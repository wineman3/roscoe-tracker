// Database types
export interface Profile {
  id: string;
  display_name: string;
  avatar_color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Walk {
  id: string;
  user_id: string;
  miles: number;
  notes: string | null;
  walked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles?: {
    id: string;
    display_name: string;
    avatar_color: string | null;
  };
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  threshold_type: string;
  threshold_value: number;
  tier: number | null;
  created_at: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string | null;
  notified: boolean | null;
  badge_definitions?: BadgeDefinition;
}

export interface DestinationMilestone {
  id: string;
  order_index: number;
  from_city: string;
  to_city: string;
  state: string;
  distance_miles: number;
  cumulative_miles: number;
  fun_message: string;
  icon: string | null;
  created_at: string | null;
}

export interface UserStats {
  id: string;
  display_name: string;
  total_miles: number;
  total_walks: number;
  last_walk_date: string | null;
  week_miles: number;
  month_miles: number;
}

// Application types
export interface MilestoneProgress {
  completed: DestinationMilestone[];
  current: DestinationMilestone | null;
  next: DestinationMilestone | null;
  progress: number;
  remainingMiles: number;
  percentToNext: number;
}

export interface BadgeWithProgress extends BadgeDefinition {
  earned: boolean;
  earnedDate: string | null;
  progress: number;
}

// Re-export the generated Database type for type-safe queries
export type { Database } from "./database";
