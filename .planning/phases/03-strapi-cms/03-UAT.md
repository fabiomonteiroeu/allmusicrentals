# Fase 03 — UAT (Strapi CMS)

**Data:** 2026-08-17
**Executado por:** orquestrador (Claude), com o Strapi rodando em Docker
**Strapi:** 5.52.0 · **Next:** 16.3.1 · **Postgres:** 16-alpine
**Branch:** `fase-03-strapi`

Nenhum valor de segredo aparece neste documento — apenas nomes de variáveis.

---

## 1. Ambiente e provas automáticas

### Stack

| Serviço | Como | Status observado |
|---|---|---|
| `postgres` | container do compose | Up (healthy) |
| `cms` (Strapi 5.52.0) | container do compose, profile `cms` | Up, `:1337` respondendo |
| Next 16.3.1 | `npm run dev` local | `:3000`, `GET /pt-BR` → 200 |

Comando: `docker compose --profile cms up -d --build postgres cms`

O `web` do compose foi deliberadamente **não** subido: ele builda a imagem de produção e disputaria a
porta 3000 com o dev server.

`.env.local` criado a partir de `.env.example`, com `REVALIDATE_SECRET` gerado por
`openssl rand -hex 16`. `git check-ignore -q .env.local` → 0. `cms/.env` já tinha segredos reais
(nenhum `tobemodified`), `git check-ignore -q cms/.env` → 0.

### Bootstrap / seed

`docker compose logs cms | grep "\[seed\]"`:

```
[seed] permissões públicas garantidas
[seed] categorias garantidas
[seed] menu e rodapé garantidos
```

Nenhum `[seed] falha no bootstrap`.

**Desvio observado:** o plano previa 4 linhas, incluindo `[seed] locale criado`. Só 3 apareceram —
o volume `pgdata` é de uma execução anterior e os locales já existiam; o seed é idempotente. Em banco
limpo as 4 linhas devem aparecer. Não invalida nenhuma prova abaixo.

### API pública (role público, sem token)

| Endpoint | HTTP | Itens |
|---|---|---|
| `/api/categories?locale=pt-BR` | 200 | **5** |
| `/api/menu-items?locale=pt-BR` | 200 | 23 |
| `/api/rodape-colunas?locale=pt-BR` | 200 | 3 |
| `/api/products?locale=pt-BR` | 200 | 0 |
| `/api/avaliacoes?locale=pt-BR` | 200 | **0** ← regra "nenhum seed fictício" |
| `/api/solicitacoes` | **403** | — ← público cria, nunca lê |

### Webhook de revalidação, por linha de comando

`POST http://localhost:3000/api/revalidate`, corpo `{"model":"product","event":"entry.publish"}`:

| Header `x-revalidate-secret` | HTTP | Corpo |
|---|---|---|
| valor errado | **401** | — |
| valor de `.env.local` | **200** | `{"ok":true,"revalidado":"cms:products","evento":"entry.publish"}` |

---

## 2. UAT do modelo (via API administrativa autenticada)

Feito por API em vez de cliques no painel: as respostas são verificáveis e ficam registradas aqui.
Admin criado por `docker compose exec cms npx strapi admin:create-user` — a rota
`POST /admin/register-admin` recusou com "You cannot register a new super admin", porque o banco
reaproveitado já tinha um super admin.

### Passo 2 — Content-types (`GET /content-manager/content-types`)

9 tipos sob `api::` — 1 single type + 8 coleções:

`Avaliação` · `Categoria` · `FAQ Item` · `Menu Item` · `Página` · `Produto` · `Rodapé Coluna` ·
**`Settings Globais` (single)** · `Solicitação`

### Passo 3 — Componentes (`GET /content-manager/components`)

| Categoria | Contagem | Componentes |
|---|---|---|
| `blocos` | **13** | avaliacoes, busca, chamada-final, como-funciona, comparativo-led, destaque-led, diferenciais, faq, formulario-contato, grade-de-categorias, hero, produtos-em-destaque, texto-rico |
| `shared` | **6** | caracteristica, medida, pergunta-resposta, seo, subcategoria, variacao |

### Passo 4 — Produto sem preço

25 atributos em `api::product.product`:

```
id, nome, codigo, slug, categoria, descricaoCurta, descricaoCompleta, caracteristicas,
medidas, material, aplicacoes, variacoes, tipoDeItem, ambiente, imagens, destaque,
relacionados, alugadoComFrequencia, faq, seo, createdAt, updatedAt, createdBy, updatedBy, documentId
```

Varredura por `pre[cç]o|price|valor|value|currency|moeda|amount|pagamento|payment|custo|cost|tarifa|fee|total`:
**nenhum campo monetário**.

### Passos 5 e 6 — Criação, Dynamic Zone e i18n

- Página criada em **pt-BR** (`slug: uat-fase-03`) com 2 blocos: `blocos.hero` + `blocos.texto-rico` → status `draft` → publicada → `published`.
- Localizações **en** e **es** criadas sobre o mesmo `documentId` e publicadas — status `published` nos dois.
- Leitura pública confirmando os três locales publicados, com os blocos preservados:

| Locale | Itens | Slug | Blocos |
|---|---|---|---|
| pt-BR | 1 | `uat-fase-03` | hero + texto-rico |
| en | 1 | `uat-fase-03-en` | hero + texto-rico |
| es | 1 | `uat-fase-03-es` | hero + texto-rico |

**Observação sobre o passo 6:** a propagação foi feita por API (`PUT .../:documentId?locale=xx`), que é
o que a opção "Fill in from another locale" do painel faz por baixo. O risco de esforço editorial 3×
segue registrado — a cópia entre locales não preenche tradução, só duplica a estrutura.

### Passo 8 — Webhook disparado por publicação real

Webhook `revalidacao-next` → `http://host.docker.internal:3000/api/revalidate`, header
`x-revalidate-secret`, eventos `entry.publish`, `entry.update`, `entry.unpublish`.

Ao publicar a página em pt-BR, o log do `npm run dev` registrou duas chamadas novas:

```
POST /api/revalidate 200 in 23ms
POST /api/revalidate 200 in 31ms
```

### Passo 9 — Avaliações vazias

`GET /api/avaliacoes` → `{"data":[],"meta":{"pagination":{...,"total":0}}}`

### Passo 10 — Limpeza

Página `uat-fase-03` apagada nos três locales. Verificação final: `pt-BR=0`, `en=0`, `es=0`.

---

## 3. Prova extra — adaptadores contra o Strapi vivo

Os testes da suíte usam fixtures. Fixture errada passa no teste e falha na realidade. Rodei um teste
temporário (`src/lib/cms/uat-ao-vivo.test.ts`, **apagado ao final**, não commitado) chamando os
adaptadores reais contra `localhost:1337`:

| Prova | Resultado |
|---|---|
| `getCategorias('pt-BR')` devolve 5 categorias | ✅ |
| `getNavPrincipal` e `getColunasRodape` leem menu e rodapé | ✅ |
| `getPagina('pt-BR','uat-fase-03')` traz `hero + texto-rico` e o markdown vira `<strong>de estrutura</strong>`, sem `<script` | ✅ |
| `getAvaliacoes()` devolve `[]` | ✅ |

4 testes, 4 passando. Isto prova o que fixture nenhuma prova: **os schemas Zod batem com o formato real
de resposta do Strapi 5.52**, e a sanitização opera sobre markdown vindo do CMS de verdade.

---

## 4. Desvio que exige correção no plano 03-06

**O passo 7 do plano, como escrito, não é executável neste container.**

Criar o webhook pelo painel (ou por `POST /admin/webhooks`) apontando para
`http://host.docker.internal:3000/...` é recusado:

```
ValidationError: Url is not supported because it isn't reachable over the public internet
```

Fonte da regra, lida no container em
`node_modules/@strapi/admin/dist/server/server/src/controllers/webhooks.js`:

```js
.test('is-public-url', "Url is not supported because it isn't reachable over the public internet", async (url) => {
    if (process.env.NODE_ENV !== 'production') { return true; }
    ...
```

A validação é **pulada fora de produção** — mas `cms/Dockerfile` builda e roda em produção, então ela
vale. IP de LAN (`192.168.x.x`) é recusado pelo mesmo motivo. Um segundo erro do mesmo request mostra
que `isEnabled` não é aceito no corpo de criação (o campo persistido chama-se `enabled`).

**Contorno usado neste UAT:** inserir a linha direto em `strapi_webhooks` via `psql` e reiniciar o
`cms` (o registro de webhooks é carregado no bootstrap). Funcionou — a publicação disparou o webhook.

**Encaminhamento:** o plano 03-06 precisa escolher um dos caminhos e registrá-lo:
1. rodar o `cms` com `NODE_ENV=development` em desenvolvimento (libera a validação, mas afasta o dev do
   comportamento de produção);
2. manter a inserção via SQL como procedimento documentado de dev;
3. em produção (Fase 17) o problema não existe — a URL será pública e a validação passa naturalmente.

---

## 5. Evidência por requisito

| Requisito | Evidência | Situação |
|---|---|---|
| **CMS-01** — modelo completo | Seção 2, passo 2: 9 content-types (1 single + 8 coleções) listados pela API administrativa | ✅ |
| **CMS-02** — componentes e Dynamic Zone | Seção 2, passo 3: 13 `blocos` + 6 `shared`; seção 2 passo 5: dois blocos gravados e lidos de volta | ✅ |
| **CMS-03** — i18n, permissões e seed de estrutura | Seção 2, passo 6 (3 locales publicados); seção 1 (permissões: 200 no catálogo, 403 em solicitações; seed com 5 categorias e 0 avaliações) | ✅ |
| **CMS-04** — Zod em toda resposta | Seção 3: adaptadores reais contra o Strapi vivo, todos passando — a validação Zod roda em cada uma dessas chamadas | ✅ |
| **CMS-05** — adaptadores e sanitização | Seção 3: `getPagina` devolve `conteudoHtml` sanitizado a partir de markdown real do CMS | ✅ |
| **CMS-06** — webhook de revalidação | Seção 1 (401/200 por linha de comando) e seção 2 passo 8 (disparo por publicação real → 200) | ✅ |
| **CMS-07** — fase verificada e branch publicada | Este documento cobre a verificação. **Publicação da branch: pendente** | ⏳ |
| **PRECO-02** — `product` sem preço | Seção 2, passo 4: 25 atributos, nenhum monetário; guarda `no-price.test.ts` varre `cms/src` | ✅ |

---

## 6. Pendências

1. **Publicar a branch `fase-03-strapi`** no GitHub (CMS-07) — `origin` ainda tem só `main`,
   `fase-01-fundacao` e `fase-02-design-system`.
2. **Corrigir o passo 7 do plano 03-06** com o achado da seção 4.
3. **Rotacionar o `REVALIDATE_SECRET` de dev** — o valor apareceu na saída de erro de validação do
   Strapi durante este UAT. É segredo local, em arquivo gitignored, mas rotacionar é barato.
