# groovebox

MVP de uma aplicação para avaliar álbuns musicais: pesquisar, abrir um álbum, dar nota, escrever uma avaliação, marcar faixas favoritas, favoritar o álbum, guardar numa lista "quero ouvir", registrar audições num diário, ver a discografia de um artista, destacar seus 4 álbuns favoritos, gerar um card para compartilhar, ter um perfil público, seguir outras pessoas e ver um feed, curtir e comentar avaliações, e montar listas públicas com curadoria.

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
- **Autenticação**: email e senha. A senha é guardada com `scrypt`. O login cria uma sessão na tabela `sessions` e envia um cookie `httpOnly` com um token aleatório. O banco guarda só o hash SHA-256 do token. A sessão expira em 30 dias, e o logout a apaga no servidor. Busca e página de álbum são públicas; reviews, favoritos, diário e a biblioteca exigem login.
- **Diário**: cada audição registrada (`listens`) tem só uma data, e o mesmo álbum pode ter várias. É separado da avaliação: a nota e o texto continuam sendo um por álbum. A página `/diary` agrupa as audições por mês e marca como "Reouvido" quando não é a primeira audição daquele álbum (calculado no banco com uma window function, considerando todas as audições do usuário, não só a página carregada).
- **Perfil público** (`/u/:username`): mostra os 4 favoritos em destaque, as avaliações e os favoritos de qualquer usuário, sem exigir login. O nome de usuário é gerado a partir do nome no cadastro (acentos viram "-"; um número é acrescentado se já existir) e não é editável nesta versão. Nunca expõe o email.
- **Artista** (`/artist/:mbid`): lista a discografia principal (álbuns de estúdio; ao vivo, coletâneas e trilhas sonoras ficam de fora) consultando o MusicBrainz direto, com cache de 10 min — não é importada para o banco. Sobrepõe a nota do usuário logado em cada álbum já avaliado.
- **Faixas favoritas**: marcação simples (sem nota), independente por faixa. Aparece como um coração ao lado de cada faixa na página do álbum.
- **Quero ouvir**: lista separada da de favoritos, para álbuns que a pessoa ainda não ouviu. Ao criar a primeira avaliação de um álbum, ele sai da lista automaticamente.
- **Seus 4 favoritos**: até 4 álbuns fixados no topo do perfil público, escolhidos entre os que a pessoa já avaliou ou favoritou (não há busca dedicada para isso nesta versão). Editado na biblioteca; a ordem é a ordem em que foram adicionados.
- **Card para compartilhar**: gerado inteiramente no navegador via Canvas (capa, título, artista, nota e um trecho da avaliação), sem passar pelo backend. Aparece só depois de avaliar o álbum. A capa é desenhada com `crossOrigin="anonymous"` — o Cover Art Archive permite CORS — e cai num visual de fallback se a capa não existir ou não carregar.
- **Seguir e feed**: seguir é aberto, sem aprovação. O feed (`/feed`) mostra as avaliações de quem você segue, mais recentes primeiro — não inclui audições do diário. Não há busca de pessoas nesta versão: você chega ao perfil de alguém pelo nome, num comentário, numa curtida ou em "Outras avaliações" na página do álbum, e segue a partir de lá.
- **Curtidas e comentários**: em toda avaliação pública (no feed ou em "Outras avaliações" do álbum). Comentários são uma lista simples, sem respostas aninhadas; cada um só pode apagar os próprios.
- **Listas públicas**: título, descrição opcional e álbuns adicionados por busca (a mesma busca da Home). A ordem é a de adição — sem reordenar por arrastar nesta versão. Só quem criou a lista pode editá-la ou apagá-la; qualquer pessoa pode vê-la pelo link.

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
| GET | `/api/listens?offset=` | Diário do usuário, do mais recente ao mais antigo. Retorna `{ items, hasMore }` em páginas de 50 |
| GET | `/api/listens?albumId=` | Audições do usuário para um álbum |
| POST | `/api/listens` | `{ albumId, listenedOn: "AAAA-MM-DD" }`: registra uma audição (não pode ser no futuro) |
| DELETE | `/api/listens/:id` | Remove uma audição |
| GET | `/api/users/:username` | Perfil público (nome e username; 404 se não existir) |
| GET | `/api/users/:username/reviews` | Avaliações públicas desse usuário |
| GET | `/api/users/:username/favorites` | Favoritos públicos desse usuário |
| GET | `/api/users/:username/featured` | Os 4 favoritos em destaque desse usuário |
| GET | `/api/artists/:musicbrainzId` | Nome e discografia principal do artista |
| GET | `/api/track-favorites?albumId=` | Ids das faixas favoritas do usuário nesse álbum |
| POST | `/api/track-favorites/:trackId` | Marca a faixa como favorita (idempotente) |
| DELETE | `/api/track-favorites/:trackId` | Desmarca a faixa |
| GET | `/api/wishlist` | Lista "quero ouvir" do usuário |
| POST | `/api/wishlist/:albumId` | Adiciona à lista (idempotente) |
| DELETE | `/api/wishlist/:albumId` | Remove da lista |
| GET | `/api/featured` | Os 4 favoritos do usuário logado, em ordem |
| PUT | `/api/featured` | `{ albumIds: number[] }`: substitui a lista inteira (até 4, sem repetir) |
| GET | `/api/follows/following` | Usuários que o usuário logado segue |
| POST | `/api/follows/:username` | Segue (idempotente; 400 ao tentar seguir a si mesmo) |
| DELETE | `/api/follows/:username` | Deixa de seguir |
| GET | `/api/feed?offset=` | Avaliações de quem o usuário segue, mais recentes primeiro. `{ items, hasMore }` em páginas de 20 |
| GET | `/api/albums/:musicbrainzId/reviews` | Avaliações de outras pessoas para o álbum, com curtidas e comentários (pública) |
| POST | `/api/review-social/:reviewId/likes` | Curte a avaliação (idempotente) |
| DELETE | `/api/review-social/:reviewId/likes` | Remove a curtida |
| GET | `/api/review-social/:reviewId/comments` | Lista os comentários (pública) |
| POST | `/api/review-social/:reviewId/comments` | `{ text }`: comenta |
| DELETE | `/api/review-social/:reviewId/comments/:commentId` | Apaga um comentário (só o autor) |
| GET | `/api/lists` | Listas do usuário logado |
| POST | `/api/lists` | `{ title, description? }`: cria uma lista |
| GET | `/api/lists/:id` | Lista com os álbuns, em ordem (pública) |
| PUT | `/api/lists/:id` | `{ title, description }`: edita (só o dono) |
| DELETE | `/api/lists/:id` | Apaga a lista (só o dono) |
| POST | `/api/lists/:id/items` | `{ albumId }`: adiciona um álbum (só o dono) |
| DELETE | `/api/lists/:id/items/:albumId` | Remove um álbum da lista (só o dono) |
| GET | `/api/users/:username/lists` | Listas públicas desse usuário |

As rotas `/api/reviews`, `/api/favorites`, `/api/listens`, `/api/track-favorites`, `/api/wishlist`, `/api/featured`, `/api/follows` e as escritas em `/api/lists` e `/api/review-social` exigem login (401 sem sessão). As rotas `/api/users/:username`, `/api/artists/:mbid`, `GET /api/lists/:id` e as leituras em `/api/review-social` são públicas.

`/api/review-social` é montado como um router à parte de `/api/reviews`: este último aplica `requireAuth` a tudo que passa por ele, o que bloquearia a leitura pública de comentários se estivesse no mesmo router.

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
      artists/           rotas, service (discografia via MusicBrainz, com cache)
      reviews/           rotas, repository
      favorites/         rotas, repository
      listens/           rotas, repository (diário)
      track-favorites/   rotas, repository (faixas favoritas)
      wishlist/          rotas, repository ("quero ouvir")
      featured/          rotas, repository ("seus 4 favoritos")
      follows/           rotas, repository (seguir)
      feed/              rotas, repository (feed)
      lists/             rotas, repository (listas públicas)
      profile/           rotas, repository (perfil público)
    reviews/
      reviewSocial.routes.ts  curtidas e comentários (router à parte, ver acima)
web/src/
  routes/                router e layout
  shared/                componentes (Header, busca, capa, estrelas, estados), api, utils
  features/
    auth/                login, cadastro, usuário atual, proteção de rotas
    albums/              busca, detalhes, card, tracklist (com faixas favoritas), outras avaliações
    artists/             página /artist/:mbid
    reviews/             formulário, input de estrelas, ReviewCard (curtir/comentar)
    favorites/           botão de favoritar
    listens/             bloco "Suas audições" e página /diary
    wishlist/            botão "Quero ouvir"
    featured/            editor de "seus 4 favoritos" (biblioteca)
    share/               card para compartilhar (Canvas)
    follows/             botão de seguir
    feed/                página /feed
    lists/               "Minhas listas" (biblioteca), busca para adicionar álbum, página /list/:id
    profile/             página /u/:username
    home/ library/       páginas
```
