import styled from 'styled-components';
import { isLocale, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import {
  getCategorias,
  getTiposDeEvento,
  getCoresDisponiveis,
  getProdutos,
} from '@/lib/cms/adapters';
import { parseFiltrosDaUrl } from '@/lib/catalogo/filtros';
import { coresProduto } from '@/lib/site/navigation';
import { Container } from '@/components/primitives/Container';
import { HeroCatalogo } from '@/components/catalogo/HeroCatalogo';
import { BarraDeBuscaCatalogo } from '@/components/catalogo/BarraDeBuscaCatalogo';
import { LayoutCatalogo } from '@/components/catalogo/LayoutCatalogo';

/**
 * `/[locale]/catalogo` — a primeira rota dinâmica do projeto: `searchParams` é uma `Promise`
 * no Next 16 (`node_modules/next/dist/docs/.../page.md`), e acessar seu valor opta a rota por
 * renderização sob demanda. É o que torna o `loading.tsx` deste segmento alcançável em
 * produção, ao contrário da Home (SSG), onde o fallback de `<Suspense>` resolvia no prerender.
 *
 * NÃO acrescentar `export const dynamic`/`revalidate`: o acesso a `searchParams` já é
 * suficiente para o modo dinâmico, e o cache por tag do `fetchStrapi` (revalidação por webhook)
 * continua valendo — mesmo aviso já registrado no `page.tsx` da Home.
 *
 * SEO (metadados, JSON-LD) é Fase 12 — não acrescentar `generateMetadata` aqui.
 */

const ConteudoWrapper = styled(Container)`
  padding-block: clamp(32px, 4vw, 64px);
`;

const ContagemTexto = styled.p`
  margin: 0 0 20px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const ListaDeCores = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${({ theme }) => theme.espaco[8]};
`;

export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const localeTipado: Locale = locale;

  const sp = await searchParams;

  // As três consultas abaixo são independentes de `getProdutos` — em particular
  // `getCoresDisponiveis`, que NÃO pode ser derivada do resultado filtrado (a lista de cores
  // encolheria a cada filtro aplicado e o filtro apagaria as próprias opções — contrato
  // fixado em 05-02, per D8).
  const [categorias, tiposDeEvento, coresDisponiveis] = await Promise.all([
    getCategorias(localeTipado),
    getTiposDeEvento(localeTipado),
    getCoresDisponiveis(localeTipado),
  ]);

  // A entrada do usuário (`sp`) deixa de ser confiável exatamente aqui: nada de `sp` é
  // repassado a `getProdutos` sem passar por `parseFiltrosDaUrl` (T-05-14).
  //
  // Por que a allowlist de `cores` é `Object.keys(coresProduto)` (5 nomes) e não o retorno de
  // `getCoresDisponiveis` (hoje 3): são duas listas com propósitos diferentes (D8). A allowlist
  // de parse é barreira de segurança e precisa ser estável — se variasse com o conteúdo do
  // CMS, despublicar um produto invalidaria silenciosamente URLs que já circulam (link
  // compartilhado, favorito, resultado indexado). O conjunto EXIBIDO é decisão de produto e
  // vem de `getCoresDisponiveis`. Consequência aceita: um `?cor=Bordô` digitado à mão sobrevive
  // ao parse e simplesmente não casa com produto nenhum, caindo no estado "sem resultados"
  // (tela projetada por CATA-04), não em erro.
  const filtro = parseFiltrosDaUrl(sp, {
    categorias: categorias.map((c) => c.slug),
    tiposDeEvento: tiposDeEvento.filter((t) => t.exibirNoFiltroDoCatalogo).map((t) => t.slug),
    cores: Object.keys(coresProduto),
  });

  // Uma falha real ao consultar o CMS sobe para o error.tsx do segmento — não capturar aqui
  // com try/catch que devolveria grade vazia: "sem resultados" e "erro" são telas distintas
  // (CATA-04) e confundi-las esconderia falha de infraestrutura.
  //
  // `porPagina: 100` garante que a contagem da toolbar e a grade venham do MESMO array de
  // resposta (armadilha 1 do RESEARCH §6). Paginação fica adiada, per `<deferred>` do CONTEXT.
  const produtos = await getProdutos(localeTipado, {
    categorias: filtro.categorias,
    tiposDeItem: filtro.tiposDeItem,
    cores: filtro.cores,
    tiposDeEvento: filtro.tiposDeEvento,
    ambientes: filtro.ambientes,
    busca: filtro.q ?? undefined,
    ordenar: filtro.ordenar ?? undefined,
    porPagina: 100,
  });

  return (
    <>
      <HeroCatalogo busca={<BarraDeBuscaCatalogo termoInicial={filtro.q ?? ''} />} />
      <ConteudoWrapper>
        <LayoutCatalogo
          aside={
            // Marcador mínimo desta etapa: renderiza, como texto, os nomes que
            // `getCoresDisponiveis` devolveu — mantém a chamada com consumidor real e torna a
            // decisão de D8 observável já neste plano. Em 05-05 este marcador é substituído
            // pelo `PainelDeFiltros`, que recebe a MESMA prop; nenhum plano posterior tem
            // licença para montar a lista de cores a partir de constante de tela.
            <aside aria-label="Filtros">
              <ListaDeCores>
                {coresDisponiveis.map((nome) => (
                  <li key={nome}>{nome}</li>
                ))}
              </ListaDeCores>
            </aside>
          }
        >
          <section>
            <ContagemTexto>{produtos.length} produtos encontrados</ContagemTexto>
          </section>
        </LayoutCatalogo>
      </ConteudoWrapper>
    </>
  );
}
