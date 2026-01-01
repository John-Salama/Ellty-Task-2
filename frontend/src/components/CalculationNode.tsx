import { useState } from "react";
import {
  operationSymbols,
  type CalculationTree,
  type OperationType,
} from "../types";
import { OperationForm } from "./OperationForm";
import { useAuth } from "../context/useAuth";

interface CalculationNodeProps {
  node: CalculationTree;
  onAddOperation: (
    parentId: number,
    operation: OperationType,
    operand: number
  ) => Promise<void>;
  onDeleteCalculation: (id: number) => Promise<void>;
  depth?: number;
}

export function CalculationNode({
  node,
  onAddOperation,
  onDeleteCalculation,
  depth = 0,
}: CalculationNodeProps) {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const handleAddOperation = async (
    parentId: number,
    operation: OperationType,
    operand: number
  ) => {
    await onAddOperation(parentId, operation, operand);
    setShowForm(false);
  };

  const formatValue = (value: number): string => {
    const rounded = Math.round(value * 1000000) / 1000000;
    return rounded.toString();
  };

  const isStarting = node.parent_id === null;
  const operationDisplay = node.operation
    ? `${operationSymbols[node.operation as OperationType]} ${node.operand}`
    : null;

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-zinc-200" : ""}>
      <div className="py-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Value */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-sm font-medium ${
              isStarting
                ? "bg-blue-100 text-blue-800"
                : "bg-zinc-100 text-zinc-800"
            }`}
          >
            {operationDisplay && (
              <span className="text-zinc-500">{operationDisplay} =</span>
            )}
            {formatValue(node.value)}
          </span>

          {/* Meta */}
          <span className="text-xs text-zinc-500">
            {node.username} · {new Date(node.created_at).toLocaleDateString()}
          </span>

          {/* Reply */}
          {user && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Reply
            </button>
          )}

          {/* Delete - only for creator */}
          {user && user.username === node.username && (
            <button
              onClick={() => onDeleteCalculation(node.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </div>

        {showForm && (
          <OperationForm
            parentId={node.id}
            parentValue={node.value}
            onSubmit={handleAddOperation}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>

      {node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <CalculationNode
              key={child.id}
              node={child}
              onAddOperation={onAddOperation}
              onDeleteCalculation={onDeleteCalculation}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
