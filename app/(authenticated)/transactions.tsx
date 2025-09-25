import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import ThemedDatePicker from '@/components/ThemedDatePicker';
import { ThemedDropdown } from '@/components/ThemedDropdown';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { formatAmount } from '@/helpers';
import useTrackHistory from '@/hooks/useTrackHistory';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function TransactionsScreen() {
	useTrackHistory('/(authenticated)/transactions');
	const colorScheme = useColorScheme() ?? 'light';
	const { purchases, fetchPurchases } = useTransaction();
	const { user, language } = useGeneral();
	const t = translations[language].categories.transactions;

	// Filters state
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [status, setStatus] = useState<string>(t.all);
	const [type, setType] = useState<string>(t.all);

	// Dropdown local
	const [showStatusDd, setShowStatusDd] = useState(false);
	const [showTypeDd, setShowTypeDd] = useState(false);
	const statusOptions = useMemo(() => [t.all, t.pending, t.approved], [t]);
	const typeOptions = useMemo(() => [t.all, t.debit, t.credit], [t]);

	// Refs for dropdown containers (avoid any-casts)
	const statusDdRef = useRef<View>(null);
	const typeDdRef = useRef<View>(null);

	// When language changes, reset default selections to "All"
	useEffect(() => {
		setStatus(t.all);
		setType(t.all);
	}, [t.all]);

	// Pagination
	const [page, setPage] = useState(1);
	const pageSize = 10;

	useEffect(() => {
		if (user && purchases.length === 0) {
			(async () => {
				await fetchPurchases(user);
			})();
		}
	}, [user, purchases, fetchPurchases]);

	// Derived filtered/paginated data
	const filtered = useMemo(() => {
		return purchases.filter((p) => {
			const inStart = startDate ? p.date >= startDate : true;
			const inEnd = endDate ? p.date <= endDate : true;
			const matchesStatus =
				!status || status.toLowerCase() === t.all.toLowerCase()
					? true
					: p.status.toLowerCase() === status.toLowerCase();
			const matchesType =
				!type || type.toLowerCase() === t.all.toLowerCase()
					? true
					: p.method.type.toLowerCase() === type.toLowerCase();
			return inStart && inEnd && matchesStatus && matchesType;
		});
	}, [purchases, startDate, endDate, status, type, t.all]);

	const totalBalance = useMemo(
		() => filtered.reduce((sum, p) => sum + (p.amount || 0), 0),
		[filtered]
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page]);

	// Predefine table headers (so metadata like length is known before render)
	const txHeaders = useMemo(
		() => [
			{ key: 'hash', label: t.colHash, width: 30 },
			{ key: 'amount', label: t.colAmount, width: 120 },
			{ key: 'type', label: t.colType, width: 120 },
			{ key: 'reason', label: t.colReason, width: 120 },
			{ key: 'status', label: t.colStatus, width: 120 },
			{ key: 'router', label: t.colRouterName, width: 120 },
			{ key: 'date', label: t.colTransactionDate, width: 120 },
		],
		[t]
	);

	// Button handlers (stubs)
	const handleApplyFilters = () => {
		// Reset to first page; extend to trigger fetch if needed
		setPage(1);
	};

	const handleExportExcel = () => {
		// TODO: Implement export to Excel
		console.log('Export to Excel clicked');
	};

	const handleExportPdf = () => {
		// TODO: Implement export to PDF
		console.log('Export to PDF clicked');
	};

	const handlePrevPage = () => {
		setPage((p) => Math.max(1, p - 1));
	};

	const handleNextPage = () => {
		setPage((p) => Math.min(totalPages, p + 1));
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			contentStyle={{ padding: 16 }}
			containerStyle={{ flex: 1 }}
		>
			{/* Title */}
			<ThemedText
				lightColor={Colors.light.bim}
				darkColor={Colors.dark.bim}
				style={{
					width: '100%',
					textTransform: 'capitalize',
					fontSize: fontSize['heading.one'],
					fontWeight: fontWeight['heading.one'],
					marginBottom: 12,
				}}
			>
				{t.title}
			</ThemedText>

			{/* Filters Row */}
			<TileContainer
				id='transactions-filters'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					gap: 12,
					padding: 12,
					marginBottom: 12,
					// Ensure any nested dropdown overlays subsequent sections
					...(showStatusDd || showTypeDd
						? { zIndex: 2000, elevation: 20 }
						: {}),
				}}
			>
				<ThemedView
					style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}
					lightColor={Colors[colorScheme].background}
					darkColor={Colors[colorScheme].background}
				>
					{/* Start Date */}
					<ThemedView
						style={{ flexBasis: '48%', flexGrow: 1 }}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<ThemedDatePicker
							label={t.startDate}
							placeholder={t.startDate}
							value={startDate}
							onChange={(d) => setStartDate(d)}
							mode='date'
							inputStyle={{ backgroundColor: Colors[colorScheme].background }}
						/>
					</ThemedView>
					{/* End Date */}
					<ThemedView
						style={{ flexBasis: '48%', flexGrow: 1 }}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<ThemedDatePicker
							label={t.endDate}
							placeholder={t.endDate}
							value={endDate}
							onChange={(d) => setEndDate(d)}
							mode='date'
							inputStyle={{ backgroundColor: Colors[colorScheme].background }}
						/>
					</ThemedView>

					{/* Status */}
					<ThemedView
						style={{ flexBasis: '48%', flexGrow: 1 }}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<ThemedDropdown
							id='status-dd'
							containerRef={statusDdRef}
							label={t.status}
							placeholder={t.status}
							options={statusOptions}
							value={status}
							setValue={(v) => setStatus(v)}
							showDropdown={showStatusDd}
							setShowDropdown={setShowStatusDd}
							openDirection='down'
						/>
					</ThemedView>

					{/* Transaction Type */}
					<ThemedView
						style={{ flexBasis: '48%', flexGrow: 1 }}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<ThemedDropdown
							id='type-dd'
							containerRef={typeDdRef}
							label={t.transactionType}
							placeholder={t.transactionType}
							options={typeOptions}
							value={type}
							setValue={(v) => setType(v)}
							showDropdown={showTypeDd}
							setShowDropdown={setShowTypeDd}
							openDirection='down'
						/>
					</ThemedView>
				</ThemedView>

				{/* Actions row */}
				<ThemedView
					style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}
					lightColor={Colors[colorScheme].background}
					darkColor={Colors[colorScheme].background}
				>
					<ThemedButton
						title={t.applyFilters}
						onPress={handleApplyFilters}
						style={{ backgroundColor: Colors[colorScheme].bim }}
						lightTextColor={Colors.light.white}
						darkTextColor={Colors.dark.white}
					/>
					<ThemedView
						style={{ flex: 1 }}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					/>
				</ThemedView>

				{/* Total balance */}
				<ThemedView
					style={{
						marginTop: 8,
						flexDirection: 'row',
						alignItems: 'center',
						gap: 8,
					}}
					lightColor={Colors[colorScheme].background}
					darkColor={Colors[colorScheme].background}
				>
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
						style={{
							fontWeight: fontWeight['heading.two'],
							fontSize: fontSize['heading.two'],
						}}
					>
						{t.totalBalance}:
					</ThemedText>
					<ThemedView
						style={{
							backgroundColor: Colors[colorScheme].lime,
							borderRadius: 6,
							paddingHorizontal: 8,
							paddingVertical: 4,
						}}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<ThemedText
							lightColor={Colors.light.white}
							darkColor={Colors.dark.white}
							style={{
								fontWeight: fontWeight['heading.two'],
								fontSize: fontSize['heading.two'],
							}}
						>
							{formatAmount(totalBalance, 2)}
						</ThemedText>
					</ThemedView>
				</ThemedView>
			</TileContainer>

			{/* Export buttons section (no TileContainer) */}
			<ThemedView
				style={{
					flexDirection: 'row',
					gap: 12,
					marginBottom: 12,
					flexWrap: 'wrap',
				}}
				lightColor={Colors[colorScheme].background}
				darkColor={Colors[colorScheme].background}
			>
				<ThemedButton
					title={t.exportExcel}
					onPress={handleExportExcel}
					style={{ backgroundColor: Colors[colorScheme].lime }}
					lightTextColor={Colors.light.white}
					darkTextColor={Colors.dark.white}
				/>
				<ThemedButton
					title={t.exportPdf}
					onPress={handleExportPdf}
					style={{ backgroundColor: Colors[colorScheme].dangerButton }}
					lightTextColor={Colors.light.white}
					darkTextColor={Colors.dark.white}
				/>
			</ThemedView>
			<TileContainer
				id='router-balances'
				backgroundColor={Colors[colorScheme].background}
				style={{ flexDirection: 'column', boxSizing: 'border-box', padding: 0 }}
			>
				{/* Table with horizontal scroll */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator
					nestedScrollEnabled
				>
					<ThemedView
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						{/* Header Row */}
						<ThemedView
							id='transactions-header'
							style={{
								flexDirection: 'row',
								width: '100%',
								gap: 10,
								paddingVertical: 10,
								paddingHorizontal: 5,
								borderBottomWidth: 1,
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.titleBg}
							darkColor={Colors.dark.titleBg}
						>
							{txHeaders.map((col) => (
								<ThemedText
									key={`hdr-${col.key}`}
									numberOfLines={1}
									ellipsizeMode='tail'
									style={{
										fontSize: fontSize['text.medium'],
										width: col.width,
										flexShrink: 0,
										textTransform: 'uppercase',
										paddingRight: 8,
									}}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{col.label}
								</ThemedText>
							))}
						</ThemedView>
						<ScrollView
							style={{
								flexDirection: 'column',
								backgroundColor: Colors[colorScheme].background,
							}}
							nestedScrollEnabled
						>
							{paged.map((trans, index) => (
								<ThemedView
									key={`${trans.id}-${index}`}
									style={{
										flexDirection: 'row',
										width: '100%',
										paddingVertical: 12,
										paddingHorizontal: 5,
										gap: 10,
										alignItems: 'center',
										backgroundColor:
											index % 2 === 0
												? Colors[colorScheme].listItemBackground
												: Colors[colorScheme].background,
										borderBottomWidth: index < paged.length - 1 ? 1 : 0,
										borderBottomColor: Colors[colorScheme].borderDark,
									}}
									lightColor={Colors.light.background}
									darkColor={Colors.dark.background}
								>
									{/* # */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 30, flexShrink: 0 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{(page - 1) * pageSize + index + 1}
									</ThemedText>
									{/* Amount */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, flexShrink: 0 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{formatAmount(trans.amount, 2)}
									</ThemedText>
									{/* Type */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, flexShrink: 0 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{trans.method.type}
									</ThemedText>
									{/* Reason */}
									<ThemedText
										style={{ width: 120, flexShrink: 0 }}
										numberOfLines={1}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{trans.reason}
									</ThemedText>
									{/* Status */}
									<ThemedView
										style={{
											width: 120,
											flexShrink: 0,
											backgroundColor: Colors[colorScheme].actionButton,
											borderRadius: 2,
											margin: 0,
											padding: 0,
											alignItems: 'center',
											justifyContent: 'center',
										}}
										lightColor={Colors[colorScheme].background}
										darkColor={Colors[colorScheme].background}
									>
										<ThemedText
											numberOfLines={1}
											style={{ textAlign: 'center' }}
											lightColor={Colors.light.white}
											darkColor={Colors.dark.white}
										>
											{trans.status}
										</ThemedText>
									</ThemedView>
									{/* Router Name */}
									<ThemedText
										style={{ width: 120, flexShrink: 0 }}
										numberOfLines={1}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{trans.routerName}
									</ThemedText>
									{/* Transaction Date */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, flexShrink: 0 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{new Date(trans.date).toLocaleDateString()}
									</ThemedText>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
				{/* Pagination Controls */}
				<ThemedView
					style={{
						flexDirection: 'row',
						gap: 12,
						marginTop: 8,
						alignItems: 'center',
					}}
					lightColor={Colors[colorScheme].background}
					darkColor={Colors[colorScheme].background}
				>
					<ThemedButton
						title={'Previous'}
						onPress={handlePrevPage}
						disabled={page <= 1}
						darkColor={Colors.dark.background}
						lightColor={Colors.light.background}
						lightTextColor={page <= 1 ? Colors.light.mutedText : undefined}
						darkTextColor={page <= 1 ? Colors.dark.mutedText : undefined}
						textStyle={{ fontSize: 14 }}
					/>
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
					>
						{page} / {totalPages}
					</ThemedText>
					<ThemedButton
						title={'Next'}
						onPress={handleNextPage}
						disabled={page >= totalPages}
						darkColor={Colors.dark.background}
						lightColor={Colors.light.background}
						lightTextColor={
							page >= totalPages ? Colors.light.mutedText : undefined
						}
						darkTextColor={
							page >= totalPages ? Colors.dark.mutedText : undefined
						}
						textStyle={{ fontSize: 14 }}
					/>
				</ThemedView>
			</TileContainer>
		</ParallaxScrollView>
	);
}

// styles removed; layout handled by ParallaxScrollView props
