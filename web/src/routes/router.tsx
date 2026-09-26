import { createBrowserRouter } from 'react-router-dom';
import { AlbumPage } from '../features/albums/pages/AlbumPage';
import { SearchPage } from '../features/albums/pages/SearchPage';
import { ArtistPage } from '../features/artists/pages/ArtistPage';
import { GenrePage } from '../features/browse/pages/GenrePage';
import { YearPage } from '../features/browse/pages/YearPage';
import { RequireAuth } from '../features/auth/components/RequireAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { SettingsPage } from '../features/auth/pages/SettingsPage';
import { FeedPage } from '../features/feed/pages/FeedPage';
import { HomePage } from '../features/home/pages/HomePage';
import { LibraryPage } from '../features/library/pages/LibraryPage';
import { DiaryPage } from '../features/listens/pages/DiaryPage';
import { ListDetailPage } from '../features/lists/pages/ListDetailPage';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { PeoplePage } from '../features/people/pages/PeoplePage';
import { FollowListPage } from '../features/profile/pages/FollowListPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { StatsPage } from '../features/stats/pages/StatsPage';
import { EmptyState } from '../shared/components/StateMessage';
import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/album/:musicbrainzId', element: <AlbumPage /> },
      { path: '/artist/:musicbrainzId', element: <ArtistPage /> },
      { path: '/genre/:genre', element: <GenrePage /> },
      { path: '/year/:year', element: <YearPage /> },
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
      {
        path: '/feed',
        element: (
          <RequireAuth>
            <FeedPage />
          </RequireAuth>
        ),
      },
      {
        path: '/stats',
        element: (
          <RequireAuth>
            <StatsPage />
          </RequireAuth>
        ),
      },
      {
        path: '/notifications',
        element: (
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        ),
      },
      { path: '/list/:id', element: <ListDetailPage /> },
      { path: '/people', element: <PeoplePage /> },
      { path: '/u/:username', element: <ProfilePage /> },
      { path: '/u/:username/followers', element: <FollowListPage kind="followers" /> },
      { path: '/u/:username/following', element: <FollowListPage kind="following" /> },
      {
        path: '/settings',
        element: (
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        ),
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <EmptyState>Página não encontrada.</EmptyState> },
    ],
  },
]);
