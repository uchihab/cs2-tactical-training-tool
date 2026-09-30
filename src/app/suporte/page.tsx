"use client";

import { RoleScreen } from "@/components/RoleScreen";
import { JoinRoomForm } from "@/components/room/JoinRoomForm";

const SECTIONS = [
  "Utilitária atual",
  "Local de lançamento",
  "Tipo de lançamento",
  "Timing",
  "Próxima utilitária",
  "Smoke restante",
  "Flash restante",
  "HE restante",
  "Molotov restante",
] as const;

export default function SuportePage() {
  return (
    <RoleScreen roleLabel="Suporte" sections={SECTIONS}>
      <JoinRoomForm />
    </RoleScreen>
  );
}
