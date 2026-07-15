import { langCode } from './';
import { DashboardSummary } from './dashboard';

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

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string; // Optional, can be used for login or registration
    avatarUrl?: string;
    userLanguage?: langCode; // Optional, can be used to store user's preferred language
    createdAt: Date;
    updatedAt: Date;
    // Optional typed dashboard data returned by some login/refresh endpoints
    dashboard?: DashboardSummary;
}
