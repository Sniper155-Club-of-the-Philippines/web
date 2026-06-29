import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            '.next/**',
            'coverage/**',
            'node_modules/**',
            'next-env.d.ts',
            'next.config.ts',
            'postcss.config.mjs',
            'public/**',
            'vitest.config.mts',
        ],
    },
    ...compat.extends(
        'next/core-web-vitals',
        'next/typescript',
        'plugin:@typescript-eslint/strict-type-checked',
    ),
    ...compat.config({
        parserOptions: {
            projectService: {
                allowDefaultProject: ['eslint.config.mjs'],
            },
            tsconfigRootDir: __dirname,
        },
        rules: {
            '@next/next/no-img-element': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-invalid-void-type': 'off',
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: false,
                },
            ],
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unnecessary-type-conversion': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            eqeqeq: ['error', 'always'],
            'no-debugger': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
        },
    }),
    {
        // The config is type-checked through the default project. ESLint's
        // CommonJS compatibility bridge has no useful static types here.
        files: ['eslint.config.mjs'],
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx', 'vitest.setup.ts'],
        rules: {
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/require-await': 'off',
        },
    },
    {
        // Dynamic form-builder values cross user-authored schemas and cannot
        // be known statically. Keep strict async and React rules, but contain
        // unsafe-value exceptions to this legacy boundary.
        files: [
            'src/api/form.ts',
            'src/app/forms/**/*.tsx',
            'src/components/base/forms/FormForm.tsx',
            'src/components/base/forms/SettingForm.tsx',
            'src/components/base/forms/form-builder/**/*.tsx',
            'src/types/api/form.ts',
            'src/types/models/form-field.ts',
        ],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
        },
    },
    {
        // These images are inputs to html-to-image or local blob previews;
        // Next Image wrappers alter the rendered capture/preview semantics.
        files: [
            'src/components/member/ProofForm.tsx',
            'src/components/profile/cards/*.tsx',
        ],
        rules: {
            '@next/next/no-img-element': 'off',
        },
    },
];

export default eslintConfig;
