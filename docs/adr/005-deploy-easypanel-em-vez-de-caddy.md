# ADR 005 — Deploy: EasyPanel substitui Caddy como reverse proxy

**Status:** Aceito (Fase 17) · **Data:** 2026-08-20 · **Substitui:** [ADR 004](./004-deploy-ghcr-caddy.md) (parcialmente — só a parte do Caddy)

> **Atualização de 2026-08-20 (mesmo dia):** ao configurar o EasyPanel na prática, o usuário optou
> por fonte **Git + `Dockerfile`** para os Apps `web` e `cms` (o EasyPanel clona o repo e builda ele
> mesmo), em vez de puxar imagem pronta do GHCR. Isso torna a parte de GHCR + GitHub Actions +
> webhook deste ADR (Decisão, item 2-3, e Consequência (c)) **não usada** no caminho de deploy real
> — mantida aqui como registro do que foi planejado, não como o que está em produção. O gatilho de
> deploy real é o próprio `push` na `main`, observado pelo EasyPanel. Ver `docs/DEPLOY.md` para a
> arquitetura efetivamente em uso. Também corrigido abaixo: o domínio do CMS é `cms.allmusicbr.com`
> (subdomínio direto), não `cms.rentals.allmusicbr.com` como escrito originalmente neste ADR.

## Contexto

O ADR 004 (2026-08-17) fixou GHCR + Caddy como a arquitetura de deploy da Fase 17: build no GitHub
Actions, push para GHCR, e um Caddy próprio na VPS Hostinger fazendo reverse proxy com TLS
automático via ACME.

Entre o ADR 004 e a execução real da Fase 17, um fato novo apareceu: a VPS Hostinger **já roda
EasyPanel em produção**, com um site WordPress real publicado em `allmusicbr.com`. O EasyPanel é
quem hoje detém as portas 80/443 e o TLS desse site. Um Caddy próprio, configurado por este
projeto, faria bind nas mesmas portas e derrubaria o WordPress em produção — um risco inaceitável
para um site que não é deste projeto e cujo dono não pediu essa mudança.

Este ADR também nasce sob pressão de prazo: o usuário decidiu, em 2026-08-20, publicar uma beta de
Home + Catálogo em até 18h (ver desvio de ordem de execução em `ROADMAP.md`). Adicionar um reverse
proxy novo e testá-lo lado a lado com um WordPress em produção não é um trabalho compatível com
esse prazo, mesmo que fosse a escolha de longo prazo.

## Decisão

- **GHCR continua** como registry — build no GitHub Actions, push para GHCR, a VPS nunca compila
  (parte do ADR 004 que não muda).
- **EasyPanel substitui o Caddy** como dono do reverse proxy, dos domínios e do TLS. Os dois novos
  serviços deste projeto (`web` e `cms`) são criados como Apps no EasyPanel, com domínios próprios
  (`rentals.allmusicbr.com` e `cms.allmusicbr.com`) e certificado emitido pelo próprio EasyPanel.
  **Fonte do build:** Git + `Dockerfile`, direto no EasyPanel (ver nota de atualização acima) — não
  imagem pronta do GHCR, como planejado originalmente nesta seção.
- O redeploy deixa de ser `docker compose pull && up -d` por SSH e passa a ser um `curl` para a
  **Deployment Trigger URL** de cada serviço no EasyPanel, disparado pelo GitHub Actions após o
  push da imagem.

## Consequências

- **(a) Sem `docker-compose.prod.yml`.** A orquestração de produção passa a ser o próprio
  EasyPanel (Postgres gerenciado + 2 Apps). Não existe compose de produção neste repositório —
  diferente do que o ADR 004 e o `docs/PLANO.md` original assumiam.
- **(b) Headers de segurança.** A origem continua sendo o **Next** (`next.config.ts`), como o
  ADR 004 já fixava — o EasyPanel repassa sem sobrescrever, no mesmo papel que caberia ao Caddy.
- **(c) Segredos.** Sem mudança de princípio: GitHub Secrets para o pipeline, variáveis de
  ambiente configuradas no painel do EasyPanel para runtime dos serviços — nunca no repositório.
  Os nomes novos de secret são `EASYPANEL_DEPLOY_HOOK_WEB` e `EASYPANEL_DEPLOY_HOOK_CMS`.
- **(d) Convivência com o WordPress.** O EasyPanel já isola domínios por serviço — `web` e `cms`
  ganham subdomínios próprios de `allmusicbr.com`, sem tocar na configuração existente do
  WordPress. O risco de dimensionamento de RAM (item (a) do ADR 004) **aumenta**, porque agora o
  host soma WordPress + MySQL + EasyPanel + Next + Strapi + Postgres — por isso o plano 17-01
  bloqueia qualquer subida de imagem até um número real de RAM livre ser medido.
- **(e) `docs/PLANO.md` e `docs/adr/004-deploy-ghcr-caddy.md` ficam desatualizados** quanto ao
  Caddy especificamente; ambos precisam de nota apontando para este ADR (feito em 004 nesta
  mesma sessão).

## Gatilho de reversão

Se o EasyPanel se mostrar insuficiente (falta de recurso na VPS compartilhada, ou limitação do
painel para o caso de uso), a reversão para Caddy dedicado exige uma VPS própria — não é possível
coexistir com o WordPress do jeito que a decisão (d) descreve. Nesse cenário, o ADR 004 volta a
valer integralmente, e a criação de um `docker-compose.prod.yml` volta à mesa.
