import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { EmptyState, ErrorState, Loading } from '../../../shared/components/StateMessage';
import { getErrorMessage } from '../../../shared/services/api';
import { useCurrentUser } from '../../auth/hooks/useCurrentUser';
import { listFollowing } from '../../follows/services/followsApi';
import { PersonRow } from '../components/PersonRow';
import { getSuggestedPeople, searchPeople } from '../services/peopleApi';
import type { PersonSummary } from '../types/person';

export function PeoplePage() {
  const { user } = useCurrentUser();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const followingQuery = useQuery({
    queryKey: ['follows', 'following'],
    queryFn: listFollowing,
    enabled: Boolean(user),
  });
  const followingUsernames = new Set(followingQuery.data?.map((person) => person.username));

  const searchQuery = useQuery({
    queryKey: ['people', 'search', searchTerm],
    queryFn: () => searchPeople(searchTerm),
    enabled: searchTerm.length > 0,
  });

  const suggestedQuery = useQuery({ queryKey: ['people', 'suggested'], queryFn: getSuggestedPeople });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSearchTerm(query.trim());
  }

  function renderList(people: PersonSummary[] | undefined, isPending: boolean, error: unknown, emptyMessage: string) {
    if (isPending) return <Loading />;
    if (error) return <ErrorState message={getErrorMessage(error)} />;
    if (!people || people.length === 0) return <EmptyState>{emptyMessage}</EmptyState>;

    return (
      <ul className="person-list">
        {people.map((person) => (
          <PersonRow
            key={person.username}
            person={person}
            isFollowing={followingUsernames.has(person.username)}
            showFollowButton={Boolean(user) && person.username !== user?.username}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <h1 className="page-title">Pessoas</h1>

      <section className="section">
        <form role="search" className="search search--large" onSubmit={handleSubmit}>
          <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquise por nome ou @usuário"
            aria-label="Pesquise por nome ou usuário"
            maxLength={100}
          />
          <button type="submit" className="button button--primary">
            Pesquisar
          </button>
        </form>

        {searchTerm &&
          renderList(searchQuery.data, searchQuery.isPending, searchQuery.error, 'Nenhuma pessoa encontrada.')}
      </section>

      <section className="section">
        <h2 className="section__title">Sugestões para seguir</h2>
        {renderList(
          suggestedQuery.data,
          suggestedQuery.isPending,
          suggestedQuery.error,
          'Sem sugestões no momento.',
        )}
      </section>
    </>
  );
}
