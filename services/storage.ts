import CryptoJS from 'crypto-js';
import { AppState } from '@/types';
import { AppStateSchema } from '@/lib/schemas';

const STORAGE_KEY = 'lfs_boms_data';
const SALT_KEY = 'lfs_boms_salt';
const VERIFIER_KEY = 'lfs_boms_verifier';
const SESSION_KEY_STORAGE = 'lfs_boms_session_key';

// 4.5MB Warning Limit (approximate)
const QUOTA_WARNING_BYTES = 4.5 * 1024 * 1024;

export type StorageErrorType = 'NO_KEY' | 'INVALID_KEY' | 'DATA_CORRUPTION' | 'QUOTA_EXCEEDED' | 'UNKNOWN';

export class StorageError extends Error {
    type: StorageErrorType;
    constructor(message: string, type: StorageErrorType) {
        super(message);
        this.type = type;
    }
}

export interface StorageStatus {
    usageBytes: number;
    quotaWarning: boolean;
    hasData: boolean;
    isAuthenticated: boolean;
}

// Helper: Generate or Get Salt
function getSalt(): string {
    let salt = localStorage.getItem(SALT_KEY);
    if (!salt) {
        salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        localStorage.setItem(SALT_KEY, salt);
    }
    return salt;
}

// Helper: Derive Key from PIN + Salt
// We use PBKDF2 for security
function deriveKey(pin: string, salt: string): string {
    return CryptoJS.PBKDF2(pin, salt, {
        keySize: 256 / 32,
        iterations: 1000,
    }).toString();
}

export const StorageService = {
    // Check if system is initialized (has salt/verifier)
    isInitialized(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(VERIFIER_KEY);
    },

    // Check if user is currently authenticated (key in session)
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!sessionStorage.getItem(SESSION_KEY_STORAGE);
    },

    // Initialize System with new PIN
    initialize(pin: string) {
        const salt = getSalt();
        const key = deriveKey(pin, salt);

        // Create Verifier
        const verifier = CryptoJS.AES.encrypt("VERIFIED", key).toString();

        localStorage.setItem(VERIFIER_KEY, verifier);
        localStorage.setItem(SALT_KEY, salt);
        sessionStorage.setItem(SESSION_KEY_STORAGE, key); // Auto-login

        // Initialize Empty Data
        const emptyState: AppState = {
            orders: [],
            version: 1,
            lastBackup: Date.now()
        };
        this.save(emptyState);
    },

    // Login: validate PIN, store key in session
    login(pin: string): boolean {
        const salt = localStorage.getItem(SALT_KEY);
        const verifier = localStorage.getItem(VERIFIER_KEY);

        if (!salt || !verifier) return false;

        const key = deriveKey(pin, salt);
        try {
            const bytes = CryptoJS.AES.decrypt(verifier, key);
            const dec = bytes.toString(CryptoJS.enc.Utf8);

            if (dec === "VERIFIED") {
                sessionStorage.setItem(SESSION_KEY_STORAGE, key);
                return true;
            }
        } catch {
            return false;
        }
        return false;
    },

    logout() {
        sessionStorage.removeItem(SESSION_KEY_STORAGE);
    },

    // Save Data
    save(data: AppState): { success: boolean, warning?: string } {
        const key = sessionStorage.getItem(SESSION_KEY_STORAGE);
        if (!key) throw new StorageError("Not Authenticated", 'NO_KEY');

        // Validate Schema before saving
        const parsed = AppStateSchema.parse(data);
        const lastBackup = Date.now();
        const stateToSave = { ...parsed, lastBackup };

        const json = JSON.stringify(stateToSave);
        const encrypted = CryptoJS.AES.encrypt(json, key).toString();

        // Size Check
        const size = new Blob([encrypted]).size;

        try {
            localStorage.setItem(STORAGE_KEY, encrypted);
        } catch {
            throw new StorageError("Storage Quota Exceeded", 'QUOTA_EXCEEDED');
        }

        if (size > QUOTA_WARNING_BYTES) {
            return { success: true, warning: "Storage Full Warning" };
        }

        return { success: true };
    },

    // Load Data
    load(): AppState | null {
        const key = sessionStorage.getItem(SESSION_KEY_STORAGE);
        if (!key) throw new StorageError("Not Authenticated", 'NO_KEY');

        const encrypted = localStorage.getItem(STORAGE_KEY);
        if (!encrypted) return null;

        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, key);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) throw new Error("Decryption failed");

            const json = JSON.parse(decryptedString);
            return AppStateSchema.parse(json);
        } catch {
            throw new StorageError("Failed to decrypt or parse data", 'DATA_CORRUPTION');
        }
    },

    // Export Decrypted JSON
    exportData(): string {
        const data = this.load();
        if (!data) return "";
        return JSON.stringify(data, null, 2);
    },

    // Import JSON
    importData(jsonString: string): void {
        try {
            const json = JSON.parse(jsonString);
            const parsed = AppStateSchema.parse(json);
            // We save immediately to persist
            this.save(parsed);
        } catch {
            throw new Error("Invalid Import Data");
        }
    },

    // Factory Reset
    factoryReset() {
        localStorage.clear();
        sessionStorage.clear();
        // Reload page to reset state
        window.location.reload();
    },

    getUsage(): number {
        if (typeof window === 'undefined') return 0;
        const encrypted = localStorage.getItem(STORAGE_KEY);
        return encrypted ? new Blob([encrypted]).size : 0;
    }
};
