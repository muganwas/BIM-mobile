import { packages as defaultPackages } from '@/constants';
import { ShowAlert } from '@/helpers';
import { fetchBanks as serviceFetchBanks } from '@/services/BankService';
import { fetchPackages as serviceFetchPackages } from '@/services/PackageService';
import { fetchRouters as serviceFetchRouters } from '@/services/RouterService';
import * as UserService from '@/services/UserService';
import {
	Bank,
	DocumentProps,
	InternetPackage,
	MicroTransaction,
	NetRouter,
	Transaction,
	User,
	VoucherUser,
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
	routers: NetRouter[];
	setRouters: React.Dispatch<React.SetStateAction<NetRouter[]>>;
	banks: Bank[];
	setBanks: React.Dispatch<React.SetStateAction<Bank[]>>;
	documents: DocumentProps[];
	setDocuments: React.Dispatch<React.SetStateAction<DocumentProps[]>>;
	fetchDocuments: (user: User | null) => Promise<void>;
	fetchBanks: (user: User | null) => Promise<void>;
	fetchRouters: (user: User | null) => Promise<NetRouter[]>;
	fetchPackages: (user: User | null) => Promise<void>;
	fetchPurchases: (
		user: User | null,
		routersOverride?: NetRouter[]
	) => Promise<void>;

	// Optional dashboard data provided by the server on successful login
	serverDashboard?: any | null;
	setServerDashboard?: React.Dispatch<React.SetStateAction<any | null>>;
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
	const [routers, setRouters] = useState<NetRouter[]>([]);
	const [banks, setBanks] = useState<Bank[]>([]);
	const [documents, setDocuments] = useState<DocumentProps[]>([]);

	// Dashboard payload returned by server after login (optional)
	const [serverDashboard, setServerDashboard] = useState<any | null>(null);

	const fetchDocuments = useCallback(
		async (user: User | null) => {
			if (!user) return;
			// Prefer typed dashboard data attached to user.dashboard; fall back to root-level payload for compatibility
			const sd = ((user as any)?.dashboard ?? (user as any)) || null;
			if (sd && Array.isArray(sd.documents)) {
				setDocuments(sd.documents as DocumentProps[]);
				return;
			}
			// Try to fetch from backend if available
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
		async (user: User | null) => {
			if (!user) return;
			const sd = ((user as any)?.dashboard ?? (user as any)) || null;
			if (sd && Array.isArray(sd.banks)) {
				setBanks(sd.banks as Bank[]);
				return;
			}
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
		async (user: User | null): Promise<NetRouter[]> => {
			if (!user) return [];
			const sd = ((user as any)?.dashboard ?? (user as any)) || null;
			if (sd && Array.isArray(sd.routerBalances)) {
				setRouters(sd.routerBalances as NetRouter[]);
				return sd.routerBalances as NetRouter[];
			}
			try {
				const res = await serviceFetchRouters(authToken ?? undefined);
				if (res && res.ok) {
					const json = await res.json();
					if (Array.isArray(json)) {
						setRouters(json as NetRouter[]);
						return json as NetRouter[];
					}
				}
			} catch (e) {
				console.error('fetchRouters: failed to fetch from API', e);
			}
			setRouters([]);
			return [];
		},
		[authToken]
	);

	const fetchPackages = useCallback(
		async (user: User | null) => {
			if (!user) return;
			const sd = ((user as any)?.dashboard ?? (user as any)) || null;
			if (sd && Array.isArray(sd.packages)) {
				setPackages(sd.packages as InternetPackage[]);
				return;
			}
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
		async (user: User | null, routersOverride?: NetRouter[]) => {
			if (!user) return;
			const sd = ((user as any)?.dashboard ?? (user as any)) || null;
			if (sd) {
				if (Array.isArray(sd.purchases))
					setPurchases(sd.purchases as MicroTransaction[]);
				if (Array.isArray(sd.voucherUsers))
					setVoucherUsers(sd.voucherUsers as VoucherUser[]);
				return;
			}
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
					if (Array.isArray(sd.recentTransactions))
						setTransactions(sd.recentTransactions as Transaction[]);
					if (Array.isArray(sd.routerBalances))
						setRouters(sd.routerBalances as NetRouter[]);
					// The server may have provided aggregate numbers and chartData that
					// the rest of the app can consume later via `serverDashboard`.
				}

				setLoading(true);
				try {
					// Ensure routers are fetched first so purchases can reference them.
					const routersData = await fetchRouters(user);

					const fetchOperations = [
						{ name: 'Packages', fn: fetchPackages(user) },
						{
							name: 'Micro Transactions',
							fn: fetchPurchases(user, routersData),
						},
						{ name: 'Banks', fn: fetchBanks(user) },
						{ name: 'Documents', fn: fetchDocuments(user) },
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
