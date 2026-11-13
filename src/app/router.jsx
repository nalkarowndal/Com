import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import HomePage from '../pages/HomePage';
import ArchitecturePage from '../pages/ArchitecturePage';
import TravelPage from '../pages/TravelPage';
import ArtPage from '../pages/ArtPage';
import FoodPage from '../pages/FoodPage';
import ArticleDetailPage from '../pages/ArticleDetailPage';
import GalleryPage from '../pages/GalleryPage';
import SearchPage from '../pages/SearchPage';
import NotFoundPage from '../pages/NotFoundPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AccountPage from '../pages/user/AccountPage';
import AccountSettingsPage from '../pages/user/AccountSettingsPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminArticlesPage from '../pages/admin/AdminArticlesPage';
import AdminArticleEditPage from '../pages/admin/AdminArticleEditPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminMediaPage from '../pages/admin/AdminMediaPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

export const router = createBrowserRouter([
  // Public Site Routes
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'architecture', element: <ArchitecturePage /> },
      { path: 'travel', element: <TravelPage /> },
      { path: 'art', element: <ArtPage /> },
      { path: 'food', element: <FoodPage /> },
      { path: 'stories/:slug', element: <ArticleDetailPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'search', element: <SearchPage /> },

      // Auth routes
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // Protected Account routes for USER & ADMIN
      {
        path: 'account',
        element: (
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <AccountPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'account/settings',
        element: (
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <AccountSettingsPage />
          </ProtectedRoute>
        )
      },

      { path: '*', element: <NotFoundPage /> }
    ]
  },

  // Admin Login Route (Unified with /login)
  {
    path: '/admin/login',
    element: <LoginPage />
  },

  // Admin Portal Routes (Guarded by AdminLayout and ProtectedRoute)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'articles', element: <AdminArticlesPage /> },
      { path: 'articles/new', element: <AdminArticleEditPage /> },
      { path: 'articles/:id/edit', element: <AdminArticleEditPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'media', element: <AdminMediaPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'settings', element: <AdminSettingsPage /> }
    ]
  }
]);
