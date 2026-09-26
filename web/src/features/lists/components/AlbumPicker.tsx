import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { EmptyState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { searchAlbums } from '../../albums/services/albumsApi';
import type { AlbumSearchResult } from '../../albums/types/album';

interface AlbumPickerProps {
  onSelect: (musicbrainzId: string) => void;
  /** Ids já presentes na lista, para não sugerir adicionar de novo. */
  existingIds: Set<string>;
  disabled?: boolean;
}

export function AlbumPicker({ onSelect, existingIds, disabled }: AlbumPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlbumSearchResult[] | null>(null);

  const searchMutation = useMutation({
    mutationFn: (term: string) => searchAlbums(term, 0),
    onSuccess: (page) => setResults(page.items),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (term) searchMutation.mutate(term);
  }

  return (
    <div className="album-picker">
      <form className="album-picker__form" onSubmit={handleSubmit}>
        <input
          type="search"
          className="input"
          placeholder="Buscar álbum para adicionar"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" className="button" disabled={!query.trim() || searchMutation.isPending}>
          Buscar
        </button>
      </form>

      {searchMutation.isPending && <Loading label="Buscando…" />}
      {searchMutation.isError && (
        <span className="form-error" role="alert">
          {getErrorMessage(searchMutation.error)}
        </span>
      )}
      {results && results.length === 0 && <EmptyState>Nenhum álbum encontrado.</EmptyState>}

      {results && results.length > 0 && (
        <ul className="album-picker__results">
          {results.map((album) => {
            const alreadyAdded = existingIds.has(album.musicbrainzId);
            return (
              <li key={album.musicbrainzId} className="album-picker__result">
                <span className="album-picker__cover">
                  <AlbumCover src={album.coverUrl} alt={`Capa de ${album.title}`} />
                </span>
                <span className="album-picker__info">
                  <strong>{album.title}</strong>
                  <span className="muted">{album.artistName}</span>
                </span>
                <button
                  type="button"
                  className="button"
                  disabled={disabled || alreadyAdded}
                  onClick={() => onSelect(album.musicbrainzId)}
                >
                  {alreadyAdded ? 'Já está na lista' : 'Adicionar'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
