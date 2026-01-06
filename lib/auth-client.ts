import { createAuthClient } from "better-auth/react"
export const {signIn , signUp , signOut , useSession , } = createAuthClient({
    // baseURL: "http://localhost:3000"
    baseURL: "https://convo-ai-xu2r-k7ua7k4q3-akhileshchandewars-projects.vercel.app"
})