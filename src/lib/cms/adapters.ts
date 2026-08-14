import 'server-only';
import { fetchStrapi } from './client';
import { menuItemColecao, rodapeColunaColecao, settingsGlobaisUnico } from './schemas';
import type { ItemNav, ColunaRodape, DadosContato } from '@/lib/site/navigation';
import type { Locale } from '@/i18n/config';

/**
 * Camada de adaptação CMS → props (servidor).
 * As páginas buscam aqui no servidor e passam props aos componentes-folha.
 * Tags de cache permitem revalidação sob demanda por webhook do Strapi.
 */

const TAG = {
  menu: 'cms:menu',
  rodape: 'cms:rodape',
  settings: 'cms:settings',
} as const;

/** Itens do menu de cabeçalho, ordenados, já no formato do componente Header. */
export async function getNavPrincipal(locale: Locale): Promise<ItemNav[]> {
  const res = await fetchStrapi('menu-items', menuItemColecao, {
    params: {
      locale,
      'filters[local][$eq]': 'cabecalho',
      'filters[visivel][$eq]': true,
      'sort[0]': 'ordem:asc',
      'pagination[pageSize]': 100,
    },
    tags: [TAG.menu],
  });
  return res.data.map((item): ItemNav => ({ rotulo: item.rotulo, href: item.url }));
}

/** Colunas do rodapé com seus itens, no formato do componente Footer. */
export async function getColunasRodape(locale: Locale): Promise<ColunaRodape[]> {
  const res = await fetchStrapi('rodape-colunas', rodapeColunaColecao, {
    params: {
      locale,
      populate: 'itens',
      'sort[0]': 'ordem:asc',
      'pagination[pageSize]': 100,
    },
    tags: [TAG.rodape],
  });
  return res.data.map(
    (col): ColunaRodape => ({
      titulo: col.titulo,
      itens: [...col.itens]
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((i): ItemNav => ({ rotulo: i.rotulo, href: i.url })),
    }),
  );
}

export interface SettingsGlobais {
  nomeSite: string;
  tagline: string;
  contato: DadosContato;
}

/** Configurações globais (contato, tagline) no formato dos componentes. */
export async function getSettingsGlobais(locale: Locale): Promise<SettingsGlobais | null> {
  const res = await fetchStrapi('settings-globais', settingsGlobaisUnico, {
    params: { locale, populate: 'imagemOG' },
    tags: [TAG.settings],
  });
  const s = res.data;
  if (!s) return null;
  const telefone = s.telefone ?? '';
  return {
    nomeSite: s.nomeSite ?? 'All Music Rentals',
    tagline: s.tagline ?? '',
    contato: {
      telefone,
      telefoneHref: `tel:${telefone.replace(/[^\d+]/g, '')}`,
      email: s.email ?? '',
    },
  };
}

export const CMS_TAGS = TAG;
