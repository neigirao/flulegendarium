import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminRouteGuardProps {
  children: ReactNode;
}

export const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando permissões administrativas...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login-administrador" replace />;
  }

  return <>{children}</>;
};
