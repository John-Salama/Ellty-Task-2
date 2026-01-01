import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthForm } from "./AuthForm";
import * as useAuthModule from "../context/useAuth";

// Mock useAuth hook
vi.mock("../context/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("AuthForm", () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: null,
      login: mockLogin,
      register: mockRegister,
      logout: vi.fn(),
    });
  });

  it("should render login form by default", () => {
    render(<AuthForm />);
    expect(
      screen.getByRole("heading", { name: "Welcome back" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should switch to register form", () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText("Sign up"));
    expect(
      screen.getByRole("heading", { name: "Create account" })
    ).toBeInTheDocument();
  });

  it("should call login on submit", async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
    });
  });

  it("should show error message on login failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<AuthForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});
