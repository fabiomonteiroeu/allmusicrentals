/**
 * Estrutura de navegação e dados globais do chrome.
 * Placeholder da Fase 02 — a Fase 03 substitui isto pelos content-types do Strapi
 * (menu-item, rodape-coluna, settings-globais) via adaptador CMS→props.
 */

export interface ItemNav {
  rotulo: string;
  href: string;
}

export interface ColunaRodape {
  titulo: string;
  itens: ItemNav[];
}

export interface DadosContato {
  telefone: string;
  telefoneHref: string;
  email: string;
}

export const contato: DadosContato = {
  telefone: '(689) 242-1871',
  telefoneHref: 'tel:+16892421871',
  email: 'contato@allmusicbr.com',
};

export const navPrincipal: ItemNav[] = [
  { rotulo: 'Início', href: '#inicio' },
  { rotulo: 'Estruturas', href: '#estruturas' },
  { rotulo: 'Telas de LED', href: '#led' },
  { rotulo: 'Luz & Som', href: '#luzsom' },
  { rotulo: 'Tendas', href: '#tendas' },
  { rotulo: 'Móveis', href: '#moveis' },
  { rotulo: 'Sobre Nós', href: '#sobre' },
  { rotulo: 'Contato', href: '#contato' },
];

export const colunasRodape: ColunaRodape[] = [
  {
    titulo: 'PRODUTOS',
    itens: [
      { rotulo: 'Estruturas', href: '#estruturas' },
      { rotulo: 'Telas de LED', href: '#led' },
      { rotulo: 'Luz & Som', href: '#luzsom' },
      { rotulo: 'Tendas', href: '#tendas' },
      { rotulo: 'Móveis', href: '#moveis' },
    ],
  },
  {
    titulo: 'EMPRESA',
    itens: [
      { rotulo: 'Sobre Nós', href: '#sobre' },
      { rotulo: 'Contato', href: '#contato' },
      { rotulo: 'Solicitar Orçamento', href: '#solicitar' },
    ],
  },
  {
    titulo: 'INFORMAÇÕES',
    itens: [
      { rotulo: 'Perguntas Frequentes', href: '#faq' },
      { rotulo: 'Política de Privacidade', href: '#privacidade' },
      { rotulo: 'Termos de Uso', href: '#termos' },
      { rotulo: 'Políticas de Locação', href: '#politicas' },
      { rotulo: 'Entrega e Montagem', href: '#entrega' },
      { rotulo: 'Cancelamento', href: '#cancelamento' },
      { rotulo: 'Acessibilidade', href: '#acessibilidade' },
    ],
  },
];

/** Mapa de cor de produto → hex (do layout). Fonte única para swatches e chips. */
export const coresProduto: Record<string, string> = {
  Bege: '#D8C9A8',
  Preto: '#0B0C0D',
  Branco: '#FFFFFF',
  'Azul-marinho': '#1F2A44',
  Bordô: '#5A2020',
};

export const textosLegais = {
  disclaimer:
    'Os produtos estão sujeitos à disponibilidade. O envio de uma solicitação não cria uma reserva.',
  copyright: '© 2026 All Music Rentals. Todos os direitos reservados.',
  descricaoMarca: 'Locação de equipamentos, mobiliário e painéis de LED para eventos na Flórida.',
  tagline: 'Locação Premium e Soluções em Painéis de LED para Eventos na Flórida',
} as const;
