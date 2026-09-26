import { HttpError } from './httpError.js';

const MBID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseMbid(value: string): string {
  if (!MBID_REGEX.test(value)) throw new HttpError(400, 'MBID inválido.');
  return value.toLowerCase();
}

export function parseId(value: unknown, label = 'id'): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, `${label} inválido.`);
  return id;
}
