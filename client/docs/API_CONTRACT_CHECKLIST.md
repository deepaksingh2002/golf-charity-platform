# API Contract Checklist

This checklist maps the frontend RTK Query hooks to backend endpoints so contract drift is easy to detect during development and QA.

## Coverage Summary

- Total backend endpoints in contract: 32
- Frontend hook coverage: 31
- Not called from frontend by design: 1
  - POST /api/subscriptions/webhook (server-to-server Stripe webhook)

## Public Endpoints

| Backend Endpoint           | Method | Frontend Hook          | Slice           | Request Payload Schema                     | Notes                                   |
| -------------------------- | ------ | ---------------------- | --------------- | ------------------------------------------ | --------------------------------------- |
| /api/health                | GET    | useGetHealthQuery      | systemApiSlice  | None                                       | Health/diagnostics check                |
| /api/charities             | GET    | useGetCharitiesQuery   | charityApiSlice | Query params optional: search, page, limit | Supports search string or params object |
| /api/charities/:id         | GET    | useGetCharityByIdQuery | charityApiSlice | Path param: id                             | Public charity detail                   |
| /api/draws                 | GET    | useGetDrawHistoryQuery | drawApiSlice    | None                                       | Published draw history                  |
| /api/subscriptions/webhook | POST   | No frontend hook       | N/A             | Stripe webhook payload                     | Server-only integration endpoint        |

## Protected Endpoints (Authenticated)

| Backend Endpoint             | Method | Frontend Hook                 | Slice                | Request Payload Schema                           | Notes                                                  |
| ---------------------------- | ------ | ----------------------------- | -------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| /api/auth/me                 | GET    | useGetMeQuery                 | authApiSlice         | None                                             | User profile hydration                                 |
| /api/auth/profile            | PUT    | useUpdateProfileMutation      | authApiSlice         | Partial user profile object                      | Includes charityPercentage and selectedCharity updates |
| /api/auth/change-password    | PUT    | useChangePasswordMutation     | authApiSlice         | { currentPassword: string, newPassword: string } | Password rotation flow                                 |
| /api/subscriptions/subscribe | POST   | useSubscribeMutation          | subscriptionApiSlice | { plan: 'monthly' or 'yearly' }                  | Alias kept: useCreateCheckoutSessionMutation           |
| /api/subscriptions/cancel    | POST   | useCancelSubscriptionMutation | subscriptionApiSlice | None                                             | Subscription cancellation                              |
| /api/subscriptions/status    | GET    | useGetSubscriptionStatusQuery | subscriptionApiSlice | None                                             | Billing status and renewal metadata                    |
| /api/draws/current           | GET    | useGetCurrentDrawQuery        | drawApiSlice         | None                                             | Alias kept: useGetActiveDrawsQuery                     |
| /api/draws/:id/proof         | POST   | useUploadProofMutation        | drawApiSlice         | FormData with proof file                         | Multipart upload                                       |

## Subscriber-Only Endpoints

| Backend Endpoint     | Method | Frontend Hook          | Slice         | Request Payload Schema            | Notes                       |
| -------------------- | ------ | ---------------------- | ------------- | --------------------------------- | --------------------------- |
| /api/scores          | POST   | useAddScoreMutation    | scoreApiSlice | { value: number, date: string }   | Adds score entry            |
| /api/scores          | GET    | useGetScoresQuery      | scoreApiSlice | None                              | Returns current user scores |
| /api/scores/:scoreId | PUT    | useUpdateScoreMutation | scoreApiSlice | { value?: number, date?: string } | Partial score update        |
| /api/scores/:scoreId | DELETE | useDeleteScoreMutation | scoreApiSlice | None                              | Deletes a score             |

## Admin-Only Endpoints

| Backend Endpoint                                  | Method | Frontend Hook                     | Slice           | Request Payload Schema                                                      | Notes                            |
| ------------------------------------------------- | ------ | --------------------------------- | --------------- | --------------------------------------------------------------------------- | -------------------------------- |
| /api/admin/dashboard                              | GET    | useGetAdminDashboardStatsQuery    | adminApiSlice   | None                                                                        | Admin KPI/overview               |
| /api/admin/users                                  | GET    | useGetAllUsersQuery               | adminApiSlice   | Query params optional: page, limit, search                                  | Paged user management            |
| /api/admin/users/:id                              | GET    | useGetUserDetailQuery             | adminApiSlice   | Path param: id                                                              | Member detail                    |
| /api/admin/users/:userId/scores/:scoreId          | PUT    | useEditUserScoreMutation          | adminApiSlice   | { value: number }                                                           | Admin score correction           |
| /api/admin/users/:userId/subscription             | PUT    | useManageUserSubscriptionMutation | adminApiSlice   | { action: 'activate' or 'cancel' }                                          | Admin subscription control       |
| /api/admin/winners                                | GET    | useGetWinnersListQuery            | adminApiSlice   | None                                                                        | Winner verification queue        |
| /api/admin/draws/:drawId/winners/:winnerId/verify | PUT    | useVerifyWinnerMutation           | adminApiSlice   | None                                                                        | Marks payout as verified         |
| /api/admin/charity-report                         | GET    | useGetCharityReportQuery          | adminApiSlice   | None                                                                        | Donation/reporting analytics     |
| /api/charities                                    | POST   | useCreateCharityMutation          | charityApiSlice | { name: string, description?: string, website?: string, imageUrl?: string } | Admin create charity             |
| /api/charities/:id                                | PUT    | useUpdateCharityMutation          | charityApiSlice | Partial charity object                                                      | Admin update charity             |
| /api/charities/:id                                | DELETE | useDeleteCharityMutation          | charityApiSlice | None                                                                        | Admin delete charity             |
| /api/charities/:id/featured                       | PATCH  | useToggleFeaturedMutation         | charityApiSlice | None                                                                        | Toggle featured badge            |
| /api/charities/:id/events                         | POST   | useAddCharityEventMutation        | charityApiSlice | { title: string, date: string, description?: string }                       | Admin event creation             |
| /api/draws                                        | POST   | useCreateDrawMutation             | drawApiSlice    | { drawType?: string }                                                       | Draft draw creation              |
| /api/draws/:id/simulate                           | POST   | useSimulateDrawMutation           | drawApiSlice    | None                                                                        | Simulates winner result          |
| /api/draws/:id/publish                            | POST   | usePublishDrawMutation            | drawApiSlice    | None                                                                        | Publishes draw and notifications |

## Auth Endpoints Used by Frontend (Outside Requested List)

These are in active frontend usage and should remain part of the backend auth contract:

| Backend Endpoint   | Method | Frontend Hook       | Slice        | Request Payload Schema                            |
| ------------------ | ------ | ------------------- | ------------ | ------------------------------------------------- |
| /api/auth/login    | POST   | useLoginMutation    | authApiSlice | { email: string, password: string }               |
| /api/auth/register | POST   | useRegisterMutation | authApiSlice | { name: string, email: string, password: string } |

## Verification Rules

- All endpoint paths include /api via the configured base URL in apiSlice.
- Protected and admin requests rely on Authorization: Bearer token header injected by prepareHeaders.
- Response payloads are normalized via unwrapApiResponse and normalizeApiList to support both wrapped and direct list responses.
- Error messages are normalized via getApiErrorMessage to reduce UI coupling to backend error shape.
