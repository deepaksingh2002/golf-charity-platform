# Server API Access

This backend runs on Render, with the frontend deployed on Vercel.

## Public Endpoints

- `GET /api/health`
- `GET /api/charities`
- `GET /api/charities/:id`
- `GET /api/draws`
- `POST /api/subscriptions/webhook`

## Protected Endpoints

Authenticated users only:

- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `POST /api/subscriptions/subscribe`
- `POST /api/subscriptions/cancel`
- `GET /api/subscriptions/status`
- `GET /api/draws/current`
- `POST /api/draws/:id/proof`

## Subscriber Only

- `POST /api/scores`
- `GET /api/scores`
- `PUT /api/scores/:scoreId`
- `DELETE /api/scores/:scoreId`

## Admin Only

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:userId/scores/:scoreId`
- `PUT /api/admin/users/:userId/subscription`
- `GET /api/admin/winners`
- `PUT /api/admin/draws/:drawId/winners/:winnerId/verify`
- `GET /api/admin/charity-report`
- `POST /api/charities`
- `PUT /api/charities/:id`
- `DELETE /api/charities/:id`
- `PATCH /api/charities/:id/featured`
- `POST /api/charities/:id/events`
- `POST /api/draws`
- `POST /api/draws/:id/simulate`
- `POST /api/draws/:id/publish`

## Notes

- Proof uploads now use a local fallback path under `/uploads/proofs/...` if Cloudinary is unavailable.
- The admin dashboard response keeps compatibility aliases for the current frontend:
  - `activeSubscriptions`
  - `totalDonated`
  - `monthlyPool`
