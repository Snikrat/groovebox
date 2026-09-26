import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '../services/authApi';
import type { User } from '../types/user';

export const currentUserKey = ['auth', 'me'] as const;

export function useCurrentUser() {
  const query = useQuery({ queryKey: currentUserKey, queryFn: getCurrentUser, staleTime: Infinity });
  return { user: query.data ?? null, isPending: query.isPending };
}

/** Atualiza o usuário logado e descarta dados que pertenciam à sessão anterior. */
export function useSetCurrentUser() {
  const queryClient = useQueryClient();
  return (user: User | null) => {
    queryClient.removeQueries({ queryKey: ['reviews'] });
    queryClient.removeQueries({ queryKey: ['favorites'] });
    queryClient.setQueryData(currentUserKey, user);
  };
}
