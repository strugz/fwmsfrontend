module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 120,
        arrowParens: 'avoid',
        jsxBracketSameLine: true,
        semi: false,
        // proseWrap: "always"
      },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
