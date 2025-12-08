import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { CartData, CartItem, CartItemCustomizations } from '$lib/types/cart';

// Initialize cart from localStorage if available
const initialCart: CartData = browser 
  ? JSON.parse(localStorage.getItem('cart') || '{"items": [], "subtotal": 0, "cartId": null}')
  : { items: [], subtotal: 0, cartId: null };

// Create writable store for cart
export const cart = writable<CartData>(initialCart);

// Derived stores for computed values
export const isEmpty = derived(cart, $cart => $cart.items.length === 0);
export const totalItems = derived(cart, $cart => 
  $cart.items.reduce((sum, item) => sum + item.quantity, 0)
);
export const shippingCost = derived(cart, () => 5.0); // Fixed shipping or make it dynamic
export const total = derived(
  [cart, shippingCost],
  ([$cart, $shippingCost]) => $cart.subtotal + $shippingCost
);

// Subscribe to cart changes and save to localStorage
if (browser) {
  cart.subscribe((value: CartData) => {
    localStorage.setItem('cart', JSON.stringify(value));
  });
}

// Helper function to update cart and calculate totals
const updateCartWithTotals = (items: CartItem[]) => {
  const itemsWithTotals = items.map(item => ({
    ...item,
    itemTotal: item.unitPrice * item.quantity
  }));
  
  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.itemTotal, 0);
  
  cart.update(current => ({
    ...current,
    items: itemsWithTotals,
    subtotal
  }));
};

// Cart actions
export const cartActions = {
  async updateQuantity(itemId: number, newQuantity: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (response.ok) {
        const updatedItem: CartItem = await response.json();
        cart.update(current => {
          const updatedItems = current.items.map(item => 
            item.id === itemId ? { ...item, quantity: updatedItem.quantity } : item
          );
          return { ...current, items: updatedItems };
        });
        await this.calculateTotals();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  },

  async removeItem(itemId: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        cart.update(current => {
          const updatedItems = current.items.filter(item => item.id !== itemId);
          return { ...current, items: updatedItems };
        });
        await this.calculateTotals();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  },

  async clearCart(): Promise<void> {
    try {
      // Get sessionId from localStorage
      const sessionId = browser ? localStorage.getItem('sessionId') : null;
      const userId = browser ? localStorage.getItem('userId') : null;
      
      const queryParam = userId ? `userId=${userId}` : `sessionId=${sessionId}`;
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart?${queryParam}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        cart.set({ items: [], subtotal: 0, cartId: null });
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  async calculateTotals(): Promise<void> {
    const $cart = get(cart);
    updateCartWithTotals($cart.items);
  },

  async fetchCart(sessionId?: string, userId?: number): Promise<void> {
    try {
      const currentSessionId = sessionId || (browser ? localStorage.getItem('sessionId') : null);
      const currentUserId = userId?.toString() || (browser ? localStorage.getItem('userId') : null);
      
      if (!currentSessionId && !currentUserId) return;
      
      const queryParam = currentUserId ? `userId=${currentUserId}` : `sessionId=${currentSessionId}`;
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart?${queryParam}`);
      
      if (response.ok) {
        const cartData: CartData = await response.json();
        cart.set(cartData);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  },

  async addItemToCart(
    productId: number,
    quantity: number,
    customizations?: CartItemCustomizations,
    sessionId?: string,
    userId?: number
  ): Promise<void> {
    try {
      // Try to get sessionId and userId from various sources
      let currentSessionId = sessionId;
      let currentUserId = userId;

      if (browser) {
        if (!currentSessionId) {
          currentSessionId = localStorage.getItem('sessionId') || undefined;
        }
        if (!currentUserId) {
          const storedUserId = localStorage.getItem('userId');
          currentUserId = storedUserId ? Number(storedUserId) : undefined;
        }
      }

      // If still no sessionId or userId, try to create a guest session
      if (!currentSessionId && !currentUserId) {
        console.warn('No sessionId or userId available, creating guest session...');
        
        try {
          const guestResponse = await fetch('http://localhost:3000/api/cartSessions/cart/guest', {
            method: 'GET'
          });
          
          if (guestResponse.ok) {
            const guestData = await guestResponse.json();
            currentSessionId = guestData.sessionId;
            
            if (browser && currentSessionId) {
              localStorage.setItem('sessionId', currentSessionId);
            }
            console.log('Created new guest session:', currentSessionId);
          }
        } catch (guestError) {
          console.error('Failed to create guest session:', guestError);
          throw new Error('Cannot add to cart: no session available');
        }
      }

      if (!currentSessionId && !currentUserId) {
        throw new Error('No sessionId or userId available after attempting to create guest session');
      }

      const response = await fetch('http://localhost:3000/api/cartSessions/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
          customizations,
          sessionId: currentSessionId,
          userId: currentUserId
        })
      });

      if (response.ok) {
        const newItem = await response.json();
        
        // Update local cart store optimistically
        const $cart = get(cart);
        const existingItemIndex = $cart.items.findIndex(
          item => 
            item.productId === productId && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );

        if (existingItemIndex > -1) {
          // Update existing item quantity
          cart.update(current => {
            const updatedItems = [...current.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity
            };
            return { ...current, items: updatedItems };
          });
        } else {
          // Add new item (we'll fetch the complete data in fetchCart)
          const tempItem: CartItem = {
            id: newItem.id,
            productId,
            productName: '',
            productSlug: '',
            basePrice: 0,
            categorySlug: '',
            images: null,
            quantity,
            customizations: customizations || null,
            unitPrice: 0,
            itemTotal: 0
          };
          cart.update(current => ({
            ...current,
            items: [...current.items, tempItem]
          }));
        }

        // Refresh cart to get complete product data
        await this.fetchCart(currentSessionId, currentUserId);
        
        console.log('Item added to cart successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to add item to cart:', errorData);
        throw new Error(errorData.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  // Helper to get cart for checkout
  getCartForCheckout() {
    const $cart = get(cart);
    const $total = get(total);
    return {
      items: $cart.items,
      subtotal: $cart.subtotal,
      cartId: $cart.cartId,
      total: $total
    };
  },

  // Helper to check if cart has items
  hasItems() {
    const $cart = get(cart);
    return $cart.items.length > 0;
  }
};