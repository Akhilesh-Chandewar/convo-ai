import { cookies } from "next/headers";
import {
    verifyTokenAndGetSession,
    getUserById,
    AuthUser,
} from "./auth-server";

export interface Session {
    user: AuthUser;
    token: string;
}

/**
 * Auth object with API methods for server-side auth
 */
export const auth = {
    api: {
        /**
         * Get current session from request headers/cookies
         */
        async getSession({
            headers,
        }: {
            headers: Headers;
        }): Promise<Session | null> {
            // Try to get token from Authorization header
            const authHeader = headers.get("Authorization");
            let token = authHeader?.replace("Bearer ", "");

            // If no token in header, try cookies
            if (!token) {
                const cookieHeader = headers.get("cookie");
                if (cookieHeader) {
                    const cookies = cookieHeader.split(";");
                    const authCookie = cookies.find((c) =>
                        c.trim().startsWith("auth_token=")
                    );
                    if (authCookie) {
                        token = authCookie.split("=")[1];
                    }
                }
            }

            if (!token) {
                return null;
            }

            const session = await verifyTokenAndGetSession(token);
            if (!session) {
                return null;
            }

            return session;
        },
    },
};

/**
 * Get current user from cookies (for server components)
 */
export async function getCurrentSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return null;
    }

    return verifyTokenAndGetSession(token);
}

/**
 * Get current user from cookies (for server components)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const session = await getCurrentSession();
    if (!session) {
        return null;
    }
    return session.user;
}
