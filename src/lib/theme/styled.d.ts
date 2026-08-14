import 'styled-components';
import type { Theme } from './theme';

// Tipa o `theme` do styled-components com o tema real (autocompletar + segurança de tipos).
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
