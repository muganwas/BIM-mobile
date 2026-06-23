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
	const url = (apiBaseUrl || '') + `/routers/${routerId}/hotspots`;
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	// If the server accepted the request for background processing, poll for result
	if (resp.status === 202) {
		try {
			const body = await resp.json().catch(() => ({}));
			const cacheKey = body?.cache_key || body?.cacheKey || null;
			if (cacheKey) {
				const { fetchCsrfToken, pollQueuedOperation } = await import('@/helpers/api');
				const csrfToken = await fetchCsrfToken();
				const polled = await pollQueuedOperation(cacheKey, { csrfToken });
				return new Response(JSON.stringify(polled ?? {}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} catch (e) {
			console.error('[getRouterHotspots] polling failed', e);
			return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
		}
	}

	return resp;
}

export async function getRouterHotspotUsers(
	routerId: string,
	hotspotId: string,
	token?: string
) {
	const url = `${apiBaseUrl || ''}/vouchers/${routerId}/hotspots/${hotspotId}`;
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	if (resp.status === 202) {
		try {
			const body = await resp.json().catch(() => ({}));
			const cacheKey = body?.cache_key || body?.cacheKey || null;
			if (cacheKey) {
				const { fetchCsrfToken, pollQueuedOperation } = await import('@/helpers/api');
				const csrfToken = await fetchCsrfToken();
				const polled = await pollQueuedOperation(cacheKey, { csrfToken });
				return new Response(JSON.stringify(polled ?? {}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} catch (e) {
			console.error('[getRouterHotspotUsers] polling failed', e);
			return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
		}
	}

	return resp;
}

export default {
	fetchRouters,
	getRouterById,
	getRouterStatus,
	getRouterHotspots,
	getRouterHotspotUsers,
};
