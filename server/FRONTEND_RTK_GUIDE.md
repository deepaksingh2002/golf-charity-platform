# Antigravity Frontend RTK Prompt

Build the frontend in modern React with RTK Query and keep it aligned with the existing backend.

## Use this stack
- React
- Redux Toolkit
- RTK Query
- function components
- `credentials: 'include'` if cookies are used

## Create these slices
- `authApiSlice`
- `charityApiSlice`
- `drawApiSlice`
- `scoreApiSlice`
- `subscriptionApiSlice`
- `adminApiSlice`

## Create one shared `apiSlice`
- Use the Render backend base URL.
- Add tag types for `User`, `Charity`, `Draw`, `Score`, `Subscription`, and `Admin`.

## Use these exact hooks

### Auth
- `useLoginMutation`
- `useRegisterMutation`
- `useGetMeQuery`
- `useUpdateProfileMutation`
- `useChangePasswordMutation`

### Charities
- `useGetCharitiesQuery`
- `useGetCharityByIdQuery`
- `useCreateCharityMutation`
- `useUpdateCharityMutation`
- `useDeleteCharityMutation`
- `useToggleFeaturedMutation`

### Draws
- `useGetActiveDrawsQuery`
- `useGetDrawHistoryQuery`
- `useCreateDrawMutation`
- `useSimulateDrawMutation`
- `usePublishDrawMutation`

### Scores
- `useGetScoresQuery`
- `useAddScoreMutation`
- `useUpdateScoreMutation`
- `useDeleteScoreMutation`

### Subscriptions
- `useCreateCheckoutSessionMutation`
- `useGetSubscriptionStatusQuery`
- `useCancelSubscriptionMutation`

### Admin
- `useGetAdminDashboardStatsQuery`
- `useGetAllUsersQuery`
- `useGetUserDetailQuery`
- `useEditUserScoreMutation`
- `useManageUserSubscriptionMutation`
- `useGetWinnersListQuery`
- `useVerifyWinnerMutation`
- `useGetCharityReportQuery`

## Map to these routes
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `GET /api/charities`
- `GET /api/charities/:id`
- `POST /api/charities`
- `PUT /api/charities/:id`
- `DELETE /api/charities/:id`
- `PATCH /api/charities/:id/featured`
- `GET /api/draws`
- `GET /api/draws/current`
- `POST /api/draws`
- `POST /api/draws/:id/simulate`
- `POST /api/draws/:id/publish`
- `POST /api/draws/:id/proof`
- `GET /api/scores`
- `POST /api/scores`
- `PUT /api/scores/:scoreId`
- `DELETE /api/scores/:scoreId`
- `POST /api/subscriptions/subscribe`
- `POST /api/subscriptions/cancel`
- `GET /api/subscriptions/status`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:userId/scores/:scoreId`
- `PUT /api/admin/users/:userId/subscription`
- `GET /api/admin/winners`
- `PUT /api/admin/draws/:drawId/winners/:winnerId/verify`
- `GET /api/admin/charity-report`

## Rules
1. Use RTK Query for every backend request.
2. Keep admin hooks inside admin-only screens.
3. Use `unwrap()` for mutations.
4. Invalidate tags after create/update/delete actions.
5. Handle list fallbacks for `charities`, `scores`, `draws`, and `users`.
6. Keep the UI modern, clean, and responsive.

## Short examples
```jsx
const [login] = useLoginMutation();
await login(values).unwrap();
```

```jsx
const { data: user } = useGetMeQuery();
```

```jsx
const { data: stats } = useGetAdminDashboardStatsQuery();
```
