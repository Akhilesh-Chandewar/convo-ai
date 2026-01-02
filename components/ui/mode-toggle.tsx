"use client"

import { Sun , Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {
                theme === "light" ? <Moon className="size-5" /> : <Sun size={"size-5"} />
            }
        </Button>
    )
}