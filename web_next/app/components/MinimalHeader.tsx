// app/components/MinimalHeader.tsx

import Link from "next/link";

export function MinimalHeader({ current }: { current?: "home" | "history" }) {
  const linkClass = (active: boolean) =>
    active
      ? "text-zinc-900"
      : "text-zinc-600 hover:text-zinc-900";

  return (
    <header className="h-16 sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-zinc-900">
          Car Price
        </Link>

        <nav className="flex items-center gap-4 text-base">
          <Link href="/" className={linkClass(current === "home")}>
            Home
          </Link>
          <Link href="/history" className={linkClass(current === "history")}>
            Historique
          </Link>
        </nav>
      </div>
    </header>
  );
}