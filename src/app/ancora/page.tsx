"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Posição a defender / controlar",
  "Área de responsabilidade",
  "Condição para permanecer",
  "Condição para rotacionar",
  "Prioridade de sobrevivência",
  "Comando HOLD ou ROTATE",
] as const;

export default function AncoraPage() {
  return (
    <RoleScreen roleLabel="Âncora" sections={SECTIONS}>
      <JoinRoomForm role="ANCORA" roleLabel="Âncora" />
    </RoleScreen>
  );
}
