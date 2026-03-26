# Golf Charity Platform

A MERN stack application allowing users to support charities via subscriptions, log golf scores, and participate in an algorithmic monthly draw for prize pools.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Zustand, Framer Motion
- **Backend**: Node.js, Express, Mongoose
- **Integrations**: Stripe (Subscriptions/Payments), Cloudinary (Proof Uploads), NodeMailer (Notifications)

## Installation and Setup

### 1. Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Stripe Account (for testing webhooks)

### 2. Backend Setup
1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in the values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
   - `CLOUDINARY_*` keys
   - `EMAIL_*` credentials
4. Create the test admin account once with `npm run create:admin`
5. `npm start`

### 3. Frontend Setup
1. `cd client`
2. `npm install`
3. Create an `.env` file with backend URL: `VITE_API_URL=http://localhost:5000/api`
4. `npm run dev`

## Test Credentials
- **Admin Setup**: Run `npm run create:admin` inside `/server` to create the built-in admin account.
- **Admin Login**: Email `admin@golfcharity.com` / Password `Admin1234!`
- **Stripe Testing**: Use standard Stripe test cards (`4242 4242 4242 4242`) for testing subscription triggers locally via the Stripe CLI webhook listener.

## Architecture Highlights
- **Draw Algorithm**: Located in `/server/services/draw.service.js`. Weighs scores across the entire player base inversely against frequency.
- **Roll-over Scores**: A user's profile tightly caps their score array to 5 entities. The 6th score automatically shifts the array popping the oldest.

## Deployment (Vercel)
Production configurations for Vercel are included in both `/client/vercel.json` (SPA rules) and `/server/vercel.json` (Node execution wrappers). Set the environment variables in the Vercel dashboard prior to deployment.
