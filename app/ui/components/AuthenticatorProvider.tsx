"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { ReactNode } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { CartProvider } from "@/app/context/CartContext";

// Configure Amplify once before any Authenticator logic
Amplify.configure(outputs);

export default function AuthenticatorProvider({ children }: { children: ReactNode }) {
  return (
    <Authenticator.Provider>
      <CartProvider>
        {children}
      </CartProvider>
    </Authenticator.Provider>
  );
}
