import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateToken = (newToken) => {
    setTokenState(newToken);
    setAccessToken(newToken);
  };

  // Silent session initialization via refresh token cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res.data.success) {
          const accessToken = res.data.accessToken || res.data.token;
          updateToken(accessToken);
          setUser(res.data.user);
        }
      } catch (err) {
        updateToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // General Login (Role-agnostic / Medical Store / Admin)
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const accessToken = res.data.accessToken || res.data.token;
      updateToken(accessToken);
      setUser(res.data.user);
      return { success: true, user: res.data.user, is_approved: res.data.is_approved };
    }
    return { success: false, message: res.data.message };
  };

  // Patient Dedicated Login (Email + Password)
  const patientLogin = async (email, password) => {
    const res = await api.post('/auth/patient/login', { email, password });
    if (res.data.success) {
      const accessToken = res.data.accessToken || res.data.token;
      updateToken(accessToken);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data.message };
  };

  // Step 1: Patient Dedicated Signup (Email + Password) -> Triggers OTP Email
  const patientSignup = async (name, email, password) => {
    const res = await api.post('/auth/patient/signup', { name, email, password });
    return res.data;
  };

  // Step 2: Verify Signup OTP -> Creates account & logs in
  const verifySignupOtp = async (email, otp) => {
    const res = await api.post('/auth/patient/verify-signup-otp', { email, otp });
    if (res.data.success) {
      const accessToken = res.data.accessToken || res.data.token;
      updateToken(accessToken);
      setUser(res.data.user);
      return { success: true, user: res.data.user, message: res.data.message };
    }
    return { success: false, message: res.data.message };
  };

  // Resend Signup OTP
  const resendSignupOtp = async (email) => {
    const res = await api.post('/auth/patient/resend-signup-otp', { email });
    return res.data;
  };

  // Google OAuth Login (Patient)
  const loginWithGoogle = async (code) => {
    const res = await api.post('/auth/google', { code });
    if (res.data.success) {
      const accessToken = res.data.accessToken || res.data.token;
      updateToken(accessToken);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    }
    return { success: false, message: res.data.message };
  };

  // Medical Store & Admin Signup
  const signup = async (signupData) => {
    const res = await api.post('/auth/signup', signupData);
    if (res.data.success) {
      const accessToken = res.data.accessToken || res.data.token;
      updateToken(accessToken);
      setUser(res.data.user);
      return {
        success: true,
        user: res.data.user,
        is_approved: res.data.is_approved,
        message: res.data.message,
      };
    }
    return { success: false, message: res.data.message };
  };

  // Forgot Password Request
  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  // Verify Reset Password OTP
  const verifyResetOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-reset-otp', { email, otp });
    return res.data;
  };

  // Reset Password Request
  const resetPassword = async (email, token, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, token, newPassword });
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      updateToken(null);
      setUser(null);
    }
  };

  const isPatient = user?.role === 'patient';
  const isStore = user?.role === 'store';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        patientLogin,
        patientSignup,
        verifySignupOtp,
        resendSignupOtp,
        loginWithGoogle,
        signup,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        logout,
        isPatient,
        isStore,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
