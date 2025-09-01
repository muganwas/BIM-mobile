import { Translations } from '@/types';

const translations: Translations = {
	en: {
		name: 'English',
		active: true, // Set to true only if fully translated
		categories: {
			auth: {
				'signUp.title': 'Adventure starts here 🚀',
				'signUp.subtitle': 'Make your hotspot management easy and fun!',
				'signIn.title': 'Welcome to BIM Networks!👋',
				'signIn.subtitle':
					'Please sign-in to your account and start the adventure',
				'verify.title': 'Login Verification 👋',
				'verify.subtitle': 'Please enter the OTP code sent to your phone',
				fullName: 'Full Name',
				phoneNumber: 'Phone Number',
				password: 'Password',
				email: 'Email',
				confirmPassword: 'Confirm Password',
				signIn: 'Sign In instead',
				signUp: 'Sign Up instead',
				enterOTP: 'Enter OTP',
				haveAnAccount: 'Already have an account?',
				forgotPassword: 'Forgot Password?',
			},
			buttons: {
				verifyOTP: 'Verify OTP',
				signIn: 'Sign In',
				signUp: 'Sign Up',
				allTransactions: 'View All Transactions',
				allVoucherUsers: 'View All Voucher Users',
				addRouter: 'Add Router',
				editRouter: 'Edit Router',
				deleteRouter: 'Delete Router',
				updateRouter: 'Update Router',
				cancel: 'Cancel',
			},
			navigation: {
				home: 'Dashboard',
				settings: 'Settings',
				routers: 'Routers',
				transactions: 'Transactions',
				packages: 'Packages',
				vouchers: 'Vouchers',
				banks: 'Banks',
				documents: 'Documents',
				profile: 'My Profile',
				notifications: 'Notifications',
				about: 'About',
				help: 'Help',
				logout: 'Logout',
			},
			notifications: {
				title: 'Notifications',
				new: 'New',
				'no.notifications': 'No new notifications available',
				seeAll: 'View All Notifications',
			},
			routers: {
				title: 'Routers',
				editTitle: 'Edit Router',
				newTitle: 'Create Router',
				routerType: 'Router Type',
			},
			dashboard: {
				title: 'Dashboard',
				todaysTransactions: "Today's Transactions",
				weeksTransactions: "This Week's Transactions",
				monthsTransactions: "This Month's Transactions",
				todaysVouchers: "Today's Voucher Users",
				weeksVouchers: "This Week's Voucher Users",
				monthsVouchers: "This Month's Voucher Users",
				lastTransactions: 'last {number} transactions',
				transVolume: 'Transaction Volume (Last {number} days)',
				lastVouchers: 'Vouchers Users Created (Last {number} days)',
				amount: 'Amount',
				type: 'Type',
				reason: 'Reason',
				routerName: 'Router Name',
				routerBalances: 'Router Balances',
				date: 'Date',
				voucher: 'Voucher',
				package: 'Package',
				status: 'Status',
				ipAddress: 'IP Address',
				macAddress: 'MAC Address',
				location: 'Location',
				actions: 'Actions',
				balance: 'Balance',
				uptime: 'Uptime',
				bytesIn: 'Bytes In',
				bytesOut: 'Bytes Out',
				loading: 'Loading...',
			},
		},
	},
	fr: {
		name: 'Français',
		active: false,
		categories: {
			auth: {},
		},
	},
	es: {
		name: 'Español',
		active: false,
		categories: {
			auth: {},
		},
	},
	de: {
		name: 'Deutsch',
		active: false,
		categories: {
			auth: {},
		},
	},
	it: {
		name: 'Italiano',
		active: false,
		categories: {
			auth: {},
		},
	},
	// Add other required languages with minimal structure
	pt: {
		name: 'Português',
		active: false,
		categories: {
			auth: {},
		},
	},
	ru: {
		name: 'Русский',
		active: false,
		categories: {
			auth: {},
		},
	},
	zh: {
		name: '中文',
		active: false,
		categories: {
			auth: {},
		},
	},
	ar: {
		name: 'العربية',
		active: false,
		categories: {
			auth: {},
		},
	},
	ja: {
		name: '日本語',
		active: false,
		categories: {
			auth: {},
		},
	},
};

export default translations;
