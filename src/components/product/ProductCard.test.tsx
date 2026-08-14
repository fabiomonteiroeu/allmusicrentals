import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { ProductCard, type ProdutoResumo } from './ProductCard';

const fisico: ProdutoResumo = {
  nome: 'Mesa Alta',
  categoria: 'MÓVEIS',
  spec: '150 LB',
  descricao: 'Mesa alta de alumínio.',
};

const comVariacao: ProdutoResumo = {
  nome: 'Capa Spandex',
  categoria: 'CAPAS DE MESA',
  spec: 'SPANDEX',
  descricao: 'Escolha a cor.',
  cores: ['Preto', 'Branco', 'Bege'],
};

const servico: ProdutoResumo = {
  nome: 'Operação de LED',
  categoria: 'PAINÉIS DE LED',
  spec: 'SERVIÇO',
  descricao: 'Operação técnica.',
  ehServico: true,
  escopo: 'Informe a duração.',
};

describe('ProductCard', () => {
  it('produto físico adiciona ao orçamento com a quantidade', async () => {
    const onAdicionar = jest.fn();
    renderComProviders(<ProductCard produto={fisico} onAdicionar={onAdicionar} />);

    await userEvent.click(screen.getByRole('button', { name: /aumentar quantidade/i }));
    await userEvent.click(screen.getByRole('button', { name: /adicionar ao orçamento/i }));

    expect(onAdicionar).toHaveBeenCalledWith({ quantidade: 2, cor: undefined });
  });

  it('variação obrigatória: não adiciona sem escolher cor', async () => {
    const onAdicionar = jest.fn();
    renderComProviders(<ProductCard produto={comVariacao} onAdicionar={onAdicionar} />);

    // Antes de escolher, o botão diz "SELECIONAR COR".
    const botao = screen.getByRole('button', { name: /selecionar cor/i });
    await userEvent.click(botao);
    expect(onAdicionar).not.toHaveBeenCalled();

    // Após escolher a cor, adiciona.
    await userEvent.click(screen.getByRole('button', { name: 'Preto' }));
    await userEvent.click(screen.getByRole('button', { name: /adicionar ao orçamento/i }));
    expect(onAdicionar).toHaveBeenCalledWith({ quantidade: 1, cor: 'Preto' });
  });

  it('serviço técnico não mostra controle de quantidade e exibe escopo', () => {
    renderComProviders(<ProductCard produto={servico} />);
    expect(screen.queryByLabelText('Quantidade')).not.toBeInTheDocument();
    expect(screen.getByText('ESCOPO')).toBeInTheDocument();
    expect(screen.getByText('SERVIÇO TÉCNICO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar serviço/i })).toBeInTheDocument();
  });
});
