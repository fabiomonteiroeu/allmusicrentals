# Design Tokens — All Music Rentals

> **Fonte da verdade:** `/projeto-base/*.dc.html` (exports do Claude Design).
> Todos os valores abaixo foram **extraídos do código** com contagem de uso (grep), **não inferidos**.
> Arquivo legível por máquina: [`tokens.json`](./tokens.json) — este é o insumo do tema styled-components da Fase 02.

## Achado estrutural (importante)

- **Não existe nenhuma `@media` query no CSS.** A responsividade já está pronta, porém **fluida/intrínseca**:
  - `clamp(min, vw, max)` para tipografia e espaçamento de seção;
  - CSS Grid `repeat(auto-fit, minmax(...))` e grids fracionários `minmax(0, Nfr)`;
  - `flex-wrap` para reflow;
  - troca de layout de **header/menu** dirigida por variáveis do `support.js` (`topbarDisplay`, `deskDisplay`, `mobDisplay`, `menuDisplay`, `tituloDeskDisplay`), não por breakpoint CSS.
- **Consequência para a implementação:** o tema não terá breakpoints fixos como base — a escala tipográfica e de espaçamento é fluida. Os pontos de troca de header (desktop↔mobile) precisam ser reconstituídos a partir do `support.js` (candidato a ADR/divergência).

---

## 1. Cores

Ramificações semânticas derivadas do uso real (contexto conferido no código).

### Tinta / superfícies escuras
| Token | Hex | Usos | Papel |
|---|---|---:|---|
| `tinta.900` | `#0B0C0D` | 448 | Texto principal, base escura (ink) |
| `tinta.800` | `#1C1E20` | 55 | Borda sobre fundo escuro / topbar |
| `tinta.750` | `#2A2D2F` | 60 | Superfície escura / divisor decorativo |
| `tinta.700` | `#3A3E40` | 175 | **Borda dominante sobre fundo escuro** |
| `tinta.600` | `#4A4E50` | 87 | Superfície/borda escura secundária |
| `tinta.850` | `#141618` | 1 | Superfície escura profunda (raro) |
| `tinta.550` | `#4F5456` | 1 | Cinza escuro (raro) |

### Cinzas / superfícies claras
| Token | Hex | Usos | Papel |
|---|---|---:|---|
| `cinza.100` | `#F1F2F2` | 501 | **Fundo da página** |
| `cinza.000` | `#FFFFFF` | 118 | Branco / cartões |
| `cinza.300` | `#C9CBCC` | 261 | **Borda clara principal** (unificada: absorve `#C7CACB`) |
| `cinza.200` | `#DDE0E0` | 169 | Superfície clara / divisor |
| `cinza.150` | `#E4E6E6` | 55 | Superfície clara 2 / placeholder |
| `cinza.500` | `#5A5F61` | 89 | Texto secundário (mid) |
| `cinza.450` | `#6B7072` | 86 | Texto secundário / legenda |
| `cinza.350` | `#9EA3A5` | 70 | Texto muted claro / ícones |
| `cinza.400` | `#8A8F91` | 40 | Texto desabilitado / hint |
| `cinza.250` | `#DADCDC` | 7 | Superfície / faixa decorativa |
| `cinza.125` | `#EDEEEE` | 2 | Superfície clara 3 (raro) |

### Marca (teal)
| Token | Hex | Usos | Papel |
|---|---|---:|---|
| `teal.brilhante` | `#2FB6B9` | **657** | **Acento principal** (destaque, chip ativo, foco) |
| `teal.link` | `#1A7F82` | 126 | Cor de link (`a`) e realces médios |
| `teal.escuro` | `#166D70` | 98 | Teal escuro — hover / pressed |
| `teal.tint_bg` | `#E7EFEF` | 2 | Fundo tint teal (raro) |

### Erro / perigo
| Token | Hex | Usos | Papel |
|---|---|---:|---|
| `erro.base` | `#8C2A2A` | 71 | Vermelho de erro principal (texto + fundo de alerta) |
| `erro.bg_tint` | `#FBF0F0` | 3 | Fundo de alerta claro |
| `erro.escuro` | `#5A2020` | 4 | Vermelho escuro (unificada: absorve `#5A1F24`) |
| `erro.borda` | `#E0C4C4` | 1 | Borda de campo em erro |

### Acentos raros
| Token | Hex | Usos | Papel |
|---|---|---:|---|
| `acento.areia` | `#D8C9A8` | 3 | Bege/areia decorativo |
| `acento.navy` | `#1F2A44` | 2 | Azul-marinho (raro) |

### Alpha (sobre imagem / sombra)
`rgba(11,12,13,0.35)` (sombra padrão) · `rgba(11,12,13,0.90)` (scrim forte) · `rgba(255,255,255,0.35)` · `rgba(11,12,13,0.25)`

---

## 2. Tipografia

Três famílias, do Google Fonts:
```
family=Archivo:wdth,wght@75,700;75,800 & family=Public+Sans:wght@400;500;600 & family=IBM+Plex+Mono:wght@400;500
```

| Papel | Família | Pesos | Notas |
|---|---|---|---|
| **Display** | `Archivo` (variável) | 700, 800 | `font-variation-settings:'wdth' 75` (174 usos). **O subset `latin` precisa preservar o eixo `wdth`**, senão o display quebra. Uppercase + tracking. |
| **Corpo** | `Public Sans`, system-ui | 400, 500, 600 | Definida em `html,body`. Texto corrido e UI. |
| **Mono** | `IBM Plex Mono` | 400, 500 | Códigos, specs, medidas, protocolos, micro-rótulos (54 usos). |

**Escala de tamanho (px, com frequência):** 12(9) · 13(31) · 14(45) · 15(28) · 16(33) · 17(7) · 18(14) · 20(5) · 22(11) · 26(2) · 28(1) · 30(5) · 34(2) · 44(8) · 52(2). Corpos dominantes: **14 / 16 / 13 / 15**.

**Tamanhos fluidos (clamp) para títulos:** de `clamp(16px,1.2vw,17px)` (corpo grande) até `clamp(56px,8vw,144px)` e `clamp(64px,9vw,144px)` (display hero). Lista completa em `tokens.json`.

**Peso:** display 800 (174) / 500 (22). **Line-height:** `1` (42), `0.98` (22), `0.92` (9) — apenas display. **Letter-spacing:** `0.06em` (168, rótulos caixa-alta) · `0.04em` (35) · `-0.01em` (72, display grande). **text-transform:** `uppercase` (66).

---

## 3. Espaçamento

Unidade base ~**2px**, ritmo dominante em múltiplos de 4px.

**Escala (px):** `1 · 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40`

**Gaps mais usados:** 8(133) · 10(69) · 12(68) · 16(30) · 14(29) · 24(29) · 20(25) · 2(24) · 40(12).

**Paddings dominantes:** `4px 0`, `12px 0`, `0 20px`, `0 14px`, `20px`, `24px`, `14px 20px`, `17px 26px`, `16px 20px 24px`.

**Containers (max-width):** principal **1280px** (86 usos); restritos: 280, 360, 480, 520, 560, 640, 660, 720, 840.

---

## 4. Raio, borda, sombra

- **Raio:** `2px` domina (276 usos) → visual anguloso/industrial. `1px` (1), `50%` (3, círculos).
- **Bordas:** larguras `1px`/`2px`. Combinações-chave:
  - `1px solid #3A3E40` (128) — divisor sobre escuro
  - `1px solid #C9CBCC` (78) — cartão/campo sobre claro
  - `1px solid #0B0C0D` (30) — borda forte
  - `1px solid #2FB6B9` (21) — acento / ativo
  - `2px solid #0B0C0D` (14), `2px solid #2FB6B9` (9) — marcadores fortes
  - `1px dashed #C9CBCC` (1) — placeholder tracejado
- **Sombra:** sistema de **sombra dura (sem blur)** — `6px 6px 0 rgba(11,12,13,0.35)`, `0 6px 0 …`, `0 -4px 0 …`.

---

## 5. Gradientes

- **Scrim de hero:** `linear-gradient(100deg, rgba(11,12,13,0.97) 0%, … 0.28 100%)` — legibilidade sobre imagem.
- **Listras/placeholder:** `linear-gradient(90deg,#2A2D2F 0 22px,transparent 22px 24px)` e variantes.
- **Pontos:** `radial-gradient(#2FB6B9 32%,transparent 33%)`.

---

## 6. Movimento

**Keyframes definidos:** `amrFade` (fade-in), `amrToast` (entrada de toast), `amrErro` (shake de erro), `amrSpin` (spinner), `amrPulso` (skeleton/pulse), `amrDrawer` (drawer mobile subindo), `amrMod` (modal), `amrProg` (barra indeterminada).

**Durações:** 0.12–0.7s para UI; 1.3–1.6s para loops (pulse). **Easings:** `ease-out` (padrão), `linear` (loops), `cubic-bezier(.2,.7,.2,1)` (saída suave).

> ⚠️ **`prefers-reduced-motion` NÃO está nos HTMLs.** É requisito de acessibilidade do briefing — deve ser adicionado na Fase 02.

---

## Divergências

Registro completo em `docs/00-divergencias.md`.

1. ✅ **RESOLVIDA** — Dois cinzas de borda quase idênticos `#C9CBCC` vs `#C7CACB`: **unificados em `cinza.300 = #C9CBCC`** (261 usos). *Aprovado 2026-08-13.*
2. ✅ **RESOLVIDA** — Vermelho escuro `#5A2020` vs `#5A1F24`: **unificados em `erro.escuro = #5A2020`** (4 usos). *Aprovado 2026-08-13.*
3. **Ramp teal** (`#2FB6B9` / `#1A7F82` / `#166D70`): não é divergência — escala intencional (acento / link / hover). Mantida.
4. **Pontos de troca desktop↔mobile** vivem no `support.js`, não no CSS. Precisam ser reconstituídos e virarão os breakpoints JS/container-query do tema. *Candidato a ADR.*

---

## Como isto vira o tema (Fase 02)

`tokens.json` → objeto `theme` do styled-components (`ThemeProvider`), com:
`theme.cor.*`, `theme.fonte.{display,corpo,mono}`, `theme.tamanho.*` (fixos + helpers `clamp`), `theme.espaco[n]`, `theme.raio`, `theme.borda.*`, `theme.sombra.*`, `theme.z`, `theme.motion.*`.
Regra do briefing: **estilo inline do HTML não é copiado** — é traduzido para estes tokens.
