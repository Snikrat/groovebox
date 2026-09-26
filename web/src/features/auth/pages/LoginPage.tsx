import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/services/api';
import { useCurrentUser, useSetCurrentUser } from '../hooks/useCurrentUser';
import { login } from '../services/authApi';
import { safeRedirectPath } from '../utils/redirect';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const next = safeRedirectPath(searchParams.get('next'));
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (loggedUser) => {
      setCurrentUser(loggedUser);
      navigate(next, { replace: true });
    },
  });

  if (user && !mutation.isSuccess) return <Navigate to={next} replace />;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ email, password });
  }

  return (
    <section className="auth">
      <h1 className="page-title">Entrar</h1>

      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="login-password">
            Senha
          </label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {mutation.isError && (
          <p className="form-error" role="alert">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        <button type="submit" className="button button--primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth__switch">
        Ainda não tem conta? <Link to={`/register?next=${encodeURIComponent(next)}`}>Criar conta</Link>
      </p>
    </section>
  );
}
