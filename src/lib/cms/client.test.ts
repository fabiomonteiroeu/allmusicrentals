/**
 * @jest-environment node
 */
import { z } from 'zod';
import { fetchStrapi, postStrapi } from './client';

const schema = z.object({ data: z.array(z.object({ id: z.number(), nome: z.string() })) });

function respostaOk(json: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(json),
  } as Response);
}

describe('cliente Strapi', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('monta a URL com prefixo /api e os parâmetros de query', async () => {
    fetchMock.mockReturnValue(respostaOk({ data: [{ id: 1, nome: 'A' }] }));
    await fetchStrapi('products', schema, {
      params: { locale: 'pt-BR', 'pagination[pageSize]': 24 },
    });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/products');
    expect(url).toContain('locale=pt-BR');
    expect(url).toContain('pagination%5BpageSize%5D=24');
  });

  it('propaga tags de cache para revalidação por webhook', async () => {
    fetchMock.mockReturnValue(respostaOk({ data: [] }));
    await fetchStrapi('products', schema, { tags: ['cms:products'] });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: { tags?: string[] } }];
    expect(init.next?.tags).toEqual(['cms:products']);
  });

  it('lança quando a resposta não valida no Zod (contrato quebrado)', async () => {
    fetchMock.mockReturnValue(respostaOk({ data: [{ id: 'um', nome: 1 }] }));
    await expect(fetchStrapi('products', schema)).rejects.toThrow(/inválida/i);
  });

  it('lança quando o Strapi responde erro HTTP', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' } as Response),
    );
    await expect(fetchStrapi('products', schema)).rejects.toThrow(/404/);
  });

  it('postStrapi envolve o corpo em { data } e valida a resposta', async () => {
    fetchMock.mockReturnValue(respostaOk({ data: [{ id: 7, nome: 'Nova' }] }));
    await postStrapi('solicitacoes', { protocolo: 'AMR-0001' }, schema);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ data: { protocolo: 'AMR-0001' } });
  });
});
