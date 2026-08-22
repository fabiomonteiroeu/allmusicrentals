# Phase 6: Categoria - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-22
**Phase:** 06-categoria
**Areas discussed:** Estado "em preparação", Aplicações e FAQ da categoria, Comparativo LED, Filtros toggle

---

## Estado "em preparação"

### Q1 — O que decide se uma categoria mostra "em preparação" em vez da grade?

| Opção | Descrição | Escolhida |
|---|---|---|
| Híbrido: flag no CMS OU zero produtos | Campo `emPreparacao`; sem ele, cai na contagem | ✓ |
| Só condicional: zero produtos | Sem campo novo, zero manutenção, sem controle editorial | |
| Só flag editável | Controle total, com risco de esconder categoria com produtos | |
| Lista fixa no código | Congela luz-e-som/tendas/moveis, como o ROADMAP diz | |

**Notas:** o layout-fonte já usava `emPreparacao: c.produtos.length === 0`, então a contagem é a
regra original e a flag é acréscimo. Contagem real medida em produção: `estruturas` 0,
`telas-de-led` 4, `luz-e-som` 0, `tendas` 1, `moveis` 5 — a lista do ROADMAP está desatualizada em
duas frentes e deve ser reescrita como condição.

### Q2 — A cópia do estado fica fixa no código ou editável por categoria?

| Opção | Descrição | Escolhida |
|---|---|---|
| Fixa no código, igual ao layout-fonte | Cópia institucional, traduzível pelos 3 locales | ✓ |
| Editável por categoria no CMS | Permite justificar atraso específico; 2 campos novos | |
| Fixa com campo opcional de complemento | Meio-termo, mais uma decisão para o UI-SPEC | |

**Notas:** o trecho "os equipamentos listados acima" da cópia provou que o estado fica **abaixo das
subcategorias** — a página mantém hero e subcategorias e só a grade é substituída. Pergunta que eu
teria feito, respondida pela própria fonte.

### Q3 — Como tratar o "sem resultado", dado que o título é o mesmo do catálogo?

| Opção | Descrição | Escolhida |
|---|---|---|
| Reusar `EstadoSemResultados` com eyebrow/corpo próprios | Componente da Fase 5, já validado no axe | ✓ |
| Componente separado | Liberdade de layout, duas implementações para manter | |
| Reusar e mudar também o título | Diverge do layout de propósito | |

**Notas:** o CATG-04 pede "texto distinto do catálogo"; o layout entrega isso pelo eyebrow
(`NENHUM ITEM COM ESSA COMBINAÇÃO`) e pelo corpo, mantendo o título que `EstadoSemResultados.tsx:111`
já usa.

---

## Aplicações e FAQ da categoria

### Q4 — Como modelar `aplicacoes`?

| Opção | Descrição | Escolhida |
|---|---|---|
| Novo componente `shared.aplicacao` | Mesma forma do subcategoria; rótulo correto no admin | ✓ |
| Reusar `shared.subcategoria` | Zero arquivos novos, admin confuso | |
| Generalizar para `shared.item-com-descricao` | Mais limpo, exige migrar subcategorias existentes | |
| Hardcode por slug | Rápido, tira do cliente conteúdo claramente editorial | |

**Notas:** metade da área caiu antes da pergunta — `faq-item` **já tem** relação com `category`,
mais `ordem` e `destaque`. O FAQ não exige mudança de modelo.

### Q5 — O seed do conteúdo das 5 categorias entra no escopo?

| Opção | Descrição | Escolhida |
|---|---|---|
| Sim, seed pt-BR das 5 | Espelha a Fase 5; sem ele nenhum critério é verificável | ✓ |
| Sim, só telas-de-led e estruturas | Metade do cadastro, três categorias com casca vazia | |
| Não, só a página | Fase fecha sem verificação possível | |

**Notas:** medição em produção mostrou as 5 categorias sem `descricao`, sem `hero`, sem
subcategorias, e 0 `faq-items`. Volume do layout: 48 itens `{nome, desc}` e 11 perguntas.

---

## Comparativo LED

### Q6 — O conteúdo fica no CMS ou no código?

| Opção | Descrição | Escolhida |
|---|---|---|
| Tudo no código, bloco dedicado | Precedente do DestaqueLedBloco; régua é derivada dos números | |
| Novo bloco no Strapi, editável | Cliente controla; cadastro de 7 linhas × 3 colunas | ✓ |
| Híbrido: tabela no CMS, régua no código | Duas fontes de verdade na mesma seção | |

**Notas:** **escolha contrária à recomendação, registrada como tal.** A recomendação era código,
pelo custo de cadastro e por ser explicação técnica estável sobre dois produtos específicos. O
usuário optou por editável, ciente do custo. Decisão do usuário prevalece e está travada em D-08.

### Q7 — O que garante que apareça só em `telas-de-led`?

| Opção | Descrição | Escolhida |
|---|---|---|
| Single type "Comparativo LED" + guarda por slug | Existe exatamente um; impossível duplicar | ✓ |
| Componente na categoria + guarda por slug | Campo em toda categoria, ignorado fora de LED | |
| Presença do dado decide | Flexível, mas o CATG-03 vira convenção editorial | |

**Notas:** pergunta que só existiu porque a Q6 escolheu CMS — com conteúdo no código a garantia era
automática. O single type devolve a garantia estrutural sem abrir mão da edição.

---

## Filtros toggle

### Q8 — Quais eixos a fase entrega, dado que 4 dos 6 não têm campo no CMS?

| Opção | Descrição | Escolhida |
|---|---|---|
| Modelar só `subcategoria`; usar ambiente + tipo | 3 eixos reais; porte/montagem/distância adiados | ✓ |
| Modelar os 4 que faltam | Fiel ao layout; 4 mudanças de modelo + reclassificar 10 produtos | |
| Só ambiente + tipo | Mais enxuto; subcategorias numeradas viram decoração | |
| Reusar os 5 grupos do catálogo | Zero trabalho; esvazia o CATG-02 | |

**Notas:** descoberta desta análise — cada categoria define seus próprios grupos no layout
(`estruturas`: sub/ambiente/porte/montagem; `telas-de-led`: sub/ambiente/distancia/tipo), e o
produto só tem `ambiente` e `tipoDeItem`. Mesma classe de achado que `tipo-de-evento` na Fase 5.

### Q9 — Reusar a camada de filtros da Fase 5 ou ter a própria?

| Opção | Descrição | Escolhida |
|---|---|---|
| Generalizar `filtros.ts` para grupos parametrizados | Uma fonte de verdade; 58 e2e como rede | ✓ |
| Núcleo compartilhado + configurações separadas | Mais limpo, mais refatoração agora | |
| Módulo próprio para a categoria | Zero risco de regressão, duas implementações | |

---

## Claude's Discretion

- Forma e localização do componente de breadcrumb (não existe no projeto)
- Query ao Strapi vs filtragem em memória para o filtro de subcategoria
- Estrutura de arquivos dos componentes da categoria
- Como a relação produto → subcategoria é modelada no Strapi, desde que o filtro seja query real

## Deferred Ideas

- Eixos `porte`, `montagem` e `distancia` — sem campo no CMS, exigiriam reclassificar os 10 produtos
- Locales `en` e `es` do conteúdo das categorias
- CTA "SOLICITAR ORÇAMENTO" com destino real — Fase 9
- JSON-LD do `ItemList` para SEO — Fase 12

## Pendências deixadas em aberto de propósito

- Redação do critério 7 do comparativo ("Área de tela pelo mesmo **investimento**") — a palavra
  encosta na regra de não exibir preço; decidir antes do seed
- Tensão de rota com a Fase 7 (guarda de colisão de slug × categoria namespaced) — resolver lá
