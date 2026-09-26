const BASE_URL = 'https://coverartarchive.org/release-group';

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
