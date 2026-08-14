import { z } from 'zod';

/**
 * Schemas Zod das respostas do Strapi 5 (formato achatado: campos no topo da entrada).
 * Validam o contrato do CMS na borda. Campos não essenciais ficam opcionais/nuláveis
 * para tolerar populate ausente sem quebrar a página.
 */

/** Envelope de coleção: { data: [...], meta }. */
export const colecao = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), meta: z.unknown().optional() });

/** Envelope de item único (single type): { data: {...}|null, meta }. */
export const unico = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: item.nullable(), meta: z.unknown().optional() });

/** Campo de mídia populado do Strapi 5. */
export const midiaSchema = z
  .object({
    url: z.string(),
    alternativeText: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
  })
  .nullable();

export const localMenuEnum = z.enum([
  'cabecalho',
  'rodape-produtos',
  'rodape-empresa',
  'rodape-informacoes',
]);

export const menuItemSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  rotulo: z.string(),
  url: z.string(),
  ordem: z.number().nullable().optional(),
  visivel: z.boolean().nullable().optional(),
  abrirEmNovaAba: z.boolean().nullable().optional(),
  local: localMenuEnum.nullable().optional(),
});

export const rodapeColunaSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  titulo: z.string(),
  ordem: z.number().nullable().optional(),
  itens: z.array(menuItemSchema).default([]),
});

export const settingsGlobaisSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nomeSite: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  gtmId: z.string().nullable().optional(),
  pixelId: z.string().nullable().optional(),
  imagemOG: midiaSchema.optional(),
  redesSociais: z.unknown().optional(),
});

// Envelopes prontos
export const menuItemColecao = colecao(menuItemSchema);
export const rodapeColunaColecao = colecao(rodapeColunaSchema);
export const settingsGlobaisUnico = unico(settingsGlobaisSchema);

export type MenuItemCms = z.infer<typeof menuItemSchema>;
export type RodapeColunaCms = z.infer<typeof rodapeColunaSchema>;
export type SettingsGlobaisCms = z.infer<typeof settingsGlobaisSchema>;
