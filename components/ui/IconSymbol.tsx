// Fallback for using MaterialIcons and Ionicons on Android and web.

import {
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from '@expo/vector-icons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type MaterialCommunityIconName = ComponentProps<
	typeof MaterialCommunityIcons
>['name'];
type IoniconName = ComponentProps<typeof Ionicons>['name'];

type IconConfig = {
	type: 'material' | 'ionicon' | 'material-community';
	name: MaterialIconName | IoniconName | MaterialCommunityIconName;
};

type IconMapping = Record<string, IconConfig>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons/Ionicons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see Ionicons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
	'house.fill': { type: 'ionicon', name: 'home' },
	'paperplane.fill': { type: 'ionicon', name: 'send' },
	'chevron.left.forwardslash.chevron.right': { type: 'material', name: 'code' },
	'chevron.right': { type: 'ionicon', name: 'chevron-forward' },
	'chevron.left': { type: 'ionicon', name: 'chevron-back' },
	'search.outline': { type: 'ionicon', name: 'search-outline' },
	'notifications.outline': { type: 'material-community', name: 'bell-outline' },
	'notifications.outline.badge': {
		type: 'material-community',
		name: 'bell-badge-outline',
	},
	'home.outline': { type: 'ionicon', name: 'home-outline' },
	'routers.outline': {
		type: 'material-community',
		name: 'google-circles-extended',
	},
	bank: { type: 'material-community', name: 'bank' },
	documents: {
		type: 'material-community',
		name: 'file-document-multiple-outline',
	},
	'eye.outline': {
		type: 'material-community',
		name: 'eye-outline',
	},
	'edit.outline': {
		type: 'material-community',
		name: 'pencil-outline',
	},
	'delete.outline': {
		type: 'material-community',
		name: 'delete-outline',
	},
	'password.outline': {
		type: 'material-community',
		name: 'eye-off-outline',
	},
	'password.off.outline': {
		type: 'material-community',
		name: 'eye-outline',
	},
	block: { type: 'material', name: 'block' },
	calendar: { type: 'material-community', name: 'calendar-blank-outline' },
	monthlyCalendar: {
		type: 'material-community',
		name: 'calendar-month-outline',
	},
	menu: { type: 'material-community', name: 'menu' },
	account: { type: 'material-community', name: 'account-outline' },
	cash: { type: 'material-community', name: 'cash-multiple' },
	logout: { type: 'material-community', name: 'logout' },
	withdrawal: { type: 'material-community', name: 'credit-card-outline' },
	doubleLeft: { type: 'material', name: 'keyboard-double-arrow-left' },
	doubleRight: { type: 'material', name: 'keyboard-double-arrow-right' },
	vouchers: { type: 'material-community', name: 'ticket-account' },
	transactions: { type: 'material-community', name: 'handshake' },
	packages: { type: 'material-community', name: 'package-variant' },
	translate: { type: 'material', name: 'translate' },
	settings: { type: 'ionicon', name: 'settings' },
	close: { type: 'ionicon', name: 'close' },
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons/Ionicons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons or Ionicons.
 */
export function IconSymbol({
	name,
	size = 24,
	color,
	style,
}: {
	name: IconSymbolName;
	size?: number;
	color: string | OpaqueColorValue;
	style?: StyleProp<TextStyle>;
	weight?: SymbolWeight;
}) {
	const iconConfig = MAPPING[name];

	if (!iconConfig) {
		// Missing mapping: fall back to a generic icon without logging to console
		return (
			<MaterialIcons color={color} size={size} name='help' style={style} />
		);
	}

	if (iconConfig.type === 'ionicon') {
		return (
			<Ionicons
				color={color}
				size={size}
				name={iconConfig.name as IoniconName}
				style={style}
			/>
		);
	}
	if (iconConfig.type === 'material-community') {
		return (
			<MaterialCommunityIcons
				color={color}
				size={size}
				name={iconConfig.name as MaterialCommunityIconName}
				style={style}
			/>
		);
	}
	if (iconConfig.type === 'material') {
		return (
			<MaterialIcons
				color={color}
				size={size}
				name={iconConfig.name as MaterialIconName}
				style={style}
			/>
		);
	}
	return null;
}
