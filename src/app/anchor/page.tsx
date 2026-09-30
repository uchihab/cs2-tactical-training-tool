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

export default function AnchorPage() {
  return (
    <RoleScreen roleLabel="Anchor" sections={SECTIONS}>
      <JoinRoomForm />
    </RoleScreen>
  );
}
