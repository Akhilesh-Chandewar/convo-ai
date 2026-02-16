import { registerUser, loginUser, logoutUser, verifyTokenAndGetSession } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function setAuthCookie(response: NextResponse, token: string) {
    response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
}

function clearAuthCookie(response: NextResponse) {
    response.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}

export async function POST(request: NextRequest) {
    const { pathname } = new URL(request.url);
    const action = pathname.split("/").pop();

    try {
        if (action === "register") {
            const { email, password, name } = await request.json();

            if (!email || !password || !name) {
                return NextResponse.json(
                    { message: "Missing required fields" },
                    { status: 400 }
                );
            }

            const session = await registerUser(email, password, name);
            const response = NextResponse.json(session);
            setAuthCookie(response, session.token);
            return response;
        }

        if (action === "login") {
            const { email, password } = await request.json();

            if (!email || !password) {
                return NextResponse.json(
                    { message: "Missing email or password" },
                    { status: 400 }
                );
            }

            const session = await loginUser(email, password);
            const response = NextResponse.json(session);
            setAuthCookie(response, session.token);
            return response;
        }

        if (action === "logout") {
            const authHeader = request.headers.get("Authorization");
            const token = authHeader?.replace("Bearer ", "");

            if (token) {
                await logoutUser(token);
            }

            const response = NextResponse.json({ message: "Logged out successfully" });
            clearAuthCookie(response);
            return response;
        }

        if (action === "session") {
            const authHeader = request.headers.get("Authorization");
            const token = authHeader?.replace("Bearer ", "");

            if (!token) {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                );
            }

            const session = await verifyTokenAndGetSession(token);
            if (!session) {
                return NextResponse.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                );
            }

            return NextResponse.json(session);
        }

        return NextResponse.json(
            { message: "Not found" },
            { status: 404 }
        );
    } catch (error: unknown) {
        console.error("Auth error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return POST(request);
}