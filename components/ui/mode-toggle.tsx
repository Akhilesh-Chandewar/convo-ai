"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        const newTheme = theme === "light" ? "dark" : "light"

        // startViewTransition is now standard in many environments or types might be updated
        if (!document.startViewTransition) {
            setTheme(newTheme)
            return
        }

        const button = e.currentTarget
        const rect = button.getBoundingClientRect()
        // Improve center calculation: use the center of the button, taking scroll into account if necessary (usually client rect is viewport relative)
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2

        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )

        const transition = document.startViewTransition(() => {
            setTheme(newTheme)
        })

        transition.ready.then(() => {
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`
            ]

            document.documentElement.animate(
                {
                    clipPath: clipPath,
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            )
        })
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {
                theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />
            }
        </Button>
    )
}