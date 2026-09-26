import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/services/api';
import { useCurrentUser, useSetCurrentUser } from '../hooks/useCurrentUser';
import { register } from '../services/authApi';
import { safeRedirectPath } from '../utils/redirect';

const MIN_PASSWORD_LENGTH = 8;

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const next = safeRedirectPath(searchParams.get('next'));
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (newUser) => {
      setCurrentUser(newUser);
      navigate(next, { replace: true });
    },
  });

  if (user && !mutation.isSuccess) return <Navigate to={next} replace />;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ name, email, password });
  }

  return (
    <section className="auth">
      <h1 className="page-title">Criar conta</h1>

      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="register-name">
            Nome
          </label>
          <input
            id="register-name"
            className="input"
            autoComplete="name"
            required
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="register-password">
            Senha
          </label>
          <input
            id="register-password"
            className="input"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="field__hint">Pelo menos {MIN_PASSWORD_LENGTH} caracteres.</span>
        </div>

        {mutation.isError && (
          <p className="form-error" role="alert">
            {getErrorMessage(mutation.error)}
          </p>
        )}

        <button type="submit" className="button button--primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <p className="auth__switch">
        Já tem conta? <Link to={`/login?next=${encodeURIComponent(next)}`}>Entrar</Link>
      </p>
    </section>
  );
}
