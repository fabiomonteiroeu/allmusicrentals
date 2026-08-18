# ADR 004 — Deploy: registry GHCR + reverse proxy Caddy

**Status:** Aceito (Fase 03) · **Data:** 2026-08-17

## Contexto
`docs/PLANO.md` se contradizia na Fase 17: as Entregas já pressupunham GHCR ("push para registry
(GHCR)") enquanto a nota de riscos dizia que registry e proxy estavam em aberto (ver
`.planning/INGEST-CONFLICTS.md`, WARNING "Fase 17 — registry de imagens e reverse proxy em aberto").
A escolha determina o desenho do GitHub Actions, a RAM necessária na VPS Hostinger e a configuração de
TLS/headers em produção.

## Decisão
- Build da imagem no **GitHub Actions**, push para **GHCR** — a VPS Hostinger nunca compila, apenas
  faz `pull` das imagens já construídas.
- **Caddy** como reverse proxy, com TLS automático via ACME.

## Consequências
- **(a) Dimensionamento da VPS.** A VPS não precisa de RAM para build, só para runtime de Next +
  Strapi + Postgres + Caddy — o dimensionamento continua sendo risco declarado da Fase 17.
- **(b) Segredos fora do git.** Credenciais ficam em GitHub Secrets e em `.env` na VPS. Este ADR cita
  apenas os **nomes** das variáveis envolvidas no pipeline (segredos de registry do GitHub Actions e
  variáveis de ambiente do `.env` da VPS), nunca valores.
- **(c) Headers de segurança (Fase 15).** Passam a ter dois pontos possíveis de aplicação (Next e
  Caddy). Este ADR fixa que a origem dos headers é o **Next**, com o Caddy repassando sem sobrescrever.
- **(d) Publicação por imagem.** A imagem do Strapi e a do Next são publicadas separadamente no GHCR,
  cada uma com tag por SHA de commit.

## Gatilho de reversão
Se o GHCR ficar indisponível ou a organização exigir um registry próprio, o `docker-compose.prod.yml`
troca apenas a referência da imagem — o pipeline do GitHub Actions não muda de forma.
