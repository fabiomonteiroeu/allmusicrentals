import type { Core } from '@strapi/strapi';

/** Locales do projeto — pt-BR é o padrão (ADR 002 do Next). */
const LOCALES: { code: string; name: string }[] = [
  { code: 'pt-BR', name: 'Portuguese (Brazil) (pt-BR)' },
  { code: 'en', name: 'English (en)' },
  { code: 'es', name: 'Spanish (es)' },
];
const DEFAULT_LOCALE = 'pt-BR';

/** Ações públicas: leitura do conteúdo + create só para solicitações. */
const PUBLIC_READ = [
  'settings-globais',
  'menu-item',
  'rodape-coluna',
  'page',
  'product',
  'category',
  'faq-item',
  'avaliacao',
  'tipo-de-evento',
];

async function garantirLocales(strapi: Core.Strapi) {
  const service = strapi.plugin('i18n').service('locales');
  const existentes: { code: string }[] = await service.find();
  const codes = new Set(existentes.map((l) => l.code));

  for (const loc of LOCALES) {
    if (!codes.has(loc.code)) {
      await service.create({ code: loc.code, name: loc.name });
      strapi.log.info(`[seed] locale criado: ${loc.code}`);
    }
  }
  try {
    const atual = await service.getDefaultLocale();
    if (atual !== DEFAULT_LOCALE) {
      await service.setDefaultLocale({ code: DEFAULT_LOCALE });
      strapi.log.info(`[seed] locale padrão definido: ${DEFAULT_LOCALE}`);
    }
  } catch (e) {
    strapi.log.warn(`[seed] não foi possível definir o locale padrão: ${(e as Error).message}`);
  }
}

async function garantirPermissoesPublicas(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  const acoes: string[] = [];
  for (const name of PUBLIC_READ) {
    acoes.push(`api::${name}.${name}.find`);
    if (name !== 'settings-globais') acoes.push(`api::${name}.${name}.findOne`);
  }
  // O formulário público pode CRIAR solicitações, mas nunca lê-las.
  acoes.push('api::solicitacao.solicitacao.create');

  for (const action of acoes) {
    const existe = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });
    if (!existe) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id } });
    }
  }
  strapi.log.info('[seed] permissões públicas garantidas');
}

async function seedEstrutura(strapi: Core.Strapi) {
  // Single type: settings-globais (idempotente).
  const settingsUid = 'api::settings-globais.settings-globais';
  const settings = await strapi.documents(settingsUid).findFirst({ locale: DEFAULT_LOCALE });
  if (!settings) {
    await strapi.documents(settingsUid).create({
      locale: DEFAULT_LOCALE,
      data: {
        nomeSite: 'All Music Rentals',
        tagline: 'Locação Premium e Soluções em Painéis de LED para Eventos na Flórida',
        telefone: '(689) 242-1871',
        telefoneHref: 'tel:+16892421871',
        email: 'contato@allmusicbr.com',
        textosLegais: {
          disclaimer:
            'Os produtos estão sujeitos à disponibilidade. O envio de uma solicitação não cria uma reserva.',
          copyright: '© 2026 All Music Rentals. Todos os direitos reservados.',
          descricaoMarca:
            'Locação de equipamentos, mobiliário e painéis de LED para eventos na Flórida.',
        },
      },
    });
    strapi.log.info('[seed] settings-globais criado');
  }

  // Categorias reais (estrutura, sem produtos fictícios).
  const categorias = [
    { nome: 'Estruturas', slug: 'estruturas', ordem: 1 },
    { nome: 'Telas de LED', slug: 'telas-de-led', ordem: 2 },
    { nome: 'Luz & Som', slug: 'luz-e-som', ordem: 3 },
    { nome: 'Tendas', slug: 'tendas', ordem: 4 },
    { nome: 'Móveis', slug: 'moveis', ordem: 5 },
  ];
  for (const cat of categorias) {
    const existe = await strapi
      .documents('api::category.category')
      .findFirst({ filters: { slug: cat.slug }, locale: DEFAULT_LOCALE, status: 'draft' });
    if (!existe) {
      const doc = await strapi
        .documents('api::category.category')
        .create({ locale: DEFAULT_LOCALE, data: cat });
      await strapi
        .documents('api::category.category')
        .publish({ documentId: doc.documentId, locale: DEFAULT_LOCALE });
    }
  }
  strapi.log.info('[seed] categorias garantidas');

  // Taxonomia unificada de tipo de evento (decisão travada em 05-01, opção A, 11 rótulos).
  // `Outro` entra com exibirNoFiltroDoCatalogo: false — oculto do painel de filtros do catálogo,
  // mas disponível no select do formulário de orçamento (Fase 9).
  const tiposDeEvento = [
    { nome: 'Evento corporativo', slug: 'evento-corporativo', ordem: 1 },
    { nome: 'Casamento', slug: 'casamento', ordem: 2 },
    { nome: 'Aniversário', slug: 'aniversario', ordem: 3 },
    { nome: 'Festa privada', slug: 'festa-privada', ordem: 4 },
    { nome: 'Show', slug: 'show', ordem: 5 },
    { nome: 'Festival', slug: 'festival', ordem: 6 },
    { nome: 'Feira', slug: 'feira', ordem: 7 },
    { nome: 'Ativação de marca', slug: 'ativacao-de-marca', ordem: 8 },
    { nome: 'Formatura', slug: 'formatura', ordem: 9 },
    { nome: 'Evento ao ar livre', slug: 'evento-ao-ar-livre', ordem: 10 },
    { nome: 'Outro', slug: 'outro', ordem: 11, exibirNoFiltroDoCatalogo: false },
  ];
  for (const tipo of tiposDeEvento) {
    const existe = await strapi
      .documents('api::tipo-de-evento.tipo-de-evento')
      .findFirst({ filters: { slug: tipo.slug }, locale: DEFAULT_LOCALE, status: 'draft' });
    if (!existe) {
      const doc = await strapi
        .documents('api::tipo-de-evento.tipo-de-evento')
        .create({ locale: DEFAULT_LOCALE, data: tipo });
      await strapi
        .documents('api::tipo-de-evento.tipo-de-evento')
        .publish({ documentId: doc.documentId, locale: DEFAULT_LOCALE });
    }
  }
  strapi.log.info('[seed] tipos de evento garantidos');

  // Menu do cabeçalho.
  const cabecalho = [
    { rotulo: 'Início', url: '/', ordem: 1 },
    { rotulo: 'Estruturas', url: '/categoria/estruturas', ordem: 2 },
    { rotulo: 'Telas de LED', url: '/categoria/telas-de-led', ordem: 3 },
    { rotulo: 'Luz & Som', url: '/categoria/luz-e-som', ordem: 4 },
    { rotulo: 'Tendas', url: '/categoria/tendas', ordem: 5 },
    { rotulo: 'Móveis', url: '/categoria/moveis', ordem: 6 },
    { rotulo: 'Sobre Nós', url: '/sobre', ordem: 7 },
    { rotulo: 'Contato', url: '/contato', ordem: 8 },
  ];
  for (const item of cabecalho) {
    const existe = await strapi
      .documents('api::menu-item.menu-item')
      .findFirst({ filters: { rotulo: item.rotulo, local: 'cabecalho' }, locale: DEFAULT_LOCALE });
    if (!existe) {
      await strapi
        .documents('api::menu-item.menu-item')
        .create({ locale: DEFAULT_LOCALE, data: { ...item, local: 'cabecalho', visivel: true } });
    }
  }

  // Menus do rodapé + colunas.
  type LocalRodape = 'rodape-produtos' | 'rodape-empresa' | 'rodape-informacoes';
  const rodape: Record<LocalRodape, { titulo: string; itens: { rotulo: string; url: string }[] }> = {
    'rodape-produtos': {
      titulo: 'PRODUTOS',
      itens: [
        { rotulo: 'Estruturas', url: '/categoria/estruturas' },
        { rotulo: 'Telas de LED', url: '/categoria/telas-de-led' },
        { rotulo: 'Luz & Som', url: '/categoria/luz-e-som' },
        { rotulo: 'Tendas', url: '/categoria/tendas' },
        { rotulo: 'Móveis', url: '/categoria/moveis' },
      ],
    },
    'rodape-empresa': {
      titulo: 'EMPRESA',
      itens: [
        { rotulo: 'Sobre Nós', url: '/sobre' },
        { rotulo: 'Contato', url: '/contato' },
        { rotulo: 'Solicitar Orçamento', url: '/solicitar-orcamento' },
      ],
    },
    'rodape-informacoes': {
      titulo: 'INFORMAÇÕES',
      itens: [
        { rotulo: 'Perguntas Frequentes', url: '/faq' },
        { rotulo: 'Política de Privacidade', url: '/privacidade' },
        { rotulo: 'Termos de Uso', url: '/termos' },
        { rotulo: 'Políticas de Locação', url: '/politicas' },
        { rotulo: 'Entrega e Montagem', url: '/entrega' },
        { rotulo: 'Cancelamento', url: '/cancelamento' },
        { rotulo: 'Acessibilidade', url: '/acessibilidade' },
      ],
    },
  };

  const entradasRodape = Object.entries(rodape) as [LocalRodape, (typeof rodape)[LocalRodape]][];
  for (const [local, coluna] of entradasRodape) {
    const idsItens: string[] = [];
    for (let i = 0; i < coluna.itens.length; i++) {
      const item = coluna.itens[i];
      let doc = await strapi
        .documents('api::menu-item.menu-item')
        .findFirst({ filters: { rotulo: item.rotulo, local }, locale: DEFAULT_LOCALE });
      if (!doc) {
        doc = await strapi.documents('api::menu-item.menu-item').create({
          locale: DEFAULT_LOCALE,
          data: { ...item, local, ordem: i + 1, visivel: true },
        });
      }
      idsItens.push(doc.documentId);
    }
    const colExiste = await strapi
      .documents('api::rodape-coluna.rodape-coluna')
      .findFirst({ filters: { titulo: coluna.titulo }, locale: DEFAULT_LOCALE });
    if (!colExiste) {
      await strapi.documents('api::rodape-coluna.rodape-coluna').create({
        locale: DEFAULT_LOCALE,
        data: {
          titulo: coluna.titulo,
          ordem: Object.keys(rodape).indexOf(local) + 1,
          itens: idsItens,
        },
      });
    }
  }
  strapi.log.info('[seed] menu e rodapé garantidos');
}

/** Normaliza para comparação tolerante a acento/maiúscula: minúsculas, sem diacríticos, sem espaços nas pontas. */
function normalizarNomeTipoDeEvento(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/**
 * Mapeamento antigo→novo dos valores hoje presentes em `aplicacoes`, confirmado em 05-01-SUMMARY.md.
 * Todos os outros valores mantêm o rótulo idêntico ao migrar.
 */
const MAPEAMENTO_APLICACOES_ANTIGO_PARA_NOVO: Record<string, string> = {
  festa: 'Festa privada',
};

/**
 * Migra o conteúdo de `aplicacoes` (json de texto livre) dos produtos existentes para a relação
 * `tiposDeEvento` (D-01). Idempotente: pula produtos que já têm a relação preenchida. Não apaga nem
 * altera `aplicacoes` — o campo permanece para texto livre editorial.
 */
async function migrarAplicacoesParaTiposDeEvento(strapi: Core.Strapi) {
  try {
    const tipos = await strapi
      .documents('api::tipo-de-evento.tipo-de-evento')
      .findMany({ locale: DEFAULT_LOCALE, status: 'draft', pagination: { pageSize: 100 } });
    const indice = new Map<string, string>();
    for (const tipo of tipos) {
      indice.set(normalizarNomeTipoDeEvento(tipo.nome as string), tipo.documentId);
    }

    const produtos = await strapi.documents('api::product.product').findMany({
      locale: DEFAULT_LOCALE,
      status: 'draft',
      populate: ['tiposDeEvento'],
      pagination: { pageSize: 100 },
    });

    let migrados = 0;
    const orfaos = new Set<string>();

    for (const produto of produtos) {
      const jaTemRelacao =
        Array.isArray(produto.tiposDeEvento) && produto.tiposDeEvento.length > 0;
      if (jaTemRelacao) continue;

      const aplicacoes: unknown = produto.aplicacoes;
      if (!Array.isArray(aplicacoes) || aplicacoes.length === 0) continue;

      const documentIds: string[] = [];
      for (const valorBruto of aplicacoes) {
        if (typeof valorBruto !== 'string') continue;
        const normalizado = normalizarNomeTipoDeEvento(valorBruto);
        const remapeado = MAPEAMENTO_APLICACOES_ANTIGO_PARA_NOVO[normalizado];
        const chave = remapeado ? normalizarNomeTipoDeEvento(remapeado) : normalizado;
        const documentId = indice.get(chave);
        if (documentId) {
          documentIds.push(documentId);
        } else {
          orfaos.add(valorBruto);
        }
      }

      if (documentIds.length === 0) continue;

      await strapi.documents('api::product.product').update({
        documentId: produto.documentId,
        locale: DEFAULT_LOCALE,
        data: { tiposDeEvento: documentIds },
      });
      await strapi
        .documents('api::product.product')
        .publish({ documentId: produto.documentId, locale: DEFAULT_LOCALE });
      migrados += 1;
    }

    strapi.log.info(`[seed] migração aplicacoes→tiposDeEvento: ${migrados} produto(s) migrado(s)`);
    if (orfaos.size > 0) {
      strapi.log.warn(
        `[seed] migração aplicacoes→tiposDeEvento: valores sem correspondência na taxonomia: ${Array.from(orfaos).join(', ')}`
      );
    }
  } catch (e) {
    strapi.log.error(
      `[seed] falha na migração aplicacoes→tiposDeEvento: ${(e as Error).stack ?? (e as Error).message}`
    );
  }
}

/**
 * Backfill idempotente de `contagemSolicitacoes` para os produtos cadastrados antes deste campo
 * existir. O `"default": 0` do schema.json só se aplica na CRIAÇÃO de um registro novo — não faz
 * backfill de registros existentes quando a coluna é adicionada no boot, e o Postgres devolveria
 * `NULL`. Em `ORDER BY contagemSolicitacoes DESC` (Fase 9), `NULL` rankeia acima de qualquer valor
 * real (`DESC NULLS FIRST`), então deixar `NULL` no banco planta um bug latente.
 *
 * O campo é `localized: false`: escrever no locale padrão já reflete nos demais locales do mesmo
 * documento, mas a prova de Task 3 confere isso explicitamente via `GET` em `en`/`es`.
 *
 * Idempotente: pula produtos que já têm o valor definido (não-nulo/não-indefinido), então a
 * segunda execução em diante loga `0 produto(s) inicializado(s)`.
 */
async function garantirContagemSolicitacoes(strapi: Core.Strapi) {
  try {
    const produtos = await strapi.documents('api::product.product').findMany({
      locale: DEFAULT_LOCALE,
      status: 'draft',
      pagination: { pageSize: 100 },
    });

    let corrigidos = 0;
    for (const p of produtos) {
      if (p.contagemSolicitacoes !== null && p.contagemSolicitacoes !== undefined) continue;

      await strapi.documents('api::product.product').update({
        documentId: p.documentId,
        locale: DEFAULT_LOCALE,
        data: { contagemSolicitacoes: 0 },
      });
      await strapi
        .documents('api::product.product')
        .publish({ documentId: p.documentId, locale: DEFAULT_LOCALE });
      corrigidos += 1;
    }
    strapi.log.info(`[seed] contagemSolicitacoes: ${corrigidos} produto(s) inicializado(s)`);
  } catch (e) {
    strapi.log.error(
      `[seed] backfill contagemSolicitacoes falhou: ${(e as Error).stack ?? (e as Error).message}`
    );
  }
}

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await garantirLocales(strapi);
      await garantirPermissoesPublicas(strapi);
      await seedEstrutura(strapi);
      await migrarAplicacoesParaTiposDeEvento(strapi);
      await garantirContagemSolicitacoes(strapi);
    } catch (e) {
      strapi.log.error(`[seed] falha no bootstrap: ${(e as Error).stack ?? (e as Error).message}`);
    }
  },
};
