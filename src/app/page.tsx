import Link from "next/link";
import { ROLE_ROUTES } from "@/lib/constants/roles";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-zinc-100">CS2 Tactical Tool</h1>
        <p className="mt-1 text-sm text-zinc-500">Selecione sua função</p>
      </div>

      <nav className="flex flex-col gap-3">
        {ROLE_ROUTES.map(({ role, path, label }) => (
          <Link
            key={role}
            href={path}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-zinc-200"
          >
            {label}
          </Link>
        ))}
      </nav>

      <Link
        href="/playbook"
        className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-4 py-3 text-center text-sm font-semibold text-emerald-300"
      >
        PLAYBOOK (Coach/IGL)
      </Link>
    </main>
  );
}
