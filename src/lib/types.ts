export type MaterialType = 'leather' | 'metal' | 'other';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type ListingStatus = 'active' | 'sold' | 'archived';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_artisan: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  image_urls: string[];
  price: number;
  material: MaterialType;
  tags: string[];
  status: ListingStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
  seller?: Profile;
  is_favorited?: boolean;
}

export interface Order {
  id: string;
  buyer_id: string;
  idea_id: string | null;
  title: string;
  description: string | null;
  material: MaterialType;
  image_urls: string[];
  custom_text: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  buyer?: Profile;
  idea?: Idea;
  review?: Review;
}

export interface Favorite {
  id: string;
  user_id: string;
  idea_id: string;
  created_at: string;
  idea?: Idea;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface IdeaPurchase {
  id: string;
  buyer_id: string;
  idea_id: string;
  amount_paid: number;
  stripe_payment_intent_id: string | null;
  purchased_at: string;
  idea?: Idea;
}

// ── Form payloads ────────────────────────────────────────────

export interface OrderFormData {
  title: string;
  description: string;
  material: MaterialType;
  custom_text: string;
  quantity: number;
  image_urls: string[];
  idea_id?: string;
}

export interface IdeaFormData {
  title: string;
  description: string;
  price: number;
  material: MaterialType;
  tags: string[];
  image_urls: string[];
}
