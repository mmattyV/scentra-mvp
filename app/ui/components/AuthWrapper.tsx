"use client";

import { 
  Authenticator, 
  ThemeProvider, 
  Theme, 
  useTheme,
  View,
  Button,
  useAuthenticator
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import React from "react";
import styles from './AuthWrapper.module.css';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create a custom theme for the Authenticator
  const theme: Theme = {
    name: 'Scentra Authentication Theme',
    tokens: {
      colors: {
        brand: {
          primary: {
            10: '#f5f5f5',
            20: '#e5e5e5',
            40: '#cccccc',
            60: '#999999',
            80: '#666666',
            90: '#333333',
            100: '#000000',
          },
        },
      },
      components: {
        authenticator: {
          router: {
            boxShadow: '0 0 16px rgba(0, 0, 0, 0.1)',
            borderWidth: '0',
          },
          form: {
            padding: '1.5rem 2rem',
          },
        },
        button: {
          primary: {
            backgroundColor: '#000000',
            _hover: {
              backgroundColor: '#333333',
            },
          },
          link: {
            color: '#333333',
            _hover: {
              color: '#000000',
            },
          },
        },
        fieldcontrol: {
          borderColor: '#e1e1e1',
          _focus: {
            boxShadow: '0 0 0 2px #666666',
            borderColor: '#333333',
          },
        },
        tabs: {
          item: {
            color: '#666666',
            _active: {
              borderColor: '#000000',
              color: '#000000',
            },
            _hover: {
              color: '#333333',
            },
          },
        },
      },
    },
  };

  // Create component overrides based on the provided example
  const components = {
    SignIn: {
      Header() {
        return (
          <View textAlign="center" padding="1rem">
            <h2 className="text-xl font-semibold">Sign In</h2>
          </View>
        );
      },
      Footer() {
        const { toForgotPassword } = useAuthenticator();

        return (
          <View textAlign="center" padding="0.5rem">
            <Button
              fontWeight="normal"
              onClick={toForgotPassword}
              size="small"
              variation="link"
              style={{
                color: 'black',
                textDecoration: 'underline',
              }}
            >
              Forgot Password?
            </Button>
          </View>
        );
      },
    },
    SignUp: {
      Header() {
        return (
          <View textAlign="center" padding="1rem">
            <h2 className="text-xl font-semibold">Create Account</h2>
          </View>
        );
      },
      Footer() {
        return null; // No additional footer as per requirements
      },
    },
    ForgotPassword: {
      Header() {
        return (
          <View textAlign="center" padding="1rem">
            <h2 className="text-xl font-semibold">Reset Password</h2>
          </View>
        );
      },
      Footer() {
        return null;
      },
    },
    ConfirmResetPassword: {
      Header() {
        return (
          <View textAlign="center" padding="1rem">
            <h2 className="text-xl font-semibold">Confirm New Password</h2>
          </View>
        );
      },
      Footer() {
        return null;
      },
    },
    ConfirmSignUp: {
      Header() {
        return (
          <View textAlign="center" padding="1rem">
            <h2 className="text-xl font-semibold">Confirm Registration</h2>
          </View>
        );
      },
      Footer() {
        return null;
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.authContainer}>
        <Authenticator
          formFields={{
            signUp: {
              email: {
                order: 1,
                isRequired: true,
              },
              password: {
                order: 2,
                isRequired: true,
              },
              confirm_password: {
                order: 3,
                isRequired: true,
              },
              given_name: {
                order: 4,
                label: 'First Name',
                placeholder: 'Enter your first name',
                isRequired: true,
              },
              family_name: {
                order: 5,
                label: 'Last Name',
                placeholder: 'Enter your last name',
                isRequired: true,
              },
              address: {
                order: 6,
                placeholder: 'Enter your address',
                label: 'Address',
                isRequired: false,
              },
            },
          }}
          loginMechanisms={['email']}
          components={components}
          services={{
            async validateCustomSignUp() {
              // No validation needed for optional fields
              return {};
            },
          }}
        >
          {() => <React.Fragment>{children}</React.Fragment>}
        </Authenticator>
      </div>
    </ThemeProvider>
  );
}
