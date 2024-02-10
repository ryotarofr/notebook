import Link from "next/link"
import { siteConfig } from "@/config/site"
import ToggleThemeButton from "./mode-toggle"

export default function Footer() {
  return (
    <footer className="pb-10">
      <div className="mt-10 flex flex-col items-center justify-between border-t border-gray-400 px-6 pt-10 sm:px-10 md:flex-row">
        <div className="mb-4 flex space-x-4 md:mb-0">
          <Link className="text-sm hover:underline" href="#">
            プライバシーポリシー
          </Link>
        </div>
        <div className="text-sm">© LLC {siteConfig.name}. All rights reserved.</div>
        <ToggleThemeButton />
      </div>
    </footer>
  )
}