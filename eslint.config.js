import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
    {
        ignores: [
            'bootstrap/cache/**',
            'node_modules/**',
            'public/**',
            'storage/**',
            'vendor/**',
        ],
    },
    js.configs.recommended,
    {
        files: ['resources/js/**/*.{ts,tsx,js,jsx}', 'vite.config.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
                projectService: false,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            '@typescript-eslint': tseslint.plugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'no-redeclare': 'off',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'no-useless-escape': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
        },
    },
];
