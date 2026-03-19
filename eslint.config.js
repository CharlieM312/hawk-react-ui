const react = require('eslint-plugin-react');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ['**/*.d.ts', '**/coverage/**', '**/dist/**'],
  },

  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-trailing-spaces': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'no-trailing-spaces': 1,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    },
  }
];