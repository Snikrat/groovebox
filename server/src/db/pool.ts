import pg from 'pg';
import { config } from '../config.js';

// NUMERIC vem do pg como string; as notas (0.5 a 5) cabem com folga em um number.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => Number.parseFloat(value));

export const pool = new pg.Pool({ connectionString: config.databaseUrl });
