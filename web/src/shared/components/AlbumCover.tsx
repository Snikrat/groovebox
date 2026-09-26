import { useState } from 'react';

interface AlbumCoverProps {
  src: string | null;
  alt: string;
}

export function AlbumCover(props: AlbumCoverProps) {
  // A key reinicia o estado de erro quando a URL muda.
  return <CoverImage key={props.src ?? 'no-cover'} {...props} />;
}

function CoverImage({ src, alt }: AlbumCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="cover cover--placeholder" role="img" aria-label={`${alt} (sem capa)`}>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="17" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <circle cx="32" cy="32" r="6" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return <img className="cover" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
