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
      // Disallow accidental use of browser `window` in React Native app source.
      // Prefer `globalThis` or the cross-platform `runtime` global defined in context.
      // This rule is applied via an override below to only affect app source files.
    },
  },
  // Enforce project-specific rules for app source files only (exclude storybook/tooling)
  {
    files: [
      'app/**',
      'components/**',
      'context/**',
      'helpers/**',
      'services/**',
      'views/**',
      'hooks/**'
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message:
            'Do not use the browser `window` global in app code. Use `globalThis` or the cross-platform `runtime` global instead.'
        }
      ]
    }
  }
  ,
  // Silence unused-var warnings and similar noisy rules in test files
  {
    files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off'
    }
  }
]);
