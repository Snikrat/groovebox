import type { ReactNode } from 'react';

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button--ghost" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="state">
      <p>{children}</p>
    </div>
  );
}

/** Placeholder de cards enquanto uma lista de álbuns carrega. */
export function AlbumGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="album-grid" role="status" aria-label="Carregando álbuns">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="album-card album-card--skeleton">
          <div className="cover skeleton" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
