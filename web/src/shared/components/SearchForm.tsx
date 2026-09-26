import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchFormProps {
  initialValue?: string;
  size?: 'compact' | 'large';
  autoFocus?: boolean;
}

export function SearchForm({ initialValue = '', size = 'compact', autoFocus = false }: SearchFormProps) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const query = value.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form role="search" className={`search search--${size}`} onSubmit={handleSubmit}>
      <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Pesquise por um álbum ou artista"
        aria-label="Pesquise por um álbum ou artista"
        autoFocus={autoFocus}
        maxLength={200}
      />
      {size === 'large' && (
        <button type="submit" className="button button--primary">
          Pesquisar
        </button>
      )}
    </form>
  );
}
