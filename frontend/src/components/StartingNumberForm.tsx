import { useState, type FormEvent } from "react";

interface StartingNumberFormProps {
  onSubmit: (value: number) => Promise<void>;
}

export function StartingNumberForm({ onSubmit }: StartingNumberFormProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(numValue);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-zinc-700 mb-2">
        Start a new discussion
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
          step="any"
          className="flex-1 px-3 py-2 border border-zinc-300 rounded-md text-sm focus:border-blue-500 focus:ring-0"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <span className="spinner" />}
          Start
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
