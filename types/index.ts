export interface User {
	id: string;
	name: string;
	email: string;
	phone?: string; // Optional, can be used for login or registration
	avatarUrl?: string;
	userLanguage?: languages; // Optional, can be used to store user's preferred language
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

export type Translations = {
	[key in languages]: {
		name: string;
		categories: {
			[categoryKey: string]: {
				[translationKey: string]: string;
			};
		};
	};
};

export type languages =
	| 'en'
	| 'fr'
	| 'es'
	| 'de'
	| 'it'
	| 'ru'
	| 'pt'
	| 'zh'
	| 'ja'
	| 'ar';
