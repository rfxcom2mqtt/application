import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/main.ts'
      ]
    },
    // Configure test file patterns to match NestJS conventions
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Set up path mapping for NestJS imports
    alias: {
      '@': resolve(__dirname, './src')
    },
    // Ensure proper module resolution for NestJS
    server: {
      deps: {
        inline: ['@nestjs/testing', '@nestjs/common', '@nestjs/core']
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
