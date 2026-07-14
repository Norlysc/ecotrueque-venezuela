import type { CategoryId } from '@constants/categories';

export type ListingType = 'good' | 'service';

export type ListingStatus = 'active' | 'paused' | 'traded' | 'expired' | 'deleted';

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export type EcoLevel = 'seedling' | 'sprout' | 'guardian' | 'protector' | 'hero' | 'legend';

export type MessageType = 'text' | 'image' | 'trade_proposal' | 'system';

export type NotificationType =
  | 'trade_request'
  | 'trade_accepted'
  | 'trade_rejected'
  | 'trade_completed'
  | 'new_message'
  | 'new_review'
  | 'achievement_unlocked'
  | 'eco_level_up';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  is_verified: boolean;
  eco_points: number;
  eco_level: EcoLevel;
  reputation_score: number;
  total_trades: number;
  active_listings_count: number;
  co2_saved_kg: number;
  waste_reduced_kg: number;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  url: string;
  order: number;
}

export interface EcoImpact {
  co2_saved_kg: number;
  waste_reduced_kg: number;
  estimated_value_usd: number;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: ListingType;
  category: CategoryId;
  subcategory: string | null;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  images: ListingImage[];
  tags: string[];
  looking_for: string;
  estimated_value_usd: number | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  state: string | null;
  status: ListingStatus;
  views_count: number;
  favorites_count: number;
  eco_impact: EcoImpact;
  search_vector: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: UserProfile;
  distance_km?: number;
  is_favorited?: boolean;
}

export interface TradeRequest {
  id: string;
  requester_id: string;
  owner_id: string;
  requested_listing_id: string;
  offered_listing_id: string;
  message: string | null;
  status: TradeStatus;
  requester_confirmed: boolean;
  owner_confirmed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  requester?: UserProfile;
  owner?: UserProfile;
  requested_listing?: Listing;
  offered_listing?: Listing;
  conversation?: Conversation;
}

export interface Trade {
  id: string;
  trade_request_id: string;
  requester_id: string;
  owner_id: string;
  requested_listing_id: string;
  offered_listing_id: string;
  completed_at: string;
  eco_impact_total: EcoImpact;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: MessageType;
  content: string | null;
  image_url: string | null;
  trade_request_id: string | null;
  is_read: boolean;
  created_at: string;
  // Joined
  sender?: UserProfile;
}

export interface Conversation {
  id: string;
  trade_request_id: string | null;
  listing_id: string | null;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string | null;
  created_at: string;
  // Joined
  other_user?: UserProfile;
  trade_request?: TradeRequest;
  listing?: { id: string; title: string; images: { url: string; order: number }[] };
  last_message?: Message;
  unread_count?: number;
}

export interface SafeSpot {
  id: string;
  name: string;
  type: 'police' | 'mall' | 'metro' | 'bank' | 'hospital' | 'public';
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  is_24h: boolean;
  phone: string | null;
  created_at: string;
  // Computed
  distance_km?: number;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  emoji: string;
  points_reward: number;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
  current_progress?: number;
}

export interface EcoMetrics {
  eco_points: number;
  eco_level: EcoLevel;
  next_level_points: number;
  co2_saved_kg: number;
  waste_reduced_kg: number;
  total_trades: number;
  estimated_money_saved_usd: number;
  trees_equivalent: number;
  bottles_equivalent: number;
  km_without_car: number;
  liters_water_saved: number;
  achievements: UserAchievement[];
  recent_trades: Trade[];
}

export interface TradeMatch {
  listing: Listing;
  score: number;
  match_reasons: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  trade_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: UserProfile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_listing_id: string | null;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface NearbyFilter {
  latitude: number;
  longitude: number;
  radius_km?: number;
  category?: CategoryId;
  listing_type?: ListingType;
  search_query?: string;
  limit?: number;
  offset?: number;
}
