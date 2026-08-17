import 'server-only';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

/**
 * Sanitização de rich text vindo do CMS — SERVIDOR APENAS.
 *
 * Campos `richtext` do Strapi guardam **Markdown**. O caminho seguro é sempre:
 *   markdown → HTML (marked) → allowlist estrita (sanitize-html) → `HtmlSeguro`.
 *
 * Nenhum componente deve receber HTML de CMS que não seja `HtmlSeguro`: o tipo é
 * marcado (branded) justamente para que `dangerouslySetInnerHTML` só aceite string
 * que passou por aqui (regra de aceite da Fase 03).
 */

declare const marcaHtmlSeguro: unique symbol;

/** String de HTML já sanitizada. Só `sanitizarRichText`/`sanitizarHtml` produzem este tipo. */
export type HtmlSeguro = string & { readonly [marcaHtmlSeguro]: true };

/**
 * Allowlist do conteúdo editorial: texto, listas, tabelas simples, links e imagens.
 * Fora da lista: script, style, iframe, form, object, embed, svg, event handlers.
 */
const OPCOES: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'sup',
    'sub',
    'blockquote',
    'code',
    'pre',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'span',
    'div',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    '*': ['id'],
  },
  // Sem `data:` e sem `javascript:` — só protocolos de navegação/contato.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  // Conteúdo de tags removidas some junto (evita vazar corpo de <script>).
  nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe'],
  transformTags: {
    // Link externo nunca deixa o `opener` acessível.
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const externo = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
      };
    },
    // H1 é da página, não do conteúdo: rebaixa para manter a hierarquia acessível.
    h1: 'h2',
  },
};

/** Sanitiza HTML já pronto (ex.: campo que o editor colou como HTML). */
export function sanitizarHtml(html: string | null | undefined): HtmlSeguro {
  if (!html) return '' as HtmlSeguro;
  return sanitizeHtml(html, OPCOES) as HtmlSeguro;
}

/**
 * Converte Markdown do Strapi em HTML seguro.
 * `marked` é síncrono aqui (sem extensões async), então o cast de retorno é seguro.
 */
export function sanitizarRichText(markdown: string | null | undefined): HtmlSeguro {
  if (!markdown) return '' as HtmlSeguro;
  const html = marked.parse(markdown, { async: false, gfm: true, breaks: true });
  return sanitizarHtml(html);
}

/** Texto puro (sem nenhuma tag) — para meta description, alt, prévias. */
export function textoPuro(markdownOuHtml: string | null | undefined): string {
  if (!markdownOuHtml) return '';
  const html = marked.parse(markdownOuHtml, { async: false, gfm: true });
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
