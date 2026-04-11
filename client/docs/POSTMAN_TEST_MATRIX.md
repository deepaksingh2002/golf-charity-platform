# Postman Test Matrix

This matrix is designed for API verification in Postman and aligns with the backend contract in docs/API_CONTRACT_CHECKLIST.md.

## Environment Variables

Set these in your Postman environment:

- baseUrl: https://golf-charity-6fnp.onrender.com/api
- userToken: JWT for authenticated user
- subscriberToken: JWT for active subscriber
- adminToken: JWT for admin user
- charityId: existing charity id
- drawId: existing draw id
- scoreId: existing score id (subscriber-owned)
- winnerId: existing winner id
- userId: existing user id (admin flows)

## Execution Conventions

- Positive tests: validate expected success response and schema.
- Negative tests: validate auth/validation/business-rule failures.
- For auth-required routes: run with missing token and wrong-role token.
- For mutable routes: verify side effects via follow-up GET where possible.

## Core Assertions Template

Use these checks in each request test script:

- Status code is expected for scenario.
- Response time is below 2000 ms.
- Response content type is application/json where applicable.
- Response body includes either success data or an error message.

## Matrix

| ID      | Endpoint                                      | Method | Auth Scope    | Positive Test Assertions                                          | Negative Test Assertions                                   |
| ------- | --------------------------------------------- | ------ | ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| PUB-01  | /health                                       | GET    | Public        | 200; response includes health/service status fields               | N/A                                                        |
| PUB-02  | /charities                                    | GET    | Public        | 200; array or wrapped charities list; each item has \_id and name | Invalid query params return 400 or safe fallback           |
| PUB-03  | /charities/:id                                | GET    | Public        | 200; object includes \_id matching path                           | Unknown id returns 404                                     |
| PUB-04  | /draws                                        | GET    | Public        | 200; draw history list shape is valid                             | N/A                                                        |
| PUB-05  | /subscriptions/webhook                        | POST   | Stripe only   | Valid webhook signature processed successfully                    | Missing or bad signature returns 400 or 401                |
| AUTH-01 | /auth/me                                      | GET    | Authenticated | 200; returns current user profile                                 | Missing token returns 401                                  |
| AUTH-02 | /auth/profile                                 | PUT    | Authenticated | 200; updated fields persisted; GET /auth/me reflects changes      | Invalid payload returns 400; missing token returns 401     |
| AUTH-03 | /auth/change-password                         | PUT    | Authenticated | 200; password change confirmation                                 | Wrong current password returns 400 or 401                  |
| AUTH-04 | /subscriptions/subscribe                      | POST   | Authenticated | 200; returns checkout/session or activation payload               | Invalid plan returns 400; missing token returns 401        |
| AUTH-05 | /subscriptions/cancel                         | POST   | Authenticated | 200; status changes to canceled/inactive                          | Missing token returns 401                                  |
| AUTH-06 | /subscriptions/status                         | GET    | Authenticated | 200; includes status and renewal fields                           | Missing token returns 401                                  |
| AUTH-07 | /draws/current                                | GET    | Authenticated | 200; current draw object or null state shape                      | Missing token returns 401                                  |
| AUTH-08 | /draws/:id/proof                              | POST   | Authenticated | 200; proof upload accepted                                        | Missing file returns 400; missing token returns 401        |
| SUB-01  | /scores                                       | POST   | Subscriber    | 201 or 200; created score includes value and date                 | Non-subscriber returns 403; invalid value returns 400      |
| SUB-02  | /scores                                       | GET    | Subscriber    | 200; returns subscriber scores list                               | Non-subscriber returns 403                                 |
| SUB-03  | /scores/:scoreId                              | PUT    | Subscriber    | 200; updated score reflected in GET /scores                       | Unauthorized owner returns 403; bad scoreId returns 404    |
| SUB-04  | /scores/:scoreId                              | DELETE | Subscriber    | 200 or 204; score removed from list                               | Unauthorized owner returns 403; bad scoreId returns 404    |
| ADM-01  | /admin/dashboard                              | GET    | Admin         | 200; includes aggregate KPI fields                                | Non-admin token returns 403                                |
| ADM-02  | /admin/users                                  | GET    | Admin         | 200; paged users payload has users and pagination keys            | Non-admin token returns 403                                |
| ADM-03  | /admin/users/:id                              | GET    | Admin         | 200; user object matches path id                                  | Unknown id returns 404                                     |
| ADM-04  | /admin/users/:userId/scores/:scoreId          | PUT    | Admin         | 200; score updated for target user                                | Invalid score returns 400; non-admin returns 403           |
| ADM-05  | /admin/users/:userId/subscription             | PUT    | Admin         | 200; target user subscription state updated                       | Invalid action returns 400; non-admin returns 403          |
| ADM-06  | /admin/winners                                | GET    | Admin         | 200; winners list shape valid                                     | Non-admin returns 403                                      |
| ADM-07  | /admin/draws/:drawId/winners/:winnerId/verify | PUT    | Admin         | 200; winner payment/verification state updated                    | Invalid ids return 404; non-admin returns 403              |
| ADM-08  | /admin/charity-report                         | GET    | Admin         | 200; report metrics present                                       | Non-admin returns 403                                      |
| ADM-09  | /charities                                    | POST   | Admin         | 201 or 200; charity created with \_id                             | Missing required fields returns 400; non-admin returns 403 |
| ADM-10  | /charities/:id                                | PUT    | Admin         | 200; charity updated                                              | Unknown id returns 404; non-admin returns 403              |
| ADM-11  | /charities/:id                                | DELETE | Admin         | 200 or 204; charity removed                                       | Unknown id returns 404; non-admin returns 403              |
| ADM-12  | /charities/:id/featured                       | PATCH  | Admin         | 200; featured flag toggled                                        | Unknown id returns 404; non-admin returns 403              |
| ADM-13  | /charities/:id/events                         | POST   | Admin         | 201 or 200; event appended to charity                             | Invalid event payload returns 400; non-admin returns 403   |
| ADM-14  | /draws                                        | POST   | Admin         | 201 or 200; draft draw created                                    | Duplicate rule/business conflict returns 409 if applicable |
| ADM-15  | /draws/:id/simulate                           | POST   | Admin         | 200; draw status moves to simulated                               | Invalid state returns 400 or 409                           |
| ADM-16  | /draws/:id/publish                            | POST   | Admin         | 200; draw status moves to published                               | Publishing unsimulated draw returns 400 or 409             |
| AUTH-X1 | /auth/login                                   | POST   | Public        | 200; token and user payload returned                              | Invalid credentials return 401                             |
| AUTH-X2 | /auth/register                                | POST   | Public        | 201 or 200; token and user payload returned                       | Duplicate email returns 409; invalid payload returns 400   |

## Suggested Postman Folder Order

1. Public
2. Auth
3. Protected User
4. Subscriber
5. Admin

Run order recommendation:

1. PUB-01 to PUB-04
2. AUTH-X2 or AUTH-X1 to acquire token
3. AUTH-01 to AUTH-08
4. SUB-01 to SUB-04 using subscriberToken
5. ADM-01 to ADM-16 using adminToken

## Pass Criteria

- All positive tests pass.
- All negative tests return expected error class and status family.
- No endpoint returns unexpected 5xx for valid requests.
- Contract remains consistent with docs/API_CONTRACT_CHECKLIST.md.
