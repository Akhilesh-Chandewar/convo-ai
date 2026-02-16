import { prisma } from "@/lib/databaseConnection";
import bcryptjs from "bcryptjs";
import { nanoid } from "nanoid";
import { createHash, randomBytes } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface AuthUser {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthSession {
    token: string;
    user: AuthUser;
}

/**
 * Simple JWT-like token generation
 */
function generateToken(userId: string, email: string): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
        "base64url"
    );
    const payload = Buffer.from(
        JSON.stringify({
            userId,
            email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY / 1000,
        })
    ).toString("base64url");

    // Create HMAC signature
    const signature = createHash("sha256")
        .update(`${header}.${payload}${JWT_SECRET}`)
        .digest("base64url");

    return `${header}.${payload}.${signature}`;
}

/**
 * Verify JWT-like token
 */
function verifyToken(
    token: string
): { userId: string; email: string } | null {
    try {
        const [header, payload, signature] = token.split(".");

        // Verify signature
        const expectedSignature = createHash("sha256")
            .update(`${header}.${payload}${JWT_SECRET}`)
            .digest("base64url");

        if (signature !== expectedSignature) {
            return null;
        }

        const decodedPayload = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf-8")
        );

        // Check expiration
        if (decodedPayload.exp * 1000 < Date.now()) {
            return null;
        }

        return {
            userId: decodedPayload.userId,
            email: decodedPayload.email,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Register a new user with email and password
 */
export async function registerUser(
    email: string,
    password: string,
    name: string
): Promise<AuthSession> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            id: nanoid(),
            email,
            name,
            emailVerified: false,
            accounts: {
                create: {
                    id: nanoid(),
                    accountId: email,
                    providerId: "credentials",
                    password: hashedPassword,
                },
            },
        },
    });

    // Create session
    const token = generateToken(user.id, user.email);

    // Store session in database
    await prisma.session.create({
        data: {
            id: nanoid(),
            token,
            expiresAt: new Date(Date.now() + JWT_EXPIRY),
            userId: user.id,
            userAgent: "",
            ipAddress: "",
        },
    });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
}

/**
 * Login user with email and password
 */
export async function loginUser(
    email: string,
    password: string
): Promise<AuthSession> {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: {
                where: { providerId: "credentials" },
            },
        },
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check password
    const account = user.accounts[0];
    if (!account || !account.password) {
        throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcryptjs.compare(password, account.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    // Create session
    const token = generateToken(user.id, user.email);

    await prisma.session.create({
        data: {
            id: nanoid(),
            token,
            expiresAt: new Date(Date.now() + JWT_EXPIRY),
            userId: user.id,
            userAgent: "",
            ipAddress: "",
        },
    });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
}

/**
 * Verify token and get user session
 */
export async function verifyTokenAndGetSession(
    token: string
): Promise<AuthSession | null> {
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return null;
        }
        const session = await prisma.session.findUnique({
            where: { token },
            include: {
                user: true,
            },
        });

        if (!session || new Date() > session.expiresAt) {
            return null;
        }

        return {
            token,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                emailVerified: session.user.emailVerified,
                image: session.user.image,
                createdAt: session.user.createdAt,
                updatedAt: session.user.updatedAt,
            },
        };
    } catch (error) {
        return null;
    }
}

/**
 * Logout user by removing session
 */
export async function logoutUser(token: string): Promise<void> {
    await prisma.session.delete({
        where: { token },
    }).catch(() => {
        // Session might not exist, that's ok
    });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
