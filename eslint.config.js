// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // The @env virtual module is provided at build-time by babel plugin (react-native-dotenv).
      // eslint-plugin-import cannot resolve it in the editor environment, so ignore it here.
      'import/no-unresolved': [
        'error',
        {
          ignore: ['^@env$', '^@env/']
        }
      ],
    },
  },
]);
