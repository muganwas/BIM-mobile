import type { ApiErrors, PaginationMeta } from '@/types';

/**
 * Helpers for reading the API 2.0 response envelope:
 *   { success, message, data, meta, operation, errors }
 *
 * Every endpoint returns this envelope, so call sites should read the actual
 * payload from `data` (or use `getApiData`) instead of the top level body.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
}

/** True when the body (or `body.data`) reports success. */
export function isApiSuccess(body: unknown): boolean {
	const record = asRecord(body);
	if (!record) return false;
	const value = 'success' in record ? record.success : asRecord(record.data)?.success;
	return value === true || value === 'true' || value === 1 || value === '1';
}

/**
 * Extract the `data` payload from an API response body.
 *
 * API 2.0 always wraps payloads in `data`. Older deployments answered with the
 * payload at the top level next to `success`/`message`; those extra keys are
 * stripped here so both shapes can be consumed the same way.
 */
export function getApiData<TData = unknown>(body: unknown): TData | null {
	if (Array.isArray(body)) return body as TData;
	const record = asRecord(body);
	if (!record) return null;
	if ('data' in record) return (record.data ?? null) as TData | null;
	const {
		success: _success,
		message: _message,
		meta: _meta,
		operation: _operation,
		errors: _errors,
		...payload
	} = record;
	return Object.keys(payload).length ? (payload as TData) : null;
}

/** Pagination block carried by `meta.pagination` (with legacy `*_meta` fallback). */
export function getApiPagination(body: unknown): PaginationMeta | undefined {
	const record = asRecord(body);
	const meta = asRecord(record?.meta) ?? asRecord(asRecord(record?.data)?.meta);
	const pagination = asRecord(meta?.pagination);
	if (pagination) return pagination as PaginationMeta;

	// Older router payloads carried `cookies_meta` / `users_meta` / `hosts_meta`
	// / `leases_meta` / `active_meta` next to the collection.
	const data = asRecord(record?.data);
	for (const [key, value] of Object.entries(data ?? {})) {
		if (!key.endsWith('_meta')) continue;
		const legacyMeta = asRecord(value);
		if (legacyMeta && 'current_page' in legacyMeta) {
			return legacyMeta as PaginationMeta;
		}
	}
	return undefined;
}

/** Concrete paging numbers for UI controls (defaults applied). */
export interface PageInfo {
	current_page: number;
	last_page: number;
	total?: number;
	per_page?: number;
}

export function getPageInfo(body: unknown): PageInfo | undefined {
	const pagination = getApiPagination(body);
	if (!pagination) return undefined;
	return {
		current_page: pagination.current_page ?? 1,
		last_page: pagination.last_page ?? 1,
		total: pagination.total,
		per_page: pagination.per_page,
	};
}

/** `message` of the envelope. */
export function getApiMessage(body: unknown): string | undefined {
	const record = asRecord(body);
	const message = record?.message ?? asRecord(record?.data)?.message;
	return typeof message === 'string' && message.trim() ? message : undefined;
}

/** `errors` block of the envelope (field level validation errors). */
export function getApiErrors(body: unknown): ApiErrors {
	const record = asRecord(body);
	const errors = record?.errors ?? asRecord(record?.data)?.errors;
	return (errors as ApiErrors) ?? null;
}

/** Lifecycle state of a queued operation (`operation.state`). */
export function getOperationState(body: unknown): string | undefined {
	const record = asRecord(body);
	const operation = asRecord(record?.operation);
	const state = operation?.state;
	return typeof state === 'string' ? state : undefined;
}

/** Cache key for a queued operation, from `operation.cache_key`, `data.cache_key` or legacy body. */
export function getOperationCacheKey(body: unknown): string | undefined {
	const record = asRecord(body);
	const operation = asRecord(record?.operation);
	const data = asRecord(record?.data);
	const key = operation?.cache_key ?? data?.cache_key ?? record?.cache_key;
	return typeof key === 'string' && key ? key : undefined;
}
