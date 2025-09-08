declare module '@react-navigation/drawer' {
	// Extend DrawerNavigationOptions to allow a custom `headerProps` field used by our Header factory
	interface DrawerNavigationOptions {
		headerProps?: {
			goback?: boolean;
			// add other shared header props here if needed in future
		};
	}
}
