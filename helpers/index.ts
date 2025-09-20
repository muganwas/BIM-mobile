import { phoneNumberLength } from '@/constants';
import { Alert, AlertButton, Platform, ToastAndroid } from 'react-native';

export function filterCharacters(
	input: string,
	type: 'number' | 'text' | 'password'
): string {
	if (type === 'number')
		// Return only numeric characters8
		return input?.replace(/[^0-9]/g, '');
	else if (type === 'text')
		// Return only alphabetic characters (excluding special characters)
		return input?.replace(/[^a-zA-Z\s]/g, '');
	else if (type === 'password')
		return input?.replaceAll(' ', ''); // Return anything that has been input
	else return ''; // Return anything that has been input
}

export function translateWithVariables(
	text: string,
	variables: Record<string, string | number>
): string {
	return text.replace(/{(\w+)}/g, (match, key) => {
		return variables[key]?.toString() || match;
	});
}

export function formatPhoneNumber(phoneNumber: string, len?: number): string {
	// Remove all non-numeric characters (including spaces) to ensure consistent formatting
	let filteredValue = filterCharacters(phoneNumber, 'number');
	let interimValue = '';

	// If filteredValue doesn't start with 0, add 0 at the start
	if (
		filteredValue !== '' &&
		filteredValue?.length > 1 &&
		!filteredValue?.startsWith('0')
	) {
		filteredValue = '0' + filteredValue;
	}

	// Limit the length of the filtered value
	if (filteredValue.length > (len ?? phoneNumberLength)) {
		filteredValue = filteredValue.slice(0, len ?? phoneNumberLength);
	}

	// Format the number: first 4 digits, then groups of 3
	if (filteredValue.length <= 4) {
		interimValue = filteredValue;
	} else {
		const firstPart = filteredValue.slice(0, 4);
		const rest = filteredValue.slice(4); // Remaining digits
		const groupedRest = rest.match(/.{1,3}/g)?.join(' ') || ''; // Group into chunks of 3
		interimValue = `${firstPart} ${groupedRest}`.trim(); // Combine and trim
	}

	return interimValue;
}

export function ShowAlert(
	message: string,
	type: 'Success' | 'Error',
	options?: AlertButton[]
): void {
	if (Platform.OS === 'android' && !options)
		ToastAndroid.show(
			message,
			type === 'Error' ? ToastAndroid.LONG : ToastAndroid.SHORT
		);
	else if (options) Alert.alert(type, message, options);
	else Alert.alert(type, message, [{ text: 'OK' }]);
}

export function generateRandomNumbers(length: number): string {
	let result = '';
	const characters = '0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export function generateRandomString(length: number): string {
	let result = '';
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export function generateRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDateBetweenDaysAgo(daysAgo = 6): Date {
	const now = new Date();
	const start = new Date();
	start.setHours(0, 0, 0, 0);
	start.setDate(start.getDate() - daysAgo);
	const randomTs =
		start.getTime() + Math.random() * (now.getTime() - start.getTime());
	return new Date(randomTs);
}

export function toLocalISOString(date: Date) {
	const pad = (n: number) => n.toString().padStart(2, '0');
	return (
		date.getFullYear() +
		'-' +
		pad(date.getMonth() + 1) +
		'-' +
		pad(date.getDate()) +
		' ' +
		pad(date.getHours()) +
		':' +
		pad(date.getMinutes()) +
		':' +
		pad(date.getSeconds())
	);
}

export function formatMMDD(date: Date) {
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${m}-${d}`;
}

/**
 * Convert milliseconds to a compact HhMmSs string. Examples:
 * 19812000 -> "5h30m12s"
 * 180000 -> "3m0s"
 * 5000 -> "5s"
 */
export function msToHms(milliseconds: number): string {
	if (!Number.isFinite(milliseconds) || milliseconds <= 0) return '0s';
	const totalSeconds = Math.floor(milliseconds / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts: string[] = [];
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	// Always show seconds (including 0) to have a deterministic string
	parts.push(`${seconds}s`);

	return parts.join('');
}

export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a number with thousand separators and fixed decimals.
 * Defaults to 2 decimal places. Falls back gracefully if Intl is unavailable.
 */
export function formatAmount(value: number | string, decimals = 2): string {
	const n = typeof value === 'string' ? Number(value) : value;
	if (!Number.isFinite(n)) return '0';
	try {
		return new Intl.NumberFormat(undefined, {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(n);
	} catch {
		const fixed = n.toFixed(decimals);
		const [intPart, decPart] = fixed.split('.');
		const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return decPart ? `${withCommas}.${decPart}` : withCommas;
	}
}
