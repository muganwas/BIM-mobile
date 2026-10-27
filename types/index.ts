import { ChartDataEntry, RecentTransaction, RouterBalance } from './dashboard';
import { ServerUser, VoucherUser } from './security';
export * from './dashboard';
export * from './security';

export type headerOptions =
	| 'notifications'
	| 'profile'
	| 'language'
	| 'search'
	| undefined;
export type stringifiedBool = "true" | "false";
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
	"id": string;
	"wireguard_public_key": string;
	"name": string;
	"location": string;
	"type": string;
	"ip_address": string;
	"router_user": string;
	"router_password": string;
	"balance": string;
	"isp_id?": string;
	"device_id"?: string;
	"auth_key"?: string;
	"last_heartbeat_at"?: string;
	"last_system_info"?: RouterSystemInfo;
	"user_id": number;
	"created_at": string;
	"updated_at": string;
	"hotspot_dns"?: string;
}

export interface GetRoutersResponse {
	routers: ApiRouter[];
	success: boolean | stringifiedBool;
	message: string;
}

export type InternetPackageName = 'short' | 'daily' | 'weekly' | 'monthly';

/** RADIUS hotspot user profile returned by the /packages endpoint */
export interface RadiusProfile {
	".id": string;
	name: string; // Profile name
	display_name: string;
	"address-list"?: string;
	"rate-limit"?: string;
	"shared-users"?: number;
	"session-timeout"?: string;
	"router-name"?: string;
	"simultaneous-use"?: number;
}

export interface InternetPackage {
	".id": string;
	name: string; // Profile name
	display_name: string;
	"address-list"?: string;
	"rate-limit"?: string;
	"shared-users"?: number;
	"session-timeout"?: string;
	"router-name"?: string;
	"simultaneous-use"?: number;
}

/** Shared RADIUS plan returned by GET /profiles. */
export interface SharedRadiusProfile {
	group: string;
	name: string;
	display_name: string;
	shared: boolean;
	price: number | null;
	duration: string | null;
	duration_seconds: number;
	rate_limit: string | null;
	devices: number;
}

export interface PackageOwner {
	type: 'platform' | 'account' | 'user';
	id: number | null;
	name: string;
}

export interface PackageRateLimit {
	rate_limit: string | null;
	is_open: boolean;
	effective_rate_limit: string | null;
	source: 'override' | 'profile';
	editable: boolean;
}

/** A router association on a portal package. */
export interface PackageRouter {
	id: string;
	name: string;
	location: string | null;
	visible: boolean;
	source: 'default' | 'override';
	heartbeat_state: 'fresh' | 'stale' | 'never';
	portal_url?: string | null;
	rate_limit: string | null;
	rate_limit_open: boolean;
	effective_rate_limit: string | null;
	rate_limit_source: 'override' | 'profile';
	rate_limit_editable: boolean;
}

export interface PortalPackageProfile {
	group: string;
	name: string;
	display_name: string;
	shared: boolean;
	price: number | null;
	duration: string | null;
	duration_seconds: number;
	rate_limit: string | null;
	devices: number;
	editable: boolean;
}

/** A sellable package as returned by GET /packages. */
export interface PortalPackage {
	id: string;
	label: string;
	label_key: string | null;
	label_translations: Record<string, string>;
	price: number;
	rad_group: string;
	duration_label: string | null;
	sort: number;
	is_active: boolean;
	is_global: boolean;
	is_trial: boolean;
	account_id: number | null;
	user_id: number | null;
	owner: PackageOwner;
	profile: PortalPackageProfile;
	routers: PackageRouter[];
	rate_limits: Record<string, PackageRateLimit>;
	created_at?: string | null;
	updated_at?: string | null;
}

export interface TrialSettings {
	router_id: string;
	enabled: boolean;
	duration_minutes: number;
	cooldown_hours: number;
}

export interface GetPortalPackagesResponse {
	success: boolean | stringifiedBool;
	message: string;
	scope: 'visible' | 'global' | 'owner' | 'all';
	packages: PortalPackage[];
	packages_metadata: PaginatedResourcesMeta;
}

export interface GetPackageRoutersResponse {
	success: boolean | stringifiedBool;
	message: string;
	package_id: string;
	routers: PackageRouter[];
	rate_limits: Record<string, PackageRateLimit>;
}

export interface GetSharedRadiusProfilesResponse {
	success: boolean | stringifiedBool;
	message: string;
	scope: 'shared';
	profiles: SharedRadiusProfile[];
	profiles_metadata: PaginatedResourcesMeta;
}

export interface GetTrialSettingsResponse {
	success: boolean | stringifiedBool;
	message: string;
	trial_settings: TrialSettings;
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
	address?: string;
	online: stringifiedBool;
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
	'start-date'?: string;
	'start-date-iso'?: string;
	radius?: string;
	server: string;
	'session-time-left'?: string;
	uptime: string;
	user: string;
}

export interface RouterSystemInfo {
	arch?: string;
	version?: string;
	board?: string;
	platform?: string;
	build_time?: string;
}

export interface RouterTrafficSample {
	t: number;
	rx: number;
	tx: number;
}

export interface RouterTrafficHello {
	interface: string;
	units: string;
	interval_ms: number;
	latest_at: number | null;
	samples: RouterTrafficSample[];
}

export type Cookie = {
	".id": string;
	user: string;
	"mac-address": string;
	"expires-in": string;
	"mac-cookie": stringifiedBool;
}

export type Host = {
	".id": string;
	"mac-address": string;
	"address": string;
	"to-address": string;
	"server": string;
	"uptime": string;
	"idle-time": string;
	"keepalive-timeout": string;
	"host-dead-time": string;
	"bytes-in": string;
	"bytes-out": string;
	"packets-in": string;
	"packets-out": string;
	"found-by": string;
	"DHCP": stringifiedBool;
	"authorized": stringifiedBool;
	"bypassed": stringifiedBool
}

export type DHCPLease = {
	".id": string;
	"address": string;
	"mac-address": string;
	"client-id": string;
	"address-list": string;
	"server": string;
	"dhcp-option": string;
	"agent-remote-id": string;
	"status": string;
	"expires-after": string;
	"last-seen": string;
	"active-address": string;
	"active-mac-address": string;
	"active-client-id": string;
	"active-server": string;
	"active-agent-circuit-id": string;
	"active-agent-remote-id": string;
	"host-name": string;
	"class-id": string;
	"radius": stringifiedBool;
	"dynamic": stringifiedBool;
	"blocked": stringifiedBool;
	"disabled": stringifiedBool;
}

export type PaginatedResourcesMeta = { total: number, per_page: number, current_page: number, last_page: number, first_Item: number, last_Item: number };
export type PurchaseGuardData = {
	"router_id": string;
	"notify_existing_voucher": boolean | stringifiedBool;
}

export interface Platform {
	"role": string;
	"role_label": string;
	"is_admin": boolean | stringifiedBool;
	"is_staff": boolean | stringifiedBool;
	"is_blog_editor": boolean | stringifiedBool;
	"blog_editor_scope": string;
	"can_write_blog_content": boolean | stringifiedBool;
}


export interface OnboardingState {
	completed?: string[];
	dismissed?: string[];
}

export interface TokenMeta {
	"id": number,
	"name": string,
	"abilities": string[],
	"last_used_at": string,
	"created_at": string,
	"expires_at"?: string
}

export interface Account {
	"id": string;
	"name": string;
	"type": string;
	"type_label": string;
	"is_admin_account": boolean | stringifiedBool;
	"role": string;
	"role_label": string;
	"is_cosignatory": boolean | stringifiedBool;
	"is_active": boolean | stringifiedBool;
	"joined_at": string;
}


export interface GetDashboardResponse {
	"success": boolean | stringifiedBool,
	"message": string,
	"recentTransactions_metadata": PaginatedResourcesMeta,
	"recentTransactions": RecentTransaction[],
	"todayTransactions": number,
	"weekTransactions": number,
	"monthTransactions": number,
	"todayUsers": number,
	"weekUsers": number,
	"monthUsers": number,
	"routerBalances_metadata": PaginatedResourcesMeta,
	"routerBalances": RouterBalance[],
	"chartData_metadata": PaginatedResourcesMeta,
	"chartData": ChartDataEntry[]
}

export interface GetRouterCookiesResponse {
	"router": ApiRouter;
	"cookies": Cookie[];
	"cookies_meta": PaginatedResourcesMeta;
	"message": string;
}

export interface GetRouterActiveUsersResponse {
	"router": ApiRouter;
	"active": HotspotActiveUser[];
	"active_meta": PaginatedResourcesMeta;
	"message": string;
}

export interface GetRouterUsersResponse {
	"router": ApiRouter;
	"users": HotspotUser[];
	"users_meta": PaginatedResourcesMeta;
	"message": string;
}

export interface GetRouterHostsResponse {
	"router": ApiRouter;
	"hosts": Host[];
	"hosts_meta": PaginatedResourcesMeta;
	"message": string;
}

export interface GetRouterDHCPLeasesResponse {
	"router": ApiRouter;
	"leases": DHCPLease[];
	"leases_meta": PaginatedResourcesMeta;
	"message": string;

}

export interface GetRouterResponse {
	"router": ApiRouter;
	"message": string;
}

export interface GetPurchaseGuardResponse {
	"success": boolean | stringifiedBool;
	"data": PurchaseGuardData;
}

export interface GetRadiusProfileResponse {
	"success": boolean | stringifiedBool;
	"profiles": RadiusProfile[];
}

export interface PostPurchaseGuardResponse {
	"success": boolean | stringifiedBool;
	"message": string;
	"data": PurchaseGuardData;
}

export interface GetMeResponse {
	"success": boolean | stringifiedBool;
	"message": string;
	"user": ServerUser;
	"platform": Platform;
	"accounts": Account[];
	"accounts_metadata": PaginatedResourcesMeta;
	"active_account": Account;
}

export interface VerifyTokenResponse {
	"success": boolean | stringifiedBool;
	"user": ServerUser,
	"message": string;
	"platform": Platform;
	"active_account": Account;
	"token": string;
	"token_meta": TokenMeta
}

export interface TwoFAVerifyResponse {
	"success": boolean | stringifiedBool;
	"message": string,
	"user": ServerUser,
	"platform": Platform;
	"active_account": Account;
	"token": string,
	"token_meta": TokenMeta
}

export interface TwoFASetupResponse {
	"success": boolean | stringifiedBool;
	"message": string,
	"user": ServerUser,
	"platform": Platform;
	"active_account": Account;
	"token": string,
	"token_meta": TokenMeta
}

export interface RefreshTokenResponse {
	"success": boolean | stringifiedBool;
	"message": string,
	"user": ServerUser,
	"platform": Platform;
	"active_account": Account;
	"token": string,
	"token_meta": TokenMeta
}
