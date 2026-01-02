import { ModeToggle } from "@/components/ui/mode-toggle"


function Header() {
  return (
    <div className="flex w-full flex-row justify-end items-center border-border bg-sidebar px-4 py-3">
      <ModeToggle />
    </div>
  )
}

export default Header