import { pool } from '../../db/pool.js';
import type { NormalizedTrack } from '../musicbrainz/normalize.js';
import type { Album, NewAlbum, Track } from './albums.types.js';

// Objeto JSON com o resumo do álbum, reutilizado nas consultas de reviews e favoritos.
export const albumSummaryJson = `json_build_object(
  'id', a.id,
  'musicbrainzId', a.musicbrainz_id,
  'title', a.title,
  'artistName', a.artist_name,
  'firstReleaseDate', a.first_release_date,
  'coverUrl', a.cover_url
)`;

export async function findAlbumByMbid(mbid: string): Promise<Album | null> {
  const { rows } = await pool.query<Album>(
    `SELECT a.id,
            a.musicbrainz_id        AS "musicbrainzId",
            a.title,
            a.artist_name           AS "artistName",
            a.artist_musicbrainz_id AS "artistMusicbrainzId",
            a.first_release_date    AS "firstReleaseDate",
            a.primary_type          AS "primaryType",
            a.cover_url             AS "coverUrl",
            coalesce(a.genres, '{}') AS "genres",
            a.label,
            a.country,
            coalesce(a.external_links, '[]') AS "externalLinks",
            (SELECT SUM(duration_ms)::int FROM tracks WHERE album_id = a.id) AS "totalDurationMs",
            ROUND(AVG(r.rating), 2) AS "averageRating",
            COUNT(r.id)::int        AS "ratingsCount"
       FROM albums a
       LEFT JOIN reviews r ON r.album_id = a.id
      WHERE a.musicbrainz_id = $1
      GROUP BY a.id`,
    [mbid],
  );
  return rows[0] ?? null;
}

export async function insertAlbumWithTracks(album: NewAlbum, tracks: NormalizedTrack[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO albums (
         musicbrainz_id, title, artist_name, artist_musicbrainz_id, first_release_date,
         primary_type, cover_url, genres, label, country, external_links
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
       ON CONFLICT (musicbrainz_id) DO NOTHING
       RETURNING id`,
      [
        album.musicbrainzId,
        album.title,
        album.artistName,
        album.artistMusicbrainzId,
        album.firstReleaseDate,
        album.primaryType,
        album.coverUrl,
        album.genres,
        album.label,
        album.country,
        JSON.stringify(album.externalLinks),
      ],
    );

    // Outra requisição já salvou este álbum.
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return;
    }

    if (tracks.length > 0) {
      await client.query(
        `INSERT INTO tracks (album_id, musicbrainz_recording_id, position, title, duration_ms)
         SELECT $1, * FROM unnest($2::uuid[], $3::int[], $4::text[], $5::int[])`,
        [
          rows[0].id,
          tracks.map((track) => track.musicbrainzRecordingId),
          tracks.map((track) => track.position),
          tracks.map((track) => track.title),
          tracks.map((track) => track.durationMs),
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listTracks(albumId: number): Promise<Track[]> {
  const { rows } = await pool.query<Track>(
    `SELECT id, position, title,
            duration_ms              AS "durationMs",
            musicbrainz_recording_id AS "musicbrainzRecordingId"
       FROM tracks
      WHERE album_id = $1
      ORDER BY position`,
    [albumId],
  );
  return rows;
}
