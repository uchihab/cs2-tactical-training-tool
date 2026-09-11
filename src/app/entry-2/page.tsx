import { RoleScreen } from "@/components/RoleScreen";

const SECTIONS = [
  "Cronômetro",
  "Fase atual",
  "Instrução principal",
  "Quando acompanhar Entry 1",
  "Gatilho para trade",
  "Área que deve limpar",
  "Status HOLD ou GO",
] as const;

export default function Entry2Page() {
  return <RoleScreen roleLabel="Entry 2" sections={SECTIONS} />;
}
