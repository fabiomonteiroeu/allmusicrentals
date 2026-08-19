import type { Produto } from '@/lib/cms/adapters';
import type { HtmlSeguro } from '@/lib/cms/sanitize';
import type { Locale } from '@/i18n/config';
import { mapearParaProductCard } from './mapearParaProductCard';

const locale: Locale = 'pt-BR';

function criarProduto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: 1,
    slug: 'mesa-alta',
    nome: 'Mesa Alta',
    codigo: null,
    descricaoCurta: 'Mesa alta de alumínio.',
    descricaoHtml: '' as HtmlSeguro,
    caracteristicas: [],
    medidas: [],
    material: null,
    aplicacoes: [],
    variacoes: [],
    tipoDeItem: 'fisico',
    ambiente: null,
    imagens: [],
    destaque: false,
    faq: [],
    seo: null,
    categoria: { nome: 'Móveis', slug: 'moveis' },
    tiposDeEvento: [],
    contagemSolicitacoes: 0,
    ...overrides,
  };
}

describe('mapearParaProductCard', () => {
  it('produto físico completo mapeia categoria, spec, fotos e href', () => {
    const produto = criarProduto({
      medidas: [{ rotulo: 'Altura', valor: '110 cm' }],
      imagens: [
        { url: '/uploads/mesa-1.jpg', alt: 'Mesa 1' },
        { url: '/uploads/mesa-2.jpg', alt: 'Mesa 2' },
      ],
    });

    const resumo = mapearParaProductCard(produto, locale);

    expect(resumo.categoria).toBe('MÓVEIS');
    expect(resumo.spec).toBe('ALTURA · 110 CM');
    expect(resumo.fotoSrc).toBe('/uploads/mesa-1.jpg');
    expect(resumo.fotoHoverSrc).toBe('/uploads/mesa-2.jpg');
    expect(resumo.href).toBe('/pt-BR/moveis/mesa-alta');
  });

  it('produto sem medida mas com material usa o material em caixa-alta como spec', () => {
    const produto = criarProduto({ medidas: [], material: 'Alumínio' });
    const resumo = mapearParaProductCard(produto, locale);
    expect(resumo.spec).toBe('ALUMÍNIO');
  });

  it('produto sem medida e sem material cai na spec padrão', () => {
    const produto = criarProduto({ medidas: [], material: null });
    const resumo = mapearParaProductCard(produto, locale);
    expect(resumo.spec).toBe('ESPECIFICAÇÃO SOB CONSULTA');
  });

  it('extrai só os nomes das variações de cor, ignorando maiúsculas/minúsculas do tipo', () => {
    const produto = criarProduto({
      variacoes: [
        { tipo: 'cor', nome: 'Preto', valorExibido: null },
        { tipo: 'Cor', nome: 'Branco', valorExibido: null },
        { tipo: 'tamanho', nome: 'G', valorExibido: null },
      ],
    });
    const resumo = mapearParaProductCard(produto, locale);
    expect(resumo.cores).toEqual(['Preto', 'Branco']);
  });

  it('serviço técnico vira ehServico com escopo, e sem categoria não define href', () => {
    const produto = criarProduto({
      tipoDeItem: 'servico-tecnico',
      aplicacoes: ['Instalação de painel'],
      categoria: null,
    });
    const resumo = mapearParaProductCard(produto, locale);
    expect(resumo.ehServico).toBe(true);
    expect(resumo.escopo).toBe('Instalação de painel');
    expect('href' in resumo).toBe(false);
  });
});
