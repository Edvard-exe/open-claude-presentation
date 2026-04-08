import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ContributeApp } from './ContributeApp';
import './contribute.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContributeApp />
  </StrictMode>,
);
