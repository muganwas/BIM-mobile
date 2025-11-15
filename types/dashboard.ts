export interface ChartDataEntry {
	date: string; // ISO date string (e.g. 2025-11-15)
	total: number; // numeric total for charting
}

export interface RouterBalance {
	id: string;
	name: string;
	balance: number;
}

export interface RecentTransaction {
	id: string;
	amount: number;
	created_at: string; // original server timestamp string
	updated_at?: string | null;
	deleted_at?: string | null;
	reason?: string | null;
	router_id?: string | null;
	router?: any;
	status?: string;
	type?: 'credit' | 'debit' | string;
}

export interface DashboardSummary {
	chartData?: ChartDataEntry[];
	monthTransactions?: number;
	monthUsers?: number;
	recentTransactions?: RecentTransaction[];
	routerBalances?: RouterBalance[];
	todayTransactions?: number;
	todayUsers?: number;
	weekTransactions?: number;
	weekUsers?: number;
}

export {};
