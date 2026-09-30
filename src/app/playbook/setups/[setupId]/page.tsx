import { SetupEditor } from "@/components/playbook/SetupEditor";

export default async function SetupEditorPage(props: PageProps<"/playbook/setups/[setupId]">) {
  const { setupId } = await props.params;
  return <SetupEditor setupId={setupId} />;
}
