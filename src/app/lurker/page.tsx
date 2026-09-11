"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Área que deve controlar",
  "Posição desejada",
  "Condição para permanecer",
  "Condição para avançar",
  "Momento de cortar rotação",
  "Comando enviado pelo IGL",
] as const;

export default function LurkerPage() {
  return (
    <RoleScreen roleLabel="Lurker" sections={SECTIONS}>
      <JoinRoomForm role="LURKER" roleLabel="Lurker" />
    </RoleScreen>
  );
}
