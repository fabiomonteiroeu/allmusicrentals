# Fase 05 — Contrato de design (Catálogo)

**Data:** 2026-08-18
**Autor:** orquestrador (inline — o `gsd-ui-researcher` caiu por limite de gasto da organização)
**Fonte:** `projeto-base/All Music Rentals - Catalogo.dc.html` (~100 KB), lido diretamente. Todos os
valores abaixo foram **extraídos do arquivo**, não estimados.

> **Ressalva de processo:** este contrato não passou pelo `gsd-ui-checker` (verificação independente
> das 6 dimensões), diferente do UI-SPEC da Fase 4. Quando o limite de gasto for resolvido, vale rodar
> `gsd-ui-checker` sobre este arquivo antes de executar a fase.

---

## Sistema de design

Nenhuma biblioteca de terceiros. Design system próprio das Fases 2 e 4, styled-components 6.
**Extensões existentes:** E1 `Eyebrow $sobreEscuro` · E2 `Heading` leading 0.92 · E3 `Button
pretoSolido` · E4 `Spinner` · E5 `SearchBarGrande` · E6 `EmptyState` multi-coluna (composição local) ·
E7 `Heading $sobreEscuro`. A próxima é **E8**.

## Componentes a reaproveitar (não recriar)

| Necessidade | Componente |
|---|---|
| Chips de filtro ativo | `primitives/Chip.tsx` |
| Swatches do filtro Cor | `primitives/ColorSwatches.tsx` |
| Busca com estado `busy` | `blocos/SearchBarGrande.tsx` (E5) |
| Card de produto | `product/ProductCard.tsx` (3 variantes) |
| Skeleton / EmptyState / Notice | `feedback/` |
| Drawer com foco preso | `chrome/MobileMenu.tsx` + `@radix-ui/react-dialog` |
| Ponte de dados do card | `lib/product/mapearParaProductCard.ts` |

---

## Regras estruturais herdadas (não renegociáveis)

- **Sem `@media` nova.** Única do projeto: troca do chrome em 1080px (`theme.breakpoint.header`, D1).
- **Sem preço.** Confirmado: as 5 opções de ordenação do layout-fonte **não incluem** nenhuma por
  valor. O layout já respeitava a regra.
- `prefers-reduced-motion` em toda animação (drawer, acordeão, skeleton).
- Alvo ≥44px, foco visível, contraste AA. **Atenção:** a Fase 4 teve 4 títulos com contraste 1.00 por
  usar `Heading` sobre fundo escuro sem `$sobreEscuro` (E7). Todo bloco escuro desta fase precisa
  declarar a cor do título explicitamente.
- 375px sem scroll horizontal.

## DECISÃO ESTRUTURAL — grids por JS viram `auto-fit` (divergência D5)

O layout-fonte calcula **três grids por JavaScript de viewport**:

```js
heroCols:     vw < 900  ? '1fr' : 'minmax(0,1.35fr) minmax(280px,0.9fr)'
layoutCols:   mobile    ? '1fr' : '272px minmax(0,1fr)'
gridProdutos: vw < 700 ? '1fr' : vw < 1080 ? 'repeat(2,1fr)' : vw < 1400 ? 'repeat(2,1fr)' : 'repeat(3,1fr)'
```

Isso é exatamente o que a **divergência D1** rejeitou (mismatch de hidratação, flash, CLS) e a **D3**
já resolveu na Fase 4 com `auto-fit`. Aplicar o mesmo aqui:

| Grid | Substituição |
|---|---|
| `heroCols` | `repeat(auto-fit, minmax(280px, 1fr))` com o texto em `minmax(0, 1.35fr)` |
| `layoutCols` | `272px minmax(0, 1fr)` fixo; o aside colapsa via o drawer (ver Q1) |
| `gridProdutos` | `repeat(auto-fit, minmax(280px, 1fr))` |

**Registrar como D5** em `docs/divergencias.md`, no formato de D1/D3. Custo aceito: ±1 coluna em
larguras intermediárias, o mesmo já aceito na D3.

---

## Bloco 1 — Hero + card "SOBRE OS VALORES"

Grid de 2 colunas (texto + card), `gap: clamp(24px,3vw,48px)`, `align-items: start`.

**Coluna de texto:**
- H1 "Catálogo de Produtos para Eventos"
- Body "Navegue pelo catálogo, escolha os produtos e adicione os itens desejados ao seu orçamento."

**Card "SOBRE OS VALORES"** — é a explicação de por que não há preço, e o texto é literal:

> **SOBRE OS VALORES**
> Os preços não são exibidos online. Os valores dependem da quantidade, data, endereço, entrega,
> montagem e necessidades do evento.

Reusar `feedback/Notice.tsx`. **Não reescrever a cópia** — é o texto que sustenta a regra do produto
diante do visitante.

## Bloco 2 — Busca

- Rótulo "BUSCAR PRODUTOS NO CATÁLOGO"
- `<input type="search" id="busca-catalogo">`, placeholder
  `"Busque por mesa, capa, guarda-sol, painel de LED..."`
- Estado `busy` durante a consulta (reusar E5/`Spinner`)
- Recebe `?q=` vindo da Home — primeiro consumidor real desse contrato

## Bloco 3 — Painel de filtros (acordeão, 5 grupos)

Coluna de **272px** à esquerda. Estado inicial `aberto` **extraído do array `GRUPOS` do layout**:

| Grupo | Rótulo | Aberto? | Opções |
|---|---|---|---|
| `categoria` | Categoria | **sim** | as 5 reais do CMS (ver nota) |
| `tipo` | Tipo de item | **sim** | Produto físico · Produto com variação · Serviço técnico · Pacote |
| `cor` | Cor | **sim** (swatch) | Bege `#D8C9A8` · Preto `#0B0C0D` · Branco `#FFFFFF` |
| `evento` | Tipo de evento | não | taxonomia unificada (ver RESEARCH §4) |
| `ambiente` | Ambiente | não | Interno · Externo · Interno ou externo |

Notas do próprio layout, a preservar como microcopy:
- Categoria: *"Novas categorias entram nesta lista conforme forem cadastradas."*
- Cor: *"Outras cores cadastradas aparecem aqui."*

**Divergência de vocabulário (já decidida no CONTEXT):** o layout lista `Área externa · Mesas de
coquetel · Capas de mesa · Painéis de LED` como categorias — mas essas são **subcategorias**. O filtro
usa as 5 categorias reais do CMS.

**Acordeão:** múltiplo (vários grupos abertos ao mesmo tempo), não exclusivo — é o que o array indica,
com 3 abertos de saída. Teclado: `Enter`/`Space` alterna, foco visível no cabeçalho do grupo.

## Bloco 4 — Toolbar

- Botão "Filtros" (**mobile** — ver Q1)
- Contagem de resultados
- "Ordenar por", 5 opções **literais**, nenhuma monetária:
  `Produtos em destaque · Mais solicitados · Mais recentes · Nome de A a Z · Nome de Z a A`

**Atenção:** "Mais solicitados" não tem campo correspondente no modelo do Strapi. Ou entra como campo
novo, ou a opção cai por ora — **decidir no planejamento e registrar**, não implementar silenciosamente
como sinônimo de "destaque".

## Bloco 5 — Chips de filtro ativo

Reusar `primitives/Chip.tsx`. Um chip por filtro ativo, removível individualmente (alvo ≥44px). Para o
filtro de cor, o chip mostra **o nome** da cor (o swatch fica no painel). Estado dos chips deve espelhar
a URL — ver armadilha 2 do RESEARCH §6.

## Bloco 6 — Drawer mobile de filtros

Radix Dialog, no padrão de `MobileMenu.tsx`: foco preso, `Esc` fecha, foco retorna ao botão "Filtros",
scroll do fundo bloqueado, `prefers-reduced-motion` respeitado.
"Aplicar" fecha o drawer.

## Bloco 7 — Grade

`repeat(auto-fit, minmax(280px, 1fr))` (D5). Cada item é `ProductCard` alimentado por
`mapearParaProductCard`. O botão "adicionar ao orçamento" fica **presente e inerte** (carrinho é Fase
8) — mesma decisão Q3 da Fase 4, **sem** toast "em breve".

## Bloco 8 — Os quatro estados (telas distintas, não unificar)

1. **Vazio** — busca ainda não feita.
2. **Carregando** — skeletons. Diferente da Home: como a rota é dinâmica (`searchParams`), este estado
   **é alcançável em produção**, não só na showcase.
3. **Sem resultados** — cópia literal do layout:
   > **SEM CORRESPONDÊNCIA**
   > **Amplie a busca ou fale com a equipe**
   > Nenhum produto do catálogo combina com todos os filtros aplicados ao mesmo tempo. Tente remover o
   > filtro mais específico, ou envie sua necessidade — trabalhamos com itens que ainda não estão
   > publicados.
4. **Erro** — falha ao consultar o CMS.

---

## Escala e tokens

`clamp()` distintos extraídos do layout: `clamp(32px,4vw,64px)` · `clamp(40px,5vw,64px)` ·
`clamp(24px,3vw,48px)` · `clamp(40px,5vw,72px)` · `clamp(16px,1.2vw,17px)` · `clamp(24px,3vw,40px)` ·
`clamp(28px,4vw,48px)` · `clamp(24px,2.6vw,30px)`.

Cores, tipografia e espaçamento seguem o tema das Fases 2/4 — nenhum token novo.

---

## Questões em aberto (o planejamento decide)

**Q1 — botão "Filtros" só no mobile, sem breakpoint novo.** O layout usa `mobile` (JS). Três saídas:
(a) reusar `theme.breakpoint.header` (1080px, já aprovado em D1); (b) container query; (c) painel
sempre visível e colapsável em qualquer largura. **Recomendo (a)** — não cria breakpoint novo e é
coerente com o chrome.

**Q2 — "Mais solicitados" na ordenação** não tem campo no modelo. Criar campo, ou remover a opção?

**Q3 — `item_list_id` do `view_item_list`** com filtro aplicado: valor fixo (`catalogo`) ou derivado?

**Q4 — "Outro" da taxonomia de evento** faz sentido no formulário (Fase 9), não como filtro. Ocultar do
painel?

**Q5 — paginação.** 10 produtos não justificam. Registrar como adiado ou implementar já?
