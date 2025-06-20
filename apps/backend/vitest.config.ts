import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.e2e.test.ts', // Exclude e2e tests from regular test runs
    ],
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
