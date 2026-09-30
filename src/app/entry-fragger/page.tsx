"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Instrução principal",
  "Objetivo imediato",
  "Gatilho para entrada",
  "Utilitária que deve aguardar",
  "Status HOLD ou GO",
] as const;

export default function EntryFraggerPage() {
  return (
    <RoleScreen roleLabel="Entry-Fragger" sections={SECTIONS}>
      <JoinRoomForm />
    </RoleScreen>
  );
}
