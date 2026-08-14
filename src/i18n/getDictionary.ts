import 'server-only';
import type { Locale } from './config';

/** Dicionários carregados sob demanda no servidor (nunca vão ao bundle do cliente inteiro). */
const dictionaries = {
  'pt-BR': () => import('./dictionaries/pt-BR.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['pt-BR']>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
