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
} from './adapters';
import type { ProdutoCms, CategoriaCms, FaqItemCms } from './schemas';

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
