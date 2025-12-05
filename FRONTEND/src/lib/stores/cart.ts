import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { CartData, CartItem, CartItemCustomizations } from '$lib/types/cart';

// Initialize cart store with data from localStorage if available
const initialCart: CartData = browser 
  ? JSON.parse(localStorage.getItem('cart') || '{"items": [], "subtotal": 0}') 
  : { items: [], subtotal: 0 };

export const cart = writable<CartData>(initialCart);

// Subscribe to cart changes and save to localStorage
if (browser) {
  cart.subscribe((value: CartData) => {
    localStorage.setItem('cart', JSON.stringify(value));
  });
}

// Cart actions
export const cartActions = {
  async updateQuantity(itemId: number, newQuantity: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart/items/${itemId}`, { // ← Fix: Add full URL
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (response.ok) {
        const updatedItem: CartItem = await response.json();
        cart.update((current: CartData) => ({
          ...current,
          items: current.items.map(item => 
            item.id === itemId ? { ...item, quantity: updatedItem.quantity } : item
          )
        }));
        await cartActions.calculateTotals();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  },

  async removeItem(itemId: number): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart/items/${itemId}`, { // ← Fix: Add full URL
        method: 'DELETE'
      });
      
      if (response.ok) {
        cart.update((current: CartData) => ({
          ...current,
          items: current.items.filter(item => item.id !== itemId)
        }));
        await cartActions.calculateTotals();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  },

  async clearCart(): Promise<void> {
    try {
      // Get sessionId from localStorage
      const sessionId: string | null = browser ? localStorage.getItem('sessionId') : null;
      const userId: string | null = browser ? localStorage.getItem('userId') : null;
      
      const queryParam: string = userId ? `userId=${userId}` : `sessionId=${sessionId}`;
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart?${queryParam}`, { // ← Fix: Add full URL
        method: 'DELETE'
      });
      
      if (response.ok) {
        cart.set({ items: [], subtotal: 0 });
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },

  async calculateTotals(): Promise<void> {
    cart.update((current: CartData) => {
      const itemsWithTotals: CartItem[] = current.items.map(item => ({
        ...item,
        itemTotal: item.unitPrice * item.quantity
      }));
      
      const subtotal: number = itemsWithTotals.reduce((sum, item) => sum + item.itemTotal, 0);
      
      return {
        ...current,
        items: itemsWithTotals,
        subtotal
      };
    });
  },

  async fetchCart(sessionId?: string, userId?: number): Promise<void> { // ← Fix: Add optional parameters
    try {
      const currentSessionId: string | null = sessionId || (browser ? localStorage.getItem('sessionId') : null);
      const currentUserId: string | null = userId?.toString() || (browser ? localStorage.getItem('userId') : null);
      
      if (!currentSessionId && !currentUserId) return;
      
      const queryParam: string = currentUserId ? `userId=${currentUserId}` : `sessionId=${currentSessionId}`;
      const response = await fetch(`http://localhost:3000/api/cartSessions/cart?${queryParam}`); // ← Fix: Add full URL
      
      if (response.ok) {
        const cartData: CartData = await response.json();
        cart.set(cartData);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
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
      // Convert null to undefined for consistency
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
      cart.update((current: CartData) => {
        const existingItemIndex = current.items.findIndex(
          item => 
            item.productId === productId && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...current.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          return { ...current, items: updatedItems };
        } else {
          // Add new item (we'll fetch the complete data in fetchCart)
          const tempItem: CartItem = {
            id: newItem.id,
            productId,
            productName: '', // Will be filled by fetchCart
            productSlug: '', // Will be filled by fetchCart
            basePrice: 0, // Will be filled by fetchCart
            categorySlug: '', // Will be filled by fetchCart
            images: null, // Will be filled by fetchCart
            quantity,
            customizations: customizations || null,
            unitPrice: 0, // Will be calculated by fetchCart
            itemTotal: 0 // Will be calculated by fetchCart
          };
          return { ...current, items: [...current.items, tempItem] };
        }
      });

      // Refresh cart to get complete product data
      await cartActions.fetchCart(currentSessionId, currentUserId);
      
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
}
};