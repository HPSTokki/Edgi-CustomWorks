export interface OrderItem {
  id: number | string;
  quantity: number;
  price: string;
  customizations: any;
  productId: number;
  productName: string;
  productSlug: string;
  productImages: string[];
}

export interface Order {
  id: string | number;
  orderNumber: string;
  userId: number;
  status: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: string;
  billingAddress: string | null;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}