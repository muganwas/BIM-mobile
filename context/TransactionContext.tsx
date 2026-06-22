import { packages as defaultPackages } from '@/constants';
import { ShowAlert } from '@/helpers';
import { fetchBanks as serviceFetchBanks } from '@/services/BankService';
import { fetchPackages as serviceFetchPackages } from '@/services/PackageService';
import { fetchRouters as serviceFetchRouters } from '@/services/RouterService';
import * as UserService from '@/services/UserService';
import {
	Bank,
	DocumentProps,
	GetRoutersResponse,
	InternetPackage,
	MicroTransaction,
	Transaction,
	VoucherUser
} from '@/types';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { useGeneral } from './GeneralContext';

export interface TransactionContextType {
	transactions: Transaction[];
	setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
	purchases: MicroTransaction[];
	setPurchases: React.Dispatch<React.SetStateAction<MicroTransaction[]>>;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	voucherUsers: VoucherUser[];
	setVoucherUsers: React.Dispatch<React.SetStateAction<VoucherUser[]>>;
	packages: InternetPackage[];
	setPackages: React.Dispatch<React.SetStateAction<InternetPackage[]>>;
	routers: GetRoutersResponse | null;
	setRouters: React.Dispatch<React.SetStateAction<GetRoutersResponse | null>>;
	banks: Bank[];
	setBanks: React.Dispatch<React.SetStateAction<Bank[]>>;
	documents: DocumentProps[];
	setDocuments: React.Dispatch<React.SetStateAction<DocumentProps[]>>;
	fetchDocuments: () => Promise<void>;
	fetchBanks: () => Promise<void>;
	fetchRouters: () => Promise<GetRoutersResponse | null>;
	fetchPackages: () => Promise<void>;
	fetchPurchases: () => Promise<void>;

	// Optional dashboard data provided by the server on successful login
	serverDashboard?: any | null;
	setServerDashboard?: React.Dispatch<React.SetStateAction<any | null>>;

	// Server-provided dashboard metrics exposed for the UI (populated when server dashboard present)
	dailyPurchasesTotal?: number;
	weeklyPurchasesTotal?: number;
	monthlyPurchasesTotal?: number;
	lastSevenDaysPurchases?: { date: Date; day: string; amount: number }[];
	lastFiveTransactions?: MicroTransaction[];
	purchasesPerRouter?: { name: string; location: string; amount: number }[];
	// Voucher metrics
	dailyVoucherUsersTotal?: number;
	weeklyVoucherUsersTotal?: number;
	monthlyVoucherUsersTotal?: number;
	lastSevenVoucherUsers?: VoucherUser[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(
	undefined
);

export const TransactionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { user, authToken } = useGeneral();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [purchases, setPurchases] = useState<MicroTransaction[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [voucherUsers, setVoucherUsers] = useState<VoucherUser[]>([]);
	const [packages, setPackages] = useState<InternetPackage[]>([]);
	const [routers, setRouters] = useState<GetRoutersResponse | null>(null);
	const [banks, setBanks] = useState<Bank[]>([]);
	const [documents, setDocuments] = useState<DocumentProps[]>([]);

	// Dashboard payload returned by server after login (optional)
	const [serverDashboard, setServerDashboard] = useState<any | null>(null);

	// UI-friendly metrics derived from server dashboard (if provided)
	const [dailyPurchasesTotal, setDailyPurchasesTotal] = useState<number>(0);
	const [weeklyPurchasesTotal, setWeeklyPurchasesTotal] = useState<number>(0);
	const [monthlyPurchasesTotal, setMonthlyPurchasesTotal] = useState<number>(0);
	const [lastSevenDaysPurchases, setLastSevenDaysPurchases] = useState<
		{
			date: Date;
			day: string;
			amount: number;
		}[]
	>([]);
	const [lastFiveTransactions, setLastFiveTransactions] = useState<
		MicroTransaction[]
	>([]);
	const [purchasesPerRouter, setPurchasesPerRouter] = useState<
		{
			name: string;
			location: string;
			amount: number;
		}[]
	>([]);

	// Voucher metrics
	const [dailyVoucherUsersTotal, setDailyVoucherUsersTotal] =
		useState<number>(0);
	const [weeklyVoucherUsersTotal, setWeeklyVoucherUsersTotal] =
		useState<number>(0);
	const [monthlyVoucherUsersTotal, setMonthlyVoucherUsersTotal] =
		useState<number>(0);
	const [lastSevenVoucherUsers, setLastSevenVoucherUsers] = useState<
		VoucherUser[]
	>([]);

	const fetchDocuments = useCallback(
		async () => {
			try {
				const res = await UserService.fetchDocuments(authToken ?? undefined);
				if (res && res.ok) {
					const json = await res.json();
					if (Array.isArray(json)) {
						setDocuments(json as DocumentProps[]);
						return;
					}
				}
			} catch (e) {
				console.error('fetchDocuments: failed to fetch from API', e);
			}
			setDocuments([]);
		},
		[authToken]
	);

	const fetchBanks = useCallback(
		async () => {
			try {
				const res = await serviceFetchBanks(authToken ?? undefined);
				if (res && res.ok) {
					const json = await res.json();
					if (Array.isArray(json)) {
						setBanks(json as Bank[]);
						return;
					}
				}
			} catch (e) {
				console.error('fetchBanks: failed to fetch from API', e);
			}
			setBanks([]);
		},
		[authToken]
	);

	const fetchRouters = useCallback(
		async (): Promise<GetRoutersResponse | null> => {
			try {
				const res = await serviceFetchRouters(authToken ?? undefined);
				if (res && res.ok) {
					const json = await res.json();
					if (json?.routers?.data && Array.isArray(json.routers.data)) {
						setRouters(json as GetRoutersResponse);
						return json as GetRoutersResponse;
					}
				}
			} catch (e) {
				console.error('fetchRouters: failed to fetch from API', e);
			}
			setRouters(null);
			return null;
		},
		[authToken]
	);

	const fetchPackages = useCallback(
		async () => {
			try {
				const res = await serviceFetchPackages(authToken ?? undefined);
				if (res && res.ok) {
					const json = await res.json();
					if (Array.isArray(json)) {
						setPackages(json as InternetPackage[]);
						return;
					}
				}
			} catch (e) {
				console.error('fetchPackages: failed to fetch from API', e);
			}
			// Fallback to project defaults
			setPackages(defaultPackages || []);
		},
		[authToken]
	);

	const fetchPurchases = useCallback(
		async () => {
			try {
				const res = await UserService.fetchPurchases(authToken ?? undefined);
				if (res && res.ok) {
					const json = await res.json();
					if (Array.isArray(json.purchases))
						setPurchases(json.purchases as MicroTransaction[]);
					if (Array.isArray(json.voucherUsers))
						setVoucherUsers(json.voucherUsers as VoucherUser[]);
					return;
				}
			} catch (e) {
				console.error('fetchPurchases: failed to fetch from API', e);
			}
			setPurchases([]);
			setVoucherUsers([]);
		},
		[authToken]
	);

	useEffect(() => {
		(async () => {
			if (user) {
				// If the backend returned pre-computed dashboard data with the user
				// prefer it as the initial state rather than generating local mock data.
				const sd = ((user as any)?.dashboard ?? (user as any)) || null;
				if (
					sd &&
					(sd.recentTransactions ||
						sd.todayTransactions !== undefined ||
						sd.routerBalances ||
						sd.chartData)
				) {
					setServerDashboard(sd);
					try {
						setDailyPurchasesTotal(Number(sd.todayTransactions) || 0);
						setWeeklyPurchasesTotal(Number(sd.weekTransactions) || 0);
						setMonthlyPurchasesTotal(Number(sd.monthTransactions) || 0);
						if (Array.isArray(sd.chartData)) {
							setLastSevenDaysPurchases(
								sd.chartData.map((c: any) => ({
									date: new Date(c.date),
									day: new Date(c.date).toLocaleDateString('en-US', {
										weekday: 'long',
									}),
									amount: Number(c.total) || 0,
								}))
							);
						}
						if (Array.isArray(sd.recentTransactions)) {
							setLastFiveTransactions(
								sd.recentTransactions.slice(0, 5).map((rt: any) => ({
									id: rt.id ?? String(rt.created_at || Math.random()),
									amount: Number(rt.amount) || 0,
									status: rt.status || 'completed',
									routerName: rt.router_name ||
										rt.router_id ||
										'',
									date: rt.created_at ? new Date(rt.created_at) : new Date(),
									reason: rt.reason || 'other',
									description: undefined,
									method: { type: rt.type || 'mobile-money' },
								}))
							);
						}
						if (Array.isArray(sd.routerBalances)) {
							setPurchasesPerRouter(
								sd.routerBalances.map((rb: any) => ({
									name: rb.name,
									location: rb.location ?? '',
									amount: Number(rb.balance) || 0,
								}))
							);
						}
						setDailyVoucherUsersTotal(Number(sd.todayUsers) || 0);
						setWeeklyVoucherUsersTotal(Number(sd.weekUsers) || 0);
						setMonthlyVoucherUsersTotal(Number(sd.monthUsers) || 0);
						if (Array.isArray(sd.voucherUsers)) {
							setLastSevenVoucherUsers(
								sd.voucherUsers.slice(0, 7) as VoucherUser[]
							);
						}
					} catch (e) {
						console.error(
							'TransactionContext: failed to map server dashboard metrics',
							e
						);
					}
				}

				setLoading(true);
				try {
					// Ensure routers are fetched first so purchases can reference them.
					const routersData = await fetchRouters();

					const fetchOperations = [
						{ name: 'Packages', fn: fetchPackages() },
						{
							name: 'Micro Transactions',
							fn: fetchPurchases(),
						},
						{ name: 'Banks', fn: fetchBanks() },
						{ name: 'Documents', fn: fetchDocuments() },
					];

					const results = await Promise.allSettled(
						fetchOperations.map((op) => op.fn)
					);

					// Log errors if any; successful fetches are not noisy in production
					results.forEach((result, index) => {
						const operationName = fetchOperations[index].name;
						if (result.status === 'rejected') {
							console.error(`Failed to fetch ${operationName}:`, result.reason);
						}
					});

					const failures = results.filter(
						(result) => result.status === 'rejected'
					);

					if (failures.length > 0) {
						ShowAlert(
							`Failed to load ${failures.length} out of ${results.length} data sources`,
							'Error'
						);
					}
				} catch (error) {
					console.error('Unexpected error during data fetching:', error);
					ShowAlert('Unexpected error occurred while loading data', 'Error');
				} finally {
					setLoading(false);
				}
			}
		})();
	}, [
		user,
		fetchRouters,
		fetchPackages,
		fetchPurchases,
		fetchBanks,
		fetchDocuments,
	]);
	return (
		<TransactionContext.Provider
			value={{
				transactions,
				setTransactions,
				purchases,
				setPurchases,
				voucherUsers,
				setVoucherUsers,
				packages,
				loading,
				setLoading,
				setPackages,
				routers,
				setRouters,
				banks,
				setBanks,
				documents,
				setDocuments,
				fetchBanks,
				fetchDocuments,
				fetchRouters,
				fetchPackages,
				fetchPurchases,
				serverDashboard,
				setServerDashboard,
				// Dashboard-derived UI metrics
				dailyPurchasesTotal,
				weeklyPurchasesTotal,
				monthlyPurchasesTotal,
				lastSevenDaysPurchases,
				lastFiveTransactions,
				purchasesPerRouter,
				// Voucher metrics
				dailyVoucherUsersTotal,
				weeklyVoucherUsersTotal,
				monthlyVoucherUsersTotal,
				lastSevenVoucherUsers,
			}}
		>
			{children}
		</TransactionContext.Provider>
	);
};

export const useTransaction = () => {
	const context = useContext(TransactionContext);
	if (!context) {
		throw new Error('useTransaction must be used within a TransactionProvider');
	}
	return context;
};
