import React, { useEffect } from 'react';
import { useAuth } from '../hooks/authContext';
import { useRouter } from 'expo-router';

// ProtectedRoute component to restrict access based on user role and email verification
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'Teacher' | 'Student';
  requireVerifiedEmail?: boolean;
}

export const ProtectedScreen = ({ children, requiredRole, requireVerifiedEmail = false }: ProtectedRouteProps) => {
  const { loading, userLoggedIn, currentUser, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!userLoggedIn || !currentUser) {
      router.replace('/');
      return;
    }
    if (requireVerifiedEmail && !currentUser.emailVerified) {
      router.replace('/signInWithEmailPassword/verifyEmailPage');
      return;
    }
    if (requiredRole && role !== requiredRole && role !== 'Admin') {
      router.replace('/');
      return;
    }
  }, [loading, userLoggedIn, currentUser, role]);

  return <>{children}</>;
};
