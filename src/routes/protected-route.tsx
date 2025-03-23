import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Navigate } from "react-router";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  console.log({ user, loading });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.username) {
    return <Navigate to="/create-username" />;
  }

  return children;
};

export default ProtectedRoute;
