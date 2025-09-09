import { packages as defaultPackages } from '@/constants';
import { ShowAlert } from '@/helpers';
import * as factories from '@/helpers/factories';
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
}

const TransactionContext = createContext<TransactionContextType | undefined>(
	undefined
);

export const TransactionProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { user } = useGeneral();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [purchases, setPurchases] = useState<MicroTransaction[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [voucherUsers, setVoucherUsers] = useState<VoucherUser[]>([]);
	const [packages, setPackages] = useState<InternetPackage[]>([]);
	const [routers, setRouters] = useState<NetRouter[]>([]);
	const [banks, setBanks] = useState<Bank[]>([]);
	const [documents, setDocuments] = useState<DocumentProps[]>([]);

	const fetchDocuments = useCallback(async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch documents from the server
			const data = factories.generateDocuments(2);
			setDocuments(data);
		} catch (error: any) {
			ShowAlert(`Failed to fetch documents: ${error.message}`, 'Error');
		}
	}, []);

	const fetchBanks = useCallback(async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch banks from the server
			const data = factories.generateBanks(2);
			setBanks(data);
		} catch (error: any) {
			ShowAlert(`Failed to fetch banks: ${error.message}`, 'Error');
		}
	}, []);

	const fetchRouters = useCallback(
		async (user: User | null): Promise<NetRouter[]> => {
			if (!user) return [];
			try {
				const data = factories.generateNetRouters(3);
				setRouters(data);
				return data;
			} catch (error: any) {
				ShowAlert(`Failed to fetch routers: ${error.message}`, 'Error');
				return [];
			}
		},
		[]
	);

	const fetchPackages = useCallback(async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch internet packages from the server
			// Use project's default packages by default but allow factories to generate if needed
			setPackages(
				defaultPackages.length
					? defaultPackages
					: factories.generateInternetPackages()
			);
		} catch (error: any) {
			ShowAlert(`Failed to fetch internet packages: ${error.message}`, 'Error');
		}
	}, []);

	const fetchPurchases = useCallback(
		async (user: User | null, routersOverride?: NetRouter[]) => {
			if (!user) return;
			try {
				// Generate purchases and related voucher users using factories
				let data = factories.generateMicroTransactions(20);

				// If routers are provided, reconcile purchases so each
				// purchase.routerName references an existing router id.
				const availableRouters =
					routersOverride && routersOverride.length ? routersOverride : [];
				if (availableRouters.length) {
					// Assign each purchase to a router deterministically to avoid
					// format mismatches. Use modulo so counts differ safely.
					data = data.map((p, idx) => ({
						...p,
						routerName: availableRouters[idx % availableRouters.length].id,
					}));
				}
				const vocherUsers = factories.generateVoucherUsersFromPurchases(
					data,
					defaultPackages
				);
				setVoucherUsers(vocherUsers);
				setPurchases(data);
			} catch (error: any) {
				ShowAlert(
					`Failed to fetch micro transactions: ${error.message}`,
					'Error'
				);
			}
		},
		[]
	);

	useEffect(() => {
		(async () => {
			if (user) {
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
