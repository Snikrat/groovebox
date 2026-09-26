import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { listFollowing } from '../../follows/services/followsApi';
import { PersonRow } from '../../people/components/PersonRow';
import { getFollowers, getFollowingOf } from '../services/profileApi';

interface FollowListPageProps {
  kind: 'followers' | 'following';
}

export function FollowListPage({ kind }: FollowListPageProps) {
  const { username = '' } = useParams();
  const { user } = useCurrentUser();

  const listQuery = useQuery({
    queryKey: ['profile', username, kind],
    queryFn: () => (kind === 'followers' ? getFollowers(username) : getFollowingOf(username)),
  });

  const myFollowingQuery = useQuery({
    queryKey: ['follows', 'following'],
    queryFn: listFollowing,
    enabled: Boolean(user),
  });
  const myFollowingUsernames = new Set(myFollowingQuery.data?.map((person) => person.username));

  return (
    <section className="section">
      <h1 className="page-title">{kind === 'followers' ? `Seguidores de @${username}` : `@${username} segue`}</h1>

      {listQuery.isPending ? (
        <Loading />
      ) : listQuery.isError ? (
        <ErrorState message={getErrorMessage(listQuery.error)} onRetry={() => listQuery.refetch()} />
      ) : listQuery.data.length === 0 ? (
        <EmptyState>
          {kind === 'followers' ? 'Ainda não há seguidores.' : 'Ainda não segue ninguém.'}
        </EmptyState>
      ) : (
        <ul className="person-list">
          {listQuery.data.map((person) => (
            <PersonRow
              key={person.username}
              person={person}
              isFollowing={myFollowingUsernames.has(person.username)}
              showFollowButton={Boolean(user) && person.username !== user?.username}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
