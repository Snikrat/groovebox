import { Link, useLocation } from 'react-router-dom';

export function LoginPrompt({ message }: { message: string }) {
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.search);

  return (
    <div className="login-prompt">
      <p>{message}</p>
      <div className="login-prompt__actions">
        <Link to={`/login?next=${next}`} className="button button--primary">
          Entrar
        </Link>
        <Link to={`/register?next=${next}`} className="button">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
