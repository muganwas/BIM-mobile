import { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..');

const config: StorybookConfig = {
	stories: ['../components/**/*.stories.@(tsx|mdx)'],
	addons: ['@storybook/addon-essentials'],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
	viteFinal: async (config) => {
		config.resolve = config.resolve || {};
		const existing = Array.isArray(config.resolve.alias)
			? config.resolve.alias
			: [];
		const extra = [
			// Provide a browser shim for `process` used by some nodeLibraries (util/assert/etc.)
			{
				find: 'process',
				replacement: path.resolve(
					repoRoot,
					'node_modules',
					'process',
					'browser.js'
				),
			},
			// Also ensure process.env exists during dev
			// (Vite's define only accepts string values so we stringify a minimal env object)
			// NOTE: this inlines values at build time.
			// { find: 'process.env', replacement: JSON.stringify({ NODE_ENV: 'development' }) },
			{
				find: '@/components/ThemedText',
				replacement: path.resolve(repoRoot, 'components', 'ThemedText.tsx'),
			},
			{
				find: '@/components/ThemedView',
				replacement: path.resolve(repoRoot, 'components', 'ThemedView.tsx'),
			},
			{
				find: '@/components/ui/IconSymbol',
				replacement: path.resolve(
					repoRoot,
					'components',
					'ui',
					'IconSymbol.tsx'
				),
			},
			{
				find: '@/constants/Colors',
				replacement: path.resolve(repoRoot, 'constants', 'Colors.ts'),
			},
			{
				find: '@/hooks/useColorScheme',
				replacement: path.resolve(repoRoot, 'hooks', 'useColorScheme.ts'),
			},
			{
				find: '@/hooks/useThemeColor',
				replacement: path.resolve(repoRoot, 'hooks', 'useThemeColor.ts'),
			},
			{ find: '@', replacement: repoRoot },
			{ find: /^@\/(.*)$/, replacement: repoRoot + '/$1' },
			{
				find: 'react-native-reanimated',
				replacement: path.resolve(
					__dirname,
					'shims/react-native-reanimated.js'
				),
			},
			{
				find: 'react-native-gesture-handler',
				replacement: path.resolve(
					__dirname,
					'shims/react-native-gesture-handler.js'
				),
			},
			{
				find: 'react-native-safe-area-context',
				replacement: path.resolve(
					__dirname,
					'shims/react-native-safe-area-context.js'
				),
			},
			{
				find: 'react-native-screens',
				replacement: path.resolve(__dirname, 'shims/react-native-screens.js'),
			},
			{
				find: 'expo-constants',
				replacement: path.resolve(__dirname, 'shims/expo-constants.js'),
			},
			{
				find: '@expo/vector-icons',
				replacement: path.resolve(
					__dirname,
					'shims',
					'expo-vector-icons-shim.js'
				),
			},
			// Provide a Storybook-specific react-dom shim that exposes the
			// legacy render/unmount APIs but delegates to react-dom/client when
			// running on React 18. This prevents "unmountComponentAtNode is not a function"
			// errors coming from Storybook internals that expect the old API.
			{
				find: '@storybook/react-dom-shim',
				replacement: path.resolve(
					__dirname,
					'shims',
					'storybook-react-dom-shim.js'
				),
			},
			// Map react-native to our shim which re-exports react-native-web and
			// provides minimal NativeModules/UIManager/Platform shims used by some libs.
			{
				find: 'react-native',
				replacement: path.resolve(__dirname, 'shims', 'react-native-shim.js'),
			},
			// (react-dom aliases removed to use the real react-dom implementation)
		];
		config.resolve.alias = [...extra, ...existing];
		// Ensure esbuild parses .js files with JSX from some node_modules (e.g. @expo/vector-icons)
		config.optimizeDeps = config.optimizeDeps || {};
		config.optimizeDeps.esbuildOptions =
			config.optimizeDeps.esbuildOptions || {};
		config.optimizeDeps.esbuildOptions.loader = {
			...(config.optimizeDeps.esbuildOptions.loader || {}),
			'.js': 'jsx',
			'.ts': 'ts',
			'.tsx': 'tsx',
		};
		// For the dev server transform API, esbuild expects a single loader string.
		// Set it to 'jsx' so .js files with JSX parse correctly during dev.
		config.esbuild = config.esbuild || {};
		// Use the tsx loader for the dev server so TSX files compile in-memory.
		config.esbuild.loader = 'tsx';

		// Inlining a minimal `process` at build time ensures modules referencing
		// `process` don't throw in the browser during runtime evaluation.
		config.define = {
			...(config.define || {}),
			'process.env': JSON.stringify({ NODE_ENV: 'development' }),
			// also provide a minimal `process` object
			process: JSON.stringify({ env: { NODE_ENV: 'development' } }),
			// Define __DEV__ for libraries that expect it at runtime (React Native / Expo)
			__DEV__: JSON.stringify(true),
		};
		return config;
	},
};

export default config;
