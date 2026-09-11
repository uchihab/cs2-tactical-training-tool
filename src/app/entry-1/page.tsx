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

export default function Entry1Page() {
  return (
    <RoleScreen roleLabel="Entry 1" sections={SECTIONS}>
      <JoinRoomForm role="ENTRY_1" roleLabel="Entry 1" />
    </RoleScreen>
  );
}
