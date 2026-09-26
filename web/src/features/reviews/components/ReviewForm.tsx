import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { createReview, deleteReview, getReviewForAlbum, updateReview } from '../services/reviewsApi';
import type { Review, ReviewInput } from '../types/review';
import { StarRatingInput } from './StarRatingInput';

const MAX_LENGTH = 2000;

interface ReviewFormProps {
  albumId: number;
  albumMusicbrainzId: string;
}

export function ReviewForm({ albumId, albumMusicbrainzId }: ReviewFormProps) {
  const reviewQuery = useQuery({
    queryKey: ['reviews', 'album', albumId],
    queryFn: () => getReviewForAlbum(albumId),
  });

  if (reviewQuery.isPending) return <Loading label="Carregando sua avaliação…" />;
  if (reviewQuery.isError) {
    return <ErrorState message={getErrorMessage(reviewQuery.error)} onRetry={() => reviewQuery.refetch()} />;
  }

  return <ReviewEditor albumId={albumId} albumMusicbrainzId={albumMusicbrainzId} existing={reviewQuery.data} />;
}

interface ReviewEditorProps extends ReviewFormProps {
  existing: Review | null;
}

function ReviewEditor({ albumId, albumMusicbrainzId, existing }: ReviewEditorProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.review ?? '');

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Nota média do álbum, biblioteca e favoritos dependem da avaliação.
  function refreshRelated(review: Review | null) {
    queryClient.setQueryData(['reviews', 'album', albumId], review);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    queryClient.invalidateQueries({ queryKey: ['albums', albumMusicbrainzId], exact: true });
  }

  const mutation = useMutation({
    mutationFn: (input: ReviewInput) => (existing ? updateReview(existing.id, input) : createReview(albumId, input)),
    onSuccess: (saved) => {
      deleteMutation.reset();
      refreshRelated(saved);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      mutation.reset();
      setConfirmingDelete(false);
      setRating(0);
      setText('');
      refreshRelated(null);
    },
  });

  const isDirty = rating !== (existing?.rating ?? 0) || text.trim() !== (existing?.review ?? '');
  const isBusy = mutation.isPending || deleteMutation.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0) return;
    mutation.mutate({ rating, review: text.trim() || null });
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="field">
        <span className="field__label">Minha nota</span>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="review-text">
          Minha avaliação
        </label>
        <textarea
          id="review-text"
          className="textarea"
          rows={5}
          maxLength={MAX_LENGTH}
          placeholder="O que você achou deste álbum?"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <span className="field__hint">
          {text.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="review-form__actions">
        <button type="submit" className="button button--primary" disabled={rating === 0 || !isDirty || isBusy}>
          {mutation.isPending ? 'Salvando…' : 'Salvar avaliação'}
        </button>

        {existing && !confirmingDelete && (
          <button type="button" className="link-button" onClick={() => setConfirmingDelete(true)} disabled={isBusy}>
            Excluir avaliação
          </button>
        )}

        {existing && confirmingDelete && (
          <span className="review-form__confirm">
            Excluir sua avaliação?
            <button
              type="button"
              className="link-button link-button--danger"
              onClick={() => deleteMutation.mutate(existing.id)}
              disabled={isBusy}
            >
              {deleteMutation.isPending ? 'Excluindo…' : 'Sim, excluir'}
            </button>
            <button type="button" className="link-button" onClick={() => setConfirmingDelete(false)} disabled={isBusy}>
              Cancelar
            </button>
          </span>
        )}

        {rating === 0 && !deleteMutation.isSuccess && (
          <span className="field__hint">Escolha uma nota para salvar.</span>
        )}
        {mutation.isSuccess && !isDirty && (
          <span className="form-success" role="status">
            Avaliação salva.
          </span>
        )}
        {deleteMutation.isSuccess && rating === 0 && (
          <span className="form-success" role="status">
            Avaliação excluída.
          </span>
        )}
        {(mutation.isError || deleteMutation.isError) && (
          <span className="form-error" role="alert">
            {getErrorMessage(mutation.error ?? deleteMutation.error)}
          </span>
        )}
      </div>
    </form>
  );
}
