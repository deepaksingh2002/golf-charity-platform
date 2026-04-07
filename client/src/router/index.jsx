import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';

// Components
import AuthLayout from '../components/AuthLayout';
import { Spinner } from '../components/ui/Spinner';
import AdminRoute from './AdminRoute';

// Lazy Loaded Pages
const HomePage = lazy(() => import('../pages/public/HomePage'));
const HowItWorksPage = lazy(() => import('../pages/public/HowItWorksPage'));
const CharitiesPage = lazy(() => import('../pages/public/CharitiesPage'));
const CharityDetailPage = lazy(() => import('../pages/public/CharityDetailPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

const DashboardLayout = lazy(() => import('../pages/dashboard/DashboardLayout'));
const DashboardOverviewPage = lazy(() => import('../pages/dashboard/DashboardOverviewPage'));
const ScoresPage = lazy(() => import('../pages/dashboard/ScoresPage'));
const DrawPage = lazy(() => import('../pages/dashboard/DrawPage'));
const SubscriptionPage = lazy(() => import('../pages/dashboard/SubscriptionPage'));
const CharityPage = lazy(() => import('../pages/dashboard/CharityPage'));
const ProfilePage = lazy(() => import('../pages/dashboard/ProfilePage'));
const ProfileSettingsPage = lazy(() => import('../pages/dashboard/ProfileSettingsPage'));

const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminDrawsPage = lazy(() => import('../pages/admin/AdminDrawsPage'));
const AdminCharitiesPage = lazy(() => import('../pages/admin/AdminCharitiesPage'));
const AdminWinnersPage = lazy(() => import('../pages/admin/AdminWinnersPage'));
const AdminUserDetailPage = lazy(() => import('../pages/admin/AdminUserDetailPage'));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
            <HomePage />
          </Suspense>
        )
      },
      {
        path: "/how-it-works",
        element: (
          <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
            <HowItWorksPage />
          </Suspense>
        )
      },
      {
        path: "/charities",
        element: (
          <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
            <CharitiesPage />
          </Suspense>
        )
      },
      {
        path: "/charities/:id",
        element: (
          <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
            <CharityDetailPage />
          </Suspense>
        )
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
              <LoginPage />
            </Suspense>
          </AuthLayout>
        )
      },
      {
        path: "/register",
        element: (
          <AuthLayout authentication={false}>
            <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
              <RegisterPage />
            </Suspense>
          </AuthLayout>
        )
      },
      {
        path: "/dashboard",
        element: (
          <AuthLayout authentication={true}>
             <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
               <DashboardLayout />
             </Suspense>
          </AuthLayout>
        ),
        children: [
          { index: true, element: <DashboardOverviewPage /> },
          { path: "scores", element: <ScoresPage /> },
          { path: "subscription", element: <SubscriptionPage /> },
          { path: "draws", element: <DrawPage /> },
          { path: "charity", element: <CharityPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "settings", element: <ProfileSettingsPage /> },
        ]
      },
      {
        path: "/admin",
        element: (
          <AdminRoute>
             <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
               <AdminLayout />
             </Suspense>
          </AdminRoute>
        ),
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "users/:id", element: <AdminUserDetailPage /> },
          { path: "draws", element: <AdminDrawsPage /> },
          { path: "charities", element: <AdminCharitiesPage /> },
          { path: "winners", element: <AdminWinnersPage /> },
        ]
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<div className="flex justify-center p-12"><Spinner /></div>}>
            <NotFoundPage />
          </Suspense>
        )
      }
    ]
  }
]);
