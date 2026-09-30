"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Instrução principal",
  "Quando acompanhar Entry-Fragger",
  "Gatilho para trade",
  "Área que deve limpar",
  "Status HOLD ou GO",
] as const;

export default function RiflerPage() {
  return (
    <RoleScreen roleLabel="Rifler" sections={SECTIONS}>
      <JoinRoomForm />
    </RoleScreen>
  );
}
