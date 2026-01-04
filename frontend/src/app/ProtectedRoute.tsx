import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}