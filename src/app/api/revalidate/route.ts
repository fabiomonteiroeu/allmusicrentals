import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * Webhook de revalidação do Strapi (servidor).
 * O Strapi chama esta rota ao publicar/editar; revalidamos só as tags afetadas.
 * Protegido por REVALIDATE_SECRET (nunca NEXT_PUBLIC_).
 */

// Mapa modelo do Strapi → tag de cache usada nos adapters.
const MODELO_TAG: Record<string, string> = {
  'menu-item': 'cms:menu',
  'rodape-coluna': 'cms:rodape',
  'settings-globais': 'cms:settings',
  page: 'cms:pages',
  product: 'cms:products',
  category: 'cms:categories',
  'faq-item': 'cms:faq',
  avaliacao: 'cms:avaliacoes',
};

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const enviado = request.headers.get('x-revalidate-secret');
  if (!secret || enviado !== secret) {
    return NextResponse.json({ ok: false, erro: 'não autorizado' }, { status: 401 });
  }

  let corpo: { model?: string; event?: string } = {};
  try {
    corpo = (await request.json()) as typeof corpo;
  } catch {
    return NextResponse.json({ ok: false, erro: 'corpo inválido' }, { status: 400 });
  }

  const tag = corpo.model ? MODELO_TAG[corpo.model] : undefined;
  if (tag) {
    // Next 16: purga a tag sob demanda (perfil "max" conforme doc do revalidateTag).
    revalidateTag(tag, 'max');
    return NextResponse.json({ ok: true, revalidado: tag, evento: corpo.event });
  }
  return NextResponse.json({ ok: true, revalidado: null, aviso: 'modelo sem tag mapeada' });
}
