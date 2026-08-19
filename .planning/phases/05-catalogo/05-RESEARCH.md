# Fase 05 — Pesquisa técnica (Catálogo)

**Data:** 2026-08-18
**Autor:** orquestrador (inline — os subagentes de pesquisa caíram por limite de gasto da organização)
**Confiança:** ALTA nos itens 1, 2 e 4 (testados contra o Strapi/Next reais); MÉDIA nos itens 3 e 5
(derivados de código existente, sem execução).

> Método: cada consulta ao Strapi abaixo foi **executada de verdade** contra `localhost:1337` com os 10
> produtos já cadastrados, e a saída está transcrita. Nada aqui é suposição sobre sintaxe.

---

## 1. Filtragem: o que o Strapi 5 resolve em query (TESTADO)

**Conclusão: os 5 grupos de filtro são expressáveis em query. Não é preciso carregar tudo e filtrar
no cliente.**

### OR dentro do grupo — funciona

```
filters[$and][0][$or][0][tipoDeItem][$eq]=pacote
filters[$and][0][$or][1][tipoDeItem][$eq]=servico-tecnico
→ led-pacote, operacao-led
```

### Filtro por componente repetível (as cores vivem em `variacoes[].nome`) — funciona

```
filters[variacoes][nome][$in][0]=Bege
→ guarda-sol, capa-spandex, lounge
```

Esta era a incógnita mais séria: cor não é campo do produto, é campo de um componente repetível. O
Strapi atravessa a relação normalmente.

### AND entre grupos + OR dentro — funciona combinado

```
filters[$and][0][categoria][slug][$eq]=moveis
filters[$and][1][variacoes][nome][$in][0]=Bege
filters[$and][1][variacoes][nome][$in][1]=Preto
→ capa-6, mesa-bistro, capa-spandex, lounge
```

É exatamente a semântica que o inventário §130 pede.

### Busca textual e ordenação — funcionam

```
filters[nome][$containsi]=mesa
→ capa-6, mesa-bistro, mesa-alta, capa-spandex, lounge   (todos contêm "Mesa" no nome)

sort[0]=nome:desc
→ led-p39, led-p19, led-pacote, ...
```

**Armadilha de expectativa:** a busca por "mesa" traz `capa-6`, `capa-spandex` e `lounge` porque a
palavra aparece no nome deles ("Capa ... para **Mesa**", "Lounge ... com Sofá e **Mesa** Baixa"). Está
correto, mas parece errado a olho nu. Se o teste de aceite disser "buscar 'mesa' retorna 2 produtos",
falhará por premissa errada, não por bug. Contar sempre pelo dado real.

**Decisão recomendada ao planner:** filtrar via query ao Strapi, com o estado vindo de `searchParams`.
Com 10 produtos qualquer abordagem serve; com centenas, filtrar no cliente exigiria baixar o catálogo
inteiro. A query já provou suportar todos os casos.

### O que NÃO recomendo

`filters[aplicacoes][$containsi]=Casamento` **funciona** (6 resultados), mas é o antipadrão que a
decisão 1 do CONTEXT elimina: campo `json` de texto livre, sem vocabulário controlado, que quebra com
variação de grafia ou acento. Usar só até a taxonomia `tipo-de-evento` existir, e então migrar.

---

## 2. `searchParams` no Next 16 (VERIFICADO na doc instalada)

`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` confirma:

```ts
searchParams: Promise<{ [key: string]: string | string[] | undefined }>
```

**`searchParams` é uma Promise** — precisa de `await`, como `params` (que o projeto já trata assim em
`src/app/[locale]/layout.tsx`). Muito tutorial ainda mostra objeto síncrono; está obsoleto.

**Consequência arquitetural:** usar `searchParams` torna a rota **dinâmica** (server-rendered on
demand), não estática. É o oposto da Home, que é SSG. Isso é desejável aqui — o resultado depende dos
filtros — mas muda o comportamento de cache: a revalidação por tag continua valendo para os dados do
CMS, e a página é recomputada a cada combinação de filtro.

**Isso responde a incógnita 6:** como a rota é dinâmica, o estado "carregando" passa a ser
**alcançável de verdade** (diferente da Home, onde o `<Suspense>` resolvia no prerender e o fallback
nunca aparecia). O skeleton do catálogo é estado real de produção, não só de showcase.

---

## 3. Drawer mobile sem `@media` nova

O projeto já tem `@radix-ui/react-dialog` como dependência e um precedente direto:
`src/components/chrome/MobileMenu.tsx`, que resolve foco preso, `Esc` e retorno de foco.

**Ler esse arquivo é o caminho mais curto** — ele já convive com a regra de "sem media query nova"
porque a troca desktop/mobile do chrome usa a única media query aprovada do projeto
(`theme.breakpoint.header`, 1080px, divergência D1).

Ponto a decidir no planejamento: o botão "Filtros" da toolbar só existe no mobile. Sem breakpoint
novo, as saídas são (a) reusar `theme.breakpoint.header`, (b) esconder por container query, ou (c)
manter o botão sempre visível e o painel lateral colapsável em qualquer largura. **Registrar como
questão em aberto** — o UI-SPEC decide.

---

## 4. Taxonomia `tipo-de-evento` (decisão 1 do CONTEXT)

Vocabulário real, extraído dos 10 produtos (9 valores, na ordem em que o layout os lista):

```
Evento corporativo · Casamento · Aniversário · Festa · Show · Festival · Feira ·
Ativação de marca · Evento ao ar livre
```

### RESOLVIDO — taxonomia única unificada (decisão do usuário, 2026-08-18)

Conferi `Solicitar Orcamento.dc.html`: o formulário da Fase 9 usa `GRUPOS_OPCOES.evento`, com **10**
valores, e as listas **não são idênticas**:

```
comuns (7):        Evento corporativo · Casamento · Aniversário · Show · Festival · Feira · Ativação de marca
só no catálogo:    Festa · Evento ao ar livre
só no formulário:  Festa privada · Formatura · Outro
```

**Decisão:** **uma taxonomia única** alimenta o filtro do catálogo (Fase 5) e o select do formulário
(Fase 9) — o editor cadastra uma vez, e as listas não divergem com o tempo.

Lista proposta (11 valores) — **os rótulos finais precisam de confirmação do usuário antes de semear**:

```
Evento corporativo · Casamento · Aniversário · Festa privada · Show · Festival ·
Feira · Ativação de marca · Formatura · Evento ao ar livre · Outro
```

Duas escolhas embutidas, ambas reversíveis e a confirmar:
- **"Festa" e "Festa privada" viram um só valor** (`Festa privada`, o rótulo do formulário, que é mais
  específico). O produto `guarda-sol` e outros hoje marcados com "Festa" migram para ele.
- **"Evento ao ar livre" permanece**, mesmo havendo o filtro `Ambiente: Externo`. São eixos diferentes:
  ambiente é propriedade do produto, tipo de evento é do evento do cliente. Se o usuário preferir
  eliminar a redundância, é remover 1 valor e reapontar 5 produtos.

Nota: `Outro` faz sentido como opção de formulário, mas como **filtro de catálogo** não filtra nada
útil. Recomendo cadastrá-lo na taxonomia (para a Fase 9) e **ocultá-lo do painel de filtros** — o
planner deve decidir onde esse filtro acontece.

Trabalho previsto: content-type novo, relação many-to-many em `product`, `populate` no adaptador,
schema Zod, e **migração** dos valores hoje em `aplicacoes` dos 10 produtos. O campo `aplicacoes` pode
permanecer para texto livre editorial, mas deixa de ser fonte do filtro.

---

## 5. Eventos `search` e `filter_applied`

A porta é `emitirEvento` (`src/lib/analytics/dataLayer.ts`), e o tipo **rejeita campo monetário em
compilação** — a Fase 4 provou com `error TS2353`.

Dois pontos a definir no plano:

- **Quem emite `search`.** A busca da Home navega para `/[locale]/catalogo?q=...`. Se as duas emitirem,
  haverá evento duplicado. Recomendo: **o catálogo emite**, ao processar `?q=`, porque é onde o
  resultado existe; a Home apenas navega.
- **Quando emitir.** Não a cada tecla. Ou no submit, ou com debounce. O layout-fonte tem estado `busy`
  na busca, o que sugere submit explícito.

`view_item_list` já tem componente pronto (`EmissorViewItemList`), usado na Home com
`home_categorias`/`home_destaques`. Aqui o `item_list_id` deve refletir o filtro aplicado.

---

## 6. Armadilhas do tipo "teste verde não pega" (lição da Fase 4)

A Fase 4 teve três defeitos que passaram por 163 testes e só apareceram em navegador real. Os
equivalentes prováveis aqui:

1. **Contagem de resultados divergente do que a grade mostra** — se a contagem vier de uma query e a
   grade de outra (ex.: uma com paginação, outra sem). Teste com fixture bate; produção não.
2. **Chips de filtro dessincronizados da URL** — o chip some mas o filtro continua na query, ou
   vice-versa. Só aparece ao usar de verdade (voltar no histórico, recarregar).
3. **Foco perdido ao fechar o drawer** — jsdom não reproduz gerenciamento de foco fielmente. Exige
   Playwright, que **agora está instalado** (o Chromium foi baixado na Fase 4).
4. **Acento e caixa na busca** — `$containsi` é case-insensitive, mas acento é outra história.
   "Painéis" vs "paineis" precisa de teste com dado real.

**Recomendação:** esta fase deve ter teste e2e Playwright para o fluxo de filtro, não só unitário. O
Playwright já está pronto e a Fase 16 vai precisar dele de qualquer forma.

---

## 7. O que reusar (nada disso deve ser reescrito)

| Necessidade | Já existe |
|---|---|
| Ponte `Produto` → `ProdutoResumo` | `src/lib/product/mapearParaProductCard.ts` |
| Card de produto (3 variantes) | `src/components/product/ProductCard.tsx` |
| Chips | `src/components/primitives/Chip.tsx` |
| Swatches de cor | `src/components/primitives/ColorSwatches.tsx` |
| Skeleton, EmptyState, Notice, Spinner | `src/components/feedback/` |
| Busca com estado `busy` | `src/components/blocos/SearchBarGrande.tsx` (E5) |
| Emissão de `view_item_list` | `src/components/analytics/EmissorViewItemList.tsx` |
| Diálogo com foco preso | `src/components/chrome/MobileMenu.tsx` + `@radix-ui/react-dialog` |
| Busca no CMS com filtro | `getProdutos(locale, filtro)` em `src/lib/cms/adapters.ts` |

`getProdutos` hoje aceita `categoria`, `destaque`, `busca`, paginação. Precisa crescer para os 5
grupos — extensão aditiva, no mesmo padrão.

---

## Questões em aberto para o planejamento

1. ~~Décima opção de "Tipo de evento"~~ — **RESOLVIDO**: taxonomia única unificada (ver seção 4). Falta só o usuário confirmar os 11 rótulos finais antes de semear.
2. **Botão "Filtros" só no mobile sem breakpoint novo** — três saídas propostas no item 3.
3. **`item_list_id` do `view_item_list`** quando há filtro aplicado — valor fixo (`catalogo`) ou
   derivado dos filtros?
4. **Paginação** — 10 produtos não justificam; decidir se entra agora ou fica registrado como adiado.
