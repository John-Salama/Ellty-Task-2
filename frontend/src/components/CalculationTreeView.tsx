import type { CalculationTree, OperationType } from "../types";
import { CalculationNode } from "./CalculationNode";

interface CalculationTreeViewProps {
  trees: CalculationTree[];
  loading: boolean;
  onAddOperation: (
    parentId: number,
    operation: OperationType,
    operand: number
  ) => Promise<void>;
  onDeleteCalculation: (id: number) => Promise<void>;
}

export function CalculationTreeView({
  trees,
  loading,
  onAddOperation,
  onDeleteCalculation,
}: CalculationTreeViewProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-sm">No discussions yet</p>
        <p className="text-xs mt-1">Start one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trees.map((tree) => (
        <div
          key={tree.id}
          className="bg-white border border-zinc-200 rounded-lg p-4"
        >
          <CalculationNode
            node={tree}
            onAddOperation={onAddOperation}
            onDeleteCalculation={onDeleteCalculation}
          />
        </div>
      ))}
    </div>
  );
}
