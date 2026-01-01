"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { Github } from "lucide-react";

export default function SignInPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    async function handleEmailSignIn() {
        try {
            setLoading(true);
            await signIn.email({
                email,
                password,
                callbackURL: "/",
            });
        } catch (error) {
            console.error(error);
            alert("Invalid email or password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold">Welcome to ConvoAI</h1>
                    <p className="mt-2 text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>

                {/* Email + Password */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleEmailSignIn}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* GitHub OAuth */}
                <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                        signIn.social({
                            provider: "github",
                            callbackURL: "/",
                        })
                    }
                >
                    <Github className="w-4 h-4" />
                    Sign in with GitHub
                </Button>
            </div>
        </section>
    );
}
