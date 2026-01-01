import { useState, type FormEvent } from "react";
import { operationSymbols, type OperationType } from "../types";

interface OperationFormProps {
  parentId: number;
  parentValue: number;
  onSubmit: (
    parentId: number,
    operation: OperationType,
    operand: number
  ) => Promise<void>;
  onCancel: () => void;
}

export function OperationForm({
  parentId,
  parentValue,
  onSubmit,
  onCancel,
}: OperationFormProps) {
  const [operation, setOperation] = useState<OperationType>("add");
  const [operand, setOperand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPreview = (): string => {
    const numOperand = parseFloat(operand);
    if (isNaN(numOperand)) return "?";

    switch (operation) {
      case "add":
        return (parentValue + numOperand).toString();
      case "subtract":
        return (parentValue - numOperand).toString();
      case "multiply":
        return (parentValue * numOperand).toString();
      case "divide":
        return numOperand === 0 ? "∞" : (parentValue / numOperand).toString();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numOperand = parseFloat(operand);
    if (isNaN(numOperand)) {
      setError("Please enter a valid number");
      return;
    }

    if (operation === "divide" && numOperand === 0) {
      setError("Cannot divide by zero");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(parentId, operation, numOperand);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md"
    >
      <div className="flex items-center gap-2 flex-wrap text-sm">
        <span className="font-mono font-medium text-zinc-700">
          {parentValue}
        </span>
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value as OperationType)}
          className="px-2 py-1 border border-zinc-300 rounded text-sm font-mono bg-white"
        >
          {(Object.keys(operationSymbols) as OperationType[]).map((op) => (
            <option key={op} value={op}>
              {operationSymbols[op]}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={operand}
          onChange={(e) => setOperand(e.target.value)}
          placeholder="0"
          step="any"
          className="w-20 px-2 py-1 border border-zinc-300 rounded text-sm font-mono"
          required
        />
        <span className="text-zinc-400">=</span>
        <span className="font-mono font-semibold text-blue-600">
          {getPreview()}
        </span>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <span className="spinner" style={{ width: 14, height: 14 }} />
          )}
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
