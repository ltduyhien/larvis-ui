// router/index.tsx: Central route definitions for the app.
// Maps URL paths to page components and assigns layouts.

import { createBrowserRouter, Navigate } from 'react-router-dom'
// createBrowserRouter: React Router v7 function that creates a router using the browser's
//   History API (pushState/popState). Enables clean URLs like /dashboard instead of /#/dashboard.
// Navigate: Component that performs a redirect when rendered.

import { AuthLayout } from '@/app/layout/AuthLayout'
// AuthLayout: Full-screen Mars background with centered content. Used for the login page.

import { MainLayout } from '@/app/layout/MainLayout'
// MainLayout: Sidebar + header + content area shell. Used for all authenticated pages.

import { ProtectedRoute } from './ProtectedRoute'
// ProtectedRoute: Route guard — redirects to /login if the user isn't authenticated.

import { LoginPage } from '@/pages/LoginPage'
import { ActivitiesPage } from '@/pages/ActivitiesPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SpaceCommandPage } from '@/pages/SpaceCommandPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/activities" replace />,
    // replace: Don't add / to the history stack — pressing back won't loop back here.
  },

  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    // ProtectedRoute wraps all routes that require authentication.
    // If the user isn't logged in, they get redirected to /login.
    children: [
      {
        element: <MainLayout />,
        // MainLayout provides the sidebar + header shell for authenticated pages.
        children: [
          { path: '/activities', element: <ActivitiesPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/space-command', element: <SpaceCommandPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
