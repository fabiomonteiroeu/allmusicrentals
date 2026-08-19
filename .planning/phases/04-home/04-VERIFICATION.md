---
phase: 04-home
status: passed
date: 2026-08-18
plans_verified: 7
requirements_verified: 6
---

# Fase 04 — Verificação (Home)

Verificação goal-backward: parte dos 5 critérios de sucesso do ROADMAP e pergunta se cada um é
**verdade hoje**, com evidência executável colhida em navegador real contra o CMS real.

**Objetivo da fase:** a Home renderiza todos os seus blocos a partir do CMS, com fidelidade ao layout
e sem preço.

---

## Critério 1 — O visitante abre `/pt-BR`, `/en` e `/es` e vê os 9 blocos vindos do CMS

**VERDADE.** Medido com Playwright headless nos três locales:

```
pt-BR  1440px   main=1  secoes=9  abaixoAA=0  overflow=false  falhas=0
en     1440px   main=1  secoes=9  abaixoAA=0  overflow=false  falhas=0
es     1440px   main=1  secoes=9  abaixoAA=0  overflow=false  falhas=0
```

Os 9 blocos são hero, busca, grade-de-categorias, produtos-em-destaque, destaque-led, como-funciona,
diferenciais, avaliacoes e chamada-final — a ordem exata do layout-fonte, resolvida pelo
`RenderizadorDeBlocos` a partir da Dynamic Zone.

Nota de conteúdo (não é defeito): `/en` e `/es` mostram texto em pt-BR porque a estrutura foi copiada
entre locales e a tradução é trabalho editorial do cliente.

## Critério 2 — Editar um bloco no Strapi e publicar muda a Home em segundos, sem novo deploy

**VERDADE, provado de ponta a ponta.** Troquei o `eyebrow` do hero por um marcador
(`REVALIDACAO-OK`), publiquei no Strapi, e a Home serviu o texto novo em ~3s sem rebuild. Texto
original restaurado em seguida.

O circuito é: publicação no Strapi → webhook → `POST /api/revalidate` (401 com segredo errado, 200
com o correto) → `revalidateTag(tag, 'max')` → a tag declarada pelo adaptador.

## Critério 3 — Sem avaliações reais, a seção mostra o estado vazio; nunca depoimento inventado

**VERDADE.** O CMS tem **0 avaliações** e o Bloco 8 renderiza o estado vazio especificado no UI-SPEC
(eyebrow "NENHUMA AVALIAÇÃO PUBLICADA", H3 "Publicamos apenas avaliações reais de clientes.", caixa
"ESTRUTURA DA AVALIAÇÃO" decorativa e CTA). Nenhum dos 4 nomes fictícios do layout-fonte aparece no
código ou nos testes — verificado por varredura.

O estado **carregando** foi entregue como componente testável na showcase, não como garantia de
produção: com Server Component e sem `cacheComponents`, o `<Suspense>` resolve no prerender e o
visitante nunca vê o fallback. HOME-03 foi reescrito com essa redação antes da execução.

## Critério 4 — Fidelidade lado a lado com `Home.dc.html` em desktop e 375px

**VERDADE, após 3 rodadas de correção.** Conferência feita em navegador real (Chrome 1440px) e com
viewport 375px real (Playwright — a janela do Chrome no macOS não desce abaixo de ~606px CSS):

```
375px: viewport 375 · scrollWidth 375 · overflow false · 0 elementos vazando
contraste: 24 títulos na página, 0 abaixo de AA
prefers-reduced-motion: 40 células do mosaico com animation-delay 0s
teclado: 14 paradas de Tab, 0 sem indicador de foco visível
```

O mosaico 12×6 do Hero carrega a imagem do Strapi e é 100% CSS — sem `window.matchMedia`, sem JS de
animação.

## Critério 5 — `view_item_list` pelo módulo tipado; nenhuma chamada solta passa no lint

**VERDADE.** Em runtime, dois eventos: `home_categorias` (5 itens) e `home_destaques` (0 itens —
correto, não há produtos cadastrados). **Nenhum** campo `price`/`value`/`currency`/`revenue` no
`dataLayer`.

A barreira é dupla e foi provada ativa:
- `no-restricted-properties` barra `window.dataLayer.push(...)` **e** `dataLayer.push(...)` sem
  `window` — testei as duas formas com arquivo temporário, ambas rejeitadas.
- O tipo `ItemDeListaGA4` rejeita campo monetário em **tempo de compilação** (`error TS2353` ao tentar
  `price: 99`), não só em runtime.

---

## Requisitos

| ID | Situação | Evidência |
|---|---|---|
| HOME-01 | ✅ | 9 seções nos 3 locales, vindas da Dynamic Zone |
| HOME-02 | ✅ | slider `scroll-snap` (vazio: 0 produtos) e seção LED com pixel pitch, listas e galeria |
| HOME-03 | ✅ | como funciona (4 passos), diferenciais (5), avaliações no estado vazio + skeleton na showcase |
| HOME-04 | ✅ | conferência em 1440px e 375px real; 0 overflow, 0 títulos abaixo de AA |
| HOME-05 | ✅ | `view_item_list` × 2, sem campo monetário |
| MED-01 | ✅ | `emitirEvento` como porta única; lint + guarda + tipo barrando as três formas de escape |

**Suíte:** 32 suítes, 173 testes verdes. `npm run build` gera `/pt-BR`, `/en` e `/es`.

---

## Os 3 defeitos que o checkpoint pegou — e que 163 testes verdes não pegaram

Este é o registro mais útil desta fase para as Fases 5–11.

| Defeito | Impacto | Por que escapou dos testes |
|---|---|---|
| 4 títulos com contraste **1.00** (texto invisível sobre fundo escuro) | H1 do Hero e 3 outros headings ilegíveis | Jest não computa cor contra fundo |
| 8 dos 9 blocos com `key` React duplicada | React pode duplicar/omitir filhos ao revalidar | fixtures inventam ids únicos; o Strapi repete `id: 7` entre tipos de componente |
| Mídia de bloco com URL relativa | mosaico do Hero sem imagem (404) | `adaptarBloco` nunca passou mídia por `adaptarImagem` — a Fase 4 é o primeiro consumidor |

**Lição para as próximas fases de tela:** teste verde não substitui abrir a página num navegador real
com dados reais do CMS. Os três defeitos eram invisíveis para a suíte e óbvios na tela.

Os três ganharam teste de regressão, e cada teste foi **provado falhando** antes do commit (reverter a
correção, ver o `FAIL`, restaurar). Teste de regressão que nunca falhou não protege nada.

## Correção emergencial durante a execução

Os 9 componentes de bloco foram criados sem `'use client'`. Em Server Component puro, o
`ThemeContext` do styled-components resolve para `undefined` e todo bloco lançava
`Cannot read properties of undefined (reading 'cor')` em runtime — embora os testes Jest passassem,
porque Jest não distingue Server de Client Component. Corrigido conforme `docs/adr/001-styled-components.md`
regra 3.

**Consequência arquitetural a registrar:** a decisão de planejamento de manter o Hero como "Server
Component puro" não sobreviveu ao contato com o runtime. O mosaico continua 100% CSS (sem JS de
animação), mas o componente vai para o bundle do cliente como todos os outros blocos. Isso entra no
custo de JS que a Fase 14 vai medir contra o gatilho de reversão do ADR 001.

---

## Achados que atravessam para outras fases

1. **Paralelismo sem isolamento gera atrito de git.** Três executores da wave 2 relataram, de forma
   independente, o hook de `lint-staged` varrendo arquivos de outros planos. Ninguém perdeu trabalho
   (`git restore --staged`, `git commit -- <pathspec>`), mas nas Fases 5–11 vale usar
   `isolation: worktree` em waves paralelas.
2. **`settings-globais` devolve 404, não `200 data:null`,** para single-type sem localização
   publicada. A correção defensiva está em `getSettingsGlobais`; as localizações `en`/`es` foram
   semeadas.
3. **Playwright instalado** (`chromium`) — os navegadores nunca haviam sido baixados. Destrava a
   Fase 16 e foi o que permitiu verificar 375px de verdade.
4. **CTAs apontam para rotas que ainda não existem** (`/catalogo`, `/solicitar-orcamento`) — 404 até
   as Fases 5 e 8, por decisão travada.
5. **`ImagePlaceholder` em toda a Home menos o Hero** — nenhuma imagem de categoria ou produto foi
   enviada ao Strapi. É conteúdo do cliente, não código.

---

## Veredito

**PASSOU.** Os 5 critérios de sucesso são verdade, os 6 requisitos têm evidência executável, e os três
padrões que as Fases 5–11 herdam — renderizador de Dynamic Zone, fronteira Server/Client e porta
tipada do `dataLayer` — estão estabelecidos e cobertos por teste.
