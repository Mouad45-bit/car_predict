// app/components/MinimalHeader.tsx

import Link from "next/link";

export function MinimalHeader({ current }: { current?: "home" | "history" }) {
  const linkTextClass = (active: boolean) =>
    active ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900";

  const iconClass = (active: boolean) =>
    active ? "opacity-100" : "opacity-60 group-hover:opacity-90";

  return (
    <header className="h-18 sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl uppercase font-semibold tracking-tight text-zinc-900">
          Car Price
        </Link>

        <nav className="flex items-center gap-6 text-base">
          <Link
            href="/"
            className={`group flex flex-col items-center leading-none ${linkTextClass(
              current === "home"
            )}`}
          >
            <img
              src="/icons/HomeIcon.svg"
              alt=""
              className={`mb-1 h-6 w-6 ${iconClass(current === "home")}`}
            />
            <span>Home</span>
          </Link>

          <Link
            href="/history"
            className={`group flex flex-col items-center leading-none ${linkTextClass(
              current === "history"
            )}`}
          >
            <img
              src="/icons/HistoryIcon.svg"
              alt=""
              className={`mb-1 h-6 w-6 ${iconClass(current === "history")}`}
            />
            <span>Historique</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}