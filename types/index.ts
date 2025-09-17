export interface User {
	id: string;
	name: string;
	email: string;
	phone?: string; // Optional, can be used for login or registration
	avatarUrl?: string;
	userLanguage?: langCode; // Optional, can be used to store user's preferred language
	createdAt: Date;
	updatedAt: Date;
}

export type headerOptions =
	| 'notifications'
	| 'profile'
	| 'language'
	| 'search'
	| undefined;

export interface Transaction {
	id: string;
	amount: number;
	type: 'credit' | 'debit';
	date: Date;
	description?: string; // Optional description for the transaction
	method: TransactionMethod; // Reference to the transaction method used
}

export interface PromptButton {
	title: string;
	color: string;
	textColor: string;
	action: () => void;
}

export interface Hotspot {
	id: string;
	ssid: string; // SSID of the hotspot
	interface: string; // Network interface associated with the hotspot
	profile: string; // Profile name for the hotspot
	status: 'enabled' | 'disabled'; // Status of the hotspot
	users?: VoucherUser[]; // Optional list of voucher users connected to the hotspot
}

export interface NetworkInfo {
	mac: string;
	ipv4: string;
	ipv6: string;
	hostname: string;
	routerHash: string;
	uptime: string;
	hotspots: Hotspot[];
}

export interface HardWareInfo {
	cpuFrequency: string;
	cpuLoad: string;
	totalMemory: string;
	freeMemory: string;
	storage: string;
	routerOsVersion: string;
	firmwareVersion: string;
	model?: string;
}

export interface NetRouter {
	id: string;
	name: string; // Name of the router
	type: string;
	networkInfo: NetworkInfo;
	hardwareInfo: HardWareInfo;
	transactionBalance: number; // Balance of the router's transactions
	model?: string; // Model of the router
	location: string; // Location of the router
	firmwareVersion?: string; // Firmware version of the router
	username: string;
	password: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export type InternetPackageName = 'short' | 'daily' | 'weekly' | 'monthly';

export interface InternetPackage {
	id?: string;
	tag: string;
	name: InternetPackageName; // Name of the internet package
	price: number; // Price of the package
	bandwidth: string; // Bandwidth in MBps/MBps
	duration: number; // Duration in hours
	createdAt?: Date;
	updatedAt?: Date;
}

export interface DocumentProps {
	id?: string;
	name: string; // Name of the document
	type: 'pdf' | 'image' | 'text'; // Type of the document
	url: string; // URL to access the document
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Bank {
	id?: string;
	name: string; // Name of the bank
	accountNumber: string; // Account number of the bank
	accountHolderName: string; // Name of the account holder
	SWIFTCode?: string; // Optional, can be used for international transactions
	currency?: string; // Optional, can be used to specify the currency of the bank account
	branch?: string; // Optional branch name
	createdAt?: Date;
	updatedAt?: Date;
}

export interface VoucherUser {
	voucherCode: string;
	password?: string;
	package: string;
	status: 'active' | 'inactive';
	macAddress: string; // MAC address of the user
	uptime: number; // Uptime of the user in minutes
	bytesIn: number; // Data usage in bytes
	bytesOut: number; // Data usage in bytes
	comment: string;
	createdAt: string;
}

export type TransactionType =
	| 'credit'
	| 'debit'
	| 'bank-transfer'
	| 'cash'
	| 'mobile-money';

export type TransactionStatus = 'pending' | 'completed' | 'failed';
export interface MicroTransaction {
	id: string;
	amount: number;
	status: TransactionStatus; // Status of the micro transaction
	routerName: string; // Name of the router associated with the micro transaction
	date: Date;
	reason: 'wifi' | 'subscription' | 'other'; // Reason for the micro transaction
	description?: string; // Optional description for the micro transaction
	method: TransactionMethod; // Reference to the transaction method used
}

export interface TransactionMethod {
	id?: string;
	name?: string;
	type: TransactionType; // Type of transaction method
	phoneNumber?: string; // Optional, can be used for phone transactions
	accountNumber?: string; // Optional, can be used for bank accounts
	cardNumber?: string; // Optional, can be used for card transactions
	accountHolderName?: string; // Optional, can be used for bank accounts or cards
	csv?: string; // Optional, can be used for card transactions
	expiryDate?: Date; // Optional, can be used for card transactions
	createdAt?: Date;
	updatedAt?: Date;
}

export interface AuthRequest {
	name?: string; // Required for registration, optional for login
	email: string;
	phone?: string; // Optional, can be used for login or registration
	password: string;
}

export interface notifications {
	id: string;
	from: string;
	to: string;
	type: 'message' | 'alert' | 'reminder';
	title: string;
	message: string;
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface dayPurchase {
	date: Date;
	day: string;
	amount: number;
}

export type Translations = {
	[key in langCode]: {
		name: lang;
		active: boolean; // Indicates if the language is fully translated and active
		categories: {
			[categoryKey: string]: {
				[translationKey: string]: string;
			};
		};
	};
};

export type lang =
	| 'English'
	| 'Français'
	| 'Español'
	| 'Deutsch'
	| 'Italiano'
	| 'Русский'
	| 'Português'
	| '中文'
	| '日本語'
	| 'العربية';

export type langCode =
	| 'en'
	| 'fr'
	| 'es'
	| 'de'
	| 'it'
	| 'ru'
	| 'pt'
	| 'zh'
	| 'ja'
	| 'ar';
