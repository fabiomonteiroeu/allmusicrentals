import type { Metadata } from 'next';
import { Showcase } from '@/components/showcase/Showcase';

// Página interna de conferência do design system — fora dos índices de busca.
export const metadata: Metadata = {
  title: 'Design System — All Music Rentals',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <Showcase />;
}
