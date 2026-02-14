export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
  };
}

export interface StravaActivity {
  id: number;
  type: string;
  sport_type: string;
  distance: number;
  start_date: string;
  name: string;
}

export interface StravaWebhookEvent {
  object_type: string;
  object_id: number;
  aspect_type: string;
  owner_id: number;
  subscription_id: number;
  event_time: number;
}
