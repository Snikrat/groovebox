import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://groovebox:groovebox@localhost:5432/groovebox',
  musicBrainzUserAgent:
    process.env.MUSICBRAINZ_USER_AGENT ?? 'Groovebox/0.1.0 ( configure MUSICBRAINZ_USER_AGENT no .env )',
};
