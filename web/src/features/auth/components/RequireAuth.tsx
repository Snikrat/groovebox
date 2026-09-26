import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from '../../../shared/components/StateMessage';
import { useCurrentUser } from '../hooks/useCurrentUser';

/** Redireciona para o login, voltando para a página atual depois de entrar. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUser();
  const location = useLocation();

  if (isPending) return <Loading />;
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
