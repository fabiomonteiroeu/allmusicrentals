import { isLocale, locales, defaultLocale } from './config';

describe('i18n config', () => {
  it('tem três locales com pt-BR como padrão', () => {
    expect(locales).toEqual(['pt-BR', 'en', 'es']);
    expect(defaultLocale).toBe('pt-BR');
  });

  it('valida locales conhecidos', () => {
    expect(isLocale('pt-BR')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
  });

  it('rejeita locales desconhecidos', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('pt')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});
