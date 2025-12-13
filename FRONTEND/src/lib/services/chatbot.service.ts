import type { OrderWithItems } from '$lib/types/order';

export type ChatMessage = {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  loading?: boolean;
};

export type ChatIntent = 
  | 'track_order'
  | 'order_status'
  | 'shipping_info'
  | 'payment_info'
  | 'return_policy'
  | 'contact_support'
  | 'general_help'
  | 'unknown';

export class ChatbotService {
  private readonly orderApiUrl = 'http://localhost:3000/api/orderRouting/orders';

  async trackOrder(orderNumber: string): Promise<OrderWithItems | null> {
  try {
    console.log('Fetching order:', `${this.orderApiUrl}/${orderNumber}`);
    const response = await fetch(`${this.orderApiUrl}/${orderNumber}`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Order not found');
    }
    
    const order = await response.json();
    console.log('Order data received:', order);
    return order;
  } catch (error) {
    console.error('Track order error:', error);
    return null;
  }
}

  async getUserOrders(userId: number): Promise<OrderWithItems[]> {
    try {
      const response = await fetch(`${this.orderApiUrl}?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  detectIntent(userMessage: string): ChatIntent {
    const message = userMessage.toLowerCase().trim();
    
    // Order tracking patterns
    if (/(track|where is|status of|check on) (my )?order/i.test(message) || 
        /order (tracking|status)/i.test(message)) {
      return 'track_order';
    }
    
    if (/order status|order #|ord-\w+/i.test(message)) {
      return 'order_status';
    }
    
    if (/shipping|delivery|arrive|when will it get here/i.test(message)) {
      return 'shipping_info';
    }
    
    if (/payment|paid|charge|refund/i.test(message)) {
      return 'payment_info';
    }
    
    if (/return|exchange|refund policy/i.test(message)) {
      return 'return_policy';
    }
    
    if (/contact|support|help|customer service/i.test(message)) {
      return 'contact_support';
    }
    
    return 'general_help';
  }

extractOrderNumber(message: string): string | null {
  // Match ORD- followed by numbers, then another hyphen, then alphanumeric characters
  const orderRegex = /ORD-\d+-\w+/i;
  const match = message.match(orderRegex);
  return match ? match[0] : null;
}

  generateResponse(intent: ChatIntent, data?: any): string {
    switch (intent) {
      case 'track_order':
        if (data?.order) {
          const order = data.order;
          return `📦 Order #${order.orderNumber} is currently **${order.status.toUpperCase()}**.
          
Shipping: ₱${order.shipping}
Total: ₱${order.total}
Estimated delivery: ${this.getEstimatedDelivery(order.createdAt)}
          
Items (${order.items.length}):
${order.items.map((item: any) => `• ${item.productName} x${item.quantity}`).join('\n')}`;
        } else {
          return "I couldn't find that order. Please check your order number and try again. Order numbers look like: ORD-123456789-abc123";
        }
        
      case 'order_status':
        return "To check your order status, I'll need your order number. Could you provide it? (e.g., ORD-123456789-abc123)";
        
      case 'shipping_info':
        return `**Shipping Information:**
• Standard shipping: 3-5 business days (₱5.00)
• Express shipping: 1-2 business days (₱12.00)
• International shipping: 7-14 business days (varies by country)

Once shipped, you'll receive tracking information via email.`;
        
      case 'payment_info':
        return `**Payment Options:**
• Credit/Debit Cards (Visa, MasterCard, Amex)
• PayPal
• Apple Pay / Google Pay

Payments are processed securely. Refunds take 5-10 business days to appear in your account.`;
        
      case 'return_policy':
        return `**Return Policy:**
• RETURN IS NOT ALLOWED ONCE TRANSACTION IS COMPLETED.

[View full return policy](https://example.com/returns)`;
        
      case 'contact_support':
        return `**Contact Support:**
📧 Email: support@example.com
📞 Phone: 1-800-123-4567
🕒 Hours: Mon-Fri 9AM-6PM EST

You can also visit our [Help Center](https://help.example.com) for common questions.`;
        
      case 'general_help':
        return "I can help you with:\n• Tracking orders\n• Checking order status\n• Shipping information\n• Payment questions\n• Return policies\n• Contacting support\n\nWhat would you like to know?";
        
      default:
        return "I'm not sure I understand. I can help you track orders, check status, or answer questions about shipping, payments, and returns. What would you like to know?";
    }
  }

  private getEstimatedDelivery(orderDate: Date | string): string {
    const date = new Date(orderDate);
    const deliveryDate = new Date(date);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 business days
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  async processMessage(message: string, userId?: number): Promise<{ response: string; data?: any }> {
    const intent = this.detectIntent(message);
    
    // Extract order number if present
    const orderNumber = this.extractOrderNumber(message);
    
    if (intent === 'track_order' && orderNumber) {
      const order = await this.trackOrder(orderNumber);
      return {
        response: this.generateResponse(intent, { order }),
        data: { order }
      };
    }
    
    // If user asks for orders but doesn't provide order number
    if ((intent === 'track_order' || intent === 'order_status') && userId && !orderNumber) {
      const orders = await this.getUserOrders(userId);
      if (orders.length > 0) {
        return {
          response: `I found ${orders.length} order(s) for your account. Please provide an order number to check status. Your recent orders:\n${orders.slice(0, 3).map(o => `• ${o.orderNumber} - ${o.status} - $${o.total}`).join('\n')}`,
          data: { orders }
        };
      }
    }
    
    return {
      response: this.generateResponse(intent)
    };
  }
}