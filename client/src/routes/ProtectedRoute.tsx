import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/authContext";

// ProtectedRoute component to restrict access based on user role and email verification
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "Admin" | "Teacher" | "Student";
  requireVerifiedEmail?: boolean;
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requireVerifiedEmail = false,
}: ProtectedRouteProps) => {
  // Get the authentication context
  const { userLoggedIn, currentUser, role } = useAuth();

  // Check if the user is logged in
  if (!userLoggedIn && !currentUser) {
    return <Navigate to="/home" replace />;
  }

  // Check if the user has verified their email if required
  if (requireVerifiedEmail && currentUser && !currentUser.emailVerified) {
    return <Navigate to="/home" replace />;
  }

  // Check if the user has the required role
  if (requiredRole && role !== requiredRole && role !== "Admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;
