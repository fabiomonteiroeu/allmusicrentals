import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { QuantityStepper } from './QuantityStepper';

function Controlado({ inicial = 1 }: { inicial?: number }) {
  const [v, setV] = useState(inicial);
  return <QuantityStepper valor={v} onChange={setV} />;
}

describe('QuantityStepper', () => {
  it('incrementa e decrementa', async () => {
    renderComProviders(<Controlado inicial={2} />);
    const campo = screen.getByLabelText('Quantidade') as HTMLInputElement;
    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }));
    expect(campo.value).toBe('3');
    await userEvent.click(screen.getByRole('button', { name: /diminuir/i }));
    expect(campo.value).toBe('2');
  });

  it('não desce abaixo de 1', async () => {
    renderComProviders(<Controlado inicial={1} />);
    const campo = screen.getByLabelText('Quantidade') as HTMLInputElement;
    await userEvent.click(screen.getByRole('button', { name: /diminuir/i }));
    expect(campo.value).toBe('1');
  });
});
