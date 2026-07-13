import { apiBaseUrl } from '@/constants/API';
import { apiFetch } from '@/helpers/api';

function buildHeaders(token?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

export async function fetchDashboard(token?: string) {
	return apiFetch((apiBaseUrl || '') + '/dashboard', {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function fetchPurchases(token?: string) {
	return apiFetch((apiBaseUrl || '') + `/transactions`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function fetchDocuments(token?: string) {
	return apiFetch((apiBaseUrl || '') + '/documents', {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export default {
	fetchDashboard,
	fetchPurchases,
	fetchDocuments,
};
