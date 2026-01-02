"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";


async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(session){
        return redirect('/');        
    }
    return (
        <div>
            {children}
        </div>
    )
}

export default AuthLayout