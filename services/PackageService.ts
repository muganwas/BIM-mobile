import { apiBaseUrl } from '@/constants/API';
import { apiFetch } from '@/helpers/api';

function buildHeaders(token?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

export async function fetchPackages(token?: string) {
	return apiFetch((apiBaseUrl || '') + '/packages', {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export default {
	fetchPackages,
};
