import { ChartDataEntry, RecentTransaction, RouterBalance } from './dashboard';
import { ServerUser, UserProfile, VoucherUser } from './security';
export * from './dashboard';
export * from './security';

export type headerOptions =
	| 'notifications'
	| 'profile'
	| 'language'
	| 'search'
	| undefined;
export type stringifiedBool = "true" | "false";

/* ------------------------------------------------------------------------- *
 * API 2.0 response envelope.
 * Every JSON response from the backend is wrapped as:
 *   { success, message, data, meta, operation, errors }
 * Response interfaces below extend `ApiEnvelope<...>` and describe `data`.
 * ------------------------------------------------------------------------- */

/** Field level validation errors returned by the API (`errors` key of the envelope). */
export type ApiErrors = Record<string, string | string[] | Record<string, unknown>> | null;

/** Pagination numbers for a single paginated collection. */
export interface PaginationMeta {
	current_page?: number;
	per_page?: number;
	total?: number;
	last_page?: number;
	first_item?: number | null;
	last_item?: number | null;
}

/**
 * `meta.pagination` is keyed by collection name — e.g.
 * `{ pagination: { active: { total, per_page, current_page, last_page } } }`.
 */
export type PaginationGroups = Record<string, PaginationMeta>;

export interface ApiMeta {
	/** Keyed collection blocks, or a single block for older/flat responses. */
	pagination?: PaginationGroups | PaginationMeta;
}

export type ApiOperationState =
	| 'queued'
	| 'processing'
	| 'done'
	| 'error'
	| 'cancelled';

/** Lifecycle information for queued (202) router operations. */
export interface ApiOperation {
	state?: ApiOperationState;
	cache_key?: string;
	poll_url?: string;
	retry_after?: number;
	progress?: {
		pages_total?: number;
		pages_ready?: number;
		[key: string]: unknown;
	};
	page_number?: number;
	page_metadata?: Record<string, unknown>;
	started_at?: string;
	updated_at?: string;
	finished_at?: string;
	timestamps?: {
		started_at?: string;
		updated_at?: string;
		finished_at?: string;
	};
	cached?: {
		has_status?: boolean;
		has_meta?: boolean;
		has_result?: boolean;
	};
	duration?: { seconds?: number; human?: string; in_progress?: boolean };
	pages?: { total?: number; ready?: number; available?: number[] };
	meta?: Record<string, unknown>;
	error?: string;
}

/** Envelope shared by every API 2.0 JSON response. */
export interface ApiEnvelope<TData = unknown> {
	success: boolean | stringifiedBool;
	message?: string;
	data?: TData | null;
	meta?: ApiMeta;
	operation?: ApiOperation;
	errors?: ApiErrors;
}

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

/** Router as returned by API 2.0 (`Router` / `RouterWithWireguardKey`). */
export interface ApiRouter {
	"id": string;
	"name": string;
	"location": string;
	"type": string;
	"ip_address": string;
	"router_user": string;
	/** Router credit balance in the account currency. */
	"balance": number;
	"user_id": number;
	"notify_existing_voucher"?: boolean;
	"created_at": string;
	"updated_at": string;
	/** Only sent by the list/detail endpoints (`RouterWithWireguardKey`). */
	"wireguard_public_key"?: string;
	/** Not returned by API 2.0 — kept optional for the router edit form. */
	"router_password"?: string;
	"last_system_info"?: RouterSystemInfo;
	"last_heartbeat_at"?: string;
	"isp_id"?: string;
	"device_id"?: string;
	"auth_key"?: string;
	"hotspot_dns"?: string;
}

/** `GET /routers` */
export type GetRoutersResponse = ApiEnvelope<{ routers: ApiRouter[] }>;

export type InternetPackageName = 'short' | 'daily' | 'weekly' | 'monthly';

/**
 * MikroTik hotspot profile shape used by the voucher screens.
 * This is an app level model — API 2.0 exposes RADIUS plans through
 * `GET /profiles` (see `SharedRadiusProfile`).
 * @deprecated prefer `InternetPackage`
 */
export type RadiusProfile = InternetPackage;

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
	/** Populated when the profile was mapped from `GET /profiles`. */
	price?: number | null;
	shared?: boolean;
}

/** Shared RADIUS plan returned by `GET /profiles` (API 2.0 `RadiusProfile` schema). */
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

/** `GET /packages` */
export type GetPortalPackagesResponse = ApiEnvelope<{
	scope: 'visible' | 'global' | 'owner' | 'all';
	packages: PortalPackage[];
	}>;

/** `GET /packages/{package}/routers` */
export type GetPackageRoutersResponse = ApiEnvelope<{
	package_id: string;
	routers: PackageRouter[];
	rate_limits: Record<string, PackageRateLimit>;
	visibility?: Record<string, unknown>[];
	}>;

/** `GET /profiles` */
export type GetSharedRadiusProfilesResponse = ApiEnvelope<{ scope: 'shared'; profiles: SharedRadiusProfile[] }>;

/** `GET|POST /packages/trial/{router}` */
export type GetTrialSettingsResponse = ApiEnvelope<{ trial_settings: TrialSettings }>;

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
	/** Payment gateway that processed the transaction (`YO`, `Relworx`, …). */
	gateway?: string | null;
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

export type PurchaseGuardData = {
	"router_id"?: string;
	"notify_existing_voucher": boolean;
}

/** Platform role block (`PlatformRole` schema) returned by the identity endpoints. */
export interface Platform {
	/** `admin`, `staff`, `owner`, … — kept open because account roles reuse this block. */
	"role": string;
	"role_label": string;
	"is_admin": boolean | stringifiedBool;
	"is_staff": boolean | stringifiedBool;
	"is_blog_editor": boolean | stringifiedBool;
	"blog_editor_scope"?: string;
	"can_write_blog_content": boolean | stringifiedBool;
}

export interface OnboardingState {
	completed?: string[];
	dismissed?: string[];
}

export interface TokenMeta {
	"id": string;
	"name": string;
	"abilities": string[];
	"last_used_at"?: string;
	"created_at"?: string;
	"expires_at"?: string;
}

/** Account (organisation) block returned inside the identity payload. */
export interface Account {
	"id": number;
	"name": string;
	"type": 'admin' | 'business';
	"type_label": string;
	"is_admin_account": boolean;
	"role": string;
	"role_label": string;
	"is_cosignatory": boolean;
	"is_active": boolean;
	"joined_at": string;
}

/** `data` of `GET /dashboard` */
export interface DashboardData {
	recentTransactions?: RecentTransaction[];
	todayTransactions?: number;
	weekTransactions?: number;
	monthTransactions?: number;
	todayUsers?: number;
	weekUsers?: number;
	monthUsers?: number;
	routerBalances?: RouterBalance[];
	chartData?: ChartDataEntry[];
}

/** `GET /dashboard` and `GET /dashboard/refresh` */
export type GetDashboardResponse = ApiEnvelope<DashboardData>;

/** Router resource record returned by `GET /routers/{router}/status`. */
export interface RouterStatusRecord {
	uptime?: string;
	version?: string;
	'cpu-load'?: string;
	'free-memory'?: string;
	'total-memory'?: string;
	'free-hdd-space'?: string;
	'total-hdd-space'?: string;
	'architecture-name'?: string;
	'board-name'?: string;
	platform?: string;
}

/** `GET /routers/{router}/status` (200 — cached read) */
export type GetRouterStatusResponse = ApiEnvelope<{
	router?: ApiRouter;
	status?: RouterStatusRecord | null;
	}>;

/** `GET /routers/{router}/status` (202 — a read was queued, poll with `cache_key`). */
export type GetRouterStatusQueuedResponse = ApiEnvelope<{
	status?: string;
	cache_key?: string;
	retry_after?: number;
	}>;

/** `GET /routers/{router}/hotspots` */
export type GetRouterHotspotsResponse = ApiEnvelope<{
	router?: ApiRouter;
	hotspots?: Hotspot[];
	status?: RouterStatusRecord | null;
	pending?: boolean;
	retry_after?: number | null;
	}>;

/** `GET /routers/{router}/hotspot-cookies` */
export type GetRouterCookiesResponse = ApiEnvelope<{
	router?: ApiRouter;
	cookies?: Cookie[];
	cookies_links?: string;
	}>;

/** `GET /routers/{router}/hotspots/active` */
export type GetRouterActiveUsersResponse = ApiEnvelope<{
	router?: ApiRouter;
	active?: HotspotActiveUser[];
	active_links?: string;
	}>;

/** `GET /routers/{router}/hotspots/users` */
export type GetRouterUsersResponse = ApiEnvelope<{
	router?: ApiRouter;
	users?: HotspotUser[];
	users_links?: string;
	}>;

/** `GET /routers/{router}/hosts` */
export type GetRouterHostsResponse = ApiEnvelope<{
	router?: ApiRouter;
	hosts?: Host[];
	hosts_links?: string;
	}>;

/** `GET /routers/{router}/dhcp/leases` */
export type GetRouterDHCPLeasesResponse = ApiEnvelope<{
	router?: ApiRouter;
	leases?: DHCPLease[];
	leases_links?: string;
	}>;

/** A network interface as returned by `GET /routers/{router}/interfaces`. */
export interface RouterInterface {
	name?: string;
	'default-name'?: string;
	type?: string;
	'interface'?: string;
	running?: boolean | stringifiedBool;
	disabled?: boolean | stringifiedBool;
	'rx-byte'?: number | string;
	'tx-byte'?: number | string;
}

/** `GET /routers/{router}/interfaces` */
export type GetRouterInterfacesResponse = ApiEnvelope<{
	router?: ApiRouter;
	interfaces?: RouterInterface[];
	}>;

/** `GET /routers/{router}` */
export type GetRouterResponse = ApiEnvelope<{ router?: ApiRouter }>;

/** `GET|POST /routers/{router}/purchase-guard` */
export type GetPurchaseGuardResponse = ApiEnvelope<{ purchase_guard: PurchaseGuardData }>;

/** `POST /routers/{router}/purchase-guard` */
export type PostPurchaseGuardResponse = ApiEnvelope<{ purchase_guard: PurchaseGuardData }>;

/** `GET|POST /profiles/{profile}` — RADIUS plans. */
export type GetRadiusProfileResponse = ApiEnvelope<{ profiles: SharedRadiusProfile[] }>;

/** `GET /routers/{router}/ping` */
export type PingRouterResponse = ApiEnvelope<{
	online?: boolean;
	router?: { id?: string; name?: string; ip?: string };
	}>;

/** Identity payload (`IdentityContextResponse` schema). */
export interface IdentityContext {
	user?: ServerUser;
	platform?: Platform;
	accounts?: Account[];
	active_account?: Account;
	home_url?: string;
}

/** `GET /me` and `GET /user` */
export type GetMeResponse = ApiEnvelope<IdentityContext>;

/** `GET /profile` */
export type GetProfileResponse = ApiEnvelope<{ user: UserProfile; accounts: Account[] }>;

/** Session payload (`AuthTokenResponse` schema). */
export interface AuthSession {
	user: ServerUser;
	platform?: Platform;
	active_account?: Account;
	accounts?: Account[];
	token: string;
	token_meta?: TokenMeta;
	redirect?: string;
}

/** 2FA challenge payload returned by `POST /login` when TOTP is required. */
export interface TOTPRequiredData {
	redirect?: string;
	phone?: string;
}

/** Setup payload returned by `POST /login`, `POST /verify-otp` and `GET /2fa-setup`. */
export interface TotpSetupData {
	user?: ServerUser;
	platform?: Platform;
	active_account?: Account;
	accounts?: Account[];
	phone?: string;
	setup_token?: string;
	secret?: string;
	qr?: string;
	qr_base64?: string;
	message?: string;
}

/** `POST /login` (200 — TOTP required or TOTP setup required) */
export type LoginResponse = ApiEnvelope<TOTPRequiredData | TotpSetupData>;

/** `POST /register` */
export type RegisterResponse = ApiEnvelope<{ phone?: string }>;

/** `POST /verify-otp` (200 — TOTP setup required) */
export type VerifyOtpResponse = ApiEnvelope<TotpSetupData>;

/** `GET /2fa-setup` (provisioning data for API clients) */
export type GetTwoFASetupResponse = ApiEnvelope<{ qr?: string; qr_base64?: string; secret?: string }>;

/** `GET /token/verify` */
export type VerifyTokenResponse = ApiEnvelope<AuthSession>;

/** `POST /token/refresh` */
export type RefreshTokenResponse = ApiEnvelope<AuthSession>;

/** `POST /2fa-verify` */
export type TwoFAVerifyResponse = ApiEnvelope<AuthSession>;

/** `POST /2fa-setup` */
export type TwoFASetupResponse = ApiEnvelope<AuthSession>;

/** `POST /logout` */
export type LogoutResponse = ApiEnvelope<null>;

/** `POST /2fa-setup` or `POST /2fa-verify` failure payload. */
export type AuthFailureResponse = ApiEnvelope<null>;

/* ----------------------------- records ----------------------------- */

/** `Bank` schema — `GET /banks` */
export interface ApiBank {
	id: number;
	user_id: number;
	bank_name: string;
	account_number: string;
	phone?: string;
	swift_code?: string;
	bank_branch?: string;
	created_at?: string;
	updated_at?: string;
}

/** `GET /banks` */
export type GetBanksResponse = ApiEnvelope<{ banks: ApiBank[] }>;

/** `Document` schema — `GET /documents` */
export interface ApiDocument {
	id: number;
	user_id: number;
	type: string;
	number?: string;
	attachment?: string;
	status: 'pending' | 'approved' | 'rejected';
	created_at?: string;
	updated_at?: string;
}

/** `GET /documents` */
export type GetDocumentsResponse = ApiEnvelope<{ documents: ApiDocument[] }>;

/** `Transaction` schema — rows of `GET /transactions`. */
export interface ApiTransaction {
	id: string;
	router_id?: string;
	type: 'credit' | 'debit';
	/** The API serialises money as a decimal string (`"1000.00"`). */
	amount: number | string;
	reason?: string;
	status?: string;
	created_at?: string;
	router_name?: string;
	transaction_date?: string;
	/** Payment gateway that processed the transaction (`YO`, `Relworx`, …). */
	gateway?: string | null;
}

/** Paginated transaction collection (Laravel paginator shape). */
export interface PaginatedCollection<T> {
	current_page?: number;
	data?: T[];
	first_page_url?: string | null;
	from?: number | null;
	last_page?: number;
	last_page_url?: string | null;
	next_page_url?: string | null;
	path?: string;
	per_page?: number;
	prev_page_url?: string | null;
	to?: number | null;
	total?: number;
}

/** `GET /transactions` */
export type GetTransactionsResponse = ApiEnvelope<{
	transactions: PaginatedCollection<ApiTransaction>;
	total_amount: number;
}>;

/** `GET /connector` */
export type GetConnectorKeysResponse = ApiEnvelope<{ keys: WireguardKey[] }>;

/** `POST|GET|PUT /connector/{id}` */
export type GetConnectorKeyResponse = ApiEnvelope<{ key: WireguardKey }>;

/** WireGuard key record (`WireguardKey` schema) returned by `/connector`. */
export interface WireguardKey {
	id: string;
	user_id?: number;
	key_name: string;
	router_private_key?: string;
	router_public_key?: string;
	server_public_key?: string;
	host_address?: string;
	host_port?: number;
	host_port_observed?: number;
	observed_endpoint_address?: string;
	observed_endpoint_port?: number;
	endpoint_address?: string;
	endpoint_port?: number;
	ip_address?: string;
	my_address?: string;
	status?: 'active' | 'inactive' | 'pending' | string;
	radius_secret?: string;
	radius_nas_shortname?: string;
	radius_nas_type?: string;
	radius_ports?: string;
	radius_description?: string | null;
	last_handshake_at?: string | null;
	router_id?: string;
	created_at?: string;
	updated_at?: string;
}
