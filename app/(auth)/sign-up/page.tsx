"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";

export default function SignUpPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    async function handleSignUp() {
        // Clear previous errors
        setError("");

        // Client-side validation
        if (!username.trim()) {
            setError("Username is required");
            return;
        }
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            setLoading(true);
            await signUp.email({
                email,
                password,
                name: username,
                callbackURL: "/",
            });
        } catch (err: unknown) {
            console.error(err);
            // Display the actual error message from the API
            const errorMessage = err instanceof Error ? err.message : "Sign-up failed. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold">Create an account</h1>
                    <p className="mt-2 text-muted-foreground">
                        Sign up to get started
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="akhil"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </Button>

                    {/* Sign In Link */}
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/sign-in"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
