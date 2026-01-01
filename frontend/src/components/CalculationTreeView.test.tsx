import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalculationTreeView } from "./CalculationTreeView";
import type { CalculationTree } from "../types";

// Mock useAuth
vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("CalculationTreeView", () => {
  const mockOnAddOperation = vi.fn();
  const mockOnDeleteCalculation = vi.fn();

  it("should show loading state", () => {
    render(
      <CalculationTreeView
        trees={[]}
        loading={true}
        onAddOperation={mockOnAddOperation}
        onDeleteCalculation={mockOnDeleteCalculation}
      />
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show empty state when no calculations", () => {
    render(
      <CalculationTreeView
        trees={[]}
        loading={false}
        onAddOperation={mockOnAddOperation}
        onDeleteCalculation={mockOnDeleteCalculation}
      />
    );
    expect(screen.getByText("No discussions yet")).toBeInTheDocument();
  });

  it("should render calculation trees", () => {
    const mockTrees: CalculationTree[] = [
      {
        id: 1,
        user_id: 1,
        parent_id: null,
        value: 42,
        operation: null,
        operand: null,
        created_at: "2025-01-01T00:00:00Z",
        username: "testuser",
        children: [],
      },
    ];

    render(
      <CalculationTreeView
        trees={mockTrees}
        loading={false}
        onAddOperation={mockOnAddOperation}
        onDeleteCalculation={mockOnDeleteCalculation}
      />
    );
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/testuser/)).toBeInTheDocument();
  });

  it("should render nested calculations", () => {
    const mockTrees: CalculationTree[] = [
      {
        id: 1,
        user_id: 1,
        parent_id: null,
        value: 10,
        operation: null,
        operand: null,
        created_at: "2025-01-01T00:00:00Z",
        username: "user1",
        children: [
          {
            id: 2,
            user_id: 2,
            parent_id: 1,
            value: 15,
            operation: "add",
            operand: 5,
            created_at: "2025-01-01T01:00:00Z",
            username: "user2",
            children: [],
          },
        ],
      },
    ];

    render(
      <CalculationTreeView
        trees={mockTrees}
        loading={false}
        onAddOperation={mockOnAddOperation}
        onDeleteCalculation={mockOnDeleteCalculation}
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("+ 5 =")).toBeInTheDocument();
  });
});
