import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { MainLayout } from '@/app/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { ActivitiesPage } from '@/pages/ActivitiesPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/activities" replace />,
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
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/activities', element: <ActivitiesPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
