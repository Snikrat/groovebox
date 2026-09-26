import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { Stars } from '../../../shared/components/Stars';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/format';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { addComment, deleteComment, likeReview, listComments, unlikeReview } from '../services/reviewSocialApi';
import type { PublicReview } from '../types/review';

interface ReviewCardProps {
  review: PublicReview;
  /** Mostra a capa/álbum (feed); na página do próprio álbum isso é redundante. */
  showAlbum?: boolean;
  /** Chamado depois de curtir, comentar ou apagar um comentário, para o pai atualizar as contagens. */
  onChanged?: () => void;
}

export function ReviewCard({ review, showAlbum = false, onChanged }: ReviewCardProps) {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [commentsOpen, setCommentsOpen] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => (review.likedByMe ? unlikeReview(review.id) : likeReview(review.id)),
    onSuccess: () => onChanged?.(),
  });

  const commentsQuery = useQuery({
    queryKey: ['review-comments', review.id],
    queryFn: () => listComments(review.id),
    enabled: commentsOpen,
  });

  const [commentText, setCommentText] = useState('');
  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addComment(review.id, text),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['review-comments', review.id] });
      onChanged?.();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(review.id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-comments', review.id] });
      onChanged?.();
    },
  });

  function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();
    const text = commentText.trim();
    if (text) addCommentMutation.mutate(text);
  }

  return (
    <article className="review-card">
      <div className="review-card__header">
        {showAlbum && (
          <Link to={`/album/${review.album.musicbrainzId}`} className="review-card__cover">
            <AlbumCover src={review.album.coverUrl} alt={`Capa de ${review.album.title}`} />
          </Link>
        )}
        <div className="review-card__meta">
          <p>
            <Link to={`/u/${review.author.username}`} className="review-card__author">
              {review.author.name}
            </Link>
            {showAlbum && (
              <>
                {' avaliou '}
                <Link to={`/album/${review.album.musicbrainzId}`} className="review-card__album">
                  {review.album.title}
                </Link>
              </>
            )}
          </p>
          <div className="review-card__rating">
            <Stars rating={review.rating} size="sm" />
            <span className="muted">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {review.review && <p className="review-card__text">{review.review}</p>}

      <div className="review-card__actions">
        <button
          type="button"
          className={`review-card__like${review.likedByMe ? ' is-active' : ''}`}
          aria-pressed={review.likedByMe}
          disabled={!user || likeMutation.isPending}
          onClick={() => likeMutation.mutate()}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.4 3.5 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
          </svg>
          {review.likeCount > 0 ? review.likeCount : 'Curtir'}
        </button>

        <button type="button" className="review-card__comment-toggle" onClick={() => setCommentsOpen((open) => !open)}>
          {review.commentCount > 0
            ? `${review.commentCount} ${review.commentCount === 1 ? 'comentário' : 'comentários'}`
            : 'Comentar'}
        </button>
      </div>

      {likeMutation.isError && (
        <span className="form-error" role="alert">
          {getErrorMessage(likeMutation.error)}
        </span>
      )}

      {commentsOpen && (
        <div className="review-card__comments">
          {commentsQuery.isPending && <span className="muted">Carregando comentários…</span>}
          {commentsQuery.isError && (
            <span className="form-error" role="alert">
              {getErrorMessage(commentsQuery.error)}
            </span>
          )}
          {commentsQuery.data?.map((comment) => (
            <div key={comment.id} className="comment">
              <p>
                <Link to={`/u/${comment.author.username}`} className="comment__author">
                  {comment.author.name}
                </Link>{' '}
                {comment.text}
              </p>
              <div className="comment__meta">
                <span className="muted">{formatDate(comment.createdAt)}</span>
                {user?.username === comment.author.username && (
                  <button
                    type="button"
                    className="link-button link-button--danger"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    disabled={deleteCommentMutation.isPending}
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}

          {user && (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Escreva um comentário…"
                maxLength={500}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
              <button type="submit" className="button" disabled={!commentText.trim() || addCommentMutation.isPending}>
                {addCommentMutation.isPending ? 'Enviando…' : 'Comentar'}
              </button>
              {addCommentMutation.isError && (
                <span className="form-error" role="alert">
                  {getErrorMessage(addCommentMutation.error)}
                </span>
              )}
            </form>
          )}
        </div>
      )}
    </article>
  );
}
