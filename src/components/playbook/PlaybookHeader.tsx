"use client";

import Link from "next/link";

/** Cabeçalho comum às telas do Playbook (Configuration Mode). */
export function PlaybookHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Configuration mode</p>
        <h1 className="text-lg font-bold tracking-wide text-zinc-100">PLAYBOOK TÁTICO</h1>
      </div>
      <nav className="flex gap-4 text-xs font-semibold uppercase tracking-wide">
        <Link href="/playbook" className="text-zinc-300 hover:text-zinc-100">
          Estratégias
        </Link>
        <Link href="/playbook/skills" className="text-zinc-300 hover:text-zinc-100">
          Skills
        </Link>
        <Link href="/" className="text-zinc-500 hover:text-zinc-300">
          Sair
        </Link>
      </nav>
    </header>
  );
}
