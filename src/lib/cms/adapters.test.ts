/**
 * @jest-environment node
 */
import { produtoColecao, paginaSchema, blocoTolerante } from './schemas';
import {
  adaptarProduto,
  adaptarCategoria,
  adaptarFaqItem,
  adaptarBlocos,
  adaptarSeo,
  getTiposDeEvento,
  getCoresDisponiveis,
  getProdutos,
  ORDENACOES,
} from './adapters';
import type { ProdutoCms, CategoriaCms, FaqItemCms } from './schemas';

function respostaOk(json: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(json),
  } as Response);
}

/** Devolve os `searchParams` da URL chamada, para inspecionar chaves com colchetes sem
 * lidar com encoding manualmente. */
function paramsChamados(fetchMock: jest.Mock): URLSearchParams {
  const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
  return new URL(url).searchParams;
}

const produtoCru: ProdutoCms = {
  id: 1,
  nome: 'Treliça Q30',
  slug: 'trelica-q30',
  codigo: 'TQ30',
  descricaoCurta: 'Estrutura modular.',
  descricaoCompleta: 'Estrutura **modular** de alumínio.\n\n<script>alert(1)</script>',
  caracteristicas: [{ texto: 'Alumínio' }],
  medidas: [{ rotulo: 'Comprimento', valor: '2 m' }],
  material: 'Alumínio',
  aplicacoes: ['Palco'],
  variacoes: [{ tipo: 'cor', nome: 'Preto', valorExibido: '#000000' }],
  tipoDeItem: 'com-variacao',
  ambiente: 'interno-ou-externo',
  imagens: [{ url: '/uploads/q30.jpg', alternativeText: null, width: 800, height: 600 }],
  destaque: true,
  faq: [{ pergunta: 'Entrega?', resposta: 'Sim, <em>na Flórida</em>.' }],
  seo: null,
};

describe('adaptadores CMS → props', () => {
  it('adapta produto e sanitiza o rich text', () => {
    const p = adaptarProduto(produtoCru);
    expect(p.nome).toBe('Treliça Q30');
    expect(p.descricaoHtml).toContain('<strong>modular</strong>');
    expect(p.descricaoHtml).not.toContain('script');
    expect(p.caracteristicas).toEqual(['Alumínio']);
    expect(p.faq[0]?.respostaHtml).toContain('<em>na Flórida</em>');
  });

  it('usa o nome do produto como alt quando a imagem não tem texto alternativo', () => {
    const p = adaptarProduto(produtoCru);
    expect(p.imagens[0]?.alt).toBe('Treliça Q30');
    expect(p.imagens[0]?.largura).toBe(800);
  });

  it('produto sem campos opcionais não quebra o adaptador', () => {
    const p = adaptarProduto({
      id: 2,
      nome: 'Serviço técnico',
      slug: 'servico-tecnico',
      tipoDeItem: 'servico-tecnico',
    });
    expect(p.descricaoHtml).toBe('');
    expect(p.imagens).toEqual([]);
    expect(p.faq).toEqual([]);
    expect(p.seo).toBeNull();
    expect(p.categoria).toBeNull();
  });

  it('produto sem `tiposDeEvento` e sem `contagemSolicitacoes` devolve [] e 0 (nunca undefined)', () => {
    const p = adaptarProduto({
      id: 2,
      nome: 'Serviço técnico',
      slug: 'servico-tecnico',
      tipoDeItem: 'servico-tecnico',
    });
    expect(p.tiposDeEvento).toEqual([]);
    expect(p.contagemSolicitacoes).toBe(0);
  });

  it('adapta tiposDeEvento e contagemSolicitacoes quando populados', () => {
    const p = adaptarProduto({
      ...produtoCru,
      tiposDeEvento: [{ nome: 'Casamento', slug: 'casamento' }],
      contagemSolicitacoes: 5,
    });
    expect(p.tiposDeEvento).toEqual([{ nome: 'Casamento', slug: 'casamento' }]);
    expect(p.contagemSolicitacoes).toBe(5);
  });

  it('adapta a categoria populada do produto', () => {
    const p = adaptarProduto({
      ...produtoCru,
      categoria: { nome: 'Móveis', slug: 'moveis' },
    });
    expect(p.categoria).toEqual({ nome: 'Móveis', slug: 'moveis' });
  });

  it('produto sem a relação categoria populada resulta em categoria null', () => {
    const p = adaptarProduto(produtoCru);
    expect(p.categoria).toBeNull();
  });

  it('adapta categoria com produtos aninhados', () => {
    const c: CategoriaCms = {
      id: 3,
      nome: 'Estruturas',
      slug: 'estruturas',
      ordem: 1,
      subcategorias: [{ nome: 'Treliças', descricao: null }],
      produtos: [produtoCru],
    };
    const adaptada = adaptarCategoria(c);
    expect(adaptada.produtos).toHaveLength(1);
    expect(adaptada.subcategorias[0]?.nome).toBe('Treliças');
  });

  it('adapta item de FAQ sanitizando a resposta', () => {
    const f: FaqItemCms = {
      id: 4,
      pergunta: 'Vocês publicam valores?',
      resposta: 'Não. <a href="javascript:alert(1)">clique</a>',
      destaque: true,
    };
    const item = adaptarFaqItem(f);
    expect(item.respostaHtml).not.toContain('javascript');
    expect(item.destaque).toBe(true);
  });

  it('adapta o componente seo', () => {
    expect(adaptarSeo(null)).toBeNull();
    const seo = adaptarSeo({ title: 'T', description: 'D', noindex: true });
    expect(seo).toMatchObject({ titulo: 'T', descricao: 'D', noindex: true });
  });
});

describe('Dynamic Zone', () => {
  it('sanitiza rich text dos blocos que têm HTML', () => {
    const blocos = adaptarBlocos([
      {
        __component: 'blocos.texto-rico',
        id: 1,
        conteudo: 'Texto **forte** <img src="x" onerror="alert(1)">',
      },
      {
        __component: 'blocos.faq',
        id: 2,
        itens: [{ pergunta: 'P', resposta: '<b>R</b><script>x()</script>' }],
      },
    ]);

    const texto = blocos[0] as { conteudoHtml: string };
    expect(texto.conteudoHtml).toContain('<strong>forte</strong>');
    expect(texto.conteudoHtml).not.toContain('onerror');

    const faq = blocos[1] as { itens: { respostaHtml: string }[] };
    expect(faq.itens[0]?.respostaHtml).toContain('<b>R</b>');
    expect(faq.itens[0]?.respostaHtml).not.toContain('script');
  });

  it('descarta bloco de componente desconhecido em vez de derrubar a página', () => {
    const parsed = blocoTolerante.parse({ __component: 'blocos.inexistente', id: 9 });
    expect(parsed).toBeNull();
    expect(adaptarBlocos([parsed])).toEqual([]);
  });

  it('mantém blocos sem rich text intactos', () => {
    const blocos = adaptarBlocos([
      { __component: 'blocos.hero', id: 3, titulo: 'Bem-vindo', subtitulo: 'Flórida' },
    ]);
    expect(blocos[0]).toMatchObject({ __component: 'blocos.hero', titulo: 'Bem-vindo' });
  });

  // Achado no checkpoint HOME-04 (04-07): `adaptarBloco` tratava rich text mas nunca passava a
  // mídia de bloco (`blocos.hero.imagem`, `blocos.destaque-led.imagens`) por `adaptarImagem` —
  // a url relativa do Strapi chegava crua ao componente, e `next/image` resolvia contra a
  // origem do próprio front (404), em vez da origem do Strapi. `MEDIA_BASE` é lido de
  // `NEXT_PUBLIC_STRAPI_MEDIA_URL` na carga do módulo; o teste usa o valor real do ambiente
  // (vazio se a variável não estiver definida) para não depender de um `.env.local` específico.
  const mediaBase = process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL ?? '';

  it('blocos.hero: imagem com url relativa recebe o prefixo de NEXT_PUBLIC_STRAPI_MEDIA_URL', () => {
    const blocos = adaptarBlocos([
      {
        __component: 'blocos.hero',
        id: 5,
        titulo: 'O palco é seu.',
        imagem: { url: '/uploads/hero.jpg', alternativeText: null, width: 1600, height: 900 },
      },
    ]);
    const hero = blocos[0] as { imagem: { url: string; alt: string } | null };
    expect(hero.imagem?.url).toBe(`${mediaBase}/uploads/hero.jpg`);
    // Sem alternativeText no CMS, o alt cai para o título do bloco (altPadrao), não fica vazio.
    expect(hero.imagem?.alt).toBe('O palco é seu.');
  });

  it('blocos.hero: imagem com url já absoluta (https://) permanece inalterada', () => {
    const blocos = adaptarBlocos([
      {
        __component: 'blocos.hero',
        id: 6,
        titulo: 'O palco é seu.',
        imagem: {
          url: 'https://cdn.exemplo.com/hero.jpg',
          alternativeText: 'Palco montado com painel de LED',
          width: 1600,
          height: 900,
        },
      },
    ]);
    const hero = blocos[0] as { imagem: { url: string; alt: string } | null };
    expect(hero.imagem?.url).toBe('https://cdn.exemplo.com/hero.jpg');
    expect(hero.imagem?.alt).toBe('Palco montado com painel de LED');
  });

  it('blocos.destaque-led: imagens[] passam pelo mesmo prefixo de MEDIA_BASE', () => {
    const blocos = adaptarBlocos([
      {
        __component: 'blocos.destaque-led',
        id: 7,
        titulo: 'Painéis de LED',
        imagens: [{ url: '/uploads/led-1.jpg', alternativeText: null, width: 1600, height: 1000 }],
      },
    ]);
    const led = blocos[0] as { imagens: { url: string; alt: string }[] };
    expect(led.imagens[0]?.url).toBe(`${mediaBase}/uploads/led-1.jpg`);
    expect(led.imagens[0]?.alt).toBe('Painéis de LED');
  });
});

describe('getTiposDeEvento — taxonomia `tipo-de-evento` (05-02)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('consulta o endpoint tipo-de-eventos com locale e ordem', async () => {
    fetchMock.mockReturnValue(
      respostaOk({
        data: [{ id: 1, nome: 'Casamento', slug: 'casamento', ordem: 1 }],
      }),
    );
    const tipos = await getTiposDeEvento('pt-BR');
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/tipo-de-eventos');
    expect(url).toContain('locale=pt-BR');
    expect(url).toContain('sort%5B0%5D=ordem%3Aasc');
    expect(tipos[0]).toMatchObject({ nome: 'Casamento', slug: 'casamento' });
  });

  it('default exibirNoFiltroDoCatalogo para true quando ausente', async () => {
    fetchMock.mockReturnValue(
      respostaOk({ data: [{ id: 1, nome: 'Casamento', slug: 'casamento' }] }),
    );
    const tipos = await getTiposDeEvento('pt-BR');
    expect(tipos[0]?.exibirNoFiltroDoCatalogo).toBe(true);
  });

  it('honra exibirNoFiltroDoCatalogo: false vindo do CMS (caso `outro`)', async () => {
    fetchMock.mockReturnValue(
      respostaOk({
        data: [{ id: 11, nome: 'Outro', slug: 'outro', exibirNoFiltroDoCatalogo: false }],
      }),
    );
    const tipos = await getTiposDeEvento('pt-BR');
    expect(tipos[0]?.exibirNoFiltroDoCatalogo).toBe(false);
  });
});

describe('getCoresDisponiveis — origem única das cores do painel de filtros (05-02)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('devolve as cores cadastradas, deduplicadas, na ordem de coresProduto', async () => {
    fetchMock.mockReturnValue(
      respostaOk({
        data: [
          { nome: 'Guarda-sol', variacoes: [{ nome: 'Bege' }] },
          { nome: 'Capa spandex', variacoes: [{ nome: 'Preto' }, { nome: 'Bege' }] },
        ],
      }),
    );
    const cores = await getCoresDisponiveis('pt-BR');
    expect(cores).toEqual(['Bege', 'Preto']);
  });

  it('ignora nome de variação fora da paleta conhecida (ex.: tamanho "M" ou cor "Verde")', async () => {
    fetchMock.mockReturnValue(
      respostaOk({
        data: [
          { nome: 'Capa spandex', variacoes: [{ nome: 'Verde' }, { nome: 'M' }, { nome: 'Preto' }] },
        ],
      }),
    );
    const cores = await getCoresDisponiveis('pt-BR');
    expect(cores).toEqual(['Preto']);
    expect(cores).not.toContain('Verde');
    expect(cores).not.toContain('M');
  });

  it('catálogo sem nenhuma variação devolve []', async () => {
    fetchMock.mockReturnValue(
      respostaOk({ data: [{ nome: 'Serviço técnico', variacoes: [] }] }),
    );
    const cores = await getCoresDisponiveis('pt-BR');
    expect(cores).toEqual([]);
  });
});

describe('getProdutos — 5 grupos de filtro (AND entre grupos, OR dentro do grupo) e ordenação (05-02)', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockReturnValue(respostaOk({ data: [] }));
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('grupo categorias isolado: um valor entra em $and[0][$or][0]', async () => {
    await getProdutos('pt-BR', { categorias: ['moveis'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][$or][0][categoria][slug][$eq]')).toBe('moveis');
  });

  it('grupo tiposDeItem isolado: dois valores compartilham o mesmo índice de $and', async () => {
    await getProdutos('pt-BR', { tiposDeItem: ['pacote', 'servico-tecnico'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][$or][0][tipoDeItem][$eq]')).toBe('pacote');
    expect(sp.get('filters[$and][0][$or][1][tipoDeItem][$eq]')).toBe('servico-tecnico');
  });

  it('grupo cores isolado: usa $in sobre o componente repetível variacoes', async () => {
    await getProdutos('pt-BR', { cores: ['Bege'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][variacoes][nome][$in][0]')).toBe('Bege');
  });

  it('grupo tiposDeEvento isolado: usa $in sobre a relação por slug', async () => {
    await getProdutos('pt-BR', { tiposDeEvento: ['casamento'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][tiposDeEvento][slug][$in][0]')).toBe('casamento');
  });

  it('grupo ambientes isolado: $or por valor do enum', async () => {
    await getProdutos('pt-BR', { ambientes: ['interno', 'externo'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][$or][0][ambiente][$eq]')).toBe('interno');
    expect(sp.get('filters[$and][0][$or][1][ambiente][$eq]')).toBe('externo');
  });

  it('busca isolada: $containsi sobre nome', async () => {
    await getProdutos('pt-BR', { busca: 'mesa' });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][nome][$containsi]')).toBe('mesa');
  });

  it('combinação categorias + cores (RESEARCH §1): categoria no índice 0, cores no índice 1', async () => {
    await getProdutos('pt-BR', { categorias: ['moveis'], cores: ['Bege', 'Preto'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][$or][0][categoria][slug][$eq]')).toBe('moveis');
    expect(sp.get('filters[$and][1][variacoes][nome][$in][0]')).toBe('Bege');
    expect(sp.get('filters[$and][1][variacoes][nome][$in][1]')).toBe('Preto');
  });

  it('dois grupos distintos ocupam índices DIFERENTES de $and', async () => {
    await getProdutos('pt-BR', { tiposDeItem: ['pacote'], ambientes: ['interno'] });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][$or][0][tipoDeItem][$eq]')).toBe('pacote');
    expect(sp.get('filters[$and][1][$or][0][ambiente][$eq]')).toBe('interno');
  });

  it('filtro legado `categoria` (Fase 6) continua funcionando isoladamente', async () => {
    await getProdutos('pt-BR', { categoria: 'estruturas' });
    const sp = paramsChamados(fetchMock);
    expect(sp.get('filters[$and][0][categoria][slug][$eq]')).toBe('estruturas');
  });

  it.each(Object.keys(ORDENACOES) as (keyof typeof ORDENACOES)[])(
    'ordenação "%s" aplica os campos de sort do contrato',
    async (chave) => {
      await getProdutos('pt-BR', { ordenar: chave });
      const sp = paramsChamados(fetchMock);
      ORDENACOES[chave].forEach((campo, idx) => {
        expect(sp.get(`sort[${idx}]`)).toBe(campo);
      });
    },
  );

  it('sem `ordenar`, o padrão é "destaque" (destaque:desc, nome:asc)', async () => {
    await getProdutos('pt-BR', {});
    const sp = paramsChamados(fetchMock);
    expect(sp.get('sort[0]')).toBe('destaque:desc');
    expect(sp.get('sort[1]')).toBe('nome:asc');
  });
});

describe('validação Zod do contrato do CMS', () => {
  it('aceita a resposta de coleção do Strapi 5', () => {
    const res = produtoColecao.safeParse({
      data: [produtoCru],
      meta: { pagination: { page: 1, pageSize: 24, pageCount: 1, total: 1 } },
    });
    expect(res.success).toBe(true);
  });

  it('rejeita produto sem slug (contrato quebrado)', () => {
    const res = produtoColecao.safeParse({ data: [{ id: 1, nome: 'X', tipoDeItem: 'fisico' }] });
    expect(res.success).toBe(false);
  });

  it('rejeita página sem título', () => {
    expect(paginaSchema.safeParse({ id: 1, slug: 'home' }).success).toBe(false);
  });

  it('aceita página com blocos vazios', () => {
    const res = paginaSchema.safeParse({ id: 1, titulo: 'Home', slug: 'home', blocos: [] });
    expect(res.success).toBe(true);
  });
});
