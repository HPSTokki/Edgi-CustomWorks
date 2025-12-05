import express from 'express';
import { CartService } from '../services/cart.services.ts';
import type { Request, Response } from 'express';

const router = express.Router();

router.get('/cart', async (req: Request, res: Response) => {

    try {
        const { userId, sessionId } = req.query;

        const cartService = new CartService();
        const result = await cartService.getCart(
            userId ? Number(userId) : undefined,
            sessionId as string
        );

        res.json(result);

    } catch (error) {
        console.log(error);
        if (error instanceof Error) {
            if (error.message === "userId or sessionId required") {
                return res.status(400).json({
                    error: error.message
                });
            }
        }
        res.status(500).json({ error: 'Internal server error' });
    }

})

router.post('/cart/items', async (req: Request, res: Response) => {

    try {
        const { userId, sessionId, productId, quantity, customizations } = req.body;
        
        const cartService = new CartService();
        const newItem = await cartService.addItemToCart(
            userId,
            sessionId,
            productId,
            quantity,
            customizations
        );

        console.log('Added new item to cart:', newItem);
        res.status(201).json(newItem);

    } catch (error) {

        console.log(error);
        if(error instanceof Error) {
            if (error.message === "userId or sessionId required" || error.message === "Product not found") {
                return res.status(400).json({
                    error: error.message
                });
            }
        }
        res.status(500).json({ error: 'Internal server error' });
    }

})

router.patch('/cart/items/:id', async (req: Request, res: Response) => {

    try {

        const { quantity } = req.body;
        const itemId = Number(req.params.id);

        if (isNaN(itemId)) {
            return res.status(400).json({ error: 'Invalid item ID' });
        }

        const cartService = new CartService();

        const updated = await cartService.updateCartItem(itemId, quantity);

        console.log('Updated cart item:', updated);
        res.json(updated);

    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === "Cart item not found") {
            return res.status(404).json({error: error.message});
        }
        res.status(500).json({ error: 'Internal server error' });
    }

})

router.delete('/cart/items/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    const cartService = new CartService();
    await cartService.removeCartItem(itemId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// GET /api/cart/guest - Get or create guest cart
router.get('/cart/guest', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const cartService = new CartService();
    
    const result = await cartService.getOrCreateGuestCart(sessionId as string);
    
    res.json({
      cartId: result.cart?.id,
      sessionId: result.sessionId,
      isNew: result.isNew
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get guest cart' });
  }
});

// POST /api/cart/guest/items - Add item to guest cart
router.post('/cart/guest/items', async (req, res) => {
  try {
    const { sessionId, productId, quantity, customizations } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    const cartService = new CartService();
    const cartResult = await cartService.getOrCreateGuestCart(sessionId);
    
    const newItem = await cartService.addItemToCart(
      undefined,
      cartResult.sessionId,
      productId,
      quantity,
      customizations
    );
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add to guest cart' });
  }
});

// POST /api/cart/merge - Merge guest cart with user cart
router.post('/cart/merge', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'userId and sessionId required' });
    }

    const cartService = new CartService();
    await cartService.mergeCarts(Number(userId), sessionId);
    res.json({ message: 'Carts merged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to merge carts' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/cart', async (req, res) => {
  try {
    const { userId, sessionId } = req.query;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'userId or sessionId required' });
    }

    const cartService = new CartService();
    await cartService.clearCart(
      userId ? Number(userId) : undefined,
      sessionId as string
    );

    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === 'Cart not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;