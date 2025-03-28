import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { Newspaper } from "lucide-react";
import { Link, Outlet } from "react-router";

export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <header className="p-4 flex justify-between items-center">
          <Link to="/">
            <div className="flex items-center gap-2">
              <Newspaper />
              <h1 className="text-sm font-bold">HNR</h1>
            </div>
          </Link>
          {user ? (
            <div className="flex items-center gap-2 text-xs">
              <Link to="/profile">profile — {user.username}</Link> |
              <Link to="/new">new</Link> |
              <button onClick={logout}>logout</button>
            </div>
          ) : (
            <button>Login</button>
          )}
        </header>
      </div>

      <main>
        <Outlet />
        <Toaster />
      </main>
    </>
  );
}
