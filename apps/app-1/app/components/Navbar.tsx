import Link from "next/link";

import { ThemeSwitcher } from "./ThemeSwitcher";

export function Navbar() {
  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-bold">
          Hebrew Date Converter
        </Link>
        <ThemeSwitcher />
      </nav>
    </header>
  );
}
