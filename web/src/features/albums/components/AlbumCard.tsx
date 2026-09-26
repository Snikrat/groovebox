import { Link } from 'react-router-dom';
import { AlbumCover } from '../../../shared/components/AlbumCover';
import { Stars } from '../../../shared/components/Stars';
import { getYear } from '../../../shared/utils/format';

interface AlbumCardProps {
  album: {
    musicbrainzId: string;
    title: string;
    artistName: string;
    firstReleaseDate: string | null;
    coverUrl: string | null;
  };
  /** Nota do usuário, exibida na biblioteca e na Home. */
  rating?: number | null;
}

export function AlbumCard({ album, rating }: AlbumCardProps) {
  const year = getYear(album.firstReleaseDate);

  return (
    <Link to={`/album/${album.musicbrainzId}`} className="album-card">
      <AlbumCover src={album.coverUrl} alt={`Capa de ${album.title}`} />
      <div className="album-card__body">
        <h3 className="album-card__title">{album.title}</h3>
        <p className="album-card__artist">{album.artistName}</p>
        {(year || rating != null) && (
          <div className="album-card__meta">
            {rating != null ? <Stars rating={rating} size="sm" /> : <span>{year}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
