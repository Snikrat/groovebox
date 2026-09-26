import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/services/api';
import { useCurrentUser, useSetCurrentUser } from '../hooks/useCurrentUser';
import { updateUsername } from '../services/authApi';

const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/;

export function SettingsPage() {
  const { user } = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const [username, setUsername] = useState(user?.username ?? '');

  const mutation = useMutation({
    mutationFn: () => updateUsername(username.trim().toLowerCase()),
    onSuccess: setCurrentUser,
  });

  if (!user) return null;

  const isValid = USERNAME_REGEX.test(username.trim().toLowerCase());
  const isUnchanged = username.trim().toLowerCase() === user.username;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isValid && !isUnchanged) mutation.mutate();
  }

  return (
    <section className="section">
      <h1 className="page-title">Configurações</h1>

      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="settings-username">
            Nome de usuário
          </label>
          <input
            id="settings-username"
            className="input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={40}
            required
          />
          <span className="field__hint">
            Seu perfil fica em groovebox/u/{username.trim().toLowerCase() || '…'}. De 3 a 40 letras minúsculas,
            números ou hífen, sem começar ou terminar com hífen.
          </span>
        </div>

        <div className="review-form__actions">
          <button type="submit" className="button button--primary" disabled={!isValid || isUnchanged || mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Salvar'}
          </button>
          {mutation.isSuccess && isUnchanged && (
            <span className="form-success" role="status">
              Nome de usuário atualizado.
            </span>
          )}
          {mutation.isError && (
            <span className="form-error" role="alert">
              {getErrorMessage(mutation.error)}
            </span>
          )}
        </div>
      </form>

      <p className="auth__switch">
        <Link to={`/u/${user.username}`}>Ver seu perfil público</Link>
      </p>
    </section>
  );
}
