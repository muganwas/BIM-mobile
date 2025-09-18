import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDropdown } from '@/components/ThemedDropdown';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
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
	const [showStartPicker, setShowStartPicker] = useState(false);
	const [showEndPicker, setShowEndPicker] = useState(false);
	const [status, setStatus] = useState<string | undefined>(undefined);
	const [type, setType] = useState<string | undefined>(undefined);

	// Dropdown local
	const [showStatusDd, setShowStatusDd] = useState(false);
	const [showTypeDd, setShowTypeDd] = useState(false);
	const statusOptions = useMemo(() => [t.pending, t.approved], [t]);
	const typeOptions = useMemo(() => [t.debit, t.credit], [t]);

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
			const matchesStatus = status
				? p.status.toLowerCase() === status.toLowerCase()
				: true;
			const matchesType = type
				? p.method.type.toLowerCase() === type.toLowerCase()
				: true;
			return inStart && inEnd && matchesStatus && matchesType;
		});
	}, [purchases, startDate, endDate, status, type]);

	const totalBalance = useMemo(
		() => filtered.reduce((sum, p) => sum + (p.amount || 0), 0),
		[filtered]
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, page]);

	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			{/* Title */}
			<ThemedText
				lightColor={Colors.light.screenTitleText}
				darkColor={Colors.dark.screenTitleText}
				style={{
					width: '100%',
					textTransform: 'capitalize',
					fontSize: fontSize['heading.three'],
					fontWeight: fontWeight['heading.three'],
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
				}}
			>
				<View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
					{/* Start Date */}
					<View style={{ flexBasis: '48%', flexGrow: 1 }}>
						<ThemedInput
							label={t.startDate}
							value={startDate ? startDate.toDateString() : ''}
							placeholder={t.startDate}
							editable={false}
							onTouchEnd={() => setShowStartPicker(true)}
							setValue={() => {}}
						/>
						{showStartPicker && Platform.OS !== 'web' && (
							<DateTimePicker
								value={startDate ?? new Date()}
								mode='date'
								onChange={(_, d) => {
									setShowStartPicker(false);
									if (d) setStartDate(d);
								}}
							/>
						)}
					</View>
					{/* End Date */}
					<View style={{ flexBasis: '48%', flexGrow: 1 }}>
						<ThemedInput
							label={t.endDate}
							value={endDate ? endDate.toDateString() : ''}
							placeholder={t.endDate}
							editable={false}
							onTouchEnd={() => setShowEndPicker(true)}
							setValue={() => {}}
						/>
						{showEndPicker && Platform.OS !== 'web' && (
							<DateTimePicker
								value={endDate ?? new Date()}
								mode='date'
								onChange={(_, d) => {
									setShowEndPicker(false);
									if (d) setEndDate(d);
								}}
							/>
						)}
					</View>

					{/* Status */}
					<View style={{ flexBasis: '48%', flexGrow: 1 }}>
						<ThemedDropdown
							id='status-dd'
							containerRef={{ current: null } as any}
							label={t.status}
							placeholder={t.status}
							options={statusOptions}
							value={status || ''}
							setValue={(v) => setStatus(v)}
							showDropdown={showStatusDd}
							setShowDropdown={setShowStatusDd}
							openDirection='down'
						/>
					</View>

					{/* Transaction Type */}
					<View style={{ flexBasis: '48%', flexGrow: 1 }}>
						<ThemedDropdown
							id='type-dd'
							containerRef={{ current: null } as any}
							label={t.transactionType}
							placeholder={t.transactionType}
							options={typeOptions}
							value={type || ''}
							setValue={(v) => setType(v)}
							showDropdown={showTypeDd}
							setShowDropdown={setShowTypeDd}
							openDirection='down'
						/>
					</View>
				</View>

				{/* Actions row */}
				<View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
					<ThemedButton
						title={t.applyFilters}
						onPress={() => setPage(1)}
						style={{ backgroundColor: Colors[colorScheme].bim }}
						lightTextColor={Colors.light.white}
						darkTextColor={Colors.dark.white}
					/>
					<View style={{ flex: 1 }} />
					<ThemedButton title={t.exportExcel} onPress={() => {}} />
					<ThemedButton title={t.exportPdf} onPress={() => {}} />
				</View>

				{/* Total balance */}
				<View style={{ marginTop: 8 }}>
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
						style={{ fontWeight: fontWeight['heading.two'] }}
					>
						{t.totalBalance}: {totalBalance.toFixed(2)}
					</ThemedText>
				</View>
			</TileContainer>
			<TileContainer
				id='router-balances'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					height: 350,
				}}
			>
				<ThemedView
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
						style={{
							width: '100%',
							textTransform: 'capitalize',
							fontSize: fontSize['heading.three'],
							fontWeight: fontWeight['heading.three'],
						}}
					>
						{translations[language].categories.dashboard.routerBalances}
					</ThemedText>
				</ThemedView>
				{/* Table with horizontal scroll */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator
					nestedScrollEnabled
				>
					<View>
						{/* Header Row */}
						<ThemedView
							id='transactions-header'
							style={{
								flexDirection: 'row',
								gap: 10,
								paddingVertical: 10,
								borderBottomWidth: 1,
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.background}
							darkColor={Colors.dark.background}
						>
							{[
								t.colHash,
								t.colAmount,
								t.colType,
								t.colReason,
								t.colStatus,
								t.colRouterName,
								t.colTransactionDate,
							].map((label, idx) => (
								<ThemedText
									key={`hdr-${idx}`}
									numberOfLines={1}
									ellipsizeMode='tail'
									style={{
										fontSize: fontSize['text.medium'],
										width: idx === 0 ? 30 : 120,
										flexShrink: 0,
										textTransform: 'uppercase',
										paddingRight: 8,
									}}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{label}
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
										gap: 10,
										alignItems: 'center',
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
										{trans.amount.toFixed
											? trans.amount.toFixed(2)
											: trans.amount}
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
									<View
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
									>
										<ThemedText
											numberOfLines={1}
											style={{ textAlign: 'center' }}
											lightColor={Colors.light.white}
											darkColor={Colors.dark.white}
										>
											{trans.status}
										</ThemedText>
									</View>
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
					</View>
				</ScrollView>
				{/* Pagination Controls */}
				<View
					style={{
						flexDirection: 'row',
						gap: 12,
						marginTop: 8,
						alignItems: 'center',
					}}
				>
					<ThemedButton
						title={'<'}
						onPress={() => setPage((p) => Math.max(1, p - 1))}
					/>
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
					>
						{page} / {totalPages}
					</ThemedText>
					<ThemedButton
						title={'>'}
						onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
					/>
				</View>
			</TileContainer>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		padding: 16,
	},
	routerItem: {
		flexDirection: 'row',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
});
