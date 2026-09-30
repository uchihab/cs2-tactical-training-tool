import { StrategyEditor } from "@/components/playbook/StrategyEditor";

export default async function StrategyEditorPage(
  props: PageProps<"/playbook/strategies/[strategyId]">,
) {
  const { strategyId } = await props.params;
  return <StrategyEditor strategyId={strategyId} />;
}
