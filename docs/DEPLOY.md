# Deploy — All Music Rentals

**Status:** em andamento (2026-08-20), sob prazo de 18h para uma beta pública de Home + Catálogo.
Ver `docs/adr/005-deploy-easypanel-em-vez-de-caddy.md` para a arquitetura e `.planning/ROADMAP.md`
(aviso de desvio de 2026-08-20) para o escopo aceito desta beta.

## Arquitetura

- **Build e runtime:** EasyPanel na VPS Hostinger (substitui Caddy — ver ADR 005), configurado com
  **fonte Git** (não imagem de registry): o EasyPanel conecta direto no repositório GitHub e builda
  a imagem usando o `Dockerfile` do projeto — um App para `web` (build a partir da raiz do repo) e
  um App para `cms` (build a partir de `./cms`), mais um Postgres gerenciado pelo próprio EasyPanel.
- **Gatilho de deploy: manual.** Fluxo decidido pelo usuário em 2026-08-20 (já usado em outros
  projetos dele): commit + push na `main` só leva o código para o GitHub; o build/deploy em si é
  disparado manualmente por ele no painel do EasyPanel, quando quiser. **Sem GitHub Actions, sem
  GHCR, sem webhook automático** — `.github/workflows/deploy.yml` e a Task 1 de 17-02 não são
  usados neste projeto; não é necessário colar esse arquivo no repositório.
- **Domínios:** `rentals.allmusicbr.com` (Next/`web`) e `cms.allmusicbr.com` (Strapi/`cms`) — DNS já
  configurado em 2026-08-20. **Atenção:** o `cms` é subdomínio direto de `allmusicbr.com`, **não**
  `cms.rentals.allmusicbr.com` — isso muda o valor de `NEXT_PUBLIC_STRAPI_MEDIA_URL` abaixo.
- **TLS:** automático, emitido pelo EasyPanel por domínio.
- **Convivência:** a mesma VPS já roda WordPress + MySQL em produção via EasyPanel, no domínio raiz
  `allmusicbr.com`. Este deploy não deve interromper esse site.

## Orçamento de RAM

**Gate de bloqueio removido por decisão do usuário (2026-08-20).** RAM total da VPS: **4 GB**
(confirmado). O usuário decidiu seguir sem medir RAM disponível/uso atual antes de criar os
serviços — não é mais critério de parada deste plano.

Estimativa deste projeto, para referência (não travou nenhuma decisão): Next standalone
~300–400 MB, Strapi + `sharp` ~512–768 MB, Postgres ~256–384 MB — soma ~1.1–1.6 GB, dividindo os 4 GB
totais com WordPress + MySQL + EasyPanel já em produção no mesmo host. Projeto de baixíssimo tráfego
(público pequeno, poucos acessos, confirmado pelo usuário) — isso reduz o risco de pico de memória
sob carga simultânea, mas não muda o consumo **parado** dos três serviços (Strapi e Postgres pesam
praticamente o mesmo com 1 visitante ou com 100). Se algum serviço começar a reiniciar sozinho ou
ficar lento depois do deploy, isso costuma ser sintoma de memória insuficiente — vale olhar
`docker stats --no-stream` e o painel de recursos do EasyPanel nesse caso.

## Variáveis de ambiente por serviço

Nomes apenas — valores reais nunca neste arquivo, nunca no repositório. Configuradas diretamente no
painel do EasyPanel, por serviço. Documentadas no estilo onde é usada / o que quebra sem ela / se
falha silenciosa ou visível (convenção emprestada da skill `olivia-prado-stack`, só as partes de CMS
e Frontend — nada de Chatwoot se aplica aqui).

### Build Arguments do App `web` (viram `ARG`/`ENV` no estágio `builder` do `Dockerfile` — Fase 17-01)

`NEXT_PUBLIC_*` embute o valor no bundle JS no momento do build — errar aqui só se corrige com novo
build, não dá pra trocar em runtime.

| Variável | Valor | Onde é usada | O que quebra sem ela / valor errado |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://rentals.allmusicbr.com` | Ainda não consumida em nenhuma tag de SEO nesta beta (Fase 12 não rodou, `robots.ts` bloqueia indexação de qualquer forma) — mas fixar certo agora evita retrabalho quando a Fase 12 rodar | Hoje: nada visível. Quando a Fase 12 ligar `metadataBase`/`og:image`/canonical nela, um valor errado quebra SEO inteiro (mesma pegadinha da skill) |
| `NEXT_PUBLIC_STRAPI_MEDIA_URL` | `https://cms.allmusicbr.com` (**não** `cms.rentals...`) | `next.config.ts` (`remotePatterns`) e `src/lib/cms/adapters.ts` (`adaptarImagem`) | Precisa ser a **URL pública**, não host interno do EasyPanel — senão as imagens do catálogo quebram (ícone de imagem faltando) porque o otimizador do Next não reconhece o host, ou o link fica inacessível fora da rede interna |

### Runtime — serviço `web` (Next, App do EasyPanel)

| Variável | Uso | Onde é usada | O que quebra sem ela |
| --- | --- | --- | --- |
| `STRAPI_API_URL` | `https://cms.allmusicbr.com` (ou endereço interno do EasyPanel, se o `cms` não precisar ser público para o `web` alcançar) | `src/lib/cms/client.ts` — toda leitura de conteúdo server-side | Sem ela, toda página cai no `error.tsx` do segmento `[locale]` (tela genérica "não foi possível carregar", sem detalhe — comportamento intencional, T-05-38) |
| `STRAPI_API_TOKEN` | Token de leitura do Strapi — servidor apenas; só existe depois do bootstrap do Strapi (Fase 17-03) | Idem acima | **Diferente do padrão de outros projetos:** aqui a ausência não derruba a home/catálogo com erro 502 — cai no mesmo `error.tsx`/estado vazio já projetado (falha silenciosa e aceitável enquanto o Strapi ainda não tem token gerado) |
| `REVALIDATE_SECRET` | Segredo do webhook de revalidação (Fase 03) | Route Handler de revalidação | Sem ele, editar conteúdo no Strapi não atualiza o site sem novo deploy — sintoma silencioso (conteúdo desatualizado, sem erro visível) |

### Runtime — serviço `cms` (Strapi, App do EasyPanel)

| Variável | Uso | O que quebra sem ela |
| --- | --- | --- |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | Segredos de framework do Strapi — gerar novos para produção com `openssl rand -base64 32`, **nunca** os defaults `tobemodified`/de dev | Sem gerar de verdade: sessão de admin não assina corretamente, ou (pior) fica com segredo previsível/reaproveitado de dev — nunca aceitar valor de exemplo |
| `DATABASE_CLIENT` | `postgres` | Strapi não sobe / cai para SQLite por padrão, o que não é o banco de produção deste projeto |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` (ou `DATABASE_URL`) | Apontam para o Postgres gerenciado do EasyPanel | Strapi não conecta no boot — falha visível (container não fica healthy) |

## Passo a passo de publicação

### 0. Bloqueante — RAM da VPS

Não pule esta etapa. Via SSH na VPS: `free -h` (linha `Mem:` — total/used/available) e
`docker stats --no-stream` (o que EasyPanel+WordPress+MySQL já consomem). Também olhar o widget de
recursos do próprio painel do EasyPanel. Preencher a seção "Orçamento de RAM" acima com os números
reais antes de criar qualquer serviço novo. Se a RAM disponível for menor que ~2 GB, parar aqui e
decidir entre upgrade de plano / swapfile temporário / revisar footprint do que já roda, antes de
seguir.

### 1. Criar o projeto no EasyPanel

Se ainda não existir um projeto para este app no painel, criar um novo (ex.: nome `rentals`). Os
três serviços abaixo (Postgres, `cms`, `web`) vivem dentro dele.

### 2. Criar o Postgres gerenciado

Adicionar serviço → Postgres (gerenciado pelo próprio EasyPanel, não um container customizado).
Nome sugerido: `postgres`. Deixar o EasyPanel gerar usuário/senha. Depois de criado, abrir a aba de
credenciais/conexão e anotar host interno, porta, usuário, senha e nome do banco (`strapi`) — vai
usar isso nas variáveis `DATABASE_*` do App `cms` no passo 3.

### 3. Criar o App `cms` (Strapi)

1. Adicionar serviço → App → fonte **GitHub** (conectar a conta/organização do GitHub se ainda não
   estiver conectada ao EasyPanel).
2. Repositório: o repo deste projeto na branch `main`.
3. **Root Directory:** `./cms` — é o `Dockerfile` de `cms/Dockerfile` que builda, não o da raiz.
4. **Build method:** Dockerfile (o EasyPanel detecta automaticamente pelo `Dockerfile` presente).
5. **Porta interna:** `1337`.
6. **Domínio:** `cms.allmusicbr.com` — SSL automático.
7. **Variáveis de ambiente:** ver tabela "Runtime — serviço `cms`" acima. As seis strings de
   segredo, gerar uma a uma no seu terminal com `openssl rand -base64 32` (não reaproveitar as de
   dev). As `DATABASE_*`, usar os dados anotados no passo 2.
8. **Limite de memória** do serviço: ajustar conforme o orçamento de RAM medido no passo 0 (a Fase
   17-01 estimou ~512–768 MB para o Strapi + processamento de imagem via `sharp`, com folga para
   picos do admin).
9. Disparar o primeiro deploy deste serviço e aguardar ficar healthy antes de seguir.
10. Abrir `https://cms.allmusicbr.com/admin` — deve aparecer a tela de criação do **primeiro
    administrador** do Strapi. Criar essa conta agora (senha forte) — é o único momento em que essa
    tela aparece.
11. Dentro do admin: replicar a mesma configuração de **Permissões do Role Público** que já foi
    validada em dev na Fase 3 (`03-UAT.md`) — só `find`/`findOne` liberado nas coleções que a Home e
    o Catálogo consomem (produtos, categorias, taxonomia de tipo de evento, e o single type da Home),
    nada de `create`/`update`/`delete`. Sem isso, a API pública responde 403 e o site cai nos
    estados de erro/vazio em vez de mostrar conteúdo.
12. Gerar um **API Token** de leitura (Settings → API Tokens → tipo "Read-only") — vai virar a
    variável `STRAPI_API_TOKEN` do App `web` no próximo passo.

### 4. Criar o App `web` (Next.js)

1. Adicionar serviço → App → mesma fonte GitHub, mesmo repositório, branch `main`.
2. **Root Directory:** raiz do repositório (`.`) — usa o `Dockerfile` da raiz, não o de `cms/`.
3. **Build method:** Dockerfile.
4. **Porta interna:** `3000`.
5. **Domínio:** `rentals.allmusicbr.com` — SSL automático.
6. **Build Arguments** (tela de build do EasyPanel, não variável de runtime): `NEXT_PUBLIC_SITE_URL`
   e `NEXT_PUBLIC_STRAPI_MEDIA_URL` — ver tabela "Build Arguments do App `web`" acima. Esses dois só
   fazem efeito com um build novo (mudar depois exige rebuildar, não só reiniciar).
7. **Variáveis de ambiente (runtime):** `STRAPI_API_URL=https://cms.allmusicbr.com`,
   `STRAPI_API_TOKEN` = o token gerado no passo 3.12, `REVALIDATE_SECRET` = gerar com
   `openssl rand -base64 32` (guardar o mesmo valor para configurar o webhook de revalidação do
   Strapi depois, se for ligar isso nesta rodada).
8. **Limite de memória:** conforme o orçamento (Fase 17-01 estimou ~300–400 MB para o Next
   standalone).
9. Disparar o deploy.

### 5. Verificar

1. `https://rentals.allmusicbr.com` e `https://rentals.allmusicbr.com/pt-BR/catalogo` respondem com
   certificado válido e renderizam (mesmo com poucos produtos cadastrados ainda — os estados vazios
   das Fases 4/5 cobrem isso).
2. `https://cms.allmusicbr.com/admin` abre normalmente.
3. `https://allmusicbr.com` (WordPress) continua respondendo sem nenhuma mudança.
4. Rodar a checklist de smoke test abaixo.

### 6. Depois de verificado: cadastrar produtos e imagens reais

É o objetivo desta primeira entrega — com `cms` no ar e as permissões do passo 3.11 configuradas,
cadastrar os produtos e imagens finais direto no admin do Strapi em produção
(`https://cms.allmusicbr.com/admin`), nos 3 locales (pt-BR, en, es), e conferir que aparecem no
catálogo publicado.

## Checklist final de smoke test

Adaptado do padrão de deploy EasyPanel que o usuário já usa em outros projetos (skill
`olivia-prado-stack`) — este projeto usa Postgres + Dockerfile em vez de SQLite + Nixpacks + Chatwoot
(esse é o outro padrão dele, "Holanda Atelie"), então os itens abaixo foram adaptados ao que existe
de fato aqui, sem chat nem `api.*`:

- [ ] SSL ativo nos dois domínios (`rentals.allmusicbr.com`, `cms.allmusicbr.com`)
- [ ] Idioma do painel admin do Strapi configurado
- [ ] Permissões públicas do Strapi revisadas — só `find`/`findOne` nas 8 coleções do catálogo, nada de `create`/`update`/`delete` liberado (CMS-01/04 da Fase 3)
- [ ] `robots.ts` respondendo `disallow: '/'` em produção (beta não deve ser indexada)
- [ ] Cache/revalidação do Next funcionando (editar um bloco no Strapi reflete na Home sem novo deploy — critério da Fase 4)
- [ ] Imagens dos cards do catálogo carregam via `NEXT_PUBLIC_STRAPI_MEDIA_URL` público (`cms.allmusicbr.com`), não host interno do EasyPanel
- [ ] Nenhuma tela mostra preço, em nenhum estado (regra transversal do projeto)
- [ ] Console do navegador sem aviso de chave React duplicada nem erro de hidratação (os 2 outros defeitos que a Fase 4 pegou só em navegador real)
- [ ] `https://allmusicbr.com` (WordPress) continua respondendo sem mudança

## Rollback

O EasyPanel com fonte Git normalmente mantém histórico de builds/deploys por serviço — o caminho de
rollback é re-disparar um build de um commit anterior (ou usar o botão de rollback do próprio
painel, se existir). Confirmar e documentar o mecanismo exato quando o primeiro deploy acontecer.

## Backup

**Preenchido no plano 17-04** (provisionamento da VPS) — rotina de backup do Postgres do Strapi e
dos uploads, com restauração comprovada.
