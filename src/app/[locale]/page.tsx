import styled from 'styled-components';
import { isLocale, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { getPagina, getCategorias, getProdutos, getAvaliacoes } from '@/lib/cms/adapters';
import { RenderizadorDeBlocos } from '@/components/blocos/renderizador';
import { Container } from '@/components/primitives/Container';
import { Notice } from '@/components/feedback/Notice';

/**
 * Home (`/[locale]`). Busca no servidor, monta a Dynamic Zone.
 *
 * Cache: `fetchStrapi` já propaga `next: { tags }` (Fase 3) e o webhook `/api/revalidate`
 * chama `revalidateTag(tag, 'max')` — o modelo de cache está correto e cobre a página `home`.
 * NÃO acrescentar uma constante de revalidação por tempo nem forçar o modo dinâmico de rota
 * aqui: isso regride para revalidação por tempo/requisição em vez de por evento de publicação,
 * mesmo sendo a tentação óbvia de quem lê "a Home muda em segundos sem novo deploy".
 *
 * SEO (metadados de página, hreflang, JSON-LD) é Fase 12 — não acrescentar a função de
 * metadados do App Router aqui.
 */

const TITULO_INDISPONIVEL = 'CONTEÚDO INDISPONÍVEL';
const TEXTO_INDISPONIVEL =
  'Não foi possível carregar o conteúdo da página no momento. Tente novamente em alguns minutos.';

const FallbackWrapper = styled(Container)`
  padding-block: clamp(64px, 9vw, 144px);
`;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const localeTipado: Locale = locale;

  const pagina = await getPagina(localeTipado, 'home');

  // Não buscar produtos/categorias/avaliações quando não há página — seriam três requisições
  // desperdiçadas para renderizar só um aviso.
  const [categorias, produtosDestaque, avaliacoes] = pagina
    ? await Promise.all([
        getCategorias(localeTipado),
        getProdutos(localeTipado, { destaque: true }),
        getAvaliacoes(),
      ])
    : [[], [], []];

  if (!pagina) {
    // Strapi indisponível ou a página `home` ainda não existe: não é notFound() (o chrome do
    // layout sobrevive) e não é tela branca — um único aviso, sem detalhe de erro/URL/status
    // interno (T-04-29).
    return (
      <FallbackWrapper>
        <Notice rotulo={TITULO_INDISPONIVEL} variante="escuro">
          {TEXTO_INDISPONIVEL}
        </Notice>
      </FallbackWrapper>
    );
  }

  // Ou todos os blocos recebidos renderizam (desconhecidos filtrados para null pelo
  // renderizador), ou cai no fallback acima — sem estado intermediário.
  return (
    <RenderizadorDeBlocos
      blocos={pagina.blocos}
      locale={localeTipado}
      categorias={categorias}
      produtosDestaque={produtosDestaque}
      avaliacoes={avaliacoes}
    />
  );
}
