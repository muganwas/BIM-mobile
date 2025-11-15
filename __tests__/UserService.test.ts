/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

// Mock the API base URL used by the service
jest.mock('@/constants/API', () => ({
	apiBaseUrl: 'https://api.example',
}));

// Mock the apiFetch helper so we can assert it's called correctly
const mockApiFetch = jest.fn(() =>
	Promise.resolve({ ok: true, json: async () => ({}) })
);
jest.mock('@/helpers/api', () => ({ apiFetch: mockApiFetch }));

const UserService = require('@/services/UserService');

describe('UserService', () => {
	beforeEach(() => {
		mockApiFetch.mockClear();
	});

	test('fetchDashboard calls apiFetch with correct url and headers', async () => {
		await UserService.fetchDashboard();
		expect(mockApiFetch).toHaveBeenCalledTimes(1);
		const [url, init] = mockApiFetch.mock.calls[0];
		expect(url).toBe('https://api.example/dashboard');
		expect(init).toBeDefined();
		expect(init.method).toBe('GET');
		expect(init.headers['Content-Type']).toBe('application/json');
		// no Authorization header when token not provided
		expect(init.headers.Authorization).toBeUndefined();
	});

	test('fetchDashboard includes Authorization when token provided', async () => {
		await UserService.fetchDashboard('mytoken');
		expect(mockApiFetch).toHaveBeenCalledTimes(1);
		const [, init] = mockApiFetch.mock.calls[0];
		expect(init.headers.Authorization).toBe('Bearer mytoken');
	});

	test('fetchPurchases and fetchDocuments call correct endpoints', async () => {
		await UserService.fetchPurchases('t1');
		await UserService.fetchDocuments('t2');
		expect(mockApiFetch).toHaveBeenCalledTimes(2);

		const [purchasesUrl, purchasesInit] = mockApiFetch.mock.calls[0];
		expect(purchasesUrl).toBe('https://api.example/purchases');
		expect(purchasesInit.headers.Authorization).toBe('Bearer t1');

		const [docsUrl, docsInit] = mockApiFetch.mock.calls[1];
		expect(docsUrl).toBe('https://api.example/documents');
		expect(docsInit.headers.Authorization).toBe('Bearer t2');
	});
});
