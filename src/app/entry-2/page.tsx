"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Instrução principal",
  "Quando acompanhar Entry 1",
  "Gatilho para trade",
  "Área que deve limpar",
  "Status HOLD ou GO",
] as const;

export default function Entry2Page() {
  return (
    <RoleScreen roleLabel="Entry 2" sections={SECTIONS}>
      <JoinRoomForm role="ENTRY_2" roleLabel="Entry 2" />
    </RoleScreen>
  );
}
