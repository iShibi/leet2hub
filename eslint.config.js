import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{ ignores: ['dist/'] },
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			globals: { ...globals.browser, ...globals.webextensions },
		},
	},
	{ files: ['**/scripts/*.mjs'], languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
];
