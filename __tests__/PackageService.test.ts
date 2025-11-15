/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

jest.mock('@/constants/API', () => ({ apiBaseUrl: 'https://api.example' }));

const mockApiFetch = jest.fn(() =>
	Promise.resolve({ ok: true, json: async () => [] })
);
jest.mock('@/helpers/api', () => ({ apiFetch: mockApiFetch }));

const PackageService = require('@/services/PackageService');

describe('PackageService', () => {
	beforeEach(() => {
		mockApiFetch.mockClear();
	});

	test('fetchPackages calls apiFetch with correct url and headers', async () => {
		await PackageService.fetchPackages();
		expect(mockApiFetch).toHaveBeenCalledTimes(1);
		const [url, init] = mockApiFetch.mock.calls[0];
		expect(url).toBe('https://api.example/packages');
		expect(init.method).toBe('GET');
		expect(init.headers['Content-Type']).toBe('application/json');
		expect(init.headers.Authorization).toBeUndefined();
	});

	test('fetchPackages includes Authorization when token provided', async () => {
		await PackageService.fetchPackages('ptoken');
		expect(mockApiFetch).toHaveBeenCalledTimes(1);
		const [, init] = mockApiFetch.mock.calls[0];
		expect(init.headers.Authorization).toBe('Bearer ptoken');
	});
});
