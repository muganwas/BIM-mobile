import { apiBaseUrl } from '@/constants/API';
import { apiFetch } from '@/helpers/api';

function buildHeaders(token?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

export async function fetchRouters(token?: string) {
	return apiFetch((apiBaseUrl || '') + '/routers', {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getRouterById(routerId: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/routers/${routerId}`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getRouterStatus(routerId: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/routers/${routerId}/status`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getRouterHotspots(routerId: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/routers/${routerId}/hotspots`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export default {
	fetchRouters,
	getRouterById,
	getRouterStatus,
	getRouterHotspots,
};
