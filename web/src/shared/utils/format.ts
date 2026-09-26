// Datas do MusicBrainz podem ser parciais ("2010", "2010-07", "2010-07-27").
export function getYear(date: string | null): string | null {
  return date ? date.slice(0, 4) : null;
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** "26 de set. de 2026" */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Formata uma data pura "AAAA-MM-DD" (sem hora), como as audições do diário.
 * Difere de formatDate: constrói a data no fuso local, para não exibir o dia
 * anterior em fusos negativos (new Date("AAAA-MM-DD") assume meia-noite UTC).
 */
export function formatPlainDate(plainDate: string): string {
  const [year, month, day] = plainDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "Setembro de 2026", a partir de uma data pura "AAAA-MM-DD". */
export function monthYearLabel(plainDate: string): string {
  const [year, month] = plainDate.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Data de hoje no formato "AAAA-MM-DD", no fuso local. */
export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatRating(rating: number): string {
  return rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
