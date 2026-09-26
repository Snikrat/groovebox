import { createBrowserRouter } from 'react-router-dom';
import { AlbumPage } from '../features/albums/pages/AlbumPage';
import { SearchPage } from '../features/albums/pages/SearchPage';
import { RequireAuth } from '../features/auth/components/RequireAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { HomePage } from '../features/home/pages/HomePage';
import { LibraryPage } from '../features/library/pages/LibraryPage';
import { DiaryPage } from '../features/listens/pages/DiaryPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { EmptyState } from '../shared/components/StateMessage';
import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/album/:musicbrainzId', element: <AlbumPage /> },
      {
        path: '/library',
        element: (
          <RequireAuth>
            <LibraryPage />
          </RequireAuth>
        ),
      },
      {
        path: '/diary',
        element: (
          <RequireAuth>
            <DiaryPage />
          </RequireAuth>
        ),
      },
      { path: '/u/:username', element: <ProfilePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <EmptyState>Página não encontrada.</EmptyState> },
    ],
  },
]);
