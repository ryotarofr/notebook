import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLockBody } from "@/hooks/use-lock-body"
import { MainNavItem } from "@/types"

interface MobileNavProps {
  items: MainNavItem[]
  children?: React.ReactNode
}

export function MobileNav({ items, children }: MobileNavProps) {
  useLockBody()

  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-80 fixed inset-0 top-14 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto pb-32 shadow-md md:hidden"
      )}
    >
      <div className="relative z-20 grid gap-6 rounded-md bg-white px-4 text-popover-foreground shadow-md">
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "text-md flex w-full items-center border-b px-2 py-6 font-medium hover:border-pink-500",
                item.disabled && "cursor-not-allowed opacity-60"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
