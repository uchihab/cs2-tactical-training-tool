import { RoleScreen } from "@/components/RoleScreen";

const SECTIONS = [
  "Cronômetro",
  "Fase atual",
  "Utilitária atual",
  "Local de lançamento",
  "Tipo de lançamento",
  "Timing",
  "Próxima utilitária",
  "Smoke restante",
  "Flash restante",
  "HE restante",
  "Molotov restante",
] as const;

export default function SupportPage() {
  return <RoleScreen roleLabel="Support" sections={SECTIONS} />;
}
