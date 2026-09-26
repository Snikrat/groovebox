import { useState } from 'react';
import { StarIcon, starFill } from '../../../shared/components/Stars';
import { formatRating } from '../../../shared/utils/format';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

// Cada estrela tem duas metades clicáveis: a esquerda vale meia estrela, a direita a estrela inteira.
export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? value;

  return (
    <div className="star-input" role="radiogroup" aria-label="Minha nota" onMouseLeave={() => setPreview(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="star-input__star">
          <StarIcon fill={starFill(shown, star)} />
          {[star - 0.5, star].map((rating) => (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={value === rating}
              aria-label={`${formatRating(rating)} ${rating === 1 ? 'estrela' : 'estrelas'}`}
              className={`star-input__half star-input__half--${Number.isInteger(rating) ? 'right' : 'left'}`}
              onMouseEnter={() => setPreview(rating)}
              onFocus={() => setPreview(rating)}
              onBlur={() => setPreview(null)}
              onClick={() => onChange(rating)}
            />
          ))}
        </span>
      ))}
      <span className="star-input__value" aria-hidden="true">
        {shown > 0 ? formatRating(shown) : '–'}
      </span>
    </div>
  );
}
