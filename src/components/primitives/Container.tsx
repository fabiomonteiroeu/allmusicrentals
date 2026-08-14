'use client';

import styled from 'styled-components';

/** Container central do layout: max-width 1280px, padding lateral 20px (do layout). */
export const Container = styled.div`
  max-width: ${({ theme }) => theme.container.principal};
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.espaco[20]};
  padding-right: ${({ theme }) => theme.espaco[20]};
`;
