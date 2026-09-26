import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getUnreadCount } from '../services/notificationsApi';

const POLL_INTERVAL_MS = 45_000;

export function NotificationBell() {
  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const count = unreadQuery.data ?? 0;

  return (
    <Link to="/notifications" className="notification-bell" aria-label={`Notificações${count > 0 ? ` (${count} não lidas)` : ''}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 16v-5a6 6 0 0 0-4.5-5.8V4a1.5 1.5 0 0 0-3 0v1.2A6 6 0 0 0 6 11v5l-2 2v1h16v-1z" />
        <path d="M10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" />
      </svg>
      {count > 0 && <span className="notification-bell__badge">{count > 9 ? '9+' : count}</span>}
    </Link>
  );
}
