import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlbumCard } from '../../../features/albums/components/AlbumCard';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatDate } from '../../../shared/utils/format';
import { reorderArray } from '../../../shared/utils/array';
import { getAlbum } from '../../albums/services/albumsApi';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { AlbumPicker } from '../components/AlbumPicker';
import { addListItem, deleteList, getList, removeListItem, reorderListItems, updateList } from '../services/listsApi';

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

export function ListDetailPage() {
  const { id = '' } = useParams();
  const listId = Number(id);
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['lists', listId],
    queryFn: () => getList(listId),
    enabled: Number.isInteger(listId) && listId > 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['lists', listId] });
  }

  const editMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description: string | null }) =>
      updateList(listId, title, description),
    onSuccess: () => {
      setIsEditing(false);
      invalidate();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (musicbrainzId: string) => {
      const album = await getAlbum(musicbrainzId);
      await addListItem(listId, album.id);
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (albumId: number) => removeListItem(listId, albumId),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: (albumIds: number[]) => reorderListItems(listId, albumIds),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteList(listId),
    onSuccess: () => navigate('/library'),
  });

  if (!Number.isInteger(listId) || listId <= 0) return <ErrorState message="Lista inválida." />;
  if (listQuery.isPending) return <Loading label="Carregando lista…" />;
  if (listQuery.isError) {
    return <ErrorState message={getErrorMessage(listQuery.error)} onRetry={() => listQuery.refetch()} />;
  }

  const list = listQuery.data;
  const isOwner = user?.username === list.owner.username;
  const existingIds = new Set(list.items.map((album) => album.musicbrainzId));

  function handleDrop(dropIndex: number) {
    if (dragIndex !== null && dragIndex !== dropIndex) {
      reorderMutation.mutate(reorderArray(list.items, dragIndex, dropIndex).map((album) => album.id));
    }
    setDragIndex(null);
  }

  return (
    <>
      <div className="list-header">
        {isEditing ? (
          <ListEditForm
            initialTitle={list.title}
            initialDescription={list.description ?? ''}
            isPending={editMutation.isPending}
            error={editMutation.error}
            onCancel={() => setIsEditing(false)}
            onSubmit={(title, description) => editMutation.mutate({ title, description })}
          />
        ) : (
          <>
            <h1 className="page-title">{list.title}</h1>
            {list.description && <p className="list-header__description">{list.description}</p>}
            <p className="list-header__meta">
              por <Link to={`/u/${list.owner.username}`}>{list.owner.name}</Link> · {list.itemCount}{' '}
              {list.itemCount === 1 ? 'álbum' : 'álbuns'} · criada em {formatDate(list.createdAt)}
            </p>

            {isOwner && (
              <div className="list-header__actions">
                <button type="button" className="button" onClick={() => setIsEditing(true)}>
                  Editar
                </button>
                {confirmingDelete ? (
                  <span className="review-form__confirm">
                    Excluir esta lista?
                    <button
                      type="button"
                      className="link-button link-button--danger"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Excluindo…' : 'Sim, excluir'}
                    </button>
                    <button type="button" className="link-button" onClick={() => setConfirmingDelete(false)}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button type="button" className="link-button" onClick={() => setConfirmingDelete(true)}>
                    Excluir lista
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <section className="section">
        {list.items.length === 0 ? (
          <EmptyState>Esta lista ainda não tem álbuns.</EmptyState>
        ) : (
          <>
            {isOwner && list.items.length > 1 && <p className="section__hint">Arraste as capas para reordenar.</p>}
            <div className="album-grid">
              {list.items.map((album, index) => (
                <div
                  key={album.id}
                  className={`list-item${dragIndex === index ? ' is-dragging' : ''}`}
                  draggable={isOwner && list.items.length > 1}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                >
                  <AlbumCard album={album} />
                  {isOwner && (
                    <button
                      type="button"
                      className="list-item__remove"
                      onClick={() => removeMutation.mutate(album.id)}
                      disabled={removeMutation.isPending}
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {(removeMutation.isError || reorderMutation.isError) && (
          <span className="form-error" role="alert">
            {getErrorMessage(removeMutation.error ?? reorderMutation.error)}
          </span>
        )}
      </section>

      {isOwner && (
        <section className="section">
          <h2 className="section__title">Adicionar álbum</h2>
          <AlbumPicker
            existingIds={existingIds}
            disabled={addMutation.isPending}
            onSelect={(mbid) => addMutation.mutate(mbid)}
          />
          {addMutation.isError && (
            <span className="form-error" role="alert">
              {getErrorMessage(addMutation.error)}
            </span>
          )}
        </section>
      )}
    </>
  );
}

interface ListEditFormProps {
  initialTitle: string;
  initialDescription: string;
  isPending: boolean;
  error: unknown;
  onCancel: () => void;
  onSubmit: (title: string, description: string | null) => void;
}

function ListEditForm({ initialTitle, initialDescription, isPending, error, onCancel, onSubmit }: ListEditFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) onSubmit(title.trim(), description.trim() || null);
  }

  return (
    <form className="auth__form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field__label" htmlFor="list-title">
          Título
        </label>
        <input
          id="list-title"
          className="input"
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="list-description">
          Descrição (opcional)
        </label>
        <textarea
          id="list-description"
          className="textarea"
          rows={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="review-form__actions">
        <button type="submit" className="button button--primary" disabled={!title.trim() || isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" className="link-button" onClick={onCancel}>
          Cancelar
        </button>
        {error != null && (
          <span className="form-error" role="alert">
            {getErrorMessage(error)}
          </span>
        )}
      </div>
    </form>
  );
}
