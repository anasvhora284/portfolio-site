module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'studio/**', 'scripts/**', 'src/generated/**'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ['src/canvas/**/*.{js,jsx}'],
      rules: {
        'react/no-unknown-property': 'off',
        'react/prop-types': 'off',
      },
    },
    {
      files: ['src/hud/**/*.{js,jsx}', 'src/universe/**/*.{js,jsx}', 'src/audio/**/*.{js,jsx}'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
}
