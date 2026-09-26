# groovebox

MVP de uma aplicação para avaliar álbuns musicais: pesquisar, abrir um álbum, dar nota, escrever uma avaliação, favoritar e ver a própria biblioteca.

- **web/**: React + TypeScript + Vite, React Router, TanStack Query, Axios
- **server/**: Node.js + TypeScript + Express, PostgreSQL (`pg`)
- Dados musicais: [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API) (release-groups) e [Cover Art Archive](https://coverartarchive.org/)

## Como rodar

Requisitos: Node.js 20+ e PostgreSQL 14+.

1. **Banco de dados**: use um Postgres local ou suba um com Docker:

   ```bash
   docker compose up -d
   ```

   Sem Docker, crie um usuário e um banco `groovebox` (senha `groovebox`) ou ajuste `DATABASE_URL`.

2. **Configuração**: copie `server/.env.example` para `server/.env` e preencha o `MUSICBRAINZ_USER_AGENT` com um contato seu. O MusicBrainz exige um User-Agent identificando a aplicação.

3. **Instalar, migrar e rodar**:

   ```bash
   npm install
   npm run migrate
   npm run dev
   ```

   - Web: http://localhost:5173
   - API: http://localhost:3333/api

## Como funciona

```
React ──/api──▶ Express ──▶ PostgreSQL
                   │
                   └──▶ MusicBrainz (fila de 1 req/s, User-Agent próprio, cache de busca em memória)
```

- **Busca** (`GET /api/albums/search?q=`): consulta o MusicBrainz por título e por artista e ordena por relevância (score × número de edições oficiais, já que a API não tem noção de popularidade). Nada é salvo no banco.
- **Álbum** (`GET /api/albums/:mbid`): se ainda não existe no banco, o backend busca o release-group, escolhe uma edição representativa (a release oficial mais antiga), busca a tracklist e verifica se há capa no Cover Art Archive. Álbum e faixas são salvos em uma transação. O banco local cresce conforme o uso.
- **Capas**: só a URL do Cover Art Archive é guardada (`NULL` se não houver capa). O frontend mostra um placeholder quando não há imagem.
- **Autenticação**: email e senha. A senha é guardada com `scrypt`. O login cria uma sessão na tabela `sessions` e envia um cookie `httpOnly` com um token aleatório. O banco guarda só o hash SHA-256 do token. A sessão expira em 30 dias, e o logout a apaga no servidor. Busca e página de álbum são públicas; reviews, favoritos e a biblioteca exigem login.

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }`: cria a conta e já inicia a sessão |
| POST | `/api/auth/login` | `{ email, password }`: inicia a sessão |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Usuário logado (`null` se não houver) |
| GET | `/api/albums/search?q=&offset=` | Pesquisa álbuns no MusicBrainz. Retorna `{ items, hasMore }` em páginas de 24 |
| GET | `/api/albums/:musicbrainzId` | Detalhes do álbum (importa na primeira vez) |
| GET | `/api/albums/:musicbrainzId/tracks` | Tracklist |
| GET | `/api/reviews` | Avaliações do usuário, com o álbum |
| GET | `/api/reviews/:albumId` | Avaliação do usuário para o álbum (`null` se não houver) |
| POST | `/api/reviews` | `{ albumId, rating, review }`: cria a avaliação (409 se já existir) |
| PUT | `/api/reviews/:id` | `{ rating, review }`: edita a avaliação |
| DELETE | `/api/reviews/:id` | Exclui a avaliação |
| GET | `/api/favorites` | Favoritos do usuário, com a nota dada |
| POST | `/api/favorites/:albumId` | Favorita (idempotente) |
| DELETE | `/api/favorites/:albumId` | Remove dos favoritos |

As rotas `/api/reviews` e `/api/favorites` exigem login (401 sem sessão) e sempre operam sobre o usuário logado.

Notas vão de 0.5 a 5, em passos de 0.5. A regra é validada na API e por `CHECK` no banco.

## Estrutura

```
server/
  migrations/            SQL versionado (npm run migrate)
  src/
    db/                  pool e runner de migrations
    shared/              erros HTTP, validação
    features/
      auth/              cadastro, login, sessões, middleware
      musicbrainz/       cliente (rate limit), normalização, Cover Art Archive
      albums/            rotas, service (importação), repository
      reviews/           rotas, repository
      favorites/         rotas, repository
web/src/
  routes/                router e layout
  shared/                componentes (Header, busca, capa, estrelas, estados), api, utils
  features/
    auth/                login, cadastro, usuário atual, proteção de rotas
    albums/              busca, detalhes, card, tracklist
    reviews/             formulário e input de estrelas
    favorites/           botão de favoritar
    home/ library/       páginas
```
