import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";
import * as useAuthModule from "../context/useAuth";

// Mock useAuth hook
vi.mock("../context/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the title", () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText("Number Discussions")).toBeInTheDocument();
  });

  it("should show login info when user is logged in", () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { id: 1, username: "testuser" },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("should not show logout button when not logged in", () => {
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    expect(screen.queryByText("Log out")).not.toBeInTheDocument();
  });
});
