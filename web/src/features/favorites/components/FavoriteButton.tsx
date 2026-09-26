import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../../shared/services/api';
import { addFavorite, listFavorites, removeFavorite } from '../services/favoritesApi';

export function FavoriteButton({ albumId }: { albumId: number }) {
  const queryClient = useQueryClient();
  const favoritesQuery = useQuery({ queryKey: ['favorites'], queryFn: listFavorites });
  const isFavorite = favoritesQuery.data?.some((favorite) => favorite.albumId === albumId) ?? false;

  const mutation = useMutation({
    mutationFn: () => (isFavorite ? removeFavorite(albumId) : addFavorite(albumId)),
    // Retornar a promise mantém o botão desabilitado até a lista ser atualizada.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <>
      <button
        type="button"
        className={`button favorite__button${isFavorite ? ' is-active' : ''}`}
        aria-pressed={isFavorite}
        disabled={favoritesQuery.isPending || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.6 8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.4 3.5 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" />
        </svg>
        {isFavorite ? 'Favoritado' : 'Favoritar'}
      </button>
      {(mutation.isError || favoritesQuery.isError) && (
        <span className="form-error" role="alert">
          {getErrorMessage(mutation.error ?? favoritesQuery.error)}
        </span>
      )}
    </>
  );
}
