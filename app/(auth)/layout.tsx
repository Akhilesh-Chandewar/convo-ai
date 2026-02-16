"use server";

import { getCurrentSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await getCurrentSession();

    if (session) {
        return redirect("/");
    }
    return <div>{children}</div>;
}

export default AuthLayout;