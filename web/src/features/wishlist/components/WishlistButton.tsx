import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../../shared/services/api';
import { addToWishlist, listWishlist, removeFromWishlist } from '../services/wishlistApi';

export function WishlistButton({ albumId }: { albumId: number }) {
  const queryClient = useQueryClient();
  const wishlistQuery = useQuery({ queryKey: ['wishlist'], queryFn: listWishlist });
  const isWishlisted = wishlistQuery.data?.some((item) => item.albumId === albumId) ?? false;

  const mutation = useMutation({
    mutationFn: () => (isWishlisted ? removeFromWishlist(albumId) : addToWishlist(albumId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  return (
    <>
      <button
        type="button"
        className={`button wishlist__button${isWishlisted ? ' is-active' : ''}`}
        aria-pressed={isWishlisted}
        disabled={wishlistQuery.isPending || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.4a.5.5 0 0 1-.77.42L12 16.5l-5.73 4.32a.5.5 0 0 1-.77-.42V4a.5.5 0 0 1 .5-.5z" />
        </svg>
        {isWishlisted ? 'Na lista' : 'Quero ouvir'}
      </button>
      {(mutation.isError || wishlistQuery.isError) && (
        <span className="form-error" role="alert">
          {getErrorMessage(mutation.error ?? wishlistQuery.error)}
        </span>
      )}
    </>
  );
}
