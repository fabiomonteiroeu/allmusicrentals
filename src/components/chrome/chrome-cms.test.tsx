import { renderComProviders, screen } from '@/test-utils';
import { TopBar } from './TopBar';
import { Footer } from './Footer';

const contatoCms = {
  telefone: '(689) 000-0000',
  telefoneHref: 'tel:+16890000000',
  email: 'cms@exemplo.com',
};

describe('TopBar — dados do CMS por prop', () => {
  it('usa tagline e contato recebidos por prop, não o módulo estático', () => {
    renderComProviders(<TopBar tagline="Tagline do CMS" contato={contatoCms} />);
    expect(screen.getByText('Tagline do CMS')).toBeInTheDocument();
    expect(screen.getByText('(689) 000-0000')).toBeInTheDocument();
    expect(screen.getByText('cms@exemplo.com')).toBeInTheDocument();
    expect(screen.queryByText('(689) 242-1871')).not.toBeInTheDocument();
  });

  it('sem props, cai no default do módulo estático', () => {
    renderComProviders(<TopBar />);
    expect(screen.getByText('(689) 242-1871')).toBeInTheDocument();
  });

  it('localeAtual="en" mantém a lógica de idioma (link EN presente)', () => {
    renderComProviders(<TopBar localeAtual="en" />);
    expect(screen.getByRole('link', { name: 'EN' })).toBeInTheDocument();
  });
});

describe('Footer — dados do CMS por prop', () => {
  it('usa contato recebido por prop, não o módulo estático', () => {
    renderComProviders(<Footer contato={contatoCms} />);
    expect(screen.getByText('(689) 000-0000')).toBeInTheDocument();
    expect(screen.getByText('cms@exemplo.com')).toBeInTheDocument();
    expect(screen.queryByText('(689) 242-1871')).not.toBeInTheDocument();
  });

  it('sem props, cai no default do módulo estático', () => {
    renderComProviders(<Footer />);
    expect(screen.getByText('(689) 242-1871')).toBeInTheDocument();
  });
});
