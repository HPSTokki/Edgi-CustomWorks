import express from 'express';
import { OrderService } from '../services/order.service.ts';

const router = express.Router();
const orderService = new OrderService();

// POST /api/orders/checkout - Create order from cart
router.post('/orders/checkout', async (req, res) => {
  try {
    const { cartId, userId, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    if (!cartId || !userId || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: cartId, userId, shippingAddress, paymentMethod' 
      });
    }

    const checkoutData = {
      cartId: Number(cartId),
      userId: Number(userId),
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    };

    const order = await orderService.checkout(checkoutData);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Checkout error:', error);
    if (error instanceof Error) {
      if (error.message === 'Cart is empty') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Failed to create order') {
        return res.status(500).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Get user's orders
router.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const orders = await orderService.getUserOrders(Number(userId));
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    if (error instanceof Error && error.message === 'userId required') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:orderNumber - Get order details
router.get('/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber);
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    if (error instanceof Error && error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PATCH /api/orders/:orderNumber/status - Update order status
router.patch('/orders/:orderNumber/status', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const updatedOrder = await orderService.updateOrderStatus(orderNumber, status);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error instanceof Error && error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// PATCH /api/orders/:orderNumber/payment-status - Update payment status
router.patch('/orders/:orderNumber/payment-status', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ error: 'paymentStatus is required' });
    }

    const updatedOrder = await orderService.updatePaymentStatus(orderNumber, paymentStatus);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update payment status error:', error);
    if (error instanceof Error && error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});


// MOCK PAYMENT

router.post('/orders/:orderNumber/payment', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { amount, paymentMethod, transactionId } = req.body;

    // Get the order first
    const orderService = new OrderService();
    const order = await orderService.getOrderByNumber(orderNumber);
    
    const orderTotal = parseFloat(order.total);
    const paymentAmount = parseFloat(amount);

    // Validate payment amount
    if (paymentAmount < orderTotal) {
      return res.status(400).json({ 
        error: `Payment amount must be at least ${order.total}` 
      });
    }

    // Update payment status
    await orderService.updatePaymentStatus(orderNumber, 'paid');
    
    // Update order status from awaiting_payment to processing
    if (order.status === 'awaiting_payment' || order.status === 'payment_required') {
      await orderService.updateOrderStatus(orderNumber, 'processing');
    }

    // Create payment record (you'd want to save this to a payments table)
    const paymentRecord = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: paymentAmount,
      paymentMethod,
      transactionId,
      status: 'completed',
      paidAt: new Date()
    };

    // Optional: Send payment confirmation email here

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: paymentRecord,
      order: {
        ...order,
        paymentStatus: 'paid',
        status: order.status === 'awaiting_payment' ? 'processing' : order.status
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    if (error instanceof Error && error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to process payment' });
  }
});


export default router;