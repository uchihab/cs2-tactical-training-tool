interface SectionPlaceholderProps {
  label: string;
}

/**
 * Bloco de espaço reservado para um dado futuro (ex: "cronômetro", "fase atual").
 * Sem estado, sem lógica — apenas estrutura visual da fundação.
 */
export function SectionPlaceholder({ label }: SectionPlaceholderProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-600">Em breve</p>
    </div>
  );
}
