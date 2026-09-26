import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Stars } from '../../../shared/components/Stars';
import { ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { formatPlainDate, todayIsoDate } from '../../../shared/utils/format';
import { StarRatingInput } from '../../reviews/components/StarRatingInput';
import { createListen, deleteListen, listListensForAlbum, updateListen } from '../services/listensApi';
import type { Listen } from '../types/listen';

export function ListenLog({ albumId }: { albumId: number }) {
  const listensQuery = useQuery({
    queryKey: ['listens', 'album', albumId],
    queryFn: () => listListensForAlbum(albumId),
  });

  if (listensQuery.isPending) return <Loading label="Carregando audições…" />;
  if (listensQuery.isError) {
    return <ErrorState message={getErrorMessage(listensQuery.error)} onRetry={() => listensQuery.refetch()} />;
  }

  return <ListenLogEditor albumId={albumId} listens={listensQuery.data} />;
}

function ListenLogEditor({ albumId, listens }: { albumId: number; listens: Listen[] }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(todayIsoDate());
  const [rating, setRating] = useState(0);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['listens', 'album', albumId] });
    queryClient.invalidateQueries({ queryKey: ['listens', 'diary'] });
  }

  const createMutation = useMutation({
    mutationFn: () => createListen(albumId, date, rating > 0 ? rating : null),
    onSuccess: () => {
      setIsAdding(false);
      setDate(todayIsoDate());
      setRating(0);
      refresh();
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (date) createMutation.mutate();
  }

  return (
    <div className="listen-log">
      <div className="listen-log__header">
        <span className="field__label">Suas audições</span>
        <span className="listen-log__summary">
          {listens.length === 0
            ? 'Ainda não registrada'
            : `Ouvido ${listens.length} ${listens.length === 1 ? 'vez' : 'vezes'} · última em ${formatPlainDate(listens[0].listenedOn)}`}
        </span>
      </div>

      {listens.length > 0 && (
        <ul className="listen-log__list">
          {listens.map((listen) => (
            <ListenLogItem key={listen.id} listen={listen} onChanged={refresh} />
          ))}
        </ul>
      )}

      {isAdding ? (
        <form className="listen-log__form" onSubmit={handleSubmit}>
          <div className="listen-log__form-row">
            <input
              type="date"
              className="input"
              value={date}
              max={todayIsoDate()}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Data da audição"
              required
            />
            <StarRatingInput value={rating} onChange={setRating} label="Nota desta audição (opcional)" />
          </div>
          <div className="listen-log__form-row">
            <button type="submit" className="button button--primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registrando…' : 'Registrar'}
            </button>
            <button type="button" className="link-button" onClick={() => setIsAdding(false)}>
              Cancelar
            </button>
          </div>
          {createMutation.isError && (
            <span className="form-error" role="alert">
              {getErrorMessage(createMutation.error)}
            </span>
          )}
        </form>
      ) : (
        <button type="button" className="button" onClick={() => setIsAdding(true)}>
          Registrar audição
        </button>
      )}
    </div>
  );
}

function ListenLogItem({ listen, onChanged }: { listen: Listen; onChanged: () => void }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm-delete'>('view');
  const [date, setDate] = useState(listen.listenedOn);
  const [rating, setRating] = useState(listen.rating ?? 0);

  const updateMutation = useMutation({
    mutationFn: () => updateListen(listen.id, date, rating > 0 ? rating : null),
    onSuccess: () => {
      setMode('view');
      onChanged();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteListen(listen.id),
    onSuccess: onChanged,
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (date) updateMutation.mutate();
  }

  function cancelEdit() {
    setDate(listen.listenedOn);
    setRating(listen.rating ?? 0);
    setMode('view');
  }

  if (mode === 'edit') {
    return (
      <li className="listen-log__item listen-log__item--editing">
        <form className="listen-log__form" onSubmit={handleSubmit}>
          <div className="listen-log__form-row">
            <input
              type="date"
              className="input"
              value={date}
              max={todayIsoDate()}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Data da audição"
              required
            />
            <StarRatingInput value={rating} onChange={setRating} label="Nota desta audição (opcional)" />
          </div>
          <div className="listen-log__form-row">
            <button type="submit" className="button button--primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" className="link-button" onClick={cancelEdit}>
              Cancelar
            </button>
          </div>
          {updateMutation.isError && (
            <span className="form-error" role="alert">
              {getErrorMessage(updateMutation.error)}
            </span>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className="listen-log__item">
      <span className="listen-log__item-date">
        {formatPlainDate(listen.listenedOn)}
        {listen.rating != null && <Stars rating={listen.rating} size="sm" />}
      </span>
      {mode === 'confirm-delete' ? (
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
          <button type="button" className="link-button" onClick={() => setMode('view')}>
            Cancelar
          </button>
        </span>
      ) : (
        <span className="listen-log__actions">
          <button type="button" className="link-button" onClick={() => setMode('edit')}>
            Editar
          </button>
          <button type="button" className="link-button" onClick={() => setMode('confirm-delete')}>
            Remover
          </button>
        </span>
      )}
      {deleteMutation.isError && (
        <span className="form-error" role="alert">
          {getErrorMessage(deleteMutation.error)}
        </span>
      )}
    </li>
  );
}
