import { apiBaseUrl } from '@/constants/API';
import { apiFetch } from '@/helpers/api';

function buildHeaders(token?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

export async function fetchWireguardKeys(token?: string) {
	return apiFetch((apiBaseUrl || '') + '/connector', {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getWireguardKey(id: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/connector/${id}`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function createWireguardKey(keyName: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + '/connector', {
		method: 'POST',
		headers: buildHeaders(token),
		body: JSON.stringify({ key_name: keyName }),
	});
}

export async function updateWireguardKey(
	id: string,
	keyName: string,
	token?: string,
) {
	return apiFetch((apiBaseUrl || '') + `/connector/${id}`, {
		method: 'PUT',
		headers: buildHeaders(token),
		body: JSON.stringify({ key_name: keyName }),
	});
}

export async function deleteWireguardKey(id: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/connector/${id}`, {
		method: 'DELETE',
		headers: buildHeaders(token),
	});
}

export async function retryWireguardKey(id: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/connector/${id}/retry`, {
		method: 'POST',
		headers: buildHeaders(token),
	});
}

export async function repairWireguardKey(id: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/connector/${id}/repair`, {
		method: 'POST',
		headers: buildHeaders(token),
	});
}

export default {
	fetchWireguardKeys,
	getWireguardKey,
	createWireguardKey,
	updateWireguardKey,
	deleteWireguardKey,
	retryWireguardKey,
	repairWireguardKey,
};
