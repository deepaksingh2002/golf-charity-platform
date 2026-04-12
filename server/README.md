# Server API Access

This backend runs on Render, with the frontend deployed on Vercel.

## MongoDB Atlas Constraint

- `MONGO_CONNECTION_STRING` should point to your Atlas cluster.
- `MONGO_DB_NAME` is enforced by the server and scripts as the target database name.
- Allowed database-name characters: letters, numbers, `_`, `-`.

## Admin Bootstrap Configuration

- On server startup, admin user bootstrap runs automatically.
- Required env vars:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Optional env var:
  - `ADMIN_SYNC_PASSWORD_ON_BOOT=true|false` (default: `true`)

Behavior:

- If admin user does not exist, it is created.
- If admin user exists, role and status are enforced:
  - `role = admin`
  - `subscriptionStatus = active`
- Password sync behavior depends on `ADMIN_SYNC_PASSWORD_ON_BOOT`.

Manual command (optional):

- `npm run create:admin`

## Public Endpoints

- `GET /api/health`
- `GET /api/v1/health`
- `GET /api/charities`
- `GET /api/charities/:id`
- `GET /api/draws`
- `POST /api/subscriptions/webhook`
- `POST /api/v1/subscriptions/webhook`

Versioned aliases are available under `/api/v1/*` while `/api/*` remains supported for backward compatibility.

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

- Winner proof uploads are handled through Cloudinary and require valid Cloudinary credentials.
- API success responses now use one consistent envelope: `{ statusCode, data, message, success }`.
