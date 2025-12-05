import { db } from '../db.ts';
import { Cart, CartItems, Product } from '../db/index.ts';
import { eq, and } from 'drizzle-orm';
import { SessionService } from './session.service.ts';

export interface CartItemCustomizations {
  color_finish?: { value: string; price: number };
  engraving?: { type: string; text?: string; logo?: string; value: string; price: number };
  barrel_length?: { value: number; price: number };
  barrel_material?: { value: string; price: number };
}

export interface CartItem {
  id: number;
  quantity: number;
  customizations: CartItemCustomizations | null;
  productId: number;
  productName: string;
  productSlug: string;
  basePrice: number;
  images: string[] | null;
  unitPrice: number;
  itemTotal: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItem[];
  subtotal: number;
}

export class CartService {
  async getCart(userId?: number, sessionId?: string): Promise<CartResponse | { items: []; subtotal: 0 }> {
    if (!userId && !sessionId) {
      throw new Error('userId or sessionId required');
    }

    // Find cart - handle nullable fields
    const cart = await db
      .select()
      .from(Cart)
      .where(
        userId 
          ? eq(Cart.userId, Number(userId))
          : eq(Cart.sessionId, sessionId as string)
      )
      .limit(1);

    if (cart.length === 0 || !cart[0]) {
      return { items: [], subtotal: 0 };
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: CartItems.id,
        quantity: CartItems.quantity,
        customizations: CartItems.customizations,
        productId: Product.id,
        productName: Product.name,
        productSlug: Product.slug,
        basePrice: Product.basePrice,
        images: Product.images,
      })
      .from(CartItems)
      .innerJoin(Product, eq(CartItems.productId, Product.id))
      .where(eq(CartItems.cartId, cart[0].id));
    // Calculate totals
    const itemsWithTotals = items.map((item) => {
      const customizations = item.customizations as CartItemCustomizations || {};
      const customizationTotal =
        (customizations?.color_finish?.price || 0) +
        (customizations?.engraving?.price || 0) +
        (customizations?.barrel_length?.price || 0) +
        (customizations?.barrel_material?.price || 0);

      const unitPrice = Number(item.basePrice) + customizationTotal;
      const itemTotal = unitPrice * item.quantity;

      return {
        ...item,
        unitPrice,
        itemTotal,
      };
    });

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.itemTotal, 0);

    return {
      cartId: cart[0].id,
      items: itemsWithTotals,
      subtotal,
    };
  }

  async addItemToCart(
  userId?: number, 
  sessionId?: string, 
  productId?: number, 
  quantity: number = 1, 
  customizations?: CartItemCustomizations
) {
  if (!userId && !sessionId) {
    throw new Error('userId or sessionId required');
  }

  if (!productId) {
    throw new Error('productId is required');
  }

  // Find or create cart
  let cart = await db
    .select()
    .from(Cart)
    .where(
      userId
        ? eq(Cart.userId, userId)
        : eq(Cart.sessionId, sessionId as string)
    )
    .limit(1);

  let currentCart;
  
  if (cart.length === 0 || !cart[0]) {
    const [newCart] = await db
      .insert(Cart)
      .values({
        userId: userId || null,
        sessionId: sessionId || null,
      })
      .returning();
    
    if (!newCart) {
      throw new Error('Failed to create cart');
    }
    currentCart = newCart;
  } else {
    currentCart = cart[0];
  }

  // Check if item already exists in cart with same customizations
  // Use a simpler approach for JSONB comparison
  const existingItems = await db
    .select()
    .from(CartItems)
    .where(
      and(
        eq(CartItems.cartId, currentCart.id),
        eq(CartItems.productId, productId)
      )
    )
    .limit(10); // Get multiple potential matches

  // Manually filter by customizations since direct JSONB comparison is tricky
  const existingItem = existingItems.find(item => {
    if (customizations === undefined || customizations === null) {
      return item.customizations === null;
    }
    // Simple string comparison for customizations
    return JSON.stringify(item.customizations) === JSON.stringify(customizations);
  });

  let newItem;
  
  if (existingItem) {
    // Update quantity if item exists with same customizations
    const [updated] = await db
      .update(CartItems)
      .set({ 
        quantity: existingItem.quantity + quantity
      })
      .where(eq(CartItems.id, existingItem.id))
      .returning();
    
    if (!updated) {
      throw new Error('Failed to update cart item');
    }
    newItem = updated;
  } else {
    // Add new item to cart
    const [inserted] = await db
      .insert(CartItems)
      .values({
        cartId: currentCart.id, // Use the safe currentCart reference
        productId: productId,
        quantity: quantity,
        customizations: customizations || null,
      })
      .returning();

    if (!inserted) {
      throw new Error('Failed to add item to cart');
    }
    newItem = inserted;
  }

  return newItem;
}

  async updateCartItem(itemId: number, quantity: number) {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      await this.removeCartItem(itemId);
      return { id: itemId, quantity: 0 };
    }

    const [updated] = await db
      .update(CartItems)
      .set({ quantity })
      .where(eq(CartItems.id, Number(itemId)))
      .returning();

    if (!updated) {
      throw new Error('Cart item not found');
    }

    return updated;
  }

  async removeCartItem(itemId: number) {
    const result = await db
      .delete(CartItems)
      .where(eq(CartItems.id, Number(itemId)));

    return result;
  }

  /**
   * Get or create cart for guest user with session ID
   */
  async getOrCreateGuestCart(sessionId?: string) {
    if (!sessionId) {
      // Generate new session ID if none provided
      sessionId = SessionService.generateSessionId();
    }

    let cart = await db
      .select()
      .from(Cart)
      .where(eq(Cart.sessionId, sessionId))
      .limit(1);

    if (cart.length === 0 || !cart[0]) {
      const [newCart] = await db
        .insert(Cart)
        .values({
          userId: null,
          sessionId: sessionId,
        })
        .returning();
      
      if (!newCart) {
        throw new Error('Failed to create guest cart');
      }
      cart = [newCart];
    }

    return {
      cart: cart[0],
      sessionId: sessionId,
      isNew: cart.length === 0
    };
  }

  async ensureUserCart(userId: number) {
    let cart = await db
      .select()
      .from(Cart)
      .where(eq(Cart.userId, userId))
      .limit(1);

    if (cart.length === 0 || !cart[0]) {
      const [newCart] = await db
        .insert(Cart)
        .values({
          userId: userId,
          sessionId: null,
        })
        .returning();

        console.log('Created new cart for user:', newCart);
      
      if (!newCart) {
        throw new Error('Failed to create user cart');
      }
      return newCart;
    }

    return cart[0];
  }

  async convertGuestToUserCart(sessionId: string, userId: number) {
    // Find guest cart
    const guestCart = await db
      .select()
      .from(Cart)
      .where(eq(Cart.sessionId, sessionId))
      .limit(1);

    if (guestCart.length === 0 || !guestCart[0]) {
      // No guest cart found, just create a user cart
      return await this.ensureUserCart(userId);
    }

    // Check if user already has a cart
    const userCart = await db
      .select()
      .from(Cart)
      .where(eq(Cart.userId, userId))
      .limit(1);

    if (userCart.length > 0 && userCart[0]) {
      // Merge guest cart into existing user cart
      return await this.mergeCarts(userId, sessionId);
    } else {
      // Convert guest cart to user cart
      const [updatedCart] = await db
        .update(Cart)
        .set({ 
          userId: userId,
          sessionId: null
        })
        .where(eq(Cart.id, guestCart[0].id))
        .returning();

      if (!updatedCart) {
        throw new Error('Failed to convert guest cart to user cart');
      }

      return updatedCart;
    }
  }

  async mergeCarts(userId: number, sessionId: string) {
  try {
    // Find guest cart by sessionId
    const guestCart = await db
      .select()
      .from(Cart)
      .where(eq(Cart.sessionId, sessionId))
      .limit(1);

    if (guestCart.length === 0 || !guestCart[0]) {
      // No guest cart to merge, just ensure user has a cart
      return await this.ensureUserCart(userId);
    }

    // Find or create user cart
    const userCart = await this.ensureUserCart(userId);

    // If guest cart and user cart are the same, no need to merge
    if (guestCart[0].id === userCart.id) {
      return userCart;
    }

    // Get guest cart items
    const guestItems = await db
      .select()
      .from(CartItems)
      .where(eq(CartItems.cartId, guestCart[0].id));

    // Move each item to user cart, handling duplicates
    for (const guestItem of guestItems) {
      // Get all items in user cart with the same productId
      const potentialMatches = await db
        .select()
        .from(CartItems)
        .where(
          and(
            eq(CartItems.cartId, userCart.id),
            eq(CartItems.productId, guestItem.productId)
          )
        );

      // Manually find matching item by comparing customizations
      const existingItem = potentialMatches.find(item => {
        // Both are null
        if (guestItem.customizations === null && item.customizations === null) {
          return true;
        }
        // Both are defined and equal
        if (guestItem.customizations && item.customizations) {
          return JSON.stringify(guestItem.customizations) === JSON.stringify(item.customizations);
        }
        // One is null, other is not
        return false;
      });

      if (existingItem) {
        // Update quantity if item exists
        await db
          .update(CartItems)
          .set({ 
            quantity: existingItem.quantity + guestItem.quantity
          })
          .where(eq(CartItems.id, existingItem.id));
        
        // Remove the merged guest item
        await db
          .delete(CartItems)
          .where(eq(CartItems.id, guestItem.id));
      } else {
        // Move item to user cart
        await db
          .update(CartItems)
          .set({ cartId: userCart.id })
          .where(eq(CartItems.id, guestItem.id));
      }
    }

    // Delete the now-empty guest cart
    await db
      .delete(Cart)
      .where(eq(Cart.id, guestCart[0].id));

    return userCart;
  } catch (error) {
    console.error('Error merging carts:', error);
    // If merging fails, at least ensure user has a cart
    return await this.ensureUserCart(userId);
  }
}

  async clearCart(userId?: number, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('userId or sessionId required');
    }

    // Find cart
    const cart = await db
      .select()
      .from(Cart)
      .where(
        userId
          ? eq(Cart.userId, Number(userId))
          : eq(Cart.sessionId, sessionId as string)
      )
      .limit(1);

    if (cart.length === 0 || !cart[0]) {
      throw new Error('Cart not found');
    }

    // Delete all cart items
    await db
      .delete(CartItems)
      .where(eq(CartItems.cartId, cart[0].id));
  }
}