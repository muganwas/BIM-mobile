import { Translations } from '@/types';

const translations: Translations = {
	en: {
		name: 'English',
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
				'verify.button': 'Verify OTP',
				'signIn.button': 'Sign In',
				'signUp.button': 'Sign Up',
				haveAnAccount: 'Already have an account?',
				forgotPassword: 'Forgot Password?',
			},
			navigation: {
				home: 'Home',
				settings: 'Settings',
				profile: 'My Profile',
				notifications: 'Notifications',
				about: 'About',
				help: 'Help',
				logout: 'Logout',
			},
			notifications: {
				'notifications.title': 'Notifications',
				new: 'New',
				'no.notifications': 'No new notifications available',
				seeAll: 'View All Notifications',
			},
		},
	},
	fr: {
		name: 'Français',
		categories: {
			auth: {},
		},
	},
	es: {
		name: 'Español',
		categories: {
			auth: {},
		},
	},
	de: {
		name: 'Deutsch',
		categories: {
			auth: {},
		},
	},
	it: {
		name: 'Italiano',
		categories: {
			auth: {},
		},
	},
	// Add other required languages with minimal structure
	pt: {
		name: 'Português',
		categories: {
			auth: {},
		},
	},
	ru: {
		name: 'Русский',
		categories: {
			auth: {},
		},
	},
	zh: {
		name: '中文',
		categories: {
			auth: {},
		},
	},
	ar: {
		name: 'العربية',
		categories: {
			auth: {},
		},
	},
	ja: {
		name: '日本語',
		categories: {
			auth: {},
		},
	},
};

export default translations;
