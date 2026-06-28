const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const security = require('eslint-plugin-security');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      security,
    },
    rules: {
      // Quality - prevent dead code
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',

      // Security - hard fails
      'security/detect-eval-with-expression': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-child-process': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-object-injection': 'warn',
    },
  },
  prettier,
  {
    ignores: ['dist/', 'node_modules/', 'jest.config.ts', 'test/'],
  },
];
