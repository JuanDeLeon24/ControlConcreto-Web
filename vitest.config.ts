import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        // DoD: >= 80 % en lógica pura (sin componentes visuales ni 3D)
        include: ['src/lib/pk.ts', 'src/data/parse.ts', 'src/store/**', 'src/services/api.ts', 'src/auth/permissions.ts', 'src/auth/mockAdapter.ts'],
        thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
      },
    },
  }),
)
