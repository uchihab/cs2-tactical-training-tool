import Link from "next/link";
import type { ReactNode } from "react";
import { SectionPlaceholder } from "./SectionPlaceholder";

interface RoleScreenProps {
  roleLabel: string;
  sections: readonly string[];
  children?: ReactNode;
}

/**
 * Casca de tela comum às 5 funções: cabeçalho com a função ativa,
 * lista de seções de dados futuros e um slot opcional para conteúdo
 * específico da função (ex: botões do IGL).
 */
export function RoleScreen({ roleLabel, sections, children }: RoleScreenProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-xs text-zinc-500 underline underline-offset-2">
          Trocar função
        </Link>
        <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">
          {roleLabel}
        </span>
      </header>

      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <SectionPlaceholder key={section} label={section} />
        ))}
      </div>

      {children}
    </main>
  );
}
