import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

// FSD layer order (low → high): shared → entities → features → widgets → pages → app
const FSD_LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app']

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': FSD_LAYERS.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/*`,
      })),
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Forbidden: lower layers importing from higher layers
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'shared', allow: [] },
            { from: 'entities', allow: ['shared'] },
            { from: 'features', allow: ['shared', 'entities'] },
            { from: 'widgets', allow: ['shared', 'entities', 'features'] },
            { from: 'pages', allow: ['shared', 'entities', 'features', 'widgets'] },
            { from: 'app', allow: ['shared', 'entities', 'features', 'widgets', 'pages'] },
          ],
        },
      ],
    },
  },
])
