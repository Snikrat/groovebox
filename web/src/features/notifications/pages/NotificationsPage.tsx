import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/format';
import { listNotifications, markAllRead } from '../services/notificationsApi';
import type { Notification } from '../types/notification';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => listNotifications(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.reduce((total, page) => total + page.items.length, 0) : undefined,
  });

  const markReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] }),
  });

  // Marca como lidas depois que a primeira página já carregou, para os itens
  // ainda aparecerem destacados como "novos" nesta visita.
  const hasMarkedRead = useRef(false);
  useEffect(() => {
    if (notificationsQuery.isSuccess && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsQuery.isSuccess]);

  return (
    <section className="section">
      <h1 className="page-title">Notificações</h1>

      {notificationsQuery.isPending ? (
        <Loading label="Carregando notificações…" />
      ) : notificationsQuery.isLoadingError ? (
        <ErrorState message={getErrorMessage(notificationsQuery.error)} onRetry={() => notificationsQuery.refetch()} />
      ) : (
        <NotificationList
          items={notificationsQuery.data.pages.flatMap((page) => page.items)}
          hasNextPage={notificationsQuery.hasNextPage}
          isFetchingNextPage={notificationsQuery.isFetchingNextPage}
          onLoadMore={() => notificationsQuery.fetchNextPage()}
        />
      )}
    </section>
  );
}

function messageFor(notification: Notification): string {
  switch (notification.type) {
    case 'follow':
      return 'começou a seguir você.';
    case 'like':
      return `curtiu sua avaliação de ${notification.album?.title ?? 'um álbum'}.`;
    case 'comment':
      return `comentou sua avaliação de ${notification.album?.title ?? 'um álbum'}.`;
  }
}

interface NotificationListProps {
  items: Notification[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

function NotificationList({ items, hasNextPage, isFetchingNextPage, onLoadMore }: NotificationListProps) {
  if (items.length === 0) {
    return <EmptyState>Você ainda não tem notificações.</EmptyState>;
  }

  return (
    <>
      <ul className="notification-list">
        {items.map((notification) => {
          const content = (
            <>
              <Link to={`/u/${notification.actor.username}`} className="notification-item__author">
                {notification.actor.name}
              </Link>{' '}
              {messageFor(notification)}
            </>
          );

          return (
            <li
              key={notification.id}
              className={`notification-item${notification.readAt ? '' : ' notification-item--unread'}`}
            >
              {notification.album ? (
                <Link to={`/album/${notification.album.musicbrainzId}`} className="notification-item__link">
                  <p>{content}</p>
                </Link>
              ) : (
                <p>{content}</p>
              )}
              <span className="muted">{formatDate(notification.createdAt)}</span>
            </li>
          );
        })}
      </ul>

      {hasNextPage && (
        <div className="load-more">
          <button type="button" className="button" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </button>
        </div>
      )}
    </>
  );
}
