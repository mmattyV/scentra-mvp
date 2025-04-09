'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signIn, 
  signUp, 
  confirmSignUp, 
  signOut, 
  resendSignUpCode, 
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser,
  fetchUserAttributes
} from 'aws-amplify/auth';
import { getAmplifyConfig } from './amplify';
import { User, AuthState } from '../types';

interface AuthContextType {
  authState: AuthState;
  signIn: (username: string, password: string) => Promise<any>;
  signUp: (username: string, password: string, email: string, name: string) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  signOut: () => Promise<void>;
  resendConfirmationCode: (username: string) => Promise<any>;
  resetPassword: (username: string) => Promise<any>;
  confirmResetPassword: (username: string, code: string, newPassword: string) => Promise<any>;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true
};

// Interface for Cognito user attributes
interface CognitoUserAttribute {
  Name: string;
  Value: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    // Initialize Amplify on client side
    getAmplifyConfig();
    
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        
        // Transform Cognito user attributes to our User type
        const transformedUser: User = {
          userId: user.username,
          email: userAttributes.email || '',
          name: userAttributes.name || '',
          role: (userAttributes['custom:role'] as 'buyer' | 'seller' | 'admin') || 'buyer',
          status: 'active',
          createdAt: new Date().toISOString() // Fallback as creation date might not be available directly
        };
        
        setAuthState({
          isAuthenticated: true,
          user: transformedUser,
          loading: false
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };
    
    checkUser();
  }, []);

  // Sign in user
  const signInUser = async (username: string, password: string) => {
    try {
      const user = await signIn({ username, password });
      
      // After successful sign in, update the auth state
      await updateAuthState();
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Sign up new user
  const signUpUser = async (username: string, password: string, email: string, name: string) => {
    try {
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            name,
            'custom:role': 'buyer' // Default role for new users
          }
        }
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Confirm sign up with verification code
  const confirmSignUpUser = async (username: string, code: string) => {
    try {
      return await confirmSignUp({ username, confirmationCode: code });
    } catch (error) {
      throw error;
    }
  };

  // Sign out current user
  const signOutUser = async () => {
    try {
      await signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    } catch (error) {
      throw error;
    }
  };

  // Resend confirmation code
  const resendConfirmationCode = async (username: string) => {
    try {
      return await resendSignUpCode({ username });
    } catch (error) {
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (username: string) => {
    try {
      return await amplifyResetPassword({ username });
    } catch (error) {
      throw error;
    }
  };

  // Confirm reset password with new password
  const confirmResetPassword = async (username: string, code: string, newPassword: string) => {
    try {
      return await amplifyConfirmResetPassword({ 
        username, 
        confirmationCode: code, 
        newPassword 
      });
    } catch (error) {
      throw error;
    }
  };

  // Helper function to update auth state after login
  const updateAuthState = async () => {
    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      const transformedUser: User = {
        userId: user.username,
        email: userAttributes.email || '',
        name: userAttributes.name || '',
        role: (userAttributes['custom:role'] as 'buyer' | 'seller' | 'admin') || 'buyer',
        status: 'active',
        createdAt: new Date().toISOString() // Fallback as creation date might not be available directly
      };
      
      setAuthState({
        isAuthenticated: true,
        user: transformedUser,
        loading: false
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn: signInUser,
        signUp: signUpUser,
        confirmSignUp: confirmSignUpUser,
        signOut: signOutUser,
        resendConfirmationCode,
        resetPassword,
        confirmResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
