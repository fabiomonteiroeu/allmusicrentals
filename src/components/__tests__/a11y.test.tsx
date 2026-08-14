import { axe } from 'jest-axe';
import { renderComProviders } from '@/test-utils';
import { Footer } from '@/components/chrome/Footer';
import { ProductCard, type ProdutoResumo } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Notice } from '@/components/feedback/Notice';
import { Button } from '@/components/primitives/Button';

/**
 * Acessibilidade automatizada (axe) dos componentes globais.
 * Verificação por teclado e no navegador entra no e2e (Playwright) das fases de página.
 */
const produto: ProdutoResumo = {
  nome: 'Mesa Alta',
  categoria: 'MÓVEIS',
  spec: '150 LB',
  descricao: 'Mesa alta de alumínio.',
  cores: ['Preto', 'Branco'],
};

describe('acessibilidade (axe)', () => {
  it('Footer sem violações', async () => {
    const { container } = renderComProviders(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ProductCard sem violações', async () => {
    const { container } = renderComProviders(<ProductCard produto={produto} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('EmptyState sem violações', async () => {
    const { container } = renderComProviders(
      <EmptyState eyebrow="SEM RESULTADO" titulo="Amplie a busca" texto="Nenhum item combina.">
        <Button $variante="primario" $tamanho="sm">
          Solicitar Orçamento
        </Button>
      </EmptyState>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Notice sem violações', async () => {
    const { container } = renderComProviders(<Notice rotulo="AVISO">Texto do aviso.</Notice>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
