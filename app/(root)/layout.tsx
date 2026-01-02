import { auth } from "@/lib/auth"
import { getCurrentUser } from "@/modules/auth/actions"
import ChatSideBar from "@/modules/chat/components/ChatSideBar"
import Header from "@/modules/chat/components/Header"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

async function layout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session) {
        return redirect("/sign-in")
    }
    const user = await getCurrentUser()
    return (
        <div className="flex h-screen overflow-hidden">
            <ChatSideBar user={user} />
            <main className="flex flex-1 flex-col overflow-hidden">
                <Header/>
                {children}
            </main>
        </div>
    )
}

export default layout