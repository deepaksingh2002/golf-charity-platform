# Postman setup

1. Import `postman/golf-charity-platform.production.postman_environment.json`
2. Import `postman/golf-charity-platform.postman_collection.json`
3. Select the `Golf Charity Platform - Production` environment

Run `Register` or `Login` first so `authToken` is filled in.

Important: the score endpoints require an active subscription, so run `04 Subscriptions -> Subscribe` before `03 Scores -> Add Score` or `03 Scores -> Get Scores`.

Notes:
- If `Register` fails because the test email already exists, update `testEmail` in the environment and run `Login`.
- Admin routes require an admin token. If your token is not admin, those requests will return `403`.
- `Upload Winner Proof` needs a real file selected in the form-data `proof` field.
- `Webhook (manual)` is included for reference, but Stripe webhook signatures must be valid for the route to accept the request.
