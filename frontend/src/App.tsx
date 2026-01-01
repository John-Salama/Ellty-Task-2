import { useState, useEffect, useCallback } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { Header } from "./components/Header";
import { AuthForm } from "./components/AuthForm";
import { StartingNumberForm } from "./components/StartingNumberForm";
import { CalculationTreeView } from "./components/CalculationTreeView";
import type { CalculationTree, OperationType } from "./types";
import { api } from "./services/api";
import "./index.css";

function AppContent() {
  const { user } = useAuth();
  const [trees, setTrees] = useState<CalculationTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchCalculations = useCallback(async () => {
    try {
      const data = await api.getCalculations();
      setTrees(data);
    } catch (error) {
      console.error("Failed to fetch calculations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  const handleCreateStartingNumber = async (value: number) => {
    await api.createStartingNumber(value);
    await fetchCalculations();
  };

  const handleAddOperation = async (
    parentId: number,
    operation: OperationType,
    operand: number
  ) => {
    await api.addOperation(parentId, operation, operand);
    await fetchCalculations();
  };

  const handleDeleteCalculation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this discussion?")) {
      return;
    }
    try {
      await api.deleteCalculation(id);
      await fetchCalculations();
    } catch (error) {
      alert("Failed to delete discussion");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Auth prompt */}
        {!user && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <button
                onClick={() => setShowAuthModal(true)}
                className="font-medium underline hover:no-underline"
              >
                Sign in
              </button>{" "}
              to start discussions and add operations.
            </p>
          </div>
        )}

        {/* New discussion form */}
        {user && (
          <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
            <StartingNumberForm onSubmit={handleCreateStartingNumber} />
          </div>
        )}

        {/* Discussions */}
        <div>
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">
            Discussions
          </h2>
          <CalculationTreeView
            trees={trees}
            loading={loading}
            onAddOperation={handleAddOperation}
            onDeleteCalculation={handleDeleteCalculation}
          />
        </div>
      </main>

      {/* Auth modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600"
            >
              ×
            </button>
            <AuthForm onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
