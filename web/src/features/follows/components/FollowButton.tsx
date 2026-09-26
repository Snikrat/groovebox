import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '../../../shared/services/api';
import { follow, unfollow } from '../services/followsApi';

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
}

export function FollowButton({ username, isFollowing }: FollowButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => (isFollowing ? unfollow(username) : follow(username)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['follows', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return (
    <>
      <button
        type="button"
        className={`button${isFollowing ? '' : ' button--primary'}`}
        aria-pressed={isFollowing}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </button>
      {mutation.isError && (
        <span className="form-error" role="alert">
          {getErrorMessage(mutation.error)}
        </span>
      )}
    </>
  );
}
