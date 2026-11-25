import js from '@eslint/js';

// Configuration volontairement limitée au JavaScript (`.js`, `.mjs`, service worker, scripts).
//
// Pourquoi pas de TypeScript ici : le projet est sur TypeScript 7, et `typescript-eslint`
// **refuse de démarrer** avec TS >= 7 (vérifié à l'exécution, aucune version publiée ne le
// supporte encore). Une configuration qui parle de `.ts` sans linter les `.ts` donnerait une
// fausse assurance. Les fichiers TypeScript sont donc couverts par `tsc -b` (types stricts)
// et par les 285 tests, pas par ESLint.
//
// Le garde-fou ci-dessous empêche la configuration de prétendre traiter du TypeScript :
//   1. les `.ts`/`.tsx` sont explicitement ignorés (pas d'analyse partielle silencieuse) ;
//   2. quiconque ajoute une règle sur un fichier TypeScript se heurte à `no-restricted-syntax`
//      sur le glob `**/*.ts` — un test vérifie ce comportement (lint.test.ts).

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'android/**',
      'coverage/**',
      'plans/**',
      // Sous-projet indépendant : ses propres scripts et tests, sa propre CI (voir son package.json).
      'modules/boussole/**',
      // Maquette de référence : HTML/CSS/JS autonomes livrés tels quels, jamais bundlés
      // ni exécutés par l'application React (sert de source de vérité visuelle).
      'maquettes/**',
      // Dump « NEW bawssala » : copie figée du dépôt telle qu'elle a été livrée,
      // gardée comme archive. Ce n'est pas du code de l'application.
      'NEW bawssala/**',
      // Sondes QA jetables à la racine (pilotage CDP d'un émulateur, Artemis, proxys) :
      // elles parlent à un navigateur piloté et ne sont jamais importées par l'app.
      // Les outils durables restent lintés : `scripts/**` et `public/**`.
      'android-*.mjs',
      'artemis-*.mjs',
      'web-*.mjs',
      'https-proxy-*.mjs',
      // TypeScript : couvert par `tsc -b` + vitest, jamais par ESLint (voir plus haut).
      '**/*.ts',
      '**/*.tsx',
    ],
  },
  js.configs.recommended,
  {
    // Le service worker et le dossier public tournent dans le navigateur.
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Headers: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    // Les scripts de vérification sont des outils Node, lus par des humains le jour
    // où la CI casse : on veut des variables et des imports propres, pas un style.
    files: ['scripts/**/*.mjs', '*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        // Scripts de navigation : ils pilotent parfois un vrai navigateur.
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // Les scripts de vérification sont lus par des humains le jour où la CI casse :
      // on veut des variables propres, pas un style.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },
];
