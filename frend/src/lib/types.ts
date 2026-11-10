export interface Product {
  id: number;
  slug: string;
  title: string;
  bengaliTitle: string;
  category: "bags" | "wallets" | "footwear" | "belts" | "jackets-gloves" | "accessories" | string;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  leatherType: string;
  images: string[];
  colors: { name: string; hex: string }[];
  dimensions?: string | null;
  warranty?: string | null;
  features: string[];
  inStock: boolean;
  stockQuantity?: number | null;
  featured: boolean;
  rating: string;
  reviewCount: number;
  sku: string;
  createdAt?: string | Date;
}

export interface CartItem {
  id: string; // unique cart item id (product id + selected color)
  productId: number;
  slug: string;
  title: string;
  bengaliTitle?: string;
  price: number;
  quantity: number;
  selectedColor: string;
  image: string;
  leatherType?: string;
}

export interface Order {
  id?: number;
  trackingCode: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  division: string;
  deliveryFee: number;
  paymentMethod: "cod" | "bkash" | "nagad" | "card" | string;
  orderStatus: "processing" | "quality_checked" | "dispatched" | "out_for_delivery" | "delivered" | "cancelled";
  items: CartItem[];
  subtotal: number;
  total: number;
  notes?: string;
  createdAt: string | Date;
}

export interface Review {
  id: number;
  productId: number;
  author: string;
  city: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: "view_product" | "track_order" | "link";
    label: string;
    target: string;
  };
}
