import { VoucherUser } from './security';
export * from './dashboard';
export * from './security';

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
	".id": string;
	name: string; // SSID of the hotspot
	interface: string; // Network interface associated with the hotspot
	profile: string; // Profile name for the hotspot
	disabled: "true" | "false" | boolean; // Status of the hotspot
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

export interface ApiRouter {
	id: string;
	name: string;
	location: string;
	type: string;
	ip_address: string;
	router_user: string;
	router_password: string;
	balance: string;
	user_id: number;
	created_at: string;
	updated_at: string;
}


export interface GetRoutersResponse {
	routers: {
		current_page: number;
		data: ApiRouter[];
		first_page_url: string;
		from: number;
		last_page: number;
		last_page_url: string;
		links: {
			url: string | null;
			label: string;
			active: boolean;
		}[];
		next_page_url: string | null;
		path: string;
		per_page: number;
		prev_page_url: string | null;
		to: number;
		total: number;
	};
	message: string;
}

export type InternetPackageName = 'short' | 'daily' | 'weekly' | 'monthly';

export interface InternetPackage {
	id?: string;
	tag: string;
	name: InternetPackageName; // Name of the internet package
	price: number; // Price of the package
	bandwidth: string; // Bandwidth in MBps/MBps
	usersPerDevice: number; // Number of users allowed per device
	duration: number; // Duration in hours
	createdAt?: Date;
	updatedAt?: Date;
}

export type identityDocumentType = 'passport' | 'id-card' | 'driver-license';
export type companyDocumentType =
	| 'incorporation-certificate'
	| 'tax-document'
	| 'articles-of-association';

export interface DocumentProps {
	id?: string;
	documentId: string; // Unique identifier for the document
	name: string; // Name of the document
	type: identityDocumentType | companyDocumentType; // Type of document
	status: 'pending' | 'approved' | 'rejected';
	url: string; // URL to access the document
	createdAt?: Date;
	updatedAt?: Date;
}

export type TransactionType =
	| 'credit'
	| 'debit'
	| 'bank-transfer'
	| 'cash'
	| 'mobile-money';

export type TransactionStatus = 'pending' | 'successful' | 'failed';
export interface MicroTransaction {
	id: string;
	amount: number;
	status: TransactionStatus; // Status of the micro transaction
	routerName: string; // Name of the router associated with the micro transaction
	date: Date;
	created_at: Date; // Timestamp of when the micro transaction was created
	reason: 'wifi' | 'subscription' | 'other'; // Reason for the micro transaction
	description?: string; // Optional description for the micro transaction
	type: TransactionType; // Type of the micro transaction
	router: ApiRouter
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

export interface HotspotUser {
	[".id"]: string;
	name: string;
	profile?: string;
	uptime: string;
	comment?: string;
	server?: string;
	"bytes-in": string;
	"bytes-out": string;
	"mac-address": string;
	"time-left"?: string;
	profile_display?: string;
	"limit-uptime"?: string;
}

export interface HotspotActiveUser {
	'.id': string;
	address: string;
	'bytes-in': string;
	'bytes-out': string;
	comment?: string;
	'idle-time'?: string;
	'keepalive-timeout'?: string;
	'login-by'?: string;
	'mac-address': string;
	'packets-in'?: string;
	'packets-out'?: string;
	radius?: string;
	server: string;
	'session-time-left'?: string;
	uptime: string;
	user: string;
}

export interface GetRouterHotspotUsersResponse {
	active: HotspotActiveUser[];
	active_by_user: Record<string, HotspotActiveUser[][]>;
	hotspotServers: any[];
	profiles: any[];
	users: HotspotUser[];
}

