# MSL League Website (Next.js + MongoDB)

Sporty college football league site with an admin panel to manage:
- Teams + team members (roles: `owner`, `keyplayer`, `player`) + photos
- Fixtures (schedule) + match scores (results)
- League table (computed from completed fixtures + points rules)
- Champions (team photos)
- League settings (content + points rules)

## Tech
- Next.js (App Router)
- MongoDB + Mongoose
- GridFS for image storage (images live inside MongoDB)

## Local development
1. Create env file:
   - Copy `.env.example` to `.env`
2. Set `MONGODB_URI` to your MongoDB Atlas connection string.
3. Run:
   - `npm install`
   - `npm run dev`

## Admin login
1. Visit `/admin`
2. Admin user is seeded on first login if the `AdminUser` collection is empty.
   - Use `ADMIN_SEED_USERNAME` / `ADMIN_SEED_PASSWORD` from `.env`

## Render deployment
1. Create a Render Web Service for this repo.
2. Build command: `npm install`
3. Start command: `npm run start`
4. Add environment variables from `.env.example` in Render’s dashboard.

## Notes
- The `/results` page is computed from fixtures marked as `completed` and their scores.
- The points table uses `LeagueSettings.pointsRules`.

