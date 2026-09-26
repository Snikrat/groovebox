import { useMutation } from '@tanstack/react-query';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCurrentUser, useSetCurrentUser } from '../../features/auth/hooks/useCurrentUser';
import { logout } from '../../features/auth/services/authApi';
import { SearchForm } from './SearchForm';

export function Header() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setCurrentUser(null);
      navigate('/');
    },
  });

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo">
          <span className="logo__mark" aria-hidden="true" />
          groovebox
        </Link>

        <nav className="nav" aria-label="Principal">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/library">Minha biblioteca</NavLink>
          <NavLink to="/diary">Diário</NavLink>
        </nav>

        {/* A Home já tem o campo de busca em destaque. */}
        {pathname !== '/' && (
          <div className="header__search">
            <SearchForm key={query} initialValue={query} />
          </div>
        )}

        {!isPending && (
          <div className="header__account">
            {user ? (
              <>
                <span className="header__user" title={user.email}>
                  {user.name}
                </span>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link to="/login" className="link-button">
                Entrar
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
