"use client"

import * as React from "react"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"


import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { MainNavItem } from "@/types"
import { MobileNav } from "./mobile-nav"
import { Menu, X } from "lucide-react"

interface MainNavProps {
  items?: MainNavItem[]
  children?: React.ReactNode
}

export function MainNav({ items, children }: MainNavProps) {
  const segment = useSelectedLayoutSegment()
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false)

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  React.useEffect(() => {
    const closeMobileMenuOnClickOutside = (event: MouseEvent) => {
      if (showMobileMenu) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener("click", closeMobileMenuOnClickOutside)

    return () => {
      document.removeEventListener("click", closeMobileMenuOnClickOutside)
    }
  }, [showMobileMenu])

  return (
    <div className="flex w-full gap-6 md:justify-between md:gap-10">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <span className="font-urban hidden text-xl font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-4 md:flex">
          {items?.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:border-b hover:border-black sm:text-sm",
                item.href.startsWith(`/${segment}`)
                  ? "text-black dark:text-white"
                  : "text-black/60 dark:text-white/60",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <button
        className=" sticky ml-3 flex items-center space-x-2 md:hidden"
        onClick={toggleMobileMenu}
      >
        {showMobileMenu ? <X /> : <Menu />}
      </button>
      {showMobileMenu && items ? (
        <>
          <MobileNav items={items}>{children}</MobileNav>
          <Link href="/" className="md:hidden">{siteConfig.name}</Link>
        </>
      ) :
        <>
          <Link href="/" className="md:hidden">{siteConfig.name}</Link>
        </>
      }
    </div>
  )
}
