import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string; user?: User }>;
  loginWithGoogle: (payload: { credential?: string; email?: string; name?: string; picture?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (name: string, email: string, pass: string, phone?: string, bio?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  initiatePasswordReset: (email: string, userId?: string) => Promise<{ success: boolean; message: string; resetLink?: string; expiresAt?: number }>;
  verifyResetToken: (token: string, email: string) => Promise<{ valid: boolean; message?: string }>;
  resetPasswordWithToken: (token: string, email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  addPointsToUser: (userId: string, points: number) => Promise<void>;
  isSuperAdmin: boolean;
  isAdminOrManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'raselbabu_token_v1';
const CURRENT_USER_KEY = 'raselbabu_current_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load current user', e);
    }
    return null;
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // Sync token to localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Load and refresh session and users from server
  const refreshUsers = async (authToken?: string | null) => {
    const activeToken = authToken || token;
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Session invalid');
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.role === 'admin' || data.user.role === 'manager') {
            refreshUsers(token);
          }
        }
      })
      .catch(() => {
        // Clear invalid token
        setToken(null);
        setCurrentUser(null);
      });
  }, [token]);

  // 1. Login with email & password via Server
  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Authentication failed.',
          user: data.user,
        };
      }

      setToken(data.token);
      setCurrentUser(data.user);
      if (data.user.role === 'admin' || data.user.role === 'manager') {
        refreshUsers(data.token);
      }

      return {
        success: true,
        message: data.message || `Welcome back, ${data.user.name}!`,
        user: data.user,
      };
    } catch (err) {
      return {
        success: false,
        message: 'Network error or server unreachable. Please try again.',
      };
    }
  };

  // 2. Google Sign-In via Server
  const loginWithGoogle = async (payload: { credential?: string; email?: string; name?: string; picture?: string }): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Google sign-in could not be completed.',
        };
      }

      setToken(data.token);
      setCurrentUser(data.user);
      if (data.user.role === 'admin' || data.user.role === 'manager') {
        refreshUsers(data.token);
      }

      return {
        success: true,
        message: data.message || `Signed in with Google as ${data.user.email}!`,
        user: data.user,
      };
    } catch {
      return {
        success: false,
        message: 'Unable to connect to Google authentication service.',
      };
    }
  };

  // 3. User Registration (Signup) via Server
  const signup = async (name: string, email: string, pass: string, phone?: string, bio?: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, phone, bio }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Registration failed.',
        };
      }

      if (data.token && data.user) {
        setToken(data.token);
        setCurrentUser(data.user);
      }

      return {
        success: true,
        message: data.message,
        user: data.user,
      };
    } catch {
      return {
        success: false,
        message: 'Network error during registration. Please try again.',
      };
    }
  };

  // 4. Logout
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  // 5. Change Password (for logged in User or Admin)
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!token) {
      return { success: false, message: 'You must be signed in to change your password.' };
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message || (res.ok ? 'Password updated.' : 'Failed to change password.'),
      };
    } catch {
      return { success: false, message: 'Server communication error while changing password.' };
    }
  };

  // 6. Admin-Initiated User Password Reset Link Dispatch (SERVER-SIDE ENFORCED)
  const initiatePasswordReset = async (email: string, userId?: string): Promise<{ success: boolean; message: string; resetLink?: string; expiresAt?: number }> => {
    if (!token) {
      return { success: false, message: 'Administrative authentication token required.' };
    }

    try {
      const res = await fetch('/api/admin/reset-password-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, userId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || data.message || 'Failed to generate password reset link.',
        };
      }

      return {
        success: true,
        message: data.message,
        resetLink: data.resetLink,
        expiresAt: data.expiresAt,
      };
    } catch {
      return { success: false, message: 'Server error while generating password reset link.' };
    }
  };

  // 7. Verify Reset Token
  const verifyResetToken = async (resetToken: string, email: string): Promise<{ valid: boolean; message?: string }> => {
    try {
      const res = await fetch(
        `/api/auth/verify-reset-token?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      return { valid: res.ok && data.valid, message: data.message };
    } catch {
      return { valid: false, message: 'Failed to verify reset link with server.' };
    }
  };

  // 8. Reset Password via Token
  const resetPasswordWithToken = async (resetToken: string, email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, email, newPassword }),
      });
      const data = await res.json();
      return {
        success: res.ok && data.success,
        message: data.message || 'Failed to reset password.',
      };
    } catch {
      return { success: false, message: 'Server error while resetting password.' };
    }
  };

  // 9. Approve User (Admin only, server enforced)
  const approveUser = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
        if (currentUser?.id === userId) {
          setCurrentUser(data.user);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 10. Reject User (Admin only, server enforced)
  const rejectUser = async (userId: string, reason?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
        if (currentUser?.id === userId) {
          setCurrentUser(data.user);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 11. Update User Role (Admin only, server enforced)
  const updateUserRole = async (userId: string, role: UserRole) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
        if (currentUser?.id === userId) {
          setCurrentUser(data.user);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 12. Add Points (Admin only, server enforced)
  const addPointsToUser = async (userId: string, pointsToAdd: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points: pointsToAdd }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
        if (currentUser?.id === userId) {
          setCurrentUser(data.user);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  const isSuperAdmin = currentUser?.role === 'admin';
  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        token,
        login,
        loginWithGoogle,
        signup,
        logout,
        changePassword,
        initiatePasswordReset,
        verifyResetToken,
        resetPasswordWithToken,
        approveUser,
        rejectUser,
        updateUserRole,
        updateProfile,
        addPointsToUser,
        isSuperAdmin,
        isAdminOrManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
