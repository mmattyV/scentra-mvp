"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import React from "react";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
      services={{
        async validateCustomSignUp() {
          // No validation needed for optional fields
          return {};
        },
      }}
    >
      {() => <React.Fragment>{children}</React.Fragment>}
    </Authenticator>
  );
}
