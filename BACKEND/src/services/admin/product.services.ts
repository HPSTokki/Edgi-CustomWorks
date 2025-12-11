import { db } from "../../db.ts";
import { eq, and } from 'drizzle-orm';
import { Order, OrderItems, Product } from "../../db/index.ts";
import { like, sql, desc, or } from "drizzle-orm";

export interface AdminOrderItem {
  id: number;
  quantity: number;
  price: string;
  customizations: any;
  productId: number;
  productName: string;
  productSlug: string;
  productImages: string[] | null;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  userId: number;
  userEmail?: string;
  userName?: string;
  status: string | null;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: string;
  billingAddress: string | null;
  paymentMethod: string;
  paymentStatus: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: AdminOrderItem[];
  itemCount?: number;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

export class AdminOrderService {
  async getAllOrders(filters: OrderFilters = {}): Promise<AdminOrder[]> {
    const {
      status,
      paymentStatus,
      paymentMethod,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(eq(Order.status, status));
    }

    if (paymentStatus && paymentStatus !== 'all') {
      conditions.push(eq(Order.paymentStatus, paymentStatus));
    }

    if (paymentMethod && paymentMethod !== 'all') {
      conditions.push(eq(Order.paymentMethod, paymentMethod));
    }

    if (search) {
      conditions.push(
        or(
          like(Order.orderNumber, `%${search}%`),
          like(Order.shippingAddress, `%${search}%`)
        )
      );
    }

    if (startDate) {
      conditions.push(sql`${Order.createdAt} >= ${new Date(startDate)}`);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(sql`${Order.createdAt} <= ${end}`);
    }

    const whereCondition = conditions.length > 0 
      ? and(...conditions)
      : undefined;

    // Get orders with item count
    const orders = await db
      .select({
        order: Order,
        itemCount: sql<number>`count(${OrderItems.id})`
      })
      .from(Order)
      .leftJoin(OrderItems, eq(Order.id, OrderItems.orderId))
      .where(whereCondition)
      .groupBy(Order.id)
      .orderBy(desc(Order.createdAt))
      .limit(limit)
      .offset(offset);

    return orders.map(({ order, itemCount }) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status || 'pending',
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress || null,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'pending',
      notes: order.notes || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      itemCount: Number(itemCount)
    }));
  }

  async getOrderByNumber(orderNumber: string): Promise<AdminOrder> {
    const result = await db
      .select()
      .from(Order)
      .where(eq(Order.orderNumber, orderNumber))
      .limit(1);

    const order = result[0];
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Get order items
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

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status || 'pending',
      subtotal: order.subtotal,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress || null,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'pending',
      notes: order.notes || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: items.map(item => ({
        ...item,
        productImages: item.productImages || []
      }))
    };
  }

  async updateOrderStatus(orderNumber: string, status: string, notes?: string): Promise<AdminOrder> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update payment status based on order status according to frontend logic
    if (status === 'cancelled') {
      updateData.paymentStatus = 'refunded';
    } else if (status === 'paid' || status === 'completed' || status === 'delivered') {
      updateData.paymentStatus = 'paid';
    } else if (status === 'awaiting_payment' || status === 'payment_required' || status === 'pending_payment') {
      // These statuses indicate payment is needed
      updateData.paymentStatus = 'pending';
    } else if (status === 'processing') {
      // For processing orders, keep existing payment status or set to pending
      // Don't auto-update to 'paid' for processing
    }

    const result = await db
      .update(Order)
      .set(updateData)
      .where(eq(Order.orderNumber, orderNumber))
      .returning();

    const updated = result[0];
    
    if (!updated) {
      throw new Error('Order not found');
    }

    return this.getOrderByNumber(orderNumber);
  }

  async updatePaymentStatus(orderNumber: string, paymentStatus: string): Promise<AdminOrder> {
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

    return this.getOrderByNumber(orderNumber);
  }

  async getOrderStats(): Promise<OrderStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      totalRevenue: sql<string>`coalesce(sum(${Order.total}::decimal), '0')`,
      pendingOrders: sql<number>`sum(case when ${Order.status} = 'pending' then 1 else 0 end)`,
      processingOrders: sql<number>`sum(case when ${Order.status} = 'processing' then 1 else 0 end)`,
      shippedOrders: sql<number>`sum(case when ${Order.status} = 'shipped' then 1 else 0 end)`,
      deliveredOrders: sql<number>`sum(case when ${Order.status} = 'delivered' or ${Order.status} = 'completed' then 1 else 0 end)`,
      cancelledOrders: sql<number>`sum(case when ${Order.status} = 'cancelled' then 1 else 0 end)`,
      paymentPendingOrders: sql<number>`sum(case when ${Order.status} IN ('pending_payment', 'awaiting_payment', 'payment_required') then 1 else 0 end)`,
      todayOrders: sql<number>`sum(case when ${Order.createdAt} >= ${today} and ${Order.createdAt} < ${tomorrow} then 1 else 0 end)`,
      todayRevenue: sql<string>`sum(case when ${Order.createdAt} >= ${today} and ${Order.createdAt} < ${tomorrow} then ${Order.total}::decimal else 0 end)`
    })
    .from(Order);

  const data = stats[0];

  if (!data) {
    throw new Error('Failed to retrieve order statistics');
  }

  return {
    totalOrders: Number(data.totalOrders) || 0,
    totalRevenue: parseFloat(data.totalRevenue) || 0,
    pendingOrders: Number(data.pendingOrders) || 0,
    processingOrders: Number(data.processingOrders) || 0,
    shippedOrders: Number(data.shippedOrders) || 0,
    deliveredOrders: Number(data.deliveredOrders) || 0,
    cancelledOrders: Number(data.cancelledOrders) || 0,
    // You can add this if you want to show payment pending orders separately
    // paymentPendingOrders: Number(data.paymentPendingOrders) || 0,
    todayOrders: Number(data.todayOrders) || 0,
    todayRevenue: parseFloat(data.todayRevenue) || 0
  };
}

async getStatusOptions(): Promise<string[]> {
  const result = await db
    .selectDistinct({ status: Order.status })
    .from(Order)
    .where(sql`${Order.status} is not null`);

  // Get unique statuses from database and add any missing ones we want to support
  const dbStatuses = result.map(r => r.status!).filter(Boolean);
  const allStatuses = [
    'pending',
    'pending_payment',
    'awaiting_payment',
    'payment_required',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    'paid'
  ];
  
  // Combine and deduplicate
  return [...new Set([...dbStatuses, ...allStatuses])].sort();
}

  async getPaymentStatusOptions(): Promise<string[]> {
    const result = await db
      .selectDistinct({ paymentStatus: Order.paymentStatus })
      .from(Order)
      .where(sql`${Order.paymentStatus} is not null`);

    return result.map(r => r.paymentStatus!).filter(Boolean);
  }

  async deleteOrder(orderNumber: string): Promise<boolean> {
    const result = await db
      .delete(Order)
      .where(eq(Order.orderNumber, orderNumber))
      .returning({ id: Order.id });

    return result.length > 0;
  }
}