/**
 * @jest-environment node
 */
import { sanitizarHtml, sanitizarRichText, textoPuro } from './sanitize';

describe('sanitização de rich text do CMS', () => {
  it('remove script e o conteúdo dele', () => {
    const html = sanitizarHtml('<p>ok</p><script>alert(1)</script>');
    expect(html).toBe('<p>ok</p>');
    expect(html).not.toContain('alert');
  });

  it('remove handlers de evento e style', () => {
    const html = sanitizarHtml('<p onclick="roubar()" style="color:red">texto</p>');
    expect(html).toBe('<p>texto</p>');
  });

  it('bloqueia href javascript: e data:', () => {
    expect(sanitizarHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript');
    expect(sanitizarHtml('<img src="data:text/html;base64,PHNjcmlwdD4=">')).not.toContain('data:');
  });

  it('bloqueia iframe, object e form', () => {
    const html = sanitizarHtml(
      '<iframe src="https://mau.com"></iframe><object data="x"></object><form action="/x"><input></form>',
    );
    expect(html).not.toMatch(/iframe|object|form|input/);
  });

  it('preserva formatação editorial legítima', () => {
    const html = sanitizarHtml(
      '<h2>Título</h2><p><strong>negrito</strong> e <em>itálico</em></p><ul><li>item</li></ul>',
    );
    expect(html).toContain('<h2>Título</h2>');
    expect(html).toContain('<strong>negrito</strong>');
    expect(html).toContain('<li>item</li>');
  });

  it('rebaixa h1 para h2 (o h1 é da página)', () => {
    expect(sanitizarHtml('<h1>Título</h1>')).toBe('<h2>Título</h2>');
  });

  it('força rel seguro em link externo e preserva link interno', () => {
    expect(sanitizarHtml('<a href="https://externo.com">x</a>')).toContain(
      'rel="noopener noreferrer"',
    );
    const interno = sanitizarHtml('<a href="/catalogo">x</a>');
    expect(interno).toContain('href="/catalogo"');
    expect(interno).not.toContain('target=');
  });

  it('converte markdown do Strapi em HTML seguro', () => {
    const html = sanitizarRichText('## Estruturas\n\nAluguel **profissional**.');
    expect(html).toContain('<h2>Estruturas</h2>');
    expect(html).toContain('<strong>profissional</strong>');
  });

  it('sanitiza HTML embutido no markdown', () => {
    const html = sanitizarRichText('Texto <script>alert(1)</script> fim');
    expect(html).not.toContain('script');
    expect(html).not.toContain('alert');
  });

  it('trata nulo/vazio como string vazia', () => {
    expect(sanitizarRichText(null)).toBe('');
    expect(sanitizarRichText(undefined)).toBe('');
    expect(sanitizarHtml('')).toBe('');
  });

  it('textoPuro devolve texto sem nenhuma tag', () => {
    expect(textoPuro('## Título\n\nUm **texto** com [link](https://x.com).')).toBe(
      'Título Um texto com link.',
    );
    expect(textoPuro('<p>a &amp; b</p>')).toBe('a & b');
  });
});
