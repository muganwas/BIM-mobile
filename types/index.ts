export interface User {
	id: string;
	name: string;
	email: string;
	phone?: string; // Optional, can be used for login or registration
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

export interface notifications {
	id: string;
	from: string;
	to: string;
	type: 'message' | 'alert' | 'reminder';
	title: string;
	message: string;
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
}
