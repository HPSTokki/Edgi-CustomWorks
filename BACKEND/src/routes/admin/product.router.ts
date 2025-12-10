import express from 'express';
import type { Request, Response } from 'express';
import { AdminOrderService } from '../../services/admin/product.services.ts';
import { Order } from '../../db/index.ts';

const router = express.Router();
const orderService = new AdminOrderService();

// Get all orders with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      status,
      paymentStatus,
      paymentMethod,
      search,
      startDate,
      endDate,
      page = '1',
      limit = '20'
    } = req.query;

    const filters = {
      status: status as string,
      paymentStatus: paymentStatus as string,
      paymentMethod: paymentMethod as string,
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const orders = await orderService.getAllOrders(filters);
    
    // Get total count for pagination
    const totalOrders = await orderService.getAllOrders({ ...filters, limit: 100000 });
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalOrders.length,
        totalPages: Math.ceil(totalOrders.length / filters.limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get order by order number
router.get('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const order = await orderService.getOrderByNumber(orderNumber as string);
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
});

// Get order statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const stats = await orderService.getOrderStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

// Get filter options
router.get('/filters/options', async (req: Request, res: Response) => {
  try {
    const [statusOptions, paymentStatusOptions] = await Promise.all([
      orderService.getStatusOptions(),
      orderService.getPaymentStatusOptions()
    ]);

    const paymentMethodOptions = ['paymongo_gcash', 'cash_on_delivery'];
    
    res.json({
      success: true,
      data: {
        status: ['all', ...statusOptions],
        paymentStatus: ['all', ...paymentStatusOptions],
        paymentMethod: ['all', ...paymentMethodOptions]
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options'
    });
  }
});

// Update order status
router.patch('/:orderNumber/status', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await orderService.updateOrderStatus(orderNumber as string, status, notes);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Update payment status
router.patch('/:orderNumber/payment-status', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Payment status is required'
      });
    }

    const order = await orderService.updatePaymentStatus(orderNumber as string, paymentStatus);
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// Delete order
router.delete('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const deleted = await orderService.deleteOrder(orderNumber as string);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});

export default router;