import { db } from "../db.ts";
import { Order, OrderItems, Product } from "../db/index.ts";
import { Cart, CartItems } from "../db/index.ts";
import { eq, desc } from "drizzle-orm";

export interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  customizations: any;
  productId: number;
  productName: string;
  productSlug: string;
  productImages: string[] | null; // Fixed: allow null
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string | null; // Allow null
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: string;
  billingAddress?: string | null; // Allow null
  paymentMethod: string;
  paymentStatus: string | null; // Allow null
  notes?: string | null; // Allow null
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CheckoutData {
  cartId: number;
  userId: number;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod: string;
  notes?: string;
}

export class OrderService {
  async checkout(checkoutData: CheckoutData) {
    const { cartId, userId, shippingAddress, billingAddress, paymentMethod, notes } = checkoutData;

    // Get cart items with product details
    const items = await db
      .select({
        cartItem: CartItems,
        product: Product
      })
      .from(CartItems)
      .innerJoin(Product, eq(CartItems.productId, Product.id))
      .where(eq(CartItems.cartId, cartId));

    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const customizations = item.cartItem.customizations as any || {};
      const customizationTotal =
        (customizations?.color_finish?.price || 0) +
        (customizations?.engraving?.price || 0) +
        (customizations?.barrel_length?.price || 0);

      const unitPrice = Number(item.product.basePrice) + customizationTotal;
      const itemSubtotal = unitPrice * item.cartItem.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.product.id,
        quantity: item.cartItem.quantity,
        price: unitPrice.toFixed(2),
        customizations: item.cartItem.customizations,
      };
    });

    // Add tax and shipping
    const tax = subtotal * 0.1;
    const shipping = 5.0;
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const result = await db
      .insert(Order)
      .values({
        orderNumber,
        userId,
        status: 'pending',
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        paymentStatus: 'pending',
        notes: notes || null,
      })
      .returning();

    const newOrder = result[0];
    
    if (!newOrder) {
      throw new Error('Failed to create order');
    }

    // Create order items
    const orderItemsToInsert = orderItemsData.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations,
    }));

    await db.insert(OrderItems).values(orderItemsToInsert);
    
    // Clear cart items
    await db.delete(CartItems).where(eq(CartItems.cartId, cartId));

    return newOrder;
  }

  async getUserOrders(userId: number) {
    if (!userId) {
      throw new Error('userId required');
    }

    const userOrders = await db
      .select()
      .from(Order)
      .where(eq(Order.userId, Number(userId)))
      .orderBy(desc(Order.createdAt));

    return userOrders;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems> {
    const result = await db
      .select()
      .from(Order)
      .where(eq(Order.orderNumber, orderNumber))
      .limit(1);

    const order = result[0];
    
    if (!order) {
      throw new Error('Order not found');
    }

    const items = await db
      .select({
        id: OrderItems.id,
        quantity: OrderItems.quantity,
        price: OrderItems.price,
        customizations: OrderItems.customizations,
        productId: Product.id,
        productName: Product.name,
        productSlug: Product.slug,
        productImages: Product.images,
      })
      .from(OrderItems)
      .innerJoin(Product, eq(OrderItems.productId, Product.id))
      .where(eq(OrderItems.orderId, order.id));
    
    // Create a properly typed order object with defaults for null values
    const typedOrder: Order = {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status || 'pending', // Provide default if null
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress || null,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'pending', // Provide default if null
      notes: order.notes || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    return {
      ...typedOrder,
      items: items.map(item => ({
        ...item,
        productImages: item.productImages || []
      })),
    };
  }

  async updateOrderStatus(orderNumber: string, status: string) {
    const result = await db
      .update(Order)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(Order.orderNumber, orderNumber))
      .returning();

    const updated = result[0];
    
    if (!updated) {
      throw new Error('Order not found');
    }

    return updated;
  }

  async updatePaymentStatus(orderNumber: string, paymentStatus: string) {
    const result = await db
      .update(Order)
      .set({ 
        paymentStatus,
        updatedAt: new Date()
      })
      .where(eq(Order.orderNumber, orderNumber))
      .returning();

    const updated = result[0];
    
    if (!updated) {
      throw new Error('Order not found');
    }

    return updated;
  }
}