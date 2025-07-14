import { phoneNumberLength } from '@/constants';

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
