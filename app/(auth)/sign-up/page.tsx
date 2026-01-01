"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    async function handleSignUp() {
        try {
            setLoading(true);
            await signUp.email({
                email,
                password,
                name: username,
                callbackURL: "/",
            });
        } catch (err) {
            console.error(err);
            alert("Sign-up failed");
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
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </Button>
                </div>
            </div>
        </section>
    );
}
