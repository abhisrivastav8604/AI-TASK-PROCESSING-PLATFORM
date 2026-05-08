module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 'warn',
    'no-await-in-loop': 'off',
    'no-param-reassign': ['error', { props: false }],
    'consistent-return': 'off',
    'no-underscore-dangle': ['error', { allow: ['_id', '__v'] }],
  },
};
