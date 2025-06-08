export interface User {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuthRequest {
	name?: string; // Required for registration, optional for login
	email: string;
	phone?: string; // Optional, can be used for login or registration
	password: string;
}
