// Database types
export interface Profile {
  id: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface Walk {
  id: string;
  user_id: string;
  miles: number;
  notes: string | null;
  walked_at: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold_type:
    | "total_miles"
    | "weekly_miles"
    | "monthly_miles"
    | "streak_days";
  threshold_value: number;
  tier: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  notified: boolean;
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
  icon: string;
  created_at: string;
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

// Supabase Database type (for type-safe queries)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      walks: {
        Row: Walk;
        Insert: Omit<Walk, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Walk, "id" | "created_at" | "updated_at">>;
      };
      badge_definitions: {
        Row: BadgeDefinition;
        Insert: Omit<BadgeDefinition, "created_at">;
        Update: Partial<Omit<BadgeDefinition, "id" | "created_at">>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Omit<UserBadge, "id" | "earned_at" | "notified">;
        Update: Partial<Omit<UserBadge, "id" | "earned_at">>;
      };
      destination_milestones: {
        Row: DestinationMilestone;
        Insert: Omit<DestinationMilestone, "id" | "created_at">;
        Update: Partial<Omit<DestinationMilestone, "id" | "created_at">>;
      };
    };
    Views: {
      user_stats: {
        Row: UserStats;
      };
    };
    Functions: {
      check_and_award_badges: {
        Args: { p_user_id: string };
        Returns: void;
      };
    };
  };
};
