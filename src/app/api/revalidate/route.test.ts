/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NextRequest } from 'next/server';

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));

import { revalidateTag } from 'next/cache';
import { POST } from '@/app/api/revalidate/route';

const ENDPOINT = 'http://localhost:3000/api/revalidate';

function chamar(corpo?: Record<string, unknown> | string, segredo?: string) {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (segredo !== undefined) headers.set('x-revalidate-secret', segredo);

  let body: string | undefined;
  if (corpo === undefined) {
    body = undefined;
  } else if (typeof corpo === 'string') {
    body = corpo;
  } else {
    body = JSON.stringify(corpo);
  }

  const request = new Request(ENDPOINT, { method: 'POST', headers, body });
  return POST(request as unknown as NextRequest);
}

describe('POST /api/revalidate', () => {
  let secretOriginal: string | undefined;

  beforeEach(() => {
    secretOriginal = process.env.REVALIDATE_SECRET;
    process.env.REVALIDATE_SECRET = 'segredo-de-teste';
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (secretOriginal === undefined) {
      delete process.env.REVALIDATE_SECRET;
    } else {
      process.env.REVALIDATE_SECRET = secretOriginal;
    }
  });

  it('recusa sem header x-revalidate-secret', async () => {
    const resposta = await chamar({ model: 'product', event: 'entry.publish' });
    expect(resposta.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('recusa com header de valor diferente do env', async () => {
    const resposta = await chamar({ model: 'product', event: 'entry.publish' }, 'segredo-errado');
    expect(resposta.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('recusa quando REVALIDATE_SECRET está ausente do ambiente, mesmo com header presente', async () => {
    delete process.env.REVALIDATE_SECRET;
    const resposta = await chamar({ model: 'product', event: 'entry.publish' }, 'segredo-de-teste');
    expect(resposta.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('retorna 400 quando o segredo é correto mas o corpo não é JSON', async () => {
    const resposta = await chamar('isto não é json', 'segredo-de-teste');
    expect(resposta.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('revalida a tag correta com segredo correto e modelo conhecido', async () => {
    const resposta = await chamar({ model: 'product', event: 'entry.publish' }, 'segredo-de-teste');
    expect(resposta.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith('cms:products', 'max');
    const json = (await resposta.json()) as { revalidado: string };
    expect(json.revalidado).toBe('cms:products');
  });

  it('retorna revalidado null e não chama revalidateTag para modelo fora do mapa', async () => {
    const resposta = await chamar(
      { model: 'modelo-inexistente', event: 'entry.publish' },
      'segredo-de-teste',
    );
    expect(resposta.status).toBe(200);
    expect(revalidateTag).not.toHaveBeenCalled();
    const json = (await resposta.json()) as { revalidado: string | null };
    expect(json.revalidado).toBeNull();
  });

  it.each([
    ['menu-item', 'cms:menu'],
    ['rodape-coluna', 'cms:rodape'],
    ['settings-globais', 'cms:settings'],
    ['page', 'cms:pages'],
    ['product', 'cms:products'],
    ['category', 'cms:categories'],
    ['faq-item', 'cms:faq'],
    ['avaliacao', 'cms:avaliacoes'],
  ])('modelo %s resolve para a tag %s', async (model, tagEsperada) => {
    const resposta = await chamar({ model, event: 'entry.publish' }, 'segredo-de-teste');
    expect(resposta.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith(tagEsperada, 'max');
  });

  it('o conjunto de tags cms:* em route.ts é idêntico ao de adapters.ts', () => {
    const routeSrc = readFileSync(join(process.cwd(), 'src/app/api/revalidate/route.ts'), 'utf8');
    const adaptersSrc = readFileSync(join(process.cwd(), 'src/lib/cms/adapters.ts'), 'utf8');

    const extrairTags = (texto: string) => {
      const matches = texto.match(/'cms:[a-z]+'/g) ?? [];
      return Array.from(new Set(matches)).sort();
    };

    const tagsRoute = extrairTags(routeSrc);
    const tagsAdapters = extrairTags(adaptersSrc);

    expect(tagsRoute).toEqual(tagsAdapters);
    expect(tagsRoute).toHaveLength(8);
  });
});
