import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const isStrict = true;
createRoot(document.getElementById('root')!).render(
  isStrict ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  ),
);
