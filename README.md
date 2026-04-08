# 🐾 Roscoe Tracker

A private walk tracker for two, built to log walks with Roscoe. Tracks miles, streaks, badges, and a shared journey across a virtual trail map.

## ✨ Features

- 📝 Log walks manually or sync automatically via Strava
- 🤝 Joint walks — when one person syncs a walk, the other gets one too
- 🏅 Badges and milestones based on cumulative miles
- 📅 Calendar view and a virtual trail map showing progress across destinations
- ⚡ Real-time updates between both users via Supabase subscriptions

## 🛠 Stack

- **Next.js 15** (App Router)
- **Supabase** (Postgres, auth, real-time)
- **Strava Webhook API** for automatic activity sync
- **Tailwind CSS**

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   STRAVA_CLIENT_ID=...
   STRAVA_CLIENT_SECRET=...
   STRAVA_VERIFY_TOKEN=...
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

## 🏃 Strava Webhook

Strava sends webhook events to `/api/strava/webhook` when activities are created or updated. The handler imports walks and hikes, converts meters to miles, and automatically creates a linked walk for the other user.

To register the webhook subscription with Strava, see the [Strava Webhooks API docs](https://developers.strava.com/docs/webhooks/).
