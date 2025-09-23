import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { generateBank } from '@/helpers/factories';
import useTrackHistory from '@/hooks/useTrackHistory';
import { Bank as BankType } from '@/types';
import BankAccount from '@/views/BankAccount';
import { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function BanksScreen() {
	useTrackHistory('/(authenticated)/banks');
	const colorScheme = useColorScheme() ?? 'light';
	const { banks, fetchBanks, setBanks } = useTransaction();
	const { user } = useGeneral();
	const [page] = useState(1);
	const pageSize = 50; // banks are typically few; keep high page size
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize;
		return banks.slice(start, start + pageSize);
	}, [banks, page]);

	// Pre-define table headers and their widths so consumers can rely on attributes (e.g., length)
	const bankHeaders = useMemo(
		() => [
			{ key: 'row', label: '#', width: 30 },
			{ key: 'name', label: 'bank name', width: 120 },
			{ key: 'account', label: 'account number', width: 120 },
			{ key: 'swift', label: 'swift code', width: 120 },
			{ key: 'actions', label: 'actions', width: 120 },
		],
		[]
	);

	useEffect(() => {
		if (user && banks.length === 0) {
			(async () => {
				await fetchBanks(user);
			})();
		}
	}, [user, banks, fetchBanks]);

	const [showAdd, setShowAdd] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showView, setShowView] = useState(false);
	const [editBank, setEditBank] = useState<BankType | null>(null);
	const handleAddAccount = () => setShowAdd(true);
	const handleCancelAdd = () => setShowAdd(false);
	const handleSaveAdd = ({
		name,
		accountNumber,
		phone,
		swift,
	}: {
		name: string;
		accountNumber: string;
		phone: string;
		swift: string;
	}) => {
		// Create a new bank entry locally using factories; currency default UGX
		const newBank = generateBank({
			name,
			accountNumber,
			SWIFTCode: swift,
			currency: 'UGX',
			accountHolderName: phone,
		});
		setBanks((prev) => [newBank, ...prev]);
		setShowAdd(false);
	};
	const handleView = (id: string) => {
		const found = banks.find((b) => b.id === id) ?? null;
		setEditBank(found);
		setShowView(!!found);
	};
	const handleEdit = (id: string) => {
		const found = banks.find((b) => b.id === id) ?? null;
		setEditBank(found);
		setShowEdit(!!found);
	};
	const handleDelete = (id: string) => console.log('Delete bank', id);

	const handleUpdateBank = ({
		name,
		accountNumber,
		phone,
		swift,
	}: {
		name: string;
		accountNumber: string;
		phone: string;
		swift: string;
	}) => {
		if (!editBank) return;
		setBanks((prev) =>
			prev.map((b) =>
				b.id === editBank.id
					? {
							...b,
							name,
							accountNumber,
							accountHolderName: phone,
							SWIFTCode: swift,
					  }
					: b
			)
		);
		setShowEdit(false);
		setEditBank(null);
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
		>
			{/* Title row */}
			<ThemedView
				lightColor={Colors.light.background}
				darkColor={Colors.dark.background}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: 12,
					marginBottom: 12,
				}}
			>
				<ThemedText
					lightColor={Colors.light.bim}
					darkColor={Colors.dark.bim}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
					}}
				>
					Bank Accounts
				</ThemedText>
			</ThemedView>

			{/* Actions */}
			<ThemedView
				style={{ width: '100%', alignItems: 'flex-end', marginBottom: 12 }}
				lightColor={Colors.light.background}
				darkColor={Colors.dark.background}
			>
				<ThemedButton
					title={'Add account'.toUpperCase()}
					numberOfLines={1}
					onPress={handleAddAccount}
					style={{ borderRadius: 8, width: 160 }}
					darkColor={Colors.dark.actionButton}
					lightColor={Colors.light.actionButton}
					darkTextColor={Colors.dark.authButtonText}
					lightTextColor={Colors.light.authButtonText}
				/>
			</ThemedView>

			{/* Banks table */}
			<TileContainer
				id='banks-table'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					padding: 0,
				}}
			>
				<ScrollView horizontal showsHorizontalScrollIndicator>
					<ThemedView
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						{/* Header */}
						<ThemedView
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
							{bankHeaders.map((col) => (
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

						{/* Rows */}
						<ScrollView nestedScrollEnabled>
							{paged.map((b, index) => (
								<ThemedView
									key={b.id}
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
										style={{ width: 30, overflow: 'hidden', paddingRight: 8 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{index + 1}
									</ThemedText>
									{/* Bank name */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8, overflow: 'hidden' }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{b.name}
									</ThemedText>
									{/* Account number */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{b.accountNumber}
									</ThemedText>
									{/* SWIFT code */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{b.SWIFTCode}
									</ThemedText>
									{/* Actions */}
									<ThemedView
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 8,
											width: 120,
										}}
										lightColor='transparent'
										darkColor='transparent'
									>
										<TouchableOpacity onPress={() => handleView(b.id)}>
											<IconSymbol
												color={Colors[colorScheme].lime}
												name='eye.outline'
											/>
										</TouchableOpacity>
										<TouchableOpacity onPress={() => handleEdit(b.id)}>
											<IconSymbol
												color={Colors[colorScheme].yellow}
												name='edit.outline'
											/>
										</TouchableOpacity>
										<TouchableOpacity onPress={() => handleDelete(b.id)}>
											<IconSymbol
												color={Colors[colorScheme].error}
												name='delete.outline'
											/>
										</TouchableOpacity>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
			{/* Bank Account Modal (Add) */}
			<BankAccount
				visible={showAdd}
				onCancel={handleCancelAdd}
				onSave={handleSaveAdd}
			/>
			{/* Bank Account Modal (Edit) */}
			<BankAccount
				visible={showEdit}
				mode='edit'
				initial={{
					name: editBank?.name ?? '',
					accountNumber: editBank?.accountNumber ?? '',
					phone: editBank?.accountHolderName ?? '',
					swift: editBank?.SWIFTCode ?? '',
				}}
				onCancel={() => {
					setShowEdit(false);
					setEditBank(null);
				}}
				onSave={handleUpdateBank}
			/>
			{/* Bank Account (View mode) */}
			<BankAccount
				visible={showView}
				mode='view'
				initial={{
					name: editBank?.name ?? '',
					accountNumber: editBank?.accountNumber ?? '',
					phone: editBank?.accountHolderName ?? '',
					swift: editBank?.SWIFTCode ?? '',
				}}
				onBack={() => {
					setShowView(false);
					setEditBank(null);
				}}
				onEdit={() => {
					setShowView(false);
					setShowEdit(true);
				}}
				onCancel={() => {
					setShowView(false);
					setEditBank(null);
				}}
				onSave={() => {
					/* no-op in view mode */
				}}
			/>
		</ParallaxScrollView>
	);
}
