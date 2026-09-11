import { RoleScreen } from "@/components/RoleScreen";

const SECTIONS = [
  "Cronômetro",
  "Fase atual",
  "Área que deve controlar",
  "Posição desejada",
  "Condição para permanecer",
  "Condição para avançar",
  "Momento de cortar rotação",
  "Comando enviado pelo IGL",
] as const;

export default function LurkerPage() {
  return <RoleScreen roleLabel="Lurker" sections={SECTIONS} />;
}
