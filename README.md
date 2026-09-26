# groovebox

MVP de uma aplicação para avaliar álbuns musicais: pesquisar, abrir um álbum, dar nota, escrever uma avaliação, marcar faixas favoritas, favoritar o álbum, guardar numa lista "quero ouvir", registrar audições num diário (cada uma com sua própria nota, editável), ver a discografia de um artista, destacar seus 4 álbuns favoritos (arrastando para reordenar), gerar um card para compartilhar, ter um perfil público com nome de usuário editável e listas de seguidores/seguindo, seguir outras pessoas e ver um feed, curtir e comentar avaliações, receber notificações dessas interações, montar listas públicas com curadoria (também reordenáveis por arrastar), ver estatísticas pessoais, descobrir álbuns e avaliações populares na Home (além dos lançamentos recentes de artistas que você já avaliou), navegar por gênero e por ano, buscar pessoas e registrar tudo de uma vez num modal rápido.

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
- **Álbum** (`GET /api/albums/:mbid`): se ainda não existe no banco, o backend busca o release-group (com gêneros e links externos), escolhe uma edição representativa (a release oficial mais antiga, com selo e país), busca a tracklist e verifica se há capa no Cover Art Archive. Álbum e faixas são salvos em uma transação. O banco local cresce conforme o uso. A duração total é a soma das faixas, calculada na consulta — não é guardada. Gêneros e links vêm do MusicBrainz; nenhum campo depende de outro serviço externo além dele e do Cover Art Archive.
- **Capas**: só a URL do Cover Art Archive é guardada (`NULL` se não houver capa). O frontend mostra um placeholder quando não há imagem.
- **Autenticação**: email e senha. A senha é guardada com `scrypt`. O login cria uma sessão na tabela `sessions` e envia um cookie `httpOnly` com um token aleatório. O banco guarda só o hash SHA-256 do token. A sessão expira em 30 dias, e o logout a apaga no servidor. Busca e página de álbum são públicas; reviews, favoritos, diário e a biblioteca exigem login.
- **Diário**: cada audição registrada (`listens`) tem uma data e, opcionalmente, sua própria nota — independente da nota "oficial" do álbum em `reviews` (que segue sendo uma por álbum, usada na média, na biblioteca e no card de compartilhar). A página `/diary` agrupa as audições por mês, mostra a nota daquela audição específica quando houver, e marca como "Reouvido" quando não é a primeira audição daquele álbum (calculado no banco com uma window function, considerando todas as audições do usuário, não só a página carregada). Data e nota de uma audição já registrada podem ser editadas depois (`PUT /api/listens/:id`).
- **Perfil público** (`/u/:username`): mostra os 4 favoritos em destaque, as avaliações e os favoritos de qualquer usuário, sem exigir login. O nome de usuário é gerado a partir do nome no cadastro (acentos viram "-"; um número é acrescentado se já existir), mas pode ser trocado depois em `/settings` (regras mais estritas que a geração automática: se o formato escolhido for inválido, a API recusa em vez de "consertar" silenciosamente). Nunca expõe o email. As contagens de seguidores/seguindo no cabeçalho do perfil levam às páginas `/u/:username/followers` e `/u/:username/following`, com a lista de pessoas e o botão de seguir de cada uma.
- **Artista** (`/artist/:mbid`): lista a discografia principal (álbuns de estúdio; ao vivo, coletâneas e trilhas sonoras ficam de fora) consultando o MusicBrainz direto, com cache de 10 min — não é importada para o banco. Sobrepõe a nota do usuário logado em cada álbum já avaliado.
- **Faixas favoritas**: marcação simples (sem nota), independente por faixa. Aparece como um coração ao lado de cada faixa na página do álbum.
- **Quero ouvir**: lista separada da de favoritos, para álbuns que a pessoa ainda não ouviu. Ao criar a primeira avaliação de um álbum, ele sai da lista automaticamente.
- **Seus 4 favoritos**: até 4 álbuns fixados no topo do perfil público, escolhidos entre os que a pessoa já avaliou ou favoritou (não há busca dedicada para isso nesta versão). Editado na biblioteca; a ordem pode ser mudada arrastando as capas (drag and drop nativo do HTML5, sem biblioteca).
- **Card para compartilhar**: gerado inteiramente no navegador via Canvas (capa, título, artista, nota e um trecho da avaliação), sem passar pelo backend. Aparece só depois de avaliar o álbum. A capa é desenhada com `crossOrigin="anonymous"` — o Cover Art Archive permite CORS — e cai num visual de fallback se a capa não existir ou não carregar.
- **Seguir e feed**: seguir é aberto, sem aprovação. O feed (`/feed`) mostra as avaliações de quem você segue, mais recentes primeiro — não inclui audições do diário. Além da busca de pessoas (`/people`, abaixo), dá pra chegar ao perfil de alguém pelo nome, num comentário, numa curtida ou em "Outras avaliações" na página do álbum, e seguir a partir de lá.
- **Curtidas e comentários**: em toda avaliação pública (no feed ou em "Outras avaliações" do álbum). Comentários são uma lista simples, sem respostas aninhadas; cada um só pode apagar os próprios.
- **Listas públicas**: título, descrição opcional e álbuns adicionados por busca (a mesma busca da Home). A ordem é a de adição, mas dá para arrastar as capas para reordenar (`PUT /api/lists/:id/items/order`, substituindo a ordem inteira — o mesmo padrão usado em "seus 4 favoritos"). Só quem criou a lista pode editá-la ou apagá-la; qualquer pessoa pode vê-la pelo link.
- **Registro rápido**: um botão "Registrar" (na busca, na discografia do artista e na lista "quero ouvir") abre um modal com nota, data e avaliação num só passo — cria/atualiza a avaliação e registra a audição juntas, com a mesma nota. Não duplica a UI da página do álbum, que continua com o fluxo completo (editar, excluir, histórico de audições).
- **Estatísticas** (`/stats`): número de avaliações e audições, nota média, distribuição de notas, artistas mais avaliados e álbuns por década — tudo calculado a partir de `reviews` e `listens`, sem tabelas novas.
- **Descoberta na Home**: "Populares esta semana" (álbuns mais avaliados nos últimos 30 dias) e "Avaliações em destaque" (as mais curtidas do app inteiro, não só de quem você segue). Cada seção some sozinha enquanto não há dado suficiente — não aparece "nada por aqui ainda" pro visitante.
- **Busca de pessoas** (`/people`): por nome ou @usuário, mais uma lista de sugestões (pessoas mais seguidas no app que você ainda não segue). É a peça que faltava para "seguir" ser utilizável sem depender só de topar com alguém numa avaliação.
- **Detalhes do álbum**: gêneros (tags, cada uma um link para `/genre/:genre`), selo, país (nome em português via `Intl.DisplayNames`, nativo do navegador — sem tabela de tradução), ano (link para `/year/:ano`), duração total e links externos (site oficial, Discogs, Wikidata, AllMusic, Bandcamp, YouTube, streaming — filtrados de dezenas de tipos de relação que o MusicBrainz tem, a maioria ruído para uma página de álbum). Álbuns importados antes desta versão não tinham esses campos; um script de manutenção único (não versionado, já rodou) preencheu os que já existiam no banco.
- **Contracapa e encarte**: além da capa frontal, o Cover Art Archive às vezes tem a contracapa e páginas do encarte/liner notes digitalizadas. Quando existem, aparecem como uma fileira de miniaturas abaixo da capa (até 1 contracapa + 4 páginas de encarte), cada uma abrindo a imagem em tamanho maior numa nova aba — sem lightbox. Guardadas como JSONB (`additional_covers`) no momento da importação; `NULL`/vazio para álbuns sem essas imagens ou importados antes desta versão.
- **Navegar por gênero e por ano** (`/genre/:genero`, `/year/:ano`): lista os álbuns já abertos no groovebox que têm aquele gênero ou ano de lançamento — busca só no banco local, não no MusicBrainz, então só mostra o que alguém já importou navegando ou pesquisando.
- **Lançamentos recentes**: na Home de quem está logado, uma seção com álbuns de estúdio lançados nos últimos 12 meses por artistas que a pessoa já avaliou (mesmo filtro de "discografia principal" da página do artista: sem ao vivo, coletâneas ou trilhas sonoras), excluindo o que já está nas avaliações ou na lista "quero ouvir". Consulta a discografia direto no MusicBrainz a cada requisição (mesmo cache de 10 min da página do artista); não é uma tabela no banco.
- **Notificações**: seguir, curtir uma avaliação e comentar geram uma notificação pro dono da avaliação (curtidas e seguidas repetidas não duplicam, e ninguém é notificado da própria ação). O sino no cabeçalho mostra a contagem de não lidas (atualizada a cada 45s) e leva a `/notifications`, que marca tudo como lido na primeira vez que a página carrega naquela visita.

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }`: cria a conta e já inicia a sessão |
| POST | `/api/auth/login` | `{ email, password }`: inicia a sessão |
| POST | `/api/auth/logout` | Encerra a sessão |
| GET | `/api/auth/me` | Usuário logado (`null` se não houver) |
| PUT | `/api/auth/username` | `{ username }`: troca o nome de usuário (409 se já estiver em uso) |
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
| POST | `/api/listens` | `{ albumId, listenedOn: "AAAA-MM-DD", rating? }`: registra uma audição (não pode ser no futuro); a nota é opcional e independente da avaliação |
| PUT | `/api/listens/:id` | `{ listenedOn, rating? }`: edita a data e/ou a nota de uma audição |
| DELETE | `/api/listens/:id` | Remove uma audição |
| GET | `/api/users/:username` | Perfil público (nome e username; 404 se não existir) |
| GET | `/api/users/:username/reviews` | Avaliações públicas desse usuário |
| GET | `/api/users/:username/favorites` | Favoritos públicos desse usuário |
| GET | `/api/users/:username/featured` | Os 4 favoritos em destaque desse usuário |
| GET | `/api/users/:username/followers` | Quem segue esse usuário |
| GET | `/api/users/:username/following` | Quem esse usuário segue |
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
| PUT | `/api/lists/:id/items/order` | `{ albumIds: number[] }`: substitui a ordem inteira dos álbuns da lista (só o dono) |
| DELETE | `/api/lists/:id/items/:albumId` | Remove um álbum da lista (só o dono) |
| GET | `/api/users/:username/lists` | Listas públicas desse usuário |
| GET | `/api/discover/albums` | Álbuns mais avaliados recentemente (pública) |
| GET | `/api/discover/reviews` | Avaliações mais curtidas do app, de qualquer usuário (pública) |
| GET | `/api/discover/new-releases` | Lançamentos recentes de artistas que o usuário logado já avaliou |
| GET | `/api/browse/genres` | Gêneros presentes no banco, com a contagem de álbuns (pública) |
| GET | `/api/browse/genres/:genre` | Álbuns do banco com esse gênero (pública) |
| GET | `/api/browse/years/:year` | Álbuns do banco lançados nesse ano (pública) |
| GET | `/api/stats` | Estatísticas do usuário logado (avaliações, audições, distribuição de notas, artistas, décadas) |
| GET | `/api/people/search?q=` | Busca pessoas por nome ou username (pública) |
| GET | `/api/people/suggested` | Pessoas mais seguidas no app que o usuário ainda não segue (pública) |
| GET | `/api/notifications?offset=` | Notificações do usuário logado, mais recentes primeiro. `{ items, hasMore }` em páginas de 30 |
| GET | `/api/notifications/unread-count` | `{ count }`: quantas ainda não foram lidas |
| POST | `/api/notifications/read-all` | Marca todas como lidas |

As rotas `/api/reviews`, `/api/favorites`, `/api/listens`, `/api/track-favorites`, `/api/wishlist`, `/api/featured`, `/api/follows`, `/api/stats`, `/api/notifications`, `PUT /api/auth/username`, `GET /api/discover/new-releases` e as escritas em `/api/lists` e `/api/review-social` exigem login (401 sem sessão). As rotas `/api/users/:username`, `/api/artists/:mbid`, `/api/browse/*`, `GET /api/discover/albums`, `GET /api/discover/reviews`, `/api/people/*`, `GET /api/lists/:id` e as leituras em `/api/review-social` são públicas.

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
      profile/           rotas, repository (perfil público, seguidores/seguindo)
      discover/          rotas, repository, service (populares na Home, lançamentos recentes)
      browse/            rotas, repository (páginas por gênero e por ano)
      notifications/     rotas, repository (seguir/curtir/comentar)
      stats/             rotas, repository (estatísticas)
      people/            rotas, repository (busca e sugestões)
    reviews/
      reviewSocial.routes.ts  curtidas e comentários (router à parte, ver acima)
web/src/
  routes/                router e layout
  shared/                componentes (Header, busca, capa, estrelas, estados), api, utils
  features/
    auth/                login, cadastro, usuário atual, proteção de rotas, página /settings (trocar username)
    albums/              busca, detalhes, card, tracklist (com faixas favoritas), outras avaliações
    artists/             página /artist/:mbid
    reviews/             formulário, input de estrelas, ReviewCard (curtir/comentar)
    favorites/           botão de favoritar
    listens/             bloco "Suas audições" (com nota por audição) e página /diary
    wishlist/            botão "Quero ouvir"
    featured/            editor de "seus 4 favoritos" (biblioteca)
    share/               card para compartilhar (Canvas)
    follows/             botão de seguir
    feed/                página /feed
    lists/               "Minhas listas" (biblioteca), busca para adicionar álbum, página /list/:id (arrastar para reordenar)
    log/                 modal de registro rápido (LogButton/LogModal)
    discover/            seções "Populares", "Em destaque" e "Lançamentos recentes" da Home
    browse/              páginas /genre/:genero e /year/:ano
    notifications/       sino do cabeçalho e página /notifications
    stats/               página /stats, componente BarChart
    people/              página /people, busca e sugestões
    profile/             página /u/:username, listas /followers e /following
    home/ library/       páginas
```
