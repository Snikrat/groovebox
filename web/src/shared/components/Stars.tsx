import { formatRating } from '../utils/format';

const STAR_PATH =
  'M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6-4.9-4.6 6.7-.8z';

/** Estrela preenchida proporcionalmente (0 = vazia, 0.5 = meia, 1 = cheia). */
export function StarIcon({ fill }: { fill: number }) {
  return (
    <span className="star" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="star__base">
        <path d={STAR_PATH} />
      </svg>
      <span className="star__fill" style={{ width: `${fill * 100}%` }}>
        <svg viewBox="0 0 24 24">
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

export function starFill(rating: number, star: number): number {
  return Math.min(1, Math.max(0, rating - (star - 1)));
}

interface StarsProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function Stars({ rating, size = 'md' }: StarsProps) {
  return (
    <span className={`stars stars--${size}`} role="img" aria-label={`Nota ${formatRating(rating)} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} fill={starFill(rating, star)} />
      ))}
    </span>
  );
}
