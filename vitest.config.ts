import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      exclude: ['src/main.tsx', 'src/**/*.test.ts', 'src/vite-env.d.ts'],
    },
  },
});
