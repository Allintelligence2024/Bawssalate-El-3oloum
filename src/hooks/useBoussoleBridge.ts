// Hook sécurisé d'écoute du pont postMessage Boussole → Masari.
// Triple vérification obligatoire :
//  1. event.origin === window.location.origin (strict, jamais '*')
//  2. event.source === iframeRef.current.contentWindow (uniquement l'iframe montée)
//  3. Validation Zod du schéma v1 (`learning.attempt.completed`, source: 'boussole')

import { useEffect, type RefObject } from 'react';
import { parseBoussoleEvent, type BoussoleAttemptEvent } from '../types/boussoleBridge';

export function useBoussoleBridge(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  onEvent?: (evt: BoussoleAttemptEvent) => void,
): void {
  useEffect(() => {
    if (!onEvent) return;
    function handler(event: MessageEvent): void {
      if (event.origin !== window.location.origin) return;
      const win = iframeRef.current?.contentWindow;
      if (!win || event.source !== win) return;
      const parsed = parseBoussoleEvent(event.data);
      if (!parsed) return;
      onEvent?.(parsed);
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [iframeRef, onEvent]);
}
