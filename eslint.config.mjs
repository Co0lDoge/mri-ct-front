import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: [
			'node_modules/**',
			'build/**',
			'dist/**',
			'.next/**',
			'**/.next/**',
			'*.config.js',
			'*.config.mjs',
			'OLD-PROJECTS/**',
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
		],
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
	},
	{
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		plugins: {
			'react-hooks': pluginReactHooks,
		},
		rules: {
			...pluginReactHooks.configs.recommended.rules,
			'no-console': 'warn',
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'no-useless-escape': 'off',
			'no-extra-boolean-cast': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		files: ['**/next.config.js', 'lib/config/next.js'],
		languageOptions: {
			sourceType: 'commonjs',
		},
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
]
