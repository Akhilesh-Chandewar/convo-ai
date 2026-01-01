// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/databaseConnection";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // 🔐 Email / Username / Password
    credentials: {
        emailAndPassword: {
            enabled: true,

            // ✅ allow username during signup
            username: {
                enabled: true,
                unique: true,
            },

            // ⚠️ set to true in production
            requireEmailVerification: false,

            // optional but recommended
            password: {
                minLength: 8,
            },
        },
    },

    // 🌐 OAuth providers
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
});
