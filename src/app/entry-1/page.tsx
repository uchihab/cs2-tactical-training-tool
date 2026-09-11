import { RoleScreen } from "@/components/RoleScreen";

const SECTIONS = [
  "Cronômetro",
  "Fase atual",
  "Instrução principal",
  "Objetivo imediato",
  "Gatilho para entrada",
  "Utilitária que deve aguardar",
  "Status HOLD ou GO",
] as const;

export default function Entry1Page() {
  return <RoleScreen roleLabel="Entry 1" sections={SECTIONS} />;
}
