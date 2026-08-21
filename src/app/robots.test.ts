import robots from './robots';

describe('robots (beta da Fase 17)', () => {
  it('bloqueia a indexação de todo o site enquanto a beta estiver no ar', () => {
    const resultado = robots();

    expect(resultado.rules).toEqual({
      userAgent: '*',
      disallow: '/',
    });
  });
});
