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

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await garantirLocales(strapi);
      await garantirPermissoesPublicas(strapi);
      await seedEstrutura(strapi);
    } catch (e) {
      strapi.log.error(`[seed] falha no bootstrap: ${(e as Error).stack ?? (e as Error).message}`);
    }
  },
};
