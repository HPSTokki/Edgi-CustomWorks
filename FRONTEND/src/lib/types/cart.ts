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
  categorySlug: string;
  basePrice: number;
  images: string[] | null;
  unitPrice: number;
  itemTotal: number;
}

export interface CartData {
  cartId?: number;
  items: CartItem[];
  subtotal: number;
}