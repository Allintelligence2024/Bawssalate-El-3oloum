// Les WebView anciens (Android 9–10, encore fréquents) exposent <dialog> sans showModal :
// un appel direct lève et casse tout l'écran. On ouvre alors en mode « non modal ».
export function ouvrirDialogue(el: HTMLDialogElement | null): void {
  if (!el || el.open) return;
  if (typeof el.showModal === 'function') el.showModal();
  else el.setAttribute('open', '');
}

/** Ferme le dialogue sans dépendre de `close()` (absent des WebView anciens). */
export function fermerDialogue(el: HTMLDialogElement | null): void {
  if (!el || !el.open) return;
  if (typeof el.close === 'function') el.close();
  else el.removeAttribute('open');
}
