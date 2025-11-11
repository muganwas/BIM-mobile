import { apiBaseUrl } from '@/constants/API';

/**
 * Lightweight fetch wrapper that injects the X-Client-Type header for backend API calls.
 * It will add the header only when the request target appears to be the configured apiBaseUrl.
 */
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
	const url = typeof input === 'string' ? input : (input as Request).url;

	// Clone/prepare headers
	const headers: Record<string, string> = {};
	if (init && init.headers) {
		if (init.headers instanceof Headers) {
			init.headers.forEach((v, k) => (headers[k] = v));
		} else if (Array.isArray(init.headers)) {
			init.headers.forEach(([k, v]) => (headers[k] = String(v)));
		} else {
			Object.assign(headers, init.headers as Record<string, string>);
		}
	}

	// Add the X-Client-Type header for API calls (only when apiBaseUrl is configured and matches)
	try {
		if (apiBaseUrl && typeof url === 'string' && url.startsWith(apiBaseUrl)) {
			headers['X-Client-Type'] = 'api-client';
		}
	} catch {
		// ignore
	}

	const mergedInit: RequestInit = {
		...(init || {}),
		headers,
	};

	return fetch(input, mergedInit);
}

export default apiFetch;
