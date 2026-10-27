import { Account, OnboardingState, Platform } from './';
import { DashboardSummary } from './dashboard';

export type Gender = 'male' | 'female' | 'other' | undefined;

export interface Bank {
    id: string;
    name: string; // Name of the bank
    accountNumber: string; // Account number of the bank
    accountHolderName: string; // Name of the account holder
    SWIFTCode: string;
    currency: string;
    branch?: string; // Optional branch name
    createdAt?: Date;
    updatedAt?: Date;
}

export interface VoucherUser {
    voucherCode: string;
    password?: string;
    package: string;
    status: 'active' | 'inactive';
    macAddress: string; // MAC address of the user
    uptime: number; // Uptime of the user in minutes
    bytesIn: number; // Data usage in bytes
    bytesOut: number; // Data usage in bytes
    comment: string;
    createdAt: string;
}

export interface WireguardKey {
    id: string;
    user_id: number;
    key_name: string;
    router_private_key: string;
    router_public_key: string;
    server_public_key: string;
    host_address: string;
    host_port: number;
    endpoint_address: string;
    endpoint_port: number;
    ip_address: string;
    my_address: string;
    status: 'active' | 'inactive' | 'pending';
    radius_secret: string;
    radius_nas_shortname: string;
    radius_nas_type: string;
    radius_ports: string;
    radius_description?: string | null;
    last_handshake_at?: string | null; // ISO date string or null
    router_id: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}
/** User object from Auth verification /token/verify */
export interface ServerUser {
    "id": number;
    "role_id": number;
    "name": string;
    "phone": string;
    "phone_verified_at"?: string;
    "email": string;
    "notification_email"?: string;
    "avatar": string;
    "avatar_url": string;
    "email_verified_at"?: string;
    "last_activity_at"?: string;
    "totp_secret": string;
    "totp_setup_at"?: string;
    "onboarding_state": OnboardingState;
    "pre_2fa_token"?: string;
    "pre_2fa_token_expires_at"?: string;
    "settings": string[];
    "created_at": string;
    "updated_at": string;
    "gender": Gender
}
/** Local app user interface */
export interface User extends ServerUser {
    account?: Account;
    platform?: Platform;
    // Optional typed dashboard data returned by some login/refresh endpoints
    dashboard?: DashboardSummary;
}
/** From /profile endpoint & /me user object */
export interface UserProfile {
    "id": number;
    "name": string;
    "email": string;
    "phone": string;
    "notification_email": string;
    "avatar": string;
    "avatar_id": string;
    "avatar_url": string;
    "gender": Gender;
    "email_verified_at": string;
    "created_at": string;
    "updated_at": string;
}