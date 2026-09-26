import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { Stars } from '../../../shared/components/Stars';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { monthYearLabel } from '../../../shared/utils/format';
import { deleteListen, listDiary } from '../services/listensApi';
import type { ListenWithAlbum } from '../types/listen';

export function DiaryPage() {
  const diaryQuery = useInfiniteQuery({
    queryKey: ['listens', 'diary'],
    queryFn: ({ pageParam }) => listDiary(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.reduce((total, page) => total + page.items.length, 0) : undefined,
  });

  return (
    <section className="section">
      <h1 className="page-title">Diário</h1>

      {diaryQuery.isPending ? (
        <Loading label="Carregando diário…" />
      ) : diaryQuery.isLoadingError ? (
        <ErrorState message={getErrorMessage(diaryQuery.error)} onRetry={() => diaryQuery.refetch()} />
      ) : (
        <DiaryList
          listens={diaryQuery.data.pages.flatMap((page) => page.items)}
          hasNextPage={diaryQuery.hasNextPage}
          isFetchingNextPage={diaryQuery.isFetchingNextPage}
          onLoadMore={() => diaryQuery.fetchNextPage()}
          loadMoreError={diaryQuery.isFetchNextPageError ? diaryQuery.error : null}
        />
      )}
    </section>
  );
}

interface DiaryListProps {
  listens: ListenWithAlbum[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  loadMoreError: unknown;
}

function DiaryList({ listens, hasNextPage, isFetchingNextPage, onLoadMore, loadMoreError }: DiaryListProps) {
  if (listens.length === 0) {
    return (
      <EmptyState>
        Você ainda não registrou nenhuma audição. Abra um álbum e use “Registrar audição” para começar.
      </EmptyState>
    );
  }

  const groups: { label: string; items: ListenWithAlbum[] }[] = [];
  for (const listen of listens) {
    const label = monthYearLabel(listen.listenedOn);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.label === label) lastGroup.items.push(listen);
    else groups.push({ label, items: [listen] });
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="diary-month">
          <h2 className="diary-month__title">{group.label}</h2>
          <ul className="diary-list">
            {group.items.map((listen) => (
              <DiaryRow key={listen.id} listen={listen} />
            ))}
          </ul>
        </div>
      ))}

      {hasNextPage && (
        <div className="load-more">
          <button type="button" className="button" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
          </button>
          {Boolean(loadMoreError) && (
            <span className="form-error" role="alert">
              {getErrorMessage(loadMoreError)}
            </span>
          )}
        </div>
      )}
    </>
  );
}

function DiaryRow({ listen }: { listen: ListenWithAlbum }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const day = Number(listen.listenedOn.split('-')[2]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteListen(listen.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listens', 'diary'] });
      queryClient.invalidateQueries({ queryKey: ['listens', 'album', listen.albumId] });
    },
  });

  return (
    <li className="diary-row">
      <Link to={`/album/${listen.album.musicbrainzId}`} className="diary-row__link">
        <span className="diary-row__day">{day}</span>
        <span className="diary-row__cover">
          <AlbumCover src={listen.album.coverUrl} alt={`Capa de ${listen.album.title}`} />
        </span>
        <span className="diary-row__info">
          <span className="diary-row__album">
            {listen.album.title}
            {listen.isRelisten && <span className="diary-row__badge">Reouvido</span>}
          </span>
          <span className="diary-row__artist">{listen.album.artistName}</span>
        </span>
        {listen.rating != null && <Stars rating={listen.rating} size="sm" />}
      </Link>

      {confirming ? (
        <span className="listen-log__confirm">
          Remover?
          <button
            type="button"
            className="link-button link-button--danger"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            Sim
          </button>
          <button type="button" className="link-button" onClick={() => setConfirming(false)}>
            Cancelar
          </button>
        </span>
      ) : (
        <button type="button" className="link-button diary-row__remove" onClick={() => setConfirming(true)}>
          Remover
        </button>
      )}
    </li>
  );
}
