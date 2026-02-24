import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    reporters: ['default', 'junit'],
    outputFile: './test-results/results.xml',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.css',
        'src/index.tsx',
        'src/setupTests.ts',
        'src/**/*.test.{ts,tsx}',
        'src/reportWebVitals.ts',
        'src/js/client/**',
        'src/**/*.stories.{ts,tsx}',
        'src/js/instances/**',
        'src/js/syntax-highlighting/**',
        'src/components/Modal/InstanceError.tsx'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
})