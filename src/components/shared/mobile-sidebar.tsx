"use client"

import { useState } from "react"
import { Menu }     from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Sidebar }  from "./sidebar"
import type { Role } from "@prisma/client"

interface MobileSidebarProps {
  name:   string
  email:  string
  role:   Role
  image?: string | null
  phone?: string | null
}

export function MobileSidebar({ name, email, role, image, phone }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <Sidebar
            name={name}
            email={email}
            role={role}
            image={image}
            phone={phone}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
