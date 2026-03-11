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
      reporter: ['text', 'html', 'json', 'json-summary'],
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
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    }
  }
})