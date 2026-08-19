/**
 * @jest-environment node
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { blocoSchema, blocoTolerante, paginaSchema, tipoDeEventoSchema, produtoSchema } from './schemas';

describe('tipoDeEventoSchema — taxonomia `tipo-de-evento` (05-01/05-02)', () => {
  it('valida um tipo de evento completo', () => {
    const resultado = tipoDeEventoSchema.safeParse({
      id: 1,
      documentId: 'abc123',
      nome: 'Casamento',
      slug: 'casamento',
      ordem: 2,
      exibirNoFiltroDoCatalogo: true,
      locale: 'pt-BR',
    });
    expect(resultado.success).toBe(true);
  });

  it('aceita o valor `outro` com exibirNoFiltroDoCatalogo: false', () => {
    const resultado = tipoDeEventoSchema.safeParse({
      id: 11,
      nome: 'Outro',
      slug: 'outro',
      exibirNoFiltroDoCatalogo: false,
    });
    expect(resultado.success).toBe(true);
  });

  it('rejeita tipo de evento sem slug (contrato quebrado)', () => {
    const resultado = tipoDeEventoSchema.safeParse({ id: 1, nome: 'Casamento' });
    expect(resultado.success).toBe(false);
  });
});

describe('produtoSchema — extensão aditiva `tiposDeEvento`/`contagemSolicitacoes` (05-02)', () => {
  it('produto sem `tiposDeEvento` e sem `contagemSolicitacoes` continua validando (aditividade)', () => {
    const resultado = produtoSchema.safeParse({
      id: 1,
      nome: 'Treliça Q30',
      slug: 'trelica-q30',
      tipoDeItem: 'fisico',
    });
    expect(resultado.success).toBe(true);
  });

  it('valida produto com tiposDeEvento e contagemSolicitacoes populados', () => {
    const resultado = produtoSchema.safeParse({
      id: 1,
      nome: 'Treliça Q30',
      slug: 'trelica-q30',
      tipoDeItem: 'fisico',
      tiposDeEvento: [{ nome: 'Casamento', slug: 'casamento' }],
      contagemSolicitacoes: 7,
    });
    expect(resultado.success).toBe(true);
  });
});

describe('blocoTolerante — degradação da Dynamic Zone', () => {
  it('bloco com __component desconhecido vira null', () => {
    const resultado = blocoTolerante.parse({ __component: 'blocos.inexistente', id: 9 });
    expect(resultado).toBeNull();
  });

  it('página com bloco desconhecido no meio parseia com sucesso e o bloco vira null', () => {
    const pagina = paginaSchema.parse({
      id: 1,
      titulo: 'Página de estrutura',
      slug: 'pagina-de-estrutura',
      blocos: [
        { __component: 'blocos.hero', titulo: 'Título de estrutura' },
        { __component: 'blocos.inexistente', qualquerCoisa: true },
        { __component: 'blocos.busca', titulo: 'Busca' },
      ],
    });

    expect(pagina.blocos).toHaveLength(3);
    expect(pagina.blocos?.[1]).toBeNull();
    expect(pagina.blocos?.[0]).toMatchObject({ __component: 'blocos.hero' });
    expect(pagina.blocos?.[2]).toMatchObject({ __component: 'blocos.busca' });
  });

  it('bloco de tipo conhecido mas inválido também vira null em vez de derrubar o parse', () => {
    const resultado = blocoTolerante.parse({ __component: 'blocos.hero' });
    expect(resultado).toBeNull();
  });
});

describe('contrato blocos↔schemas', () => {
  it('os arquivos de cms/src/components/blocos e blocoSchema.options formam o mesmo conjunto', () => {
    const arquivos = readdirSync(join(process.cwd(), 'cms/src/components/blocos'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => 'blocos.' + f.replace(/\.json$/, ''));

    const doZod = blocoSchema.options.map((o) => o.shape.__component.value);

    expect([...doZod].sort()).toEqual([...arquivos].sort());
  });

  it('blocoSchema.options tem 13 entradas', () => {
    expect(blocoSchema.options).toHaveLength(13);
  });
});
