import type { Schema, Struct } from '@strapi/strapi';

export interface BlocosAvaliacoes extends Struct.ComponentSchema {
  collectionName: 'components_blocos_avaliacoes';
  info: {
    displayName: 'Bloco: Avalia\u00E7\u00F5es';
    icon: 'emptyDot';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosBusca extends Struct.ComponentSchema {
  collectionName: 'components_blocos_buscas';
  info: {
    displayName: 'Bloco: Busca';
    icon: 'search';
  };
  attributes: {
    placeholder: Schema.Attribute.String;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosChamadaFinal extends Struct.ComponentSchema {
  collectionName: 'components_blocos_chamada_final';
  info: {
    displayName: 'Bloco: Chamada Final';
    icon: 'cursor';
  };
  attributes: {
    ctaPrimarioRotulo: Schema.Attribute.String;
    ctaPrimarioUrl: Schema.Attribute.String;
    ctaSecundarioRotulo: Schema.Attribute.String;
    ctaSecundarioUrl: Schema.Attribute.String;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosComoFunciona extends Struct.ComponentSchema {
  collectionName: 'components_blocos_como_funciona';
  info: {
    displayName: 'Bloco: Como Funciona';
    icon: 'bulletList';
  };
  attributes: {
    aviso: Schema.Attribute.Text;
    passos: Schema.Attribute.JSON;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosComparativoLed extends Struct.ComponentSchema {
  collectionName: 'components_blocos_comparativo_led';
  info: {
    displayName: 'Bloco: Comparativo LED (P1.9 x P3.9)';
    icon: 'chartBubble';
  };
  attributes: {
    ctaRotulo: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    introducao: Schema.Attribute.RichText;
    regraPratica: Schema.Attribute.Text;
    tabela: Schema.Attribute.JSON;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosDestaqueLed extends Struct.ComponentSchema {
  collectionName: 'components_blocos_destaque_led';
  info: {
    displayName: 'Bloco: Destaque LED';
    icon: 'monitor';
  };
  attributes: {
    ctaRotulo: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    exibimos: Schema.Attribute.JSON;
    eyebrow: Schema.Attribute.String;
    imagens: Schema.Attribute.Media<'images', true>;
    instalamos: Schema.Attribute.JSON;
    textos: Schema.Attribute.JSON;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosDiferenciais extends Struct.ComponentSchema {
  collectionName: 'components_blocos_diferenciais';
  info: {
    displayName: 'Bloco: Diferenciais';
    icon: 'shield';
  };
  attributes: {
    itens: Schema.Attribute.JSON;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosFaq extends Struct.ComponentSchema {
  collectionName: 'components_blocos_faq';
  info: {
    displayName: 'Bloco: FAQ';
    icon: 'question';
  };
  attributes: {
    apoio: Schema.Attribute.Text;
    eyebrow: Schema.Attribute.String;
    itens: Schema.Attribute.Component<'shared.pergunta-resposta', true>;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosFormularioContato extends Struct.ComponentSchema {
  collectionName: 'components_blocos_formulario_contato';
  info: {
    displayName: 'Bloco: Formul\u00E1rio de Contato';
    icon: 'envelop';
  };
  attributes: {
    microcopy: Schema.Attribute.Text;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosGradeDeCategorias extends Struct.ComponentSchema {
  collectionName: 'components_blocos_grade_de_categorias';
  info: {
    displayName: 'Bloco: Grade de Categorias';
    icon: 'grid';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosHero extends Struct.ComponentSchema {
  collectionName: 'components_blocos_heros';
  info: {
    displayName: 'Bloco: Hero';
    icon: 'picture';
  };
  attributes: {
    citacao: Schema.Attribute.Text;
    ctaPrimarioRotulo: Schema.Attribute.String;
    ctaPrimarioUrl: Schema.Attribute.String;
    ctaSecundarioRotulo: Schema.Attribute.String;
    ctaSecundarioUrl: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    imagem: Schema.Attribute.Media<'images' | 'videos'>;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocosProdutosEmDestaque extends Struct.ComponentSchema {
  collectionName: 'components_blocos_produtos_em_destaque';
  info: {
    displayName: 'Bloco: Produtos em Destaque';
    icon: 'star';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    subtitulo: Schema.Attribute.Text;
    titulo: Schema.Attribute.String;
  };
}

export interface BlocosTextoRico extends Struct.ComponentSchema {
  collectionName: 'components_blocos_texto_rico';
  info: {
    displayName: 'Bloco: Texto Rico';
    icon: 'align-left';
  };
  attributes: {
    conteudo: Schema.Attribute.RichText & Schema.Attribute.Required;
    titulo: Schema.Attribute.String;
  };
}

export interface SharedCaracteristica extends Struct.ComponentSchema {
  collectionName: 'components_shared_caracteristicas';
  info: {
    description: 'Caracter\u00EDstica/informa\u00E7\u00E3o t\u00E9cnica de produto.';
    displayName: 'Caracter\u00EDstica';
    icon: 'check';
  };
  attributes: {
    texto: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMedida extends Struct.ComponentSchema {
  collectionName: 'components_shared_medidas';
  info: {
    description: 'Par r\u00F3tulo/valor de medida de produto (sem pre\u00E7o).';
    displayName: 'Medida';
    icon: 'expand';
  };
  attributes: {
    rotulo: Schema.Attribute.String & Schema.Attribute.Required;
    valor: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedPerguntaResposta extends Struct.ComponentSchema {
  collectionName: 'components_shared_pergunta_respostas';
  info: {
    description: 'Item de FAQ inline (produto/categoria).';
    displayName: 'Pergunta e Resposta';
    icon: 'question';
  };
  attributes: {
    pergunta: Schema.Attribute.String & Schema.Attribute.Required;
    resposta: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Metadados de SEO reutiliz\u00E1veis por p\u00E1gina, produto e categoria.';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonical: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    imagemOG: Schema.Attribute.Media<'images'>;
    jsonLdExtra: Schema.Attribute.JSON;
    noindex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    tipoSchema: Schema.Attribute.Enumeration<
      ['Organization', 'LocalBusiness', 'Product', 'Service', 'FAQPage', 'WebPage', 'ItemList']
    >;
    title: Schema.Attribute.String;
  };
}

export interface SharedSubcategoria extends Struct.ComponentSchema {
  collectionName: 'components_shared_subcategorias';
  info: {
    description: 'Subcategoria dentro de uma categoria.';
    displayName: 'Subcategoria';
    icon: 'bulletList';
  };
  attributes: {
    descricao: Schema.Attribute.Text;
    nome: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedVariacao extends Struct.ComponentSchema {
  collectionName: 'components_shared_variacoes';
  info: {
    description: 'Varia\u00E7\u00E3o de produto (ex.: cor). valorExibido \u00E9 r\u00F3tulo, nunca pre\u00E7o.';
    displayName: 'Varia\u00E7\u00E3o';
    icon: 'layer';
  };
  attributes: {
    nome: Schema.Attribute.String & Schema.Attribute.Required;
    tipo: Schema.Attribute.String & Schema.Attribute.Required;
    valorExibido: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blocos.avaliacoes': BlocosAvaliacoes;
      'blocos.busca': BlocosBusca;
      'blocos.chamada-final': BlocosChamadaFinal;
      'blocos.como-funciona': BlocosComoFunciona;
      'blocos.comparativo-led': BlocosComparativoLed;
      'blocos.destaque-led': BlocosDestaqueLed;
      'blocos.diferenciais': BlocosDiferenciais;
      'blocos.faq': BlocosFaq;
      'blocos.formulario-contato': BlocosFormularioContato;
      'blocos.grade-de-categorias': BlocosGradeDeCategorias;
      'blocos.hero': BlocosHero;
      'blocos.produtos-em-destaque': BlocosProdutosEmDestaque;
      'blocos.texto-rico': BlocosTextoRico;
      'shared.caracteristica': SharedCaracteristica;
      'shared.medida': SharedMedida;
      'shared.pergunta-resposta': SharedPerguntaResposta;
      'shared.seo': SharedSeo;
      'shared.subcategoria': SharedSubcategoria;
      'shared.variacao': SharedVariacao;
    }
  }
}
