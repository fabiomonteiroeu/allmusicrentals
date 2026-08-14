import 'server-only';
import { z } from 'zod';

/**
 * Cliente Strapi — SERVIDOR APENAS (nunca vai ao bundle do cliente).
 * Token e URL vêm de variáveis de ambiente de servidor (nunca NEXT_PUBLIC_).
 * Toda resposta é validada por Zod na borda (regra da Fase 03).
 */

const STRAPI_URL = process.env.STRAPI_API_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export interface StrapiFetchOptions {
  /** Parâmetros de query (populate, filters, locale, sort, pagination). */
  params?: Record<string, string | number | boolean>;
  /** Tags de cache para revalidação sob demanda (webhook). */
  tags?: string[];
  /** Segundos de revalidação (ISR). Padrão: revalida por tag/webhook. */
  revalidate?: number | false;
}

function montarUrl(path: string, params?: StrapiFetchOptions['params']): string {
  const url = new URL(`/api/${path.replace(/^\//, '')}`, STRAPI_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/**
 * Busca crua no Strapi e valida a resposta inteira contra `schema`.
 * Lança erro se a validação falhar (contrato quebrado do CMS).
 */
export async function fetchStrapi<T>(
  path: string,
  schema: z.ZodType<T>,
  options: StrapiFetchOptions = {},
): Promise<T> {
  const url = montarUrl(path, options.params);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    next: {
      tags: options.tags,
      ...(options.revalidate !== undefined ? { revalidate: options.revalidate } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Strapi ${res.status} em ${path}: ${res.statusText}`);
  }

  const json: unknown = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Resposta do CMS inválida em ${path}: ${parsed.error.message}`);
  }
  return parsed.data;
}

/** Envia dados ao Strapi (ex.: criar solicitação). Servidor apenas. */
export async function postStrapi<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const res = await fetch(montarUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) {
    throw new Error(`Strapi POST ${res.status} em ${path}: ${res.statusText}`);
  }
  const json: unknown = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Resposta do CMS inválida em ${path}: ${parsed.error.message}`);
  }
  return parsed.data;
}
