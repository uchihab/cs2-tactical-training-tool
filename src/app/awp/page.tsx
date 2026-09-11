"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Instrução principal",
  "Posição / linha de mira",
  "Área prioritária",
  "Condição para reposicionar",
  "Condição para buscar pick",
  "Comando HOLD ou GO",
] as const;

export default function AwpPage() {
  return (
    <RoleScreen roleLabel="AWP" sections={SECTIONS}>
      <JoinRoomForm role="AWP" roleLabel="AWP" />
    </RoleScreen>
  );
}
