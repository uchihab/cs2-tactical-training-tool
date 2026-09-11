import { RoleScreen } from "@/components/RoleScreen";

const SECTIONS = [
  "Cronômetro do round",
  "Estratégia ativa",
  "Momento/fase atual",
  "Jogadores conectados",
  "Utilitárias restantes",
  "Informações coletadas",
  "Controle de mapa",
  "Árvore de decisão",
] as const;

const EXEC_ACTIONS = ["EXEC A", "EXEC B", "HOLD", "FAKE", "ROTATE", "CANCEL"] as const;

export default function IglPage() {
  return (
    <RoleScreen roleLabel="IGL" sections={SECTIONS}>
      <div className="grid grid-cols-2 gap-3 pt-2">
        {EXEC_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            disabled
            className="rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-zinc-400 disabled:opacity-60"
          >
            {action}
          </button>
        ))}
      </div>
    </RoleScreen>
  );
}
