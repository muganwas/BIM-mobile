import { packages as defaultPackages } from '@/constants';
import { generateRandomNumbers, ShowAlert, toLocalISOString } from '@/helpers';
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
import { createContext, useContext, useEffect, useState } from 'react';
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
	fetchRouters: (user: User | null) => Promise<void>;
	fetchPackages: (user: User | null) => Promise<void>;
	fetchVoucherUsers: (user: User | null) => Promise<void>;
	fetchPurchases: (user: User | null) => Promise<void>;
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

	useEffect(() => {
		(async () => {
			if (user) {
				setLoading(true);
				try {
					const fetchOperations = [
						{
							name: 'Micro Transactions',
							fn: fetchPurchases(user),
						},
						{ name: 'Voucher Users', fn: fetchVoucherUsers(user) },
						{ name: 'Packages', fn: fetchPackages(user) },
						{ name: 'Routers', fn: fetchRouters(user) },
						{ name: 'Banks', fn: fetchBanks(user) },
						{ name: 'Documents', fn: fetchDocuments(user) },
					];

					const results = await Promise.allSettled(
						fetchOperations.map((op) => op.fn)
					);

					// Log detailed results
					results.forEach((result, index) => {
						const operationName = fetchOperations[index].name;
						if (result.status === 'rejected') {
							console.error(`Failed to fetch ${operationName}:`, result.reason);
						} else {
							console.log(`Successfully fetched ${operationName}`);
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
	}, [user]);

	const fetchDocuments = async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch documents from the server
			const data: DocumentProps[] = [
				{
					id: '1',
					name: 'ID document',
					type: 'pdf',
					url: 'https://example.com/sample.pdf',
				},
				{
					id: '2',
					name: 'trading license',
					type: 'pdf',
					url: 'https://example.com/image.jpg',
				},
			];
			setDocuments(data);
		} catch (error: any) {
			ShowAlert(`Failed to fetch documents: ${error.message}`, 'Error');
		}
	};

	const fetchBanks = async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch banks from the server
			const data: Bank[] = [
				{
					id: '1',
					name: 'Bank of Example',
					accountNumber: '1234567890',
					accountHolderName: 'John Doe',
					SWIFTCode: 'BOEX1234',
				},
				{
					id: '2',
					name: 'Example Savings Bank',
					accountNumber: '0987654321',
					accountHolderName: 'Jane Doe',
					SWIFTCode: 'ESB1234',
				},
			];
			setBanks(data);
		} catch (error: any) {
			ShowAlert(`Failed to fetch banks: ${error.message}`, 'Error');
		}
	};

	const fetchRouters = async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch routers from the server
			const location = ['Mukono', 'Najjera', 'Kampala', 'Entebbe', 'Jinja'];
			const data: NetRouter[] = Array(5)
				.fill(null)
				.map((_, index) => ({
					ip: `192.168.1.${index + 1}`,
					mac: `00:1A:2B:3C:4D:${index + 1}`,
					name: `Router ${index + 1}`,
					location: location[index % location.length],
				}));
			setRouters(data);
		} catch (error: any) {
			ShowAlert(`Failed to fetch routers: ${error.message}`, 'Error');
		}
	};

	const fetchPackages = async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch internet packages from the server
			setPackages(defaultPackages);
		} catch (error: any) {
			ShowAlert(`Failed to fetch internet packages: ${error.message}`, 'Error');
		}
	};

	const fetchVoucherUsers = async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch voucher users from the server
			const today = new Date();
			const data: VoucherUser[] = Array(10)
				.fill(null)
				.map((_, index) => ({
					voucherCode: generateRandomNumbers(6),
					package:
						defaultPackages[Math.floor(Math.random() * defaultPackages.length)]
							.tag,
					status: 'active',
					macAddress: `00:1A:2B:3C:4D:${index + 1}`,
					uptime: Math.floor(Math.random() * 1000),
					bytesIn: Math.floor(Math.random() * 1000000),
					bytesOut: Math.floor(Math.random() * 1000000),
					comment: toLocalISOString(today) + '-' + index,
					createdAt: today.toDateString(),
				}));
			setVoucherUsers(data);
		} catch (error: any) {
			ShowAlert(`Failed to fetch voucher users: ${error.message}`, 'Error');
		}
	};

	const fetchPurchases = async (user: User | null) => {
		if (!user) return;
		try {
			// Fetch micro transactions from the server
			const data: MicroTransaction[] = [
				{
					id: generateRandomNumbers(10),
					amount: 1000,
					date: new Date(),
					status: 'completed',
					reason: 'wifi',
					routerName: 'Kisa-1',
					method: {
						type: 'mobile-money',
						name: 'Mobile Payment',
						phoneNumber: '0750941137',
					}, // Example method
				},
				{
					id: generateRandomNumbers(10),
					amount: 5000,
					date: new Date(),
					status: 'pending',
					reason: 'wifi',
					routerName: 'Najjeera-1',
					method: {
						type: 'bank-transfer',
						name: 'Bank Transfer',
						accountNumber: '1234567890',
					}, // Example method
				},
				{
					id: generateRandomNumbers(10),
					amount: 20000,
					date: new Date(),
					status: 'completed',
					reason: 'wifi',
					routerName: 'Najjeera-1',
					method: {
						type: 'mobile-money',
						name: 'Mobile Payment',
						phoneNumber: '0750941137',
					}, // Example method
				},
			];
			setPurchases(data);
		} catch (error: any) {
			ShowAlert(
				`Failed to fetch micro transactions: ${error.message}`,
				'Error'
			);
		}
	};
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
				fetchVoucherUsers,
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
