"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

export interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Session {
    token: string;
    user: User;
}

class AuthClient {
    private token: string | null = null;
    private user: User | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.token = localStorage.getItem("auth_token");
        }
    }

    /**
     * Sign up with email and password
     */
    async signUp(email: string, password: string, name: string, callbackURL?: string) {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Sign up failed");
        }

        const data = await res.json();
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem("auth_token", data.token);

        if (callbackURL) {
            window.location.href = callbackURL;
        }

        return data;
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string, callbackURL?: string) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Sign in failed");
        }

        const data = await res.json();
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem("auth_token", data.token);

        if (callbackURL) {
            window.location.href = callbackURL;
        }

        return data;
    }

    /**
     * Sign out
     */
    async signOut(fetchOptions?: { onSuccess?: () => void }) {
        if (this.token) {
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`,
                },
            }).catch(() => {
                // Ignore errors
            });
        }

        this.token = null;
        this.user = null;
        localStorage.removeItem("auth_token");

        if (fetchOptions?.onSuccess) {
            fetchOptions.onSuccess();
        }
    }

    /**
     * Get current session
     */
    async getSession(): Promise<Session | null> {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            return null;
        }

        try {
            const res = await fetch("/api/auth/session", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                localStorage.removeItem("auth_token");
                return null;
            }

            const data = await res.json();
            this.token = token;
            this.user = data.user;
            return data;
        } catch (error) {
            localStorage.removeItem("auth_token");
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.token;
    }

    /**
     * Get current user
     */
    getUser(): User | null {
        return this.user;
    }

    /**
     * Get current token
     */
    getToken(): string | null {
        return this.token;
    }
}

// Create singleton instance
const authClient = new AuthClient();

/**
 * Hook to use authentication
 */
export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Load session on mount
    useEffect(() => {
        const loadSession = async () => {
            try {
                const session = await authClient.getSession();
                setSession(session);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load session");
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    return {
        session,
        user: session?.user || null,
        loading,
        error,
        isAuthenticated: !!session,
    };
}

/**
 * Export sign in function
 */
export const signIn = {
    email: async (params: {
        email: string;
        password: string;
        callbackURL?: string;
    }) => {
        return authClient.signIn(params.email, params.password, params.callbackURL);
    },
    social: async (params: { provider: string; callbackURL?: string }) => {
        // For now, social login is not implemented
        // This would require OAuth setup
        throw new Error(`Social login with ${params.provider} not yet implemented`);
    },
};

/**
 * Export sign up function
 */
export const signUp = {
    email: async (params: {
        email: string;
        password: string;
        name: string;
        callbackURL?: string;
    }) => {
        return authClient.signUp(
            params.email,
            params.password,
            params.name,
            params.callbackURL
        );
    },
};

/**
 * Export sign out function
 */
export const signOut = async (fetchOptions?: { onSuccess?: () => void }) => {
    return authClient.signOut(fetchOptions);
};

/**
 * Export use session hook
 */
export const useSession = () => {
    return useAuth();
};