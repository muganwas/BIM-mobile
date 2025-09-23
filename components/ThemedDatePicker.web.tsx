import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	TextStyle,
	TouchableOpacity,
	useColorScheme,
	ViewStyle,
} from 'react-native';

export type ThemedDatePickerProps = {
	label?: string;
	placeholder?: string;
	value: Date | null;
	onChange: (d: Date | null) => void;
	mode?: 'date' | 'time' | 'datetime';
	minDate?: Date;
	maxDate?: Date;
	disabled?: boolean;
	containerStyle?: ViewStyle;
	labelStyle?: TextStyle;
	inputStyle?: any;
	displayFormat?: (d: Date) => string;
	showClearButton?: boolean;
};

export default function ThemedDatePicker({
	label,
	placeholder,
	value,
	onChange,
	mode = 'date',
	minDate,
	maxDate,
	disabled,
	containerStyle,
	labelStyle,
	inputStyle,
	displayFormat,
	showClearButton = true,
}: ThemedDatePickerProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement | null>(null);

	// Calendar state
	const [calYear, setCalYear] = useState<number>(
		(value ?? new Date()).getFullYear()
	);
	const [calMonth, setCalMonth] = useState<number>(
		(value ?? new Date()).getMonth()
	);

	// Time state
	const [timeHour, setTimeHour] = useState<string>('00');
	const [timeMinute, setTimeMinute] = useState<string>('00');

	// Datetime selection state (date part must be explicitly chosen)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const iconName = mode === 'time' ? 'clock' : 'calendar';

	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
	// no direct date/time string formatting needed in web dropdown
	// helpers kept minimal; datetime string helpers removed
	// datetime string parsing no longer needed in web dropdown implementation

	const formatted = useMemo(() => {
		if (!value) return '';
		if (displayFormat) return displayFormat(value);
		try {
			if (mode === 'time') return value.toLocaleTimeString();
			if (mode === 'datetime') return value.toLocaleString();
			return value.toDateString();
		} catch {
			return value.toString();
		}
	}, [value, displayFormat, mode]);

	// Live preview text while dropdown is open (updates when date/hour/minute change)
	const previewText = useMemo(() => {
		if (!open) return '';
		try {
			if (mode === 'time') {
				const hh = timeHour || '--';
				const mm = timeMinute || '--';
				return `${hh}:${mm}`;
			}
			if (mode === 'datetime') {
				// While open, do not fall back to committed value; require explicit selections
				const dateText = selectedDate ? selectedDate.toDateString() : '--';
				const hh = timeHour || '--';
				const mm = timeMinute || '--';
				return `${dateText} ${hh}:${mm}`;
			}
			// date mode uses committed value only (no placeholder calendar date)
			return formatted;
		} catch {
			return formatted;
		}
	}, [open, mode, selectedDate, timeHour, timeMinute, formatted]);

	// native input type strings are not used; all modes render custom dropdown UIs

	const openDropdown = () => {
		if (disabled) return;
		setOpen(true);
		const base = value ?? new Date();
		if (mode === 'date') {
			setCalYear(base.getFullYear());
			setCalMonth(base.getMonth());
		} else if (mode === 'time') {
			// Start afresh: do not prefill from committed value
			setTimeHour('');
			setTimeMinute('');
		} else if (mode === 'datetime') {
			setCalYear(base.getFullYear());
			setCalMonth(base.getMonth());
			// Reset temporary selections so user starts fresh
			setTimeHour('');
			setTimeMinute('');
			setSelectedDate(null);
		}
	};

	// Close when clicking outside
	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (!anchorRef.current) return;
			if (!anchorRef.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', onDown);
		return () => document.removeEventListener('mousedown', onDown);
	}, [open]);

	// Calendar grid
	const monthName = useMemo(
		() =>
			new Date(calYear, calMonth, 1).toLocaleString(undefined, {
				month: 'long',
				year: 'numeric',
			}),
		[calYear, calMonth]
	);
	const daysGrid = useMemo(() => {
		const first = new Date(calYear, calMonth, 1);
		const startWeekday = first.getDay();
		const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
		const cells: {
			key: string;
			day?: number;
			date?: Date;
			disabled?: boolean;
		}[] = [];
		for (let i = 0; i < startWeekday; i++) cells.push({ key: `e-${i}` });
		for (let d = 1; d <= daysInMonth; d++) {
			const dt = new Date(calYear, calMonth, d);
			let dis = false;
			if (
				minDate &&
				dt <
					new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
			)
				dis = true;
			if (
				maxDate &&
				dt >
					new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
			)
				dis = true;
			cells.push({ key: `d-${d}`, day: d, date: dt, disabled: dis });
		}
		return cells;
	}, [calYear, calMonth, minDate, maxDate]);

	const selectDay = (dt?: Date, dis?: boolean) => {
		if (!dt || dis) return;
		onChange(dt);
		setOpen(false);
	};

	const onTimeHourChange = (hh: string) => setTimeHour(hh);
	const onTimeMinuteChange = (mm: string) => {
		setTimeMinute(mm);
		// Only commit when both hour and minute are selected
		if (!timeHour || !mm) return;
		const base = value ?? new Date(1970, 0, 1); // avoid using current date
		const next = new Date(base);
		next.setHours(parseInt(timeHour, 10), parseInt(mm, 10), 0, 0);
		onChange(next);
		setOpen(false);
	};

	// Datetime handlers (close only if a date has been selected)
	const onDateTimeHourChange = (hh: string) => setTimeHour(hh);
	const onDateTimeMinuteChange = (mm: string) => {
		setTimeMinute(mm);
		// Require explicit date and both hour+minute
		if (!selectedDate || !timeHour || !mm) return;
		const next = new Date(selectedDate);
		next.setHours(parseInt(timeHour, 10), parseInt(mm, 10), 0, 0);
		onChange(next);
		setOpen(false);
	};

	return (
		<>
			<ThemedView
				lightColor={Colors[colorScheme].background}
				darkColor={Colors[colorScheme].background}
				style={[
					{ flexDirection: 'column', position: 'relative' },
					containerStyle,
				]}
			>
				{label ? (
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
						style={[{ marginBottom: 8 }, labelStyle]}
					>
						{label}
					</ThemedText>
				) : null}

				<div ref={anchorRef} style={{ position: 'relative' }}>
					<TouchableOpacity
						activeOpacity={0.8}
						onPress={openDropdown}
						disabled={disabled}
					>
						<ThemedView
							lightColor={Colors[colorScheme].background}
							darkColor={Colors[colorScheme].background}
							style={{ position: 'relative' }}
						>
							<ThemedInput
								editable={false}
								placeholder={placeholder || label}
								value={open && previewText ? previewText : formatted}
								setValue={() => {}}
								style={[
									{
										paddingRight: 44,
										backgroundColor: Colors[colorScheme].inputBackground,
										borderColor: Colors[colorScheme].inputBorder,
										borderWidth: 1,
									},
									inputStyle,
								]}
							/>
							<ThemedView
								lightColor={'transparent'}
								darkColor={'transparent'}
								style={{ position: 'absolute', right: 12, top: 15, zIndex: 1 }}
								pointerEvents='none'
							>
								<IconSymbol
									name={iconName as unknown as string}
									size={20}
									color={Colors[colorScheme].text}
								/>
							</ThemedView>
						</ThemedView>
					</TouchableOpacity>

					{open &&
						(mode === 'date' ? (
							<div
								style={{
									position: 'absolute',
									top: '100%',
									right: 0,
									marginTop: 6,
									background: Colors[colorScheme].background,
									color: Colors[colorScheme].text,
									border: `1px solid ${Colors[colorScheme].inputBorder}`,
									borderRadius: 12,
									boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
									padding: 12,
									zIndex: 1000,
									width: 300,
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											const m = new Date(calYear, calMonth - 1, 1);
											setCalYear(m.getFullYear());
											setCalMonth(m.getMonth());
										}}
										style={{
											background: 'transparent',
											border: 'none',
											cursor: 'pointer',
											color: Colors[colorScheme].text,
											fontSize: 18,
										}}
									>
										‹
									</button>
									<div style={{ fontWeight: 600 }}>{monthName}</div>
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											const m = new Date(calYear, calMonth + 1, 1);
											setCalYear(m.getFullYear());
											setCalMonth(m.getMonth());
										}}
										style={{
											background: 'transparent',
											border: 'none',
											cursor: 'pointer',
											color: Colors[colorScheme].text,
											fontSize: 18,
										}}
									>
										›
									</button>
								</div>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(7, 1fr)',
										gap: 6,
										fontSize: 12,
										opacity: 0.7,
										marginBottom: 6,
									}}
								>
									{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
										<div key={d} style={{ textAlign: 'center' }}>
											{d}
										</div>
									))}
								</div>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(7, 1fr)',
										gap: 6,
									}}
								>
									{daysGrid.map((cell) => (
										<button
											key={cell.key}
											disabled={cell.disabled || !cell.day}
											onClick={(e) => {
												e.stopPropagation();
												selectDay(cell.date, cell.disabled);
											}}
											style={{
												height: 34,
												borderRadius: 8,
												border: '1px solid transparent',
												background: cell.day
													? Colors[colorScheme].inputBackground
													: 'transparent',
												color: cell.disabled
													? '#999'
													: Colors[colorScheme].text,
												cursor:
													cell.day && !cell.disabled ? 'pointer' : 'default',
											}}
										>
											{cell.day || ''}
										</button>
									))}
								</div>
							</div>
						) : mode === 'time' ? (
							<div
								style={{
									position: 'absolute',
									top: '100%',
									right: 0,
									left: 0,
									marginTop: 6,
									background: Colors[colorScheme].background,
									color: Colors[colorScheme].text,
									border: `1px solid ${Colors[colorScheme].inputBorder}`,
									borderRadius: 12,
									boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
									padding: 12,
									zIndex: 1000,
									width: 'auto',
								}}
							>
								<div style={{ display: 'flex', gap: 12 }}>
									<div style={{ flex: 1 }}>
										<label style={{ fontSize: 12, opacity: 0.75 }}>Hour</label>
										<select
											value={timeHour}
											onChange={(e) =>
												onTimeHourChange((e.target as HTMLSelectElement).value)
											}
											style={{
												width: '100%',
												padding: '8px 10px',
												borderRadius: 8,
												border: `1px solid ${Colors[colorScheme].inputBorder}`,
												background: Colors[colorScheme].inputBackground,
												color: Colors[colorScheme].text,
												marginTop: 4,
											}}
										>
											<option value=''>--</option>
											{Array.from({ length: 24 }).map((_, i) => (
												<option key={i} value={pad(i)}>
													{pad(i)}
												</option>
											))}
										</select>
									</div>
									<div style={{ flex: 1 }}>
										<label style={{ fontSize: 12, opacity: 0.75 }}>
											Minute
										</label>
										<select
											value={timeMinute}
											onChange={(e) =>
												onTimeMinuteChange(
													(e.target as HTMLSelectElement).value
												)
											}
											style={{
												width: '100%',
												padding: '8px 10px',
												borderRadius: 8,
												border: `1px solid ${Colors[colorScheme].inputBorder}`,
												background: Colors[colorScheme].inputBackground,
												color: Colors[colorScheme].text,
												marginTop: 4,
											}}
										>
											<option value=''>--</option>
											{Array.from({ length: 60 }).map((_, i) => (
												<option key={i} value={pad(i)}>
													{pad(i)}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						) : (
							// Datetime: calendar + hour/minute, close only after full selection
							<div
								style={{
									position: 'absolute',
									top: '100%',
									right: 0,
									left: 0,
									marginTop: 6,
									background: Colors[colorScheme].background,
									color: Colors[colorScheme].text,
									border: `1px solid ${Colors[colorScheme].inputBorder}`,
									borderRadius: 12,
									boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
									padding: 12,
									zIndex: 1000,
									width: 'auto',
								}}
							>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											const m = new Date(calYear, calMonth - 1, 1);
											setCalYear(m.getFullYear());
											setCalMonth(m.getMonth());
										}}
										style={{
											background: 'transparent',
											border: 'none',
											cursor: 'pointer',
											color: Colors[colorScheme].text,
											fontSize: 18,
										}}
									>
										‹
									</button>
									<div style={{ fontWeight: 600 }}>{monthName}</div>
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											const m = new Date(calYear, calMonth + 1, 1);
											setCalYear(m.getFullYear());
											setCalMonth(m.getMonth());
										}}
										style={{
											background: 'transparent',
											border: 'none',
											cursor: 'pointer',
											color: Colors[colorScheme].text,
											fontSize: 18,
										}}
									>
										›
									</button>
								</div>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(7, 1fr)',
										gap: 6,
										fontSize: 12,
										opacity: 0.7,
										marginBottom: 6,
									}}
								>
									{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
										<div key={d} style={{ textAlign: 'center' }}>
											{d}
										</div>
									))}
								</div>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(7, 1fr)',
										gap: 6,
										marginBottom: 12,
									}}
								>
									{daysGrid.map((cell) => (
										<button
											key={cell.key}
											disabled={cell.disabled || !cell.day}
											onClick={(e) => {
												e.stopPropagation();
												if (!cell.date || cell.disabled) return;
												setSelectedDate(
													new Date(
														cell.date.getFullYear(),
														cell.date.getMonth(),
														cell.date.getDate()
													)
												);
											}}
											style={{
												height: 34,
												borderRadius: 8,
												border: '1px solid transparent',
												background: cell.day
													? Colors[colorScheme].inputBackground
													: 'transparent',
												color: cell.disabled
													? '#999'
													: Colors[colorScheme].text,
												cursor:
													cell.day && !cell.disabled ? 'pointer' : 'default',
											}}
										>
											{cell.day || ''}
										</button>
									))}
								</div>
								<div style={{ display: 'flex', gap: 12 }}>
									<div style={{ flex: 1 }}>
										<label style={{ fontSize: 12, opacity: 0.75 }}>Hour</label>
										<select
											value={timeHour}
											onChange={(e) =>
												onDateTimeHourChange(
													(e.target as HTMLSelectElement).value
												)
											}
											style={{
												width: '100%',
												padding: '8px 10px',
												borderRadius: 8,
												border: `1px solid ${Colors[colorScheme].inputBorder}`,
												background: Colors[colorScheme].inputBackground,
												color: Colors[colorScheme].text,
												marginTop: 4,
											}}
										>
											<option value=''>--</option>
											{Array.from({ length: 24 }).map((_, i) => (
												<option key={i} value={pad(i)}>
													{pad(i)}
												</option>
											))}
										</select>
									</div>
									<div style={{ flex: 1 }}>
										<label style={{ fontSize: 12, opacity: 0.75 }}>
											Minute
										</label>
										<select
											value={timeMinute}
											onChange={(e) =>
												onDateTimeMinuteChange(
													(e.target as HTMLSelectElement).value
												)
											}
											style={{
												width: '100%',
												padding: '8px 10px',
												borderRadius: 8,
												border: `1px solid ${Colors[colorScheme].inputBorder}`,
												background: Colors[colorScheme].inputBackground,
												color: Colors[colorScheme].text,
												marginTop: 4,
											}}
										>
											<option value=''>--</option>
											{Array.from({ length: 60 }).map((_, i) => (
												<option key={i} value={pad(i)}>
													{pad(i)}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						))}
				</div>

				{showClearButton && !!value && (
					<ThemedView
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
						style={{ alignItems: 'flex-end', marginTop: 6 }}
					>
						<TouchableOpacity
							onPress={() => {
								onChange(null);
								// Also reset any temporary datetime selections
								setSelectedDate(null);
								setTimeHour('');
								setTimeMinute('');
								setOpen(false);
							}}
						>
							<ThemedText style={{ color: Colors[colorScheme].bim }}>
								Clear
							</ThemedText>
						</TouchableOpacity>
					</ThemedView>
				)}
			</ThemedView>
		</>
	);
}
