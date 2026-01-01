import { useAuth } from "../context/useAuth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Number Discussions
          </h1>
          <p className="text-sm text-zinc-500">
            Communicate through calculations
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">{user.username}</span>
            <button
              onClick={logout}
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
