const BASE_URL = 'https://coverartarchive.org/release-group';
const MAX_ADDITIONAL_IMAGES = 4;

export function coverUrlFor(releaseGroupMbid: string, size: 250 | 500 = 500): string {
  return `${BASE_URL}/${releaseGroupMbid}/front-${size}`;
}

// Consulta o Cover Art Archive apenas para saber se a capa existe; a imagem nunca é baixada.
// Em caso de falha de rede, guarda a URL mesmo assim: o frontend exibe um placeholder se ela não carregar.
export async function findCoverUrl(releaseGroupMbid: string): Promise<string | null> {
  const url = coverUrlFor(releaseGroupMbid);
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(5_000) });
    return response.status === 404 ? null : url;
  } catch {
    return url;
  }
}

interface CoverArtImage {
  types: string[];
  thumbnails: { 500?: string; large?: string };
}

export interface AdditionalCover {
  label: string;
  url: string;
}

/** Contracapa e páginas do encarte, se o Cover Art Archive tiver — além da capa frontal. */
export async function findAdditionalCovers(releaseGroupMbid: string): Promise<AdditionalCover[]> {
  let images: CoverArtImage[];
  try {
    const response = await fetch(`${BASE_URL}/${releaseGroupMbid}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return [];
    images = (await response.json()).images ?? [];
  } catch {
    return [];
  }

  const covers: AdditionalCover[] = [];

  const back = images.find((image) => image.types.includes('Back'));
  const backUrl = back?.thumbnails[500] ?? back?.thumbnails.large;
  if (backUrl) covers.push({ label: 'Contracapa', url: backUrl });

  // Ignora imagens que também são a capa frontal, para não repetir a mesma imagem.
  const bookletPages = images.filter((image) => image.types.includes('Booklet') && !image.types.includes('Front'));
  bookletPages.slice(0, MAX_ADDITIONAL_IMAGES).forEach((page, index) => {
    const url = page.thumbnails[500] ?? page.thumbnails.large;
    if (url) covers.push({ label: `Encarte ${index + 1}`, url });
  });

  return covers;
}
