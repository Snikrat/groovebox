import { Link } from 'react-router-dom';
import { FollowButton } from '../../follows/components/FollowButton';
import type { PersonSummary } from '../types/person';

interface PersonRowProps {
  person: PersonSummary;
  isFollowing: boolean;
  /** Esconde o botão de seguir (usuário não logado, ou é o próprio usuário). */
  showFollowButton: boolean;
}

export function PersonRow({ person, isFollowing, showFollowButton }: PersonRowProps) {
  return (
    <li className="person-row">
      <Link to={`/u/${person.username}`} className="person-row__link">
        <span className="person-row__name">{person.name}</span>
        <span className="muted">@{person.username}</span>
      </Link>
      {showFollowButton && <FollowButton username={person.username} isFollowing={isFollowing} />}
    </li>
  );
}
