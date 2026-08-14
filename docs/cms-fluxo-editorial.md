# Fluxo editorial no Strapi — All Music Rentals

Guia para quem edita conteúdo. O site tem **três idiomas**: **pt-BR (padrão)**, **en**, **es**.

## Princípios
- **pt-BR é a fonte.** Crie/edite primeiro em português e depois propague para en/es.
- **Sem preço.** Nenhum campo de valor/preço existe no modelo — é intencional. Não peça para adicionar.
- **Sem conteúdo fictício.** Não cadastre depoimentos, avaliações, números ou produtos de exemplo.
  Onde faltar conteúdo real, deixe vazio — o site mostra o placeholder técnico.

## Como o i18n funciona (atenção — ponto que confunde)
No Strapi, **cada locale tem sua própria versão da entrada**, inclusive a **Dynamic Zone** das páginas.
Ou seja: numa página com blocos, o editor **preenche os blocos três vezes** (uma por idioma).

### Fluxo recomendado para páginas com blocos
1. Crie a página em **pt-BR**, monte os blocos e salve.
2. No seletor de idioma (topo direito da edição), troque para **en**.
3. Use **"Preencher a partir de outro locale" / "Fill in from another locale"** para copiar a estrutura
   de pt-BR e então **traduza os textos**. Repita para **es**.
4. **Publique cada idioma** separadamente (o status de publicação é por locale).

> A versão do Strapi instalada (5.52) oferece a cópia entre locales na tela de edição. Se em algum
> content-type essa opção não aparecer, copie os campos manualmente — e registre como risco de esforço
> editorial no cronograma (páginas com muitos blocos levam ~3× o tempo de uma página monolíngue).

## Content-types e onde editar
- **Configurações Globais** (single type): telefone, e-mail, tagline, IDs de GTM/Pixel, imagem OG padrão.
- **Menu Item / Rodapé Coluna**: montam o cabeçalho e o rodapé. Ordenação e inclusão pelo painel, sem deploy.
- **Categorias**: 5 categorias (estruturas, telas-de-led, luz-e-som, tendas, moveis).
- **Produtos**: catálogo. Cada produto tem SEO próprio, imagens com **alt obrigatório**, tipo de item
  (físico / com-variação / serviço-técnico / pacote), variações, medidas, FAQ.
- **Páginas**: conteúdo por blocos (Dynamic Zone) + SEO.
- **FAQ Item**: perguntas e respostas (opcionalmente ligadas a uma categoria).
- **Avaliações**: só reais e verificadas. Campo `publicada` controla exibição.
- **Solicitações**: recebe os formulários do site. **Não crie manualmente** — chega pelo envio do usuário.

## Publicação e atualização do site
- Ao **publicar** uma entrada, um **webhook** avisa o site (Next) para revalidar só aquele tipo de
  conteúdo — a mudança aparece em segundos, sem novo deploy.
- Rascunhos (não publicados) não aparecem no site público e ficam `noindex`.

## Imagens
- Todo upload de imagem exige **texto alternativo (alt)** — obrigatório por acessibilidade.
- Formatos aceitos seguem a política de segurança do upload (imagens, PDF). Executáveis são bloqueados.
