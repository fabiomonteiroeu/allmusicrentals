import { test, expect, type Page } from '@playwright/test';

/**
 * Suíte e2e do fluxo de filtro, drawer, chips e eventos do catálogo (Fase 5, Plano 08).
 *
 * PRÉ-REQUISITO DE AMBIENTE: o Strapi precisa estar de pé com os 10 produtos publicados e a
 * taxonomia `tipo-de-evento` migrada (`docker compose --profile cms up -d cms`). Sem isso a rota
 * renderiza a tela de erro (`error.tsx` do segmento) e TODOS os testes abaixo falhariam por
 * sintoma (zero produto/zero card), não pelo motivo real. O `test.beforeAll` abaixo falha com
 * mensagem explícita nesse caso — diagnóstico claro vale mais que dez falhas confusas (T-05-39).
 *
 * Viewport é explícito em cada bloco (`test.use({ viewport: ... })`), sem confiar no projeto do
 * Playwright (`desktop-chromium`/`mobile-chromium`), para que cada teste seja determinístico dos
 * dois lados do breakpoint único de 1080px (D7).
 *
 * Contagens conferidas contra o dado real dos 10 produtos (fonte: `05-CONTEXT.md` `<decisions>`
 * 3, e as combinações já executadas contra o Strapi em `05-RESEARCH.md` §1).
 */

/**
 * O painel de filtros (aside, Bloco 3 do UI-SPEC) e os cards de produto (Bloco 7) renderizam o
 * MESMO conjunto de nomes de cor como botão-swatch acessível (`aria-label={cor}` em
 * `SwatchesDeCor.tsx` e em `primitives/ColorSwatches.tsx` do card) — sem escopo,
 * `getByRole('button', { name: 'Bege' })` bate em mais de um elemento (erro de strict mode do
 * Playwright). Escopar no `<aside aria-label="Filtros">` resolve por construção.
 */
function painelDeFiltros(page: Page) {
  return page.getByRole('complementary', { name: 'Filtros' });
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('/pt-BR/catalogo');
  const contagem = await page.locator('article').count();
  await page.close();
  if (contagem !== 10) {
    throw new Error(
      `Pré-requisito de ambiente falhou (T-05-39): esperava 10 produtos publicados em ` +
        `/pt-BR/catalogo, mas a rota mostrou ${contagem} card(s). Suba o CMS com ` +
        `\`docker compose --profile cms up -d cms\` e confirme os 10 produtos publicados em ` +
        `pt-BR antes de rodar esta suíte — do contrário, os testes abaixo falham pelo motivo ` +
        `errado (rota renderizando a tela de erro ou catálogo vazio, não bug de filtro).`,
    );
  }
});

test.describe('desktop — filtro, contagem, ordenação', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a contagem da toolbar bate com o número de cards da grade (armadilha 1 do RESEARCH §6)', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    await expect(page.getByText('10 PRODUTOS')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(10);
  });

  test('Pacote + Serviço técnico no grupo "Tipo de item" (OR dentro do grupo) → 2 resultados', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    const aside = painelDeFiltros(page);
    await aside.getByRole('checkbox', { name: 'Pacote' }).click();
    // Espera a URL refletir o primeiro filtro ANTES do segundo clique: os dois handlers leem
    // `useSearchParams()` por closure, e clicar rápido demais faria o segundo cálculo partir do
    // valor de URL ainda desatualizado (a mesma classe de corrida que a suíte busca provar que
    // NÃO existe para chip↔URL — aqui é só um espaçamento de ação real de usuário, não um bug).
    await page.waitForURL(/tipo=pacote/);
    await aside.getByRole('checkbox', { name: 'Serviço técnico' }).click();
    await page.waitForURL(/tipo=pacote.*tipo=servico-tecnico|tipo=servico-tecnico.*tipo=pacote/);
    await expect(page.locator('article')).toHaveCount(2);
    await expect(page.getByText('2 PRODUTOS')).toBeVisible();
  });

  test('Móveis + Bege/Preto (AND entre grupos combinado com OR dentro) → 4 resultados', async ({
    page,
  }) => {
    // Combinação já executada contra o Strapi real em 05-RESEARCH.md §1:
    // categoria=moveis AND cor IN (Bege, Preto) → capa-6, mesa-bistro, capa-spandex, lounge.
    await page.goto('/pt-BR/catalogo');
    const aside = painelDeFiltros(page);
    await aside.getByRole('checkbox', { name: 'Móveis' }).click();
    await page.waitForURL(/categoria=moveis/);
    await aside.getByRole('button', { name: 'Bege' }).click();
    await page.waitForURL(/cor=Bege/);
    await aside.getByRole('button', { name: 'Preto' }).click();
    await page.waitForURL(/cor=Bege.*cor=Preto|cor=Preto.*cor=Bege/);
    await expect(page.locator('article')).toHaveCount(4);
  });

  test('buscar "mesa" retorna 5 produtos, não 2', async ({ page }) => {
    // Parece bug a olho nu — não é. "Capa de Spandex para Mesa de Coquetel", "Capa Preta para
    // Mesa Retangular de 6 Pés" e "Lounge Externo com Sofá e Mesa Baixa" contêm "Mesa" no nome,
    // somados a "Mesa Bistrô..." e "Mesa Alta...": 5 no total. Confirmado contra o Strapi real
    // (RESEARCH §1). Um futuro leitor pode achar que a expectativa "5" está errada e "corrigir"
    // para 2 — NÃO fazer isso: contar sempre pelo dado real, não pela leitura ingênua do nome.
    await page.goto('/pt-BR/catalogo');
    await page.getByLabel('BUSCAR PRODUTOS NO CATÁLOGO').fill('mesa');
    await page.getByRole('button', { name: 'BUSCAR' }).click();
    await expect(page).toHaveURL(/q=mesa/);
    await expect(page.locator('article')).toHaveCount(5);
  });

  test('busca por acento — comportamento OBSERVADO contra dado real (RESEARCH §6, armadilha 4)', async ({
    page,
  }) => {
    // ACHADO A REGISTRAR, NÃO A MASCARAR: nenhum dos 10 produtos tem "Painéis" (plural) no
    // nome — só "Painel" (singular). Por isso "painéis" e "paineis" produzem o MESMO resultado
    // observado (zero), o que não prova nada sobre sensibilidade a acento por si só: um teste
    // frouxo do tipo "pelo menos os dois têm o mesmo resultado" esconderia isso.
    //
    // A prova real de que `$containsi` É sensível a acento (mas indiferente a caixa) usa um par
    // que de fato existe no dado: "Operação Técnica de Painel de LED" é o único produto com
    // "técnica" no nome. Verificado contra o Strapi real em 2026-08-20 (consulta direta, fora
    // deste teste): filters[nome][$containsi]=técnica → 1 resultado; =tecnica (sem acento) → 0.
    await page.goto('/pt-BR/catalogo');
    const campoBusca = page.getByLabel('BUSCAR PRODUTOS NO CATÁLOGO');
    const botaoBuscar = page.getByRole('button', { name: 'BUSCAR' });

    await campoBusca.fill('painéis');
    await botaoBuscar.click();
    await expect(page).toHaveURL(/q=/);
    const comAcentoPlural = await page.locator('article').count();

    await campoBusca.fill('paineis');
    await botaoBuscar.click();
    await expect(page).toHaveURL(/q=paineis/);
    const semAcentoPlural = await page.locator('article').count();

    // Observado: ambos zero — nenhum produto usa a forma plural "Painéis".
    expect(comAcentoPlural).toBe(0);
    expect(semAcentoPlural).toBe(0);

    // Prova de sensibilidade a acento com um par que existe no dado real.
    await campoBusca.fill('técnica');
    await botaoBuscar.click();
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.locator('article h3').first()).toHaveText(
      'Operação Técnica de Painel de LED',
    );

    await campoBusca.fill('tecnica');
    await botaoBuscar.click();
    await expect(page.locator('article')).toHaveCount(0);
  });

  test('trocar a ordenação para "Nome de Z a A" muda o primeiro card e a URL', async ({ page }) => {
    await page.goto('/pt-BR/catalogo');
    const primeiroCardAntes = await page.locator('article h3').first().textContent();

    await page.locator('#ordenar-catalogo').selectOption({ label: 'Nome de Z a A' });

    await expect(page).toHaveURL(/ordenar=nome-desc/);
    // Confirmado contra o Strapi real: sort[0]=nome:desc começa em "Painel de LED P3.9mm".
    await expect(page.locator('article h3').first()).toHaveText('Painel de LED P3.9mm');
    expect(await page.locator('article h3').first().textContent()).not.toBe(primeiroCardAntes);
  });

  test('submeter a busca vazia mostra o erro inline e não muda a URL', async ({ page }) => {
    await page.goto('/pt-BR/catalogo');
    await page.getByRole('button', { name: 'BUSCAR' }).click();
    await expect(
      page.getByText('Digite um produto, equipamento ou solução para buscar.'),
    ).toBeVisible();
    await expect(page).toHaveURL('/pt-BR/catalogo');
  });
});

test.describe('desktop — chips e URL (armadilha 2 do RESEARCH §6)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('aplicar dois filtros, remover um, reload e goBack nunca dessincronizam chip e URL', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    const aside = painelDeFiltros(page);

    await aside.getByRole('checkbox', { name: 'Móveis' }).click();
    await page.waitForURL(/categoria=moveis/);
    await aside.getByRole('button', { name: 'Bege' }).click();
    await page.waitForURL(/cor=Bege/);

    const chipCategoria = page.getByRole('button', { name: 'Remover filtro Categoria: Móveis' });
    const chipCor = page.getByRole('button', { name: 'Remover filtro Cor: Bege' });

    await expect(chipCategoria).toBeVisible();
    await expect(chipCor).toBeVisible();
    await expect(page).toHaveURL(/categoria=moveis/);
    await expect(page).toHaveURL(/cor=Bege/);

    // Remover um chip: só ele some, o outro fica, e a URL perde só o parâmetro correspondente.
    await chipCor.click();
    await expect(chipCor).toBeHidden();
    await expect(chipCategoria).toBeVisible();
    await expect(page).not.toHaveURL(/cor=Bege/);
    await expect(page).toHaveURL(/categoria=moveis/);

    // Reload: o estado sobrevive porque mora na URL, não em memória do componente.
    await page.reload();
    await expect(chipCategoria).toBeVisible();
    await expect(chipCor).toBeHidden();
    await expect(page).toHaveURL(/categoria=moveis/);
    await expect(page).not.toHaveURL(/cor=Bege/);

    // goBack: o chip removido volta JUNTO com o parâmetro na URL — é o teste que pega a
    // dessincronização (chip sem parâmetro, ou parâmetro sem chip).
    await page.goBack();
    await expect(chipCor).toBeVisible();
    await expect(chipCategoria).toBeVisible();
    await expect(page).toHaveURL(/cor=Bege/);
    await expect(page).toHaveURL(/categoria=moveis/);
  });

  test('LIMPAR TUDO remove todos os chips e preserva "q" na URL', async ({ page }) => {
    await page.goto('/pt-BR/catalogo?q=mesa');
    await painelDeFiltros(page).getByRole('checkbox', { name: 'Móveis' }).click();
    await expect(page.getByRole('button', { name: /^Remover filtro/ })).toBeVisible();

    await page.getByRole('button', { name: 'LIMPAR TUDO' }).click();

    await expect(page.getByRole('button', { name: /^Remover filtro/ })).toHaveCount(0);
    await expect(page).toHaveURL(/q=mesa/);
    await expect(page).not.toHaveURL(/categoria=moveis/);
  });
});

test.describe('mobile — drawer', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('em 390px o aside de filtros está oculto e o botão FILTROS está visível', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    await expect(painelDeFiltros(page)).toBeHidden();
    await expect(page.getByRole('button', { name: 'Filtros' })).toBeVisible();
  });

  test('abrir o drawer prende o foco dentro do diálogo', async ({ page }) => {
    await page.goto('/pt-BR/catalogo');
    await page.getByRole('button', { name: 'Filtros' }).click();

    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const focoDentro = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(focoDentro).toBe(true);
    }
  });

  test('Escape fecha o drawer e devolve o foco ao botão FILTROS (jsdom não reproduz isto)', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    const botaoFiltros = page.getByRole('button', { name: 'Filtros' });
    await botaoFiltros.click();

    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(botaoFiltros).toBeFocused();
  });

  test('marcar um filtro no drawer e clicar em VER N PRODUTOS fecha o drawer e mostra o chip', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    await page.getByRole('button', { name: 'Filtros' }).click();

    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await dialog.getByRole('checkbox', { name: 'Móveis' }).click();
    await dialog.getByRole('button', { name: /^VER \d+ PRODUTOS?$/ }).click();

    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Remover filtro Categoria: Móveis' }),
    ).toBeVisible();
  });
});

test.describe('eventos (CATA-06) — fila real de window.dataLayer', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    // Instalado ANTES da navegação para capturar desde a primeira emissão.
    await page.addInitScript(() => {
      // Este é o navegador sob teste, não código de produção: aqui é onde a suíte instrumenta a
      // fila para poder inspecioná-la.
      (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    });
  });

  /**
   * O push em `window.dataLayer` acontece dentro de um `useEffect` (não `useLayoutEffect`), que
   * o React agenda para depois do commit/paint — um `expect(locator).toHaveCount(...)` pode
   * resolver antes desse efeito rodar. `expect.poll` espera pelo CONTEÚDO real da fila em vez de
   * assumir que "o DOM já mudou" implica "o efeito já rodou".
   */
  async function lerDataLayer(page: Page): Promise<unknown[]> {
    return page.evaluate(() => (window as unknown as { dataLayer: unknown[] }).dataLayer);
  }

  function isEvento(e: unknown, nome: string): e is Record<string, unknown> {
    return typeof e === 'object' && e !== null && (e as { event?: unknown }).event === nome;
  }

  test('/pt-BR/catalogo?q=mesa produz um evento search com search_term correto', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo?q=mesa');
    await expect(page.locator('article')).toHaveCount(5);

    await expect
      .poll(async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'search')).length)
      .toBe(1);

    const buscas = (await lerDataLayer(page)).filter((e) => isEvento(e, 'search'));
    expect(buscas).toEqual([{ event: 'search', search_term: 'mesa' }]);
  });

  test('marcar um filtro produz um filter_applied com filter_type e filter_value corretos', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    await painelDeFiltros(page).getByRole('checkbox', { name: 'Pacote' }).click();
    await expect(page.locator('article')).toHaveCount(1);

    await expect
      .poll(
        async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'filter_applied')).length,
      )
      .toBe(1);

    const filtros = (await lerDataLayer(page)).filter((e) => isEvento(e, 'filter_applied'));
    expect(filtros).toEqual([
      { event: 'filter_applied', filter_type: 'tipo', filter_value: 'pacote' },
    ]);
  });

  test('a grade produz um view_item_list com item_list_id "catalogo_resultados"', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    await expect(page.locator('article')).toHaveCount(10);

    await expect
      .poll(
        async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'view_item_list')).length,
      )
      .toBe(1);

    const listas = (await lerDataLayer(page)).filter((e) => isEvento(e, 'view_item_list'));
    expect(listas[0]?.item_list_id).toBe('catalogo_resultados');
  });

  test('recarregar com filtro já na URL não produz filter_applied novo (supressão da primeira montagem)', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo?categoria=moveis');
    await expect(page.locator('article')).toHaveCount(5);
    // Dá tempo ao efeito de `view_item_list` (que roda sempre) para confirmar que a fila está
    // "quente" antes de asserir a AUSÊNCIA de `filter_applied` — sem isso, "zero encontrados"
    // poderia ser só "ainda não rodou nenhum efeito".
    await expect
      .poll(
        async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'view_item_list')).length,
      )
      .toBe(1);

    const filtros = (await lerDataLayer(page)).filter((e) => isEvento(e, 'filter_applied'));
    expect(filtros).toHaveLength(0);
  });

  test('achado do orquestrador: aplicar filtro com ?q= já ativo produz EXATAMENTE UM search', async ({
    page,
  }) => {
    /*
     * Esta asserção prova que a mitigação de duplicação de `search` (a trava por VALOR em
     * `useRef`, ver `EmissorSearch.tsx`) sobrevive à navegação, e não é acidente. A trava só
     * sobrevive se a INSTÂNCIA do componente sobreviver ao `router.push` — o que só acontece
     * porque os 5 caminhos de navegação do catálogo (PainelDeFiltros, ChipsDeFiltroAtivo,
     * BarraDeBuscaCatalogo, ToolbarDoCatalogo, DrawerDeFiltros) envolvem `router.push` dentro de
     * `useTransition`, o que mantém a UI montada e evita o fallback de `loading.tsx` (que
     * desmontaria a subárvore e resetaria o `useRef` para `null`, fazendo o próximo efeito
     * reemitir `search` mesmo com o termo inalterado).
     *
     * Se um sexto caminho de navegação for adicionado no futuro SEM `useTransition`, é ESTE
     * teste que passa a falhar — em silêncio sem ele, o evento duplicaria só em produção/GA4,
     * nunca em jsdom (nenhum teste unitário alcança isto). NÃO REMOVER por parecer redundante
     * com o teste de "recarregar não duplica" acima: aquele cobre reload (montagem nova de
     * verdade, onde emitir de novo é o comportamento CORRETO); este cobre navegação
     * client-side com a MESMA instância montada (onde emitir de novo seria o BUG).
     */
    await page.goto('/pt-BR/catalogo?q=mesa');
    await expect(page.locator('article')).toHaveCount(5);
    await expect
      .poll(async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'search')).length)
      .toBe(1);

    await painelDeFiltros(page).getByRole('checkbox', { name: 'Serviço técnico' }).click();
    await page.waitForURL(/tipo=servico-tecnico/);

    // Dá tempo a um eventual SEGUNDO `search` fantasma de aparecer, se a mitigação tivesse se
    // perdido — por isso o poll aqui espera estabilizar em 1, não só "pelo menos 1".
    await expect
      .poll(async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'search')).length)
      .toBe(1);

    const buscas = (await lerDataLayer(page)).filter((e) => isEvento(e, 'search'));
    expect(buscas).toEqual([{ event: 'search', search_term: 'mesa' }]);
  });

  test('nenhum evento da fila tem value/price/currency/revenue (prova de comportamento de PRECO-04)', async ({
    page,
  }) => {
    await page.goto('/pt-BR/catalogo');
    const aside = painelDeFiltros(page);
    await aside.getByRole('checkbox', { name: 'Móveis' }).click();
    await page.waitForURL(/categoria=moveis/);
    await aside.getByRole('button', { name: 'Bege' }).click();
    await page.waitForURL(/cor=Bege/);
    await page.locator('#ordenar-catalogo').selectOption({ label: 'Nome de Z a A' });
    await expect(page).toHaveURL(/ordenar=nome-desc/);
    await expect(page.locator('article')).toHaveCount(2);

    await expect
      .poll(
        async () => (await lerDataLayer(page)).filter((e) => isEvento(e, 'view_item_list')).length,
      )
      .toBeGreaterThan(0);

    const eventos = await lerDataLayer(page);
    expect(eventos.length).toBeGreaterThan(0);
    for (const evento of eventos) {
      expect(evento).not.toHaveProperty('value');
      expect(evento).not.toHaveProperty('price');
      expect(evento).not.toHaveProperty('currency');
      expect(evento).not.toHaveProperty('revenue');
    }
  });
});
