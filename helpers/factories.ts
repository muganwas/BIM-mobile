import {
	generateRandomInt,
	generateRandomNumbers,
	generateRandomString,
	randomDateBetweenDaysAgo,
	toLocalISOString,
} from '@/helpers';
import {
	Bank,
	DocumentProps,
	HardWareInfo,
	InternetPackage,
	MicroTransaction,
	NetRouter,
	TransactionMethod,
	TransactionStatus,
	VoucherUser,
} from '@/types';

const packageNames: InternetPackage['name'][] = [
	'short',
	'daily',
	'weekly',
	'monthly',
];

export function generateNetRouter(
	overrides: Partial<NetRouter> = {}
): NetRouter {
	const idx = generateRandomInt(1, 254);
	const id = overrides.id ?? `R-${generateRandomNumbers(6)}`;
	const name = overrides.name ?? `Router ${id}`;
	const location = overrides.location ?? `Location ${generateRandomInt(1, 10)}`;
	const networkInfo = overrides.networkInfo ?? {
		mac: `00:1A:2B:3C:4D:${String(idx).padStart(2, '0')}`,
		ipv4: `192.168.${generateRandomInt(0, 255)}.${idx}`,
		ipv6: `::ffff:192.168.${generateRandomInt(0, 255)}.${idx}`,
		hostname: `router-${id}.local`,
		routerHash: generateRandomString(24),
		uptime: `${generateRandomInt(0, 999999)}`,
		hotspots: Array.from({ length: generateRandomInt(1, 2) }).map(
			(_, hIdx) => ({
				id: `${id}-hs-${hIdx + 1}`,
				ssid: `SSID-${generateRandomNumbers(4)}`,
				interface: `wlan${hIdx}`,
				profile: `default-profile-${hIdx + 1}`,
				status: Math.random() > 0.5 ? 'enabled' : 'disabled',
			})
		),
	};
	const hwOverrides = (overrides.hardwareInfo || {}) as Partial<HardWareInfo>;

	return {
		id,
		name,
		type: overrides.type ?? 'Mikrotik',
		networkInfo,
		hardwareInfo: overrides.hardwareInfo ?? {
			cpuFrequency:
				hwOverrides.cpuFrequency ?? `${generateRandomInt(800, 2400)} MHz`,
			cpuLoad: hwOverrides.cpuLoad ?? `${generateRandomInt(1, 100)}%`,
			totalMemory:
				hwOverrides.totalMemory ?? `${generateRandomInt(128, 2048)} MB`,
			freeMemory: hwOverrides.freeMemory ?? `${generateRandomInt(64, 1024)} MB`,
			storage: hwOverrides.storage ?? `${generateRandomInt(1, 128)} GB`,
			routerOsVersion:
				hwOverrides.routerOsVersion ??
				`RouterOS ${generateRandomInt(6, 7)}.${generateRandomInt(0, 99)}`,
			firmwareVersion:
				hwOverrides.firmwareVersion ??
				`v${generateRandomInt(1, 9)}.${generateRandomInt(
					0,
					9
				)}.${generateRandomInt(0, 99)}`,
			model:
				hwOverrides.model ??
				overrides.model ??
				`Model-${generateRandomNumbers(3)}`,
		},
		transactionBalance:
			overrides.transactionBalance ?? generateRandomInt(10000, 1000000),
		model: overrides.model,
		location,
		firmwareVersion: overrides.firmwareVersion,
		username: overrides.username ?? `admin-${String(id).slice(-4)}`,
		password: overrides.password ?? `pass${generateRandomNumbers(4)}`,
		createdAt: overrides.createdAt,
		updatedAt: overrides.updatedAt,
	};
}

export function generateNetRouters(count = 3, overrides?: Partial<NetRouter>) {
	return Array.from({ length: count }, () => generateNetRouter(overrides));
}

export function generateTransactionMethod(
	overrides: Partial<TransactionMethod> = {}
): TransactionMethod {
	const isMobile = Math.random() > 0.5;
	return {
		id: overrides.id,
		name: overrides.name ?? (isMobile ? 'Mobile Payment' : 'Bank Transfer'),
		type: overrides.type ?? (isMobile ? 'mobile-money' : 'bank-transfer'),
		phoneNumber:
			overrides.phoneNumber ??
			(isMobile ? generateRandomNumbers(10) : undefined),
		accountNumber:
			overrides.accountNumber ??
			(!isMobile ? generateRandomNumbers(10) : undefined),
		cardNumber: overrides.cardNumber,
		accountHolderName: overrides.accountHolderName,
		csv: overrides.csv,
		expiryDate: overrides.expiryDate,
		createdAt: overrides.createdAt,
		updatedAt: overrides.updatedAt,
	};
}

export function generateMicroTransaction(
	overrides: Partial<MicroTransaction> = {}
): MicroTransaction {
	const date = overrides.date ?? randomDateBetweenDaysAgo(6);
	const statuses: TransactionStatus[] = ['completed', 'pending', 'failed'];
	return {
		id: overrides.id ?? generateRandomNumbers(10),
		amount: overrides.amount ?? generateRandomInt(1000, 20000),
		status:
			overrides.status ?? statuses[generateRandomInt(0, statuses.length - 1)],
		routerName: overrides.routerName ?? `Router-${generateRandomNumbers(3)}`,
		date,
		reason: overrides.reason ?? 'wifi',
		description: overrides.description,
		method: overrides.method ?? generateTransactionMethod(),
	} as MicroTransaction;
}

export function generateMicroTransactions(count = 10) {
	return Array.from({ length: count }, () => generateMicroTransaction());
}

export function generateVoucherUserFromPurchase(
	p: MicroTransaction,
	packages: InternetPackage[] = []
): VoucherUser {
	const pkg = packages.length
		? packages[generateRandomInt(0, packages.length - 1)].tag
		: 'short';
	return {
		voucherCode: generateRandomNumbers(6),
		package: pkg,
		status: 'active',
		macAddress: `00:1A:2B:3C:4D:${p.id.slice(0, 2)}`,
		uptime: generateRandomInt(0, 5000),
		bytesIn: generateRandomInt(0, 1000000),
		bytesOut: generateRandomInt(0, 1000000),
		comment: `${toLocalISOString(p.date)}-${p.id}`,
		createdAt: p.date.toDateString(),
	};
}

export function generateVoucherUsersFromPurchases(
	purchases: MicroTransaction[],
	packages: InternetPackage[] = []
) {
	return purchases.map((p) => generateVoucherUserFromPurchase(p, packages));
}

export function generateBank(overrides: Partial<Bank> = {}): Bank {
	const id = overrides.id ?? generateRandomNumbers(6);
	return {
		id,
		name: overrides.name ?? `Bank ${id}`,
		accountNumber: overrides.accountNumber ?? generateRandomNumbers(10),
		accountHolderName: overrides.accountHolderName ?? 'John Doe',
		SWIFTCode: overrides.SWIFTCode,
		currency: overrides.currency ?? 'UGX',
		branch: overrides.branch,
		createdAt: overrides.createdAt,
		updatedAt: overrides.updatedAt,
	};
}

export function generateBanks(count = 2) {
	return Array.from({ length: count }, () => generateBank());
}

export function generateDocument(
	overrides: Partial<DocumentProps> = {}
): DocumentProps {
	const id = overrides.id ?? generateRandomNumbers(6);
	return {
		id,
		name: overrides.name ?? `Document ${id}`,
		type: overrides.type ?? 'pdf',
		url: overrides.url ?? `https://example.com/doc-${id}.pdf`,
		createdAt: overrides.createdAt,
		updatedAt: overrides.updatedAt,
	};
}

export function generateDocuments(count = 2) {
	return Array.from({ length: count }, () => generateDocument());
}

export function generateInternetPackage(
	overrides: Partial<InternetPackage> = {}
): InternetPackage {
	const id = overrides.id ?? generateRandomNumbers(6);
	const name =
		overrides.name ??
		packageNames[generateRandomInt(0, packageNames.length - 1)];
	return {
		id,
		tag: overrides.tag ?? `pkg-${id}`,
		name,
		price: overrides.price ?? generateRandomInt(100, 5000),
		bandwidth:
			overrides.bandwidth ??
			`${generateRandomInt(1, 100)} MBps/${generateRandomInt(1, 100)} MBps`,
		duration:
			overrides.duration ??
			(name === 'short'
				? 1
				: name === 'daily'
				? 24
				: name === 'weekly'
				? 168
				: 720),
		createdAt: overrides.createdAt ?? new Date(),
		updatedAt: overrides.updatedAt ?? new Date(),
	};
}

export function generateInternetPackages(count = 4) {
	return Array.from({ length: count }, () => generateInternetPackage());
}

export default {
	generateNetRouter,
	generateNetRouters,
	generateMicroTransaction,
	generateMicroTransactions,
	generateVoucherUserFromPurchase,
	generateVoucherUsersFromPurchases,
	generateBank,
	generateBanks,
	generateDocument,
	generateDocuments,
	generateInternetPackage,
	generateInternetPackages,
};
