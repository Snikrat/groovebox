import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { todayIsoDate } from '../../../shared/utils/format';
import { getAlbum } from '../../albums/services/albumsApi';
import { addFavorite } from '../../favorites/services/favoritesApi';
import { createListen } from '../../listens/services/listensApi';
import { StarRatingInput } from '../../reviews/components/StarRatingInput';
import { createReview, getReviewForAlbum, updateReview } from '../../reviews/services/reviewsApi';

interface LogModalProps {
  musicbrainzId: string;
  onClose: () => void;
}

const MAX_LENGTH = 2000;

export function LogModal({ musicbrainzId, onClose }: LogModalProps) {
  const albumQuery = useQuery({ queryKey: ['albums', musicbrainzId], queryFn: () => getAlbum(musicbrainzId) });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="log-overlay" role="dialog" aria-modal="true" aria-label="Registrar audição" onClick={onClose}>
      <div className="log-overlay__panel" onClick={(event) => event.stopPropagation()}>
        {albumQuery.isPending ? (
          <Loading label="Carregando álbum…" />
        ) : albumQuery.isError ? (
          <ErrorState message={getErrorMessage(albumQuery.error)} onRetry={() => albumQuery.refetch()} />
        ) : (
          <LogForm album={albumQuery.data} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

interface LogFormProps {
  album: { id: number; musicbrainzId: string; title: string; artistName: string; coverUrl: string | null };
  onClose: () => void;
}

function LogForm({ album, onClose }: LogFormProps) {
  const queryClient = useQueryClient();
  const existingReviewQuery = useQuery({
    queryKey: ['reviews', 'album', album.id],
    queryFn: () => getReviewForAlbum(album.id),
  });

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [markFavorite, setMarkFavorite] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // Pré-preenche com a avaliação existente, se houver, assim que ela carregar.
  useEffect(() => {
    if (existingReviewQuery.data && !prefilled) {
      setRating(existingReviewQuery.data.rating);
      setText(existingReviewQuery.data.review ?? '');
      setPrefilled(true);
    }
  }, [existingReviewQuery.data, prefilled]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (rating > 0) {
        const input = { rating, review: text.trim() || null };
        if (existingReviewQuery.data) await updateReview(existingReviewQuery.data.id, input);
        else await createReview(album.id, input);
      }
      await createListen(album.id, date, rating > 0 ? rating : null);
      if (markFavorite) await addFavorite(album.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['listens'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['albums', album.musicbrainzId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      onClose();
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitMutation.mutate();
  }

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <div className="log-form__header">
        <span className="log-form__cover">
          <AlbumCover src={album.coverUrl} alt={`Capa de ${album.title}`} />
        </span>
        <div>
          <p className="log-form__title">{album.title}</p>
          <p className="muted">{album.artistName}</p>
        </div>
      </div>

      {existingReviewQuery.isPending ? (
        <Loading label="Carregando sua avaliação…" />
      ) : (
        <>
          <div className="field">
            <span className="field__label">Nota</span>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="log-date">
              Data em que ouviu
            </label>
            <input
              id="log-date"
              type="date"
              className="input"
              value={date}
              max={todayIsoDate()}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="log-review">
              Avaliação (opcional)
            </label>
            <textarea
              id="log-review"
              className="textarea"
              rows={3}
              maxLength={MAX_LENGTH}
              placeholder="O que você achou?"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>

          <label className="log-form__checkbox">
            <input type="checkbox" checked={markFavorite} onChange={(event) => setMarkFavorite(event.target.checked)} />
            Marcar como favorito
          </label>
        </>
      )}

      <div className="log-form__actions">
        <button type="submit" className="button button--primary" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? 'Registrando…' : 'Registrar'}
        </button>
        <button type="button" className="button" onClick={onClose}>
          Cancelar
        </button>
      </div>

      {submitMutation.isError && (
        <span className="form-error" role="alert">
          {getErrorMessage(submitMutation.error)}
        </span>
      )}
    </form>
  );
}
