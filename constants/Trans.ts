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
				// Setup authenticator / 2FA screen
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app (Google Authenticator, Authy) or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.noQr':
					'No QR available — use the secret below to add your account manually.',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.completeSetup': 'Complete Totp Setup',
				'setupAuthenticator.settingUp': 'Setting up...',
				'setupAuthenticator.setupSuccess': 'Two-factor authentication enabled.',
				'setupAuthenticator.loginSuccess': 'You logged in successfully.',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or press the Copy Secret button and add the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. After adding the account to your authenticator app, you will be able to generate 6-digit codes for login.',
				'setupAuthenticator.step4':
					'4. Keep the secret safe. If you lose access to your authenticator, you will need this secret to restore access.',
				// Setup screen localised messages
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.missingSecret': 'Missing secret for TOTP setup',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic/fallback app messages
				loginFailed: 'Login failed',
				sessionRefreshFailed:
					'Session refresh failed. Tap Retry to attempt refresh or log in again.',
				retryFailedPleaseLogin: 'Retry failed — please log in again',
				logoutSuccess: 'Logged out',
				logoutFailed: 'Logout failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
				haveAnAccount: 'Already have an account?',
				forgotPassword: 'Forgot Password?',
				// Profile screen
				'profile.details.title': 'Profile Details',
				'profile.details.subtitle': 'Profile Information',
				'profile.details.description':
					'Update your account information and email address.',
				'profile.placeholder.fullName': 'Full name',
				'profile.placeholder.email': 'you@example.com',
				'profile.password.title': 'Change Password',
				'profile.password.subtitle': 'Update Password',
				'profile.password.description':
					'Ensure your account is using a complex password to stay secure. Passwords should be at least 8 characters long and include letters, numbers, and symbols.',
				'profile.placeholder.currentPassword': 'Current password',
				'profile.placeholder.newPassword': 'New password',
				'profile.placeholder.confirmPassword': 'Confirm password',
				'profile.delete.title': 'Delete Account',
				'profile.delete.subtitle': 'Remove Account Information',
				'profile.delete.description':
					'Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data that you wish to retain.',
				'profile.details.button': 'Save changes',
				'profile.password.button': 'Update password',
				'profile.delete.button': 'Delete account',
				'reset.title': 'Forgot Password? 🔒',
				'reset.subtitle':
					'Enter your email and we will send you instructions to reset your password',
				'reset.sendLink': 'Send reset link',
				'reset.backToLogin': 'Back to login',
			},
			buttons: {
				verifyOTP: 'Verify OTP',
				signIn: 'Sign In',
				signUp: 'Sign Up',
				allTransactions: 'View All Transactions',
				allVoucherUsers: 'View All Voucher Users',
				createSingleVoucher: 'Create Single Voucher',
				createBulkVouchers: 'Create Bulk Vouchers',
				generateUsersAndPdf: 'Generate users and pdf',
				generateUserAndPdf: 'Generate user and pdf',
				confirm: 'Confirm',
				downloadCSV: 'Download CSV',
				viewUsers: 'View Users',
				addRouter: 'Add Router',
				saveRouter: 'Save Router',
				editRouter: 'Edit Router',
				deleteRouter: 'Delete Router',
				updateRouter: 'Update Router',
				viewPackages: 'View Packages',
				viewVouchers: 'View Vouchers',
				viewDetails: 'View Details',
				saveChanges: 'Save Changes',
				hotspots: 'Hotspots',
				cancel: 'Cancel',
				delete: 'Delete',
				close: 'Close',
				ok: 'OK',
				block: 'Block',
				apply: 'Apply',
				save: 'Save',
				withdraw: 'withdraw',
				createPackage: 'Create package',
				createNewPackage: 'Create new package',
				retry: 'Retry',
			},
			navigation: {
				home: 'Dashboard',
				settings: 'Settings',
				routers: 'Routers',
				transactions: 'Transactions',
				packages: 'Packages',
				vouchers: 'Vouchers',
				connector: 'Connector',
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
				id: 'ID',
				hotspotName: 'Hotspot Name',
				interface: 'Interface',
				profile: 'Profile',
				status: 'Status',
				actions: 'Actions',
				title: 'Routers',
				editTitle: 'Edit Router',
				newTitle: 'Create Router',
				routerType: 'Router Type',
				routerHash: 'Router Hash',
				routerStatus: 'Router Status',
				uptime: 'Uptime',
				ipv4: 'IPv4 Address',
				ipv6: 'IPv6 Address',
				macAddress: 'MAC Address',
				location: 'Location',
				routerOS: 'RouterOS Version',
				freeMemory: 'Free Memory',
				totalMemory: 'Total Memory',
				cpuLoad: 'CPU Load',
				cpuFrequency: 'CPU Frequency',
				storage: 'Storage',
				firmwareVersion: 'Firmware Version',
				model: 'Model',
				hotspotsTitle: 'Hotspot Servers for Router',
				deleteMessage:
					'Are you sure you want to delete this router? This action cannot be undone.',
			},
			packages: {
				title: 'Packages',
				subtitle: 'Select router to view associated packages',
				packagesOnHotspot: 'Packages on Hotspot: {hotspotName}',
				usersPerDevice: 'Users per device',
				bandwidth: 'Bandwidth',
				durationHours: 'Duration (hrs)',
				deleteMessage:
					'Are you sure you want to delete this package? This action cannot be undone.',
			},
			internetPackage: {
				createTitle: 'Create Internet Package',
				editTitle: 'Edit Internet Package',
				viewTitle: 'Internet Package',
				packageName: 'Package name',
				usersPerDevice: 'Users per device',
				bandwidth: 'Bandwidth',
				durationHours: 'Duration (hours)',
				placeholderPackageName: 'e.g. daily',
				placeholderUsersPerDevice: 'e.g. 1',
				placeholderBandwidth: 'e.g. 5Mbps',
				placeholderDurationHours: 'e.g. 24',
			},
			hotspots: {
				title: 'Hotspot Servers for Router:',
				enabled: 'Enabled',
				disabled: 'Disabled',
			},
			vouchers: {
				title: 'Vouchers',
				mainSubtitle: 'Select router to manage vouchers',
				vouchersSubtitle:
					'Vouchers for Hotspot Server: {hotspotName} on router: {routerName}',
				vouchers: 'Vouchers',
				package: 'Package',
				numberOfUsers: 'Number of Users',
				createHotspotVoucher: 'Create Hotspot Voucher',
				createHotspotVouchers: 'Create Hotspot Vouchers',
				status: 'Status',
				macAddress: 'MAC Address',
				uptime: 'Uptime',
				bytesIn: 'Bytes In',
				bytesOut: 'Bytes Out',
				actions: 'Actions',
				editVoucher: 'Edit Voucher: {voucher}',
				username: 'Username',
				password: 'Password',
				profile: 'Profile',
				confirmBlockTitle: 'Confirm Block User',
				blockMessage:
					'Are you sure you want to block this user? They will no longer be able to access the hotspot.',
				confirmDeleteTitle: 'Confirm Delete User',
				deleteMessage:
					'Are you sure you want to delete this user? This action cannot be undone.',
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
				routerUsername: 'Router Username',
				routerPassword: 'Router Password',
				routerBalances: 'Router Balances',
				confirmDeleteTitle: 'Confirm Delete',
				routerNamePlaceholder: 'eg. Router 01',
				date: 'Date',
				voucher: 'Voucher',
				package: 'Package',
				status: 'Status',
				ipAddress: 'IP Address',
				macAddress: 'MAC Address',
				name: 'Name',
				location: 'Location',
				actions: 'Actions',
				balance: 'Balance',
				uptime: 'Uptime',
				bytesIn: 'Bytes In',
				bytesOut: 'Bytes Out',
				loading: 'Loading...',
				retrying: 'Retrying...',
			},
			transactions: {
				title: 'Transactions',
				startDate: 'Start date',
				endDate: 'End date',
				status: 'Status',
				transactionType: 'Transaction type',
				applyFilters: 'Apply filters',
				totalBalance: 'Total balance',
				exportExcel: 'Export to Excel',
				exportPdf: 'Export to PDF',
				all: 'All',
				approved: 'Approved',
				pending: 'Pending',
				successful: 'Successful',
				failed: 'Failed',
				debit: 'Debit',
				credit: 'Credit',
				colHash: '#',
				colAmount: 'Amount',
				colType: 'Type',
				colReason: 'Reason',
				colStatus: 'Status',
				colRouterName: 'Router Name',
				colTransactionDate: 'Transaction Date',
			},
			withdraw: {
				title: 'Withdraw',
				subtitle: 'Select router to manage withdrawals',
				withdrawFundsFromRouter: 'withdraw funds from router',
				withdrawAmount: 'Withdraw amount',
				mobileMoneyPhone: 'Mobile money phone number',
				narrationOptional: 'Narration (optional)',
				initiateWithdrawal: 'Initiate withdrawal',
			},
			connector: {
				title: 'Connector - Wireguard Keys',
				newKeyButton: 'Generate Key',
				id: 'ID',
				keyName: 'Key Name',
				routerPublicKey: 'Router Public Key',
				serverPublicKey: 'Server Public Key',
				endpointPort: 'Endpoint Port',
				ipAddress: 'IP Address',
				status: 'Status',
				actions: 'Actions',
				view: 'View',
				delete: 'Delete',
			},
			documents: {
				title: 'Documents',
				addDocument: 'Add document',
				attach: 'Attach',
				noFileChosen: 'No file chosen',
				selecting: 'Selecting…',
				documentNumber: 'Document number',
				documentType: 'Document type',
				attachDocument: 'Attach document',
				documentDetails: 'Document details',
				editDocument: 'Edit document',
				addYourDocumentDetails: 'Add your document details',
			},
			errors: {
				somethingWentWrong: 'Something went wrong',
			},
		},
	},
	fr: {
		name: 'Français',
		active: false,
		categories: {
			auth: {
				// Setup authenticator placeholders
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.completeSetup': 'Complete Totp Setup',
				'setupAuthenticator.settingUp': 'Setting up...',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				// Localised messages (placeholders)
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.missingSecret':
					'Secret manquant pour la configuration TOTP',
				logoutSuccess: 'Déconnexion réussie',
				logoutFailed: 'La déconnexion a échoué',
				'setupAuthenticator.setupSuccess':
					'Authentification à deux facteurs activée.',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
			errors: {
				somethingWentWrong: 'Something went wrong',
			},
		},
	},
	es: {
		name: 'Español',
		active: false,
		categories: {
			auth: {
				// Placeholder Spanish translations (copying English)
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.setup': 'Set Up',
				'setupAuthenticator.settingUp': 'Setting up...',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				// Localised messages (placeholders)
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.missingSecret':
					'Falta el secreto para la configuración de TOTP',
				logoutSuccess: 'Cierre de sesión exitoso',
				logoutFailed: 'Error al cerrar sesión',
				'setupAuthenticator.setupSuccess':
					'Autenticación de dos factores activada.',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	de: {
		name: 'Deutsch',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.setup': 'Set Up',
				'setupAuthenticator.settingUp': 'Setting up...',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				// Localised messages (placeholders)
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.missingSecret':
					'Fehlender Geheimschlüssel für die TOTP-Einrichtung',
				logoutSuccess: 'Erfolgreich abgemeldet',
				logoutFailed: 'Abmeldung fehlgeschlagen',
				'setupAuthenticator.setupSuccess':
					'Zwei-Faktor-Authentifizierung aktiviert.',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	it: {
		name: 'Italiano',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				// Localised messages (placeholders)
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	// Add other required languages with minimal structure
	pt: {
		name: 'Português',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				// Localised messages (placeholders)
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	ru: {
		name: 'Русский',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	zh: {
		name: '中文',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	ar: {
		name: 'العربية',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
	ja: {
		name: '日本語',
		active: false,
		categories: {
			auth: {
				setupAuthenticator: 'Set up authenticator',
				'setupAuthenticator.subtitle':
					'Scan the QR code with an authenticator app or copy the secret and add it manually.',
				'setupAuthenticator.secretLabel': 'Secret',
				'setupAuthenticator.enterCodePlaceholder':
					'Enter code from authenticator',
				'setupAuthenticator.copy': 'Copy Secret',
				'setupAuthenticator.verify': 'Verify',
				'setupAuthenticator.continue': 'Continue',
				'setupAuthenticator.howToTitle': 'How to set up',
				'setupAuthenticator.step1':
					'1. Install an authenticator app (Google Authenticator, Authy, etc.).',
				'setupAuthenticator.step2':
					'2. Scan the QR code above, or copy the secret manually in the app.',
				'setupAuthenticator.step3':
					'3. You can now generate 6-digit codes for login.',
				'setupAuthenticator.step4': '4. Keep the secret safe.',
				'setupAuthenticator.copiedToast': 'Secret copied to clipboard',
				'setupAuthenticator.copyFailed': 'Failed to copy secret',
				'setupAuthenticator.clipboardUnavailable':
					'Clipboard not available on this platform',
				'setupAuthenticator.missingPhone': 'Missing phone for 2FA verification',
				'setupAuthenticator.enterCodeError':
					'Enter the code from your authenticator app',
				'setupAuthenticator.verifyFailed': '2FA verification failed',
				// Generic placeholders
				loginFailed: 'Login failed',
				registrationFailed: 'Registration failed',
				otpVerificationFailed: 'OTP verification failed',
				unexpectedError: 'An unexpected error occurred',
			},
		},
	},
};

export default translations;
