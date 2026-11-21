import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { adresseRetourVerification } from './utils/identiteSync';
import { enregistrerServiceWorker } from './utils/pwa';
import './index.css';

const VerificationSync = lazy(() => import('./components/VerificationSync'));
const configVerification = (() => {
  const { VITE_VERIFICATION_SYNC, VITE_VERIFICATION_ORIGINE, VITE_VERIFICATION_AUTH_URL, VITE_VERIFICATION_AUTH_CLE } = import.meta.env;
  if (VITE_VERIFICATION_SYNC !== 'true' || Capacitor.isNativePlatform() || !VITE_VERIFICATION_ORIGINE || !VITE_VERIFICATION_AUTH_URL || !VITE_VERIFICATION_AUTH_CLE) return null;
  try {
    if (new URL(adresseRetourVerification(VITE_VERIFICATION_ORIGINE)).origin !== window.location.origin) return null;
    if (new URL(VITE_VERIFICATION_AUTH_URL).protocol !== 'https:') return null;
    return { origine: VITE_VERIFICATION_ORIGINE, urlAuth: VITE_VERIFICATION_AUTH_URL, clePublique: VITE_VERIFICATION_AUTH_CLE, essaiRpc: import.meta.env.VITE_VERIFICATION_RPC_PILOTE === 'true' };
  } catch { return null; }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {configVerification && <Suspense fallback={null}><VerificationSync config={configVerification} /></Suspense>}
    <App />
  </StrictMode>
);

enregistrerServiceWorker();
