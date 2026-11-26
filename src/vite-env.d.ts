/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** Base optionnelle des illustrations (Cloudflare R2) ; repli local sinon. */
  readonly VITE_ILLUSTRATIONS_BASE_URL?: string;
}
