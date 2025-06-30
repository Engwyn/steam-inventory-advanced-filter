import js from '@eslint/js';
import userscripts from 'eslint-plugin-userscripts';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['userscript.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        GM: 'readonly',
        GM_info: 'readonly',
        GM_getValue: 'readonly',
        GM_setValue: 'readonly',
        GM_addStyle: 'readonly',
        GM_openInTab: 'readonly',
        GM_xmlhttpRequest: 'readonly',
        unsafeWindow: 'readonly'
      }
    },
    plugins: {
      userscripts: userscripts,
      prettier: prettierPlugin
    },
    rules: {
      'userscripts/no-invalid-metadata': 'error',
      'userscripts/require-name': 'error',
      'userscripts/require-description': 'error',
      'userscripts/require-version': 'error',
      'userscripts/no-invalid-grant': 'error',
      'userscripts/metadata-spacing': 'error',
      'userscripts/better-use-match': 'warn',
      'no-console': 'off',
      'no-alert': 'off',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      indent: ['error', 2],
      quotes: ['error', 'single'],
      'arrow-parens': ['error', 'as-needed'],
      'comma-dangle': ['error', 'never'],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'none',
          printWidth: 120,
          arrowParens: 'avoid',
          endOfLine: 'auto',
          tabWidth: 2
        }
      ]
    }
  }
];
