import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { RoleCode } from '../types';

interface ProtectedRouteProps {
    allowedRoles: RoleCode[];
    children: ReactNode;
}

export default function ProtectedRoute({
    allowedRoles,
    children,
}: ProtectedRouteProps) {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role_code)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}