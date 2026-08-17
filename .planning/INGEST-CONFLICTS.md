## Conflict Detection Report

Modo: `new` · Precedência: ADR > SPEC > PRD > DOC · 8 documentos ingeridos
Gerado por `gsd-doc-synthesizer` em 2026-08-17

### BLOCKERS (0)

Nenhum. Não há contradição LOCKED-vs-LOCKED: os dois únicos ADRs travados
(`docs/adr/001-styled-components.md` e `docs/adr/002-locale-padrao.md`) tratam de escopos
disjuntos (renderização/estilo vs. i18n/SEO). Nenhum documento foi classificado como
`UNKNOWN` com confiança `low`.

### WARNINGS (4)

[WARNING] Ciclo de referências entre PLANO, inventário e divergências da Fase 00
  Found: o grafo de `cross_refs` tem ciclos — `docs/PLANO.md` → `docs/00-inventario.md` → `docs/PLANO.md`; `docs/PLANO.md` → `docs/00-divergencias.md` → `docs/PLANO.md`; e a auto-referência `docs/PLANO.md` → `docs/PLANO.md` (o plano lista a si próprio entre as entregas da Fase 00)
  Impact: pela regra padrão, ciclo é BLOCKER. Rebaixado a WARNING com justificativa explícita: as arestas são navegacionais ("detalhe no outro arquivo"), não derivação de conteúdo. A travessia terminou de forma limpa — cada documento foi lido uma única vez, profundidade máxima 3 de um teto de 50, e todo cross-ref resolve para conteúdo autocontido. Nenhum laço de síntese ocorreu. O risco residual é que os três documentos descrevam o mesmo assunto (5 etapas, faixa US$) em lugares diferentes e saiam de sincronia — o que de fato já aconteceu, ver o INFO sobre a Fase 16
  → Aprove esta ingestão se concordar com a leitura acima. Para eliminar o ciclo de vez, faça `docs/00-divergencias.md` deixar de referenciar o PLANO (remova "Fase 09 do PLANO ajustada" do item 14) e remova `docs/PLANO.md` da própria lista de entregas da Fase 00. Alternativamente, force o tratamento como BLOCKER e re-execute com `--manifest` restringindo o conjunto

[WARNING] Rota canônica de produto indefinida
  Found: `docs/00-inventario.md` §1 registra a rota como `/[locale]/produto/[slug]` **"(ou `/[categoria]/[slug]`)"` — duas alternativas, sem decisão. Nenhum outro documento resolve: `docs/PLANO.md` (Fase 07) só diz "modelos físico / com-variação / serviço-técnico / pacote" e a Fase 12 exige canônica por locale sem fixar o padrão de caminho
  Impact: a escolha afeta o roteamento (Fase 07), o breadcrumb e o `BreadcrumbList`, a canônica e o sitemap por locale (Fase 12) e o e2e (Fase 16). Decidir depois força reescrita de rotas e redirecionamentos, com custo de SEO
  → Escolha `/[locale]/produto/[slug]` (mais simples, sem colisão com slugs de categoria) ou `/[locale]/[categoria]/[slug]` (melhor sinal semântico de URL) antes de planejar a Fase 07, e registre a escolha como ADR em `docs/adr/`

[WARNING] Fase 17 — registry de imagens e reverse proxy em aberto
  Found: `docs/PLANO.md` (Fase 17) declara textualmente "**Decisão aberta:** registry (GHCR vs. build direto na VPS) e proxy (Caddy é o mais simples para TLS automático). *A confirmar antes da fase.*", enquanto as Entregas da mesma fase já assumem "push para registry (GHCR)" e "reverse proxy com TLS — Caddy/Traefik/Nginx"
  Impact: o documento se contradiz internamente — as entregas pressupõem GHCR, a nota diz que GHCR ainda não foi decidido. A escolha determina o desenho do GitHub Actions, os requisitos de RAM da VPS Hostinger (build na VPS consome muito mais) e a configuração de TLS/headers de segurança em produção
  → Confirme registry e proxy antes de planejar a Fase 17. Se GHCR + Caddy for a intenção, remova a linha "Decisão aberta" e promova a escolha a ADR

[WARNING] Seis divergências de componentes da Fase 00 seguem sem aprovação
  Found: `docs/00-divergencias.md` marca os itens 5 (Header/nav estático vs dinâmico), 6 (Rodapé com `href` divergente), 7 (Card de produto com três variações de controle), 9 (posição do Toast), 11 (mesmo produto com metadados diferentes entre páginas) e 12 (microcopy legal repetido) como ⏳ AGUARDA DECISÃO. Cada um traz "Proposta"/"Recomendado", nenhum traz aprovação. O rodapé do documento confirma: "Ainda em aberto (não bloqueiam): 5, 6, 7, 9, 11, 12"
  Impact: os itens 5, 6, 7 e 9 descrevem componentes do design system, que o contexto do orquestrador dá como **concluído na Fase 02** — ou seja, foram implementados sem que a divergência fosse formalmente fechada, e a implementação pode ter escolhido diferente da proposta. Os itens 11 e 12 recaem sobre a modelagem da Fase 03, implementada e ainda não verificada
  → Antes de rotear, confirme cada proposta (todas apontam para "unificar via CMS/componente") e verifique se o código da Fase 02/03 já as implementa. Onde implementado, mude o item para ✅ RESOLVIDA citando o componente real; onde divergir, registre em `docs/divergencias.md`

### INFO (8)

[INFO] Auto-resolvido: ADR > SPEC sobre o número de etapas do formulário
  Note: `docs/00-divergencias.md` item 14 (ADR, ✅ RESOLVIDA, aprovado 2026-08-13) fixa **5 etapas**. Contradizem: `docs/PLANO.md` Fase 16 (SPEC), cujo fluxo e2e ainda diz "form 9 etapas"; `docs/PLANO.md` Fase 09 (SPEC), que assume 5 mas marca "*Confirmar antes de executar*"; e `docs/00-inventario.md` §10 (SPEC), que lista "[ ] Aprovação das 2 decisões abertas" como pendente. O ADR vence e o contexto do orquestrador confirma a aprovação do cliente. Intel sintetizada com **5 etapas** (1 Contato · 2 Evento · 3 Local/logística · 4 Produtos+arquivos · 5 Finalizar/consentimentos). Correção pendente no documento-fonte: `docs/PLANO.md` linha 92 ainda diz "form 9 etapas"

[INFO] Auto-resolvido: ADR > SPEC sobre a "Faixa de investimento" em US$
  Note: `docs/00-divergencias.md` item 15 (ADR, ✅ RESOLVIDA, aprovado 2026-08-13) mantém o campo em US$ e exige **allowlist** no teste anti-preço, por ser budget do cliente e não preço de produto. `docs/PLANO.md` Fase 09 (SPEC) registra o mesmo mas marca "*Confirmar*", e a Fase 01 descreve o teste anti-preço sem mencionar allowlist. `docs/00-inventario.md` §Duas descobertas (SPEC) trata como "aguardam sua decisão". O ADR vence: campo mantido, ressalva obrigatória em tela, allowlist restrita a esse campo. `docs/cms-fluxo-editorial.md` (DOC) é consistente — "nenhum campo de valor/preço existe no modelo"

[INFO] Auto-resolvido: ADR > SPEC sobre a troca desktop/mobile do chrome
  Note: `docs/divergencias.md` D1 (ADR, Fase 02, 2026-08-14) decide **media query CSS em 1080px** via styled-components, rejeitando o estado JS de viewport por causar mismatch de hidratação, flash e CLS. Contradizem dois SPECs: `docs/tokens/tokens.md` §Divergências item 4, que projeta "breakpoints JS/container-query do tema", e `docs/PLANO.md` Fase 02, cujo aceite exige "sem media query fixa (fluido)". O ADR vence, com o escopo negativo que ele próprio declara: a media query cobre **apenas a visibilidade desktop/mobile do chrome**; toda a escala fluida (`clamp`) e os grids `auto-fit` continuam sem media query. O breakpoint mora em `theme.breakpoint.header`

[INFO] Auto-resolvido: proposta aberta superada por decisão posterior
  Note: `docs/00-divergencias.md` item 4 (⏳ AGUARDA DECISÃO, marcado como "Candidato a ADR") propunha reconstituir os pontos de troca do `support.js` como constantes de tema **ou container queries**. `docs/divergencias.md` D1 (2026-08-14) decidiu media query CSS em 1080px. Não é contradição entre decisões vigentes — é uma proposta aberta fechada por um registro de decisão posterior. Ambos são ADR e nenhum é `locked`, então nenhum bloqueio se aplica. Registrado em `decisions.md` como `DEC-00-04 → superado por DEC-chrome-media-query`

[INFO] Itens ✅ RESOLVIDA tratados como decisões travadas apesar de `locked: false`
  Note: `docs/00-divergencias.md` foi classificado com `locked: false` porque não há frontmatter nem campo `Status` no nível do documento. Porém os itens 1, 2, 8, 14, 15 e 16 trazem aprovação datada ("*Aprovado 2026-08-13*"). A síntese os trata como **travados**, equivalentes a ADR `Accepted`, e é sobre essa leitura que se apoiam os três auto-resolvidos acima. Se essa premissa estiver errada, os auto-resolvidos precisam ser revistos

[INFO] Nenhum PRD no conjunto ingerido
  Note: a distribuição por tipo é 4 ADR, 3 SPEC, 1 DOC, 0 PRD. Consequência positiva: o bucket `competing-variants` está vazio por construção — não há dois PRDs definindo critérios de aceite divergentes para o mesmo requisito. Consequência negativa: `requirements.md` foi derivado dos critérios de aceite embutidos nos SPECs (`docs/PLANO.md` por fase, `docs/00-inventario.md` §10), ou seja, **não existe fonte de requisito de produto independente do plano de execução**. Requisito e plano compartilham a mesma origem e não se validam mutuamente

[INFO] Cinco de oito classificações têm confiança média
  Note: `docs/00-divergencias.md` (ADR), `docs/divergencias.md` (ADR), `docs/00-inventario.md` (SPEC), `docs/PLANO.md` (SPEC) e `docs/tokens/tokens.md` (SPEC) foram classificados com `confidence: medium`, todos por ausência de frontmatter e de convenção de nome/pasta. Apenas os dois arquivos em `docs/adr/` têm confiança alta (e `manifest_override: true`). O caso mais sensível é `docs/00-divergencias.md`: classificá-lo como ADR é o que lhe dá precedência sobre `docs/PLANO.md`. Se fosse DOC, a precedência inverteria — mas as conclusões não mudariam, porque o PLANO Fase 09 e o contexto do cliente concordam com as mesmas decisões

[INFO] Estado real do código está à frente da documentação
  Note: `docs/PLANO.md` abre com "Estado: Fase 00 em andamento. Nenhuma fase de aplicação começa antes da aprovação deste plano" e `docs/00-inventario.md` §10 deixa desmarcados "Aprovação das 2 decisões abertas" e "Aprovação do `docs/PLANO.md`". O contexto fornecido pelo orquestrador diz o contrário: Fases 00, 01 e 02 concluídas, Fase 03 (Strapi) implementada mas ainda não verificada/aprovada, Fases 04–17 não iniciadas. Como o modo é `new` e não há `.planning/` prévio, isso não é conflito de merge — mas o roadmapper **precisa usar o estado real**, senão replaneja trabalho já entregue. A informação está registrada em `intel/context.md`, tópico "Estado real do código no momento da ingestão"
