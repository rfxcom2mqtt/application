"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
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
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        alias: {
            '@': (0, path_1.resolve)(__dirname, './src')
        },
        server: {
            deps: {
                inline: ['@nestjs/testing', '@nestjs/common', '@nestjs/core']
            }
        }
    },
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, './src')
        }
    }
});
//# sourceMappingURL=vitest.config.js.map