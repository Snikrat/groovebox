import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { createList, listMyLists } from '../services/listsApi';

const MAX_TITLE_LENGTH = 80;

export function ListsSection() {
  const queryClient = useQueryClient();
  const listsQuery = useQuery({ queryKey: ['lists', 'mine'], queryFn: listMyLists });
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const createMutation = useMutation({
    mutationFn: () => createList(title.trim(), null),
    onSuccess: () => {
      setTitle('');
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['lists', 'mine'] });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (title.trim()) createMutation.mutate();
  }

  return (
    <div>
      {listsQuery.isPending ? (
        <Loading label="Carregando suas listas…" />
      ) : listsQuery.isError ? (
        <ErrorState message={getErrorMessage(listsQuery.error)} onRetry={() => listsQuery.refetch()} />
      ) : listsQuery.data.length === 0 && !isCreating ? (
        <EmptyState>Você ainda não criou nenhuma lista.</EmptyState>
      ) : (
        <ul className="lists-grid">
          {listsQuery.data.map((list) => (
            <li key={list.id} className="lists-grid__item">
              <Link to={`/list/${list.id}`}>
                <strong>{list.title}</strong>
                <span className="muted">
                  {list.itemCount} {list.itemCount === 1 ? 'álbum' : 'álbuns'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isCreating ? (
        <form className="lists-create-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input"
            placeholder="Título da lista"
            maxLength={MAX_TITLE_LENGTH}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="button button--primary" disabled={!title.trim() || createMutation.isPending}>
            {createMutation.isPending ? 'Criando…' : 'Criar'}
          </button>
          <button type="button" className="link-button" onClick={() => setIsCreating(false)}>
            Cancelar
          </button>
          {createMutation.isError && (
            <span className="form-error" role="alert">
              {getErrorMessage(createMutation.error)}
            </span>
          )}
        </form>
      ) : (
        <button type="button" className="button" onClick={() => setIsCreating(true)}>
          Criar lista
        </button>
      )}
    </div>
  );
}
