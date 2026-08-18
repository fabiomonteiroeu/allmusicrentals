---
phase: 03-strapi-cms
status: passed
date: 2026-08-17
plans_verified: 6
requirements_verified: 11
---

# Fase 03 — Verificação (Strapi CMS)

Verificação goal-backward: parte dos 5 critérios de sucesso declarados no ROADMAP e pergunta se cada
um é **verdade hoje**, com evidência executável. Não é revisão de tarefas — é conferência de resultado.

**Objetivo da fase:** modelagem completa do conteúdo com i18n, cliente tipado e camada de adaptação
verificada e publicada.

---

## Critério 1 — O editor sobe o Strapi por Docker, vê os 8 content-types e os 13 blocos nos 3 idiomas, e publica por locale

**VERDADE.** Provado no UAT (`03-UAT.md`, seção 2) com o Strapi real:

- 9 tipos sob `api::` — 1 single type (`Settings Globais`) + 8 coleções — listados pela API
  administrativa. O critério do ROADMAP dizia "8 content-types"; o modelo tem 8 coleções **mais** o
  single type. Nenhuma divergência: é a mesma contagem, contada de forma diferente.
- 13 componentes em `blocos` e 6 em `shared`, nominalmente conferidos.
- Página criada em pt-BR, propagada para `en` e `es` sobre o mesmo `documentId`, publicada nos três,
  e lida de volta pela API pública com os blocos preservados.

## Critério 2 — Toda resposta é validada por Zod, e bloco desconhecido degrada para `null`

**VERDADE.** Coberto por teste automatizado **e** por prova contra o Strapi vivo:

- `src/lib/cms/schemas.test.ts` (plano 03-04) — `blocoTolerante` devolve `null` para componente
  desconhecido, para bloco conhecido inválido, e uma página com bloco desconhecido no meio continua
  parseável. Mais o teste de contrato: os 13 arquivos de `cms/src/components/blocos/` batem
  exatamente com `blocoSchema.options` — quebra o CI se alguém adicionar componente no Strapi sem
  declarar o schema.
- `src/lib/cms/client.test.ts` — resposta fora do contrato lança erro em vez de virar props.
- UAT seção 3 — adaptadores reais contra `localhost:1337`: os schemas batem com o formato real do
  Strapi 5.52, o que fixture nenhuma garante.

## Critério 3 — Nenhum rich text chega à tela sem sanitização; nenhum token do Strapi no bundle cliente

**VERDADE**, com uma ressalva de escopo registrada abaixo.

- `src/lib/cms/sanitize.test.ts` — 11 testes: script removido com o conteúdo, handlers de evento e
  `style` removidos, `javascript:`/`data:` bloqueados, iframe/object/form removidos, `h1` rebaixado,
  link externo com `rel="noopener noreferrer"`.
- `src/__tests__/guards/html-sanitizado.test.ts` — todo `dangerouslySetInnerHTML` precisa vir do
  sanitizador; o tipo marcado `HtmlSeguro` impede passar string crua.
- `scripts/verifica-segredo-no-bundle.mjs` + `npm run verifica:bundle-segredo` — build com sentinelas
  nas variáveis de servidor e varredura de `.next/static`. Saiu 0. **Controle negativo** apontando o
  script para si mesmo saiu 1, provando que a varredura enxerga o que deveria enxergar.
- `src/__tests__/guards/no-secret.test.ts` — corrigido nesta fase (commit `23aed36`): passou a casar
  `process.env['NOME']` além de `process.env.NOME`. Antes, trocar para colchetes escapava da guarda,
  inclusive num client component. Provado com um componente temporário que a guarda agora acusa.

**Ressalva:** a varredura de bundle roda sob demanda, não no CI. Entrar no pipeline é entrega da
Fase 15 (Segurança).

## Critério 4 — Nenhum campo de preço em nenhum schema do CMS

**VERDADE.** Duas provas independentes:

- `src/__tests__/guards/no-price.test.ts` varre `src/` **e** os `.json` de `cms/src` — inclui os
  schemas dos content-types. Verde em todas as execuções.
- UAT seção 2, passo 4: os 25 atributos de `api::product.product` listados pela API administrativa,
  varridos por `pre[cç]o|price|valor|value|currency|moeda|amount|pagamento|payment|custo|cost|tarifa|fee|total`
  — nenhum campo monetário.

Complementar: `GET /api/avaliacoes` devolve `[]` — a regra "nenhum conteúdo fictício" vale de fato,
não só no comentário do schema.

## Critério 5 — Divergências 5, 6, 7, 9, 11 e 12 fechadas contra o código real; `docs/PLANO.md` sem informação obsoleta

**VERDADE.** Plano 03-05, conferido por checagem executável:

```
5,6,7,9 ainda ⏳: 0     11,12 ainda ⏳: 0     10,13 → ℹ️ INTENCIONAL: 2
total ⏳ restante: 2 (legenda + item 4, superado por D1)
PLANO.md: '9 etapas':0 · 'Fase 00 em andamento':0 · 'Decisão aberta':0 · '*Confirmar*':0
inventário: rota ambígua:0 · checklist desmarcado:0
ADRs: 001, 002, 003, 004 · credenciais vazadas nos ADRs: 0
```

O fechamento não foi por leitura da proposta: o item 7 virou **RESOLVIDA COM DESVIO** com a entrada
`D2` em `docs/divergencias.md`, porque `ProductCard.tsx` usa `ehServico`/`escopo`/`cores` e **não**
`tipoDeItem` (confirmado: `grep -c tipoDeItem src/components/product/ProductCard.tsx` → 0). O item 6
registrou que `navigation.ts` ainda usa âncoras de placeholder (`#led`, `#luzsom`), pendência
esperada até a Fase 4.

---

## Requisitos

| ID | Situação | Evidência |
|---|---|---|
| CMS-01 | ✅ | UAT seção 2, passo 2 — 9 tipos pela API administrativa |
| CMS-02 | ✅ | UAT seção 2, passo 3 — 13 `blocos` + 6 `shared`; teste de contrato em `schemas.test.ts` |
| CMS-03 | ✅ | UAT seção 1 (permissões, seed) e seção 2, passo 6 (3 locales publicados) |
| CMS-04 | ✅ | `schemas.test.ts`, `client.test.ts`, UAT seção 3 |
| CMS-05 | ✅ | `adapters.test.ts`, `sanitize.test.ts`, `html-sanitizado.test.ts`, UAT seção 3 |
| CMS-06 | ✅ | `route.test.ts` (15 testes); UAT seção 1 (401/200) e seção 2, passo 8 (disparo real) |
| CMS-07 | ✅ | `03-UAT.md`; `origin/fase-03-strapi` = `3d152a0`, idêntico ao HEAD local |
| PRECO-02 | ✅ | `no-price.test.ts` varrendo `cms/src`; UAT seção 2, passo 4 |
| DOC-01 | ✅ | `docs/00-divergencias.md` itens 5, 6, 7, 9; `docs/divergencias.md` D2 |
| DOC-02 | ✅ | `docs/00-divergencias.md` itens 11 e 12; `docs/cms-fluxo-editorial.md` |
| DOC-03 | ✅ | `docs/PLANO.md`, `docs/00-inventario.md`, ADRs 003 e 004 |

**Suíte:** 15 suítes, 85 testes, verdes. Typecheck e lint verdes.

---

## Achados que atravessam para outras fases

1. **Webhook do Strapi recusa URL não-pública em produção.** `NODE_ENV=production` ativa a validação
   SSRF; `host.docker.internal` e IP de LAN são recusados. Contornado no UAT por inserção direta em
   `strapi_webhooks` + restart. Em produção (Fase 17) o problema não existe — a URL será pública.
   **Encaminhamento:** documentar o procedimento de dev no `cms/README` ou rodar o `cms` com
   `NODE_ENV=development` localmente.
2. **`npm run verifica:bundle-segredo` não está no CI.** Fase 15.
3. **Ferramentas de estado do GSD não leem este `.planning/`.** `state.advance-plan` corrompeu o
   frontmatter de `STATE.md` numa execução e `roadmap.update-plan-progress` escreveu progresso errado.
   O `.planning/` foi gerado por ingest em pt-BR. **Atualizar STATE/ROADMAP à mão** até isso ser
   resolvido.
4. **`navigation.ts` ainda tem âncoras de placeholder** (`#led`, `#luzsom`) em vez dos slugs reais.
   Fase 4 substitui pelo adaptador do CMS.
5. **Seed emitiu 3 linhas, não 4.** Falta `[seed] locale criado` porque o banco é reaproveitado. Em
   banco limpo espera-se 4 — conferir quando o ambiente for recriado do zero.

---

## Veredito

**PASSOU.** Os 5 critérios de sucesso são verdade, os 11 requisitos têm evidência executável, e a
fase está publicada em `origin/fase-03-strapi`. A Fase 4 (Home) pode começar sobre esta base.
