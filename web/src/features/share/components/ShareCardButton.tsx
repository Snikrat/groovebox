import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { getReviewForAlbum } from '../../reviews/services/reviewsApi';
import { drawShareCard } from '../shareCard';

interface ShareCardButtonProps {
  albumId: number;
  title: string;
  artistName: string;
  coverUrl: string | null;
}

// Só faz sentido compartilhar depois de avaliar: é a nota e o texto que aparecem no card.
export function ShareCardButton(props: ShareCardButtonProps) {
  const reviewQuery = useQuery({
    queryKey: ['reviews', 'album', props.albumId],
    queryFn: () => getReviewForAlbum(props.albumId),
  });
  const [isOpen, setIsOpen] = useState(false);

  if (!reviewQuery.data) return null;

  return (
    <>
      <button type="button" className="button" onClick={() => setIsOpen(true)}>
        Compartilhar
      </button>
      {isOpen && (
        <ShareCardOverlay
          title={props.title}
          artistName={props.artistName}
          coverUrl={props.coverUrl}
          rating={reviewQuery.data.rating}
          reviewText={reviewQuery.data.review}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

interface ShareCardOverlayProps {
  title: string;
  artistName: string;
  coverUrl: string | null;
  rating: number;
  reviewText: string | null;
  onClose: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ShareCardOverlay({ title, artistName, coverUrl, rating, reviewText, onClose }: ShareCardOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setStatus('loading');
    drawShareCard(canvas, { title, artistName, coverUrl, rating, reviewText })
      .then(() => !cancelled && setStatus('ready'))
      .catch(() => !cancelled && setStatus('error'));

    return () => {
      cancelled = true;
    };
  }, [title, artistName, coverUrl, rating, reviewText]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `groovebox-${slugify(title)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  return (
    <div className="share-overlay" role="dialog" aria-modal="true" aria-label="Card para compartilhar" onClick={onClose}>
      <div className="share-overlay__panel" onClick={(event) => event.stopPropagation()}>
        <div className="share-overlay__canvas-wrap">
          {status === 'loading' && <span className="share-overlay__status">Gerando imagem…</span>}
          {status === 'error' && <span className="share-overlay__status">Não foi possível gerar a imagem.</span>}
          <canvas ref={canvasRef} className="share-overlay__canvas" hidden={status !== 'ready'} />
        </div>

        <div className="share-overlay__actions">
          <button type="button" className="button button--primary" onClick={handleDownload} disabled={status !== 'ready'}>
            Baixar imagem
          </button>
          <button type="button" className="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
