"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { ReactNode, useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

export default function AuthenticatorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isAmplifyConfigured, setIsAmplifyConfigured] = useState(false);

  useEffect(() => {
    // Configure Amplify only once at the client-side root level
    if (!isAmplifyConfigured) {
      Amplify.configure(outputs);
      setIsAmplifyConfigured(true);
      console.log("Amplify configured at root level");
    }
  }, [isAmplifyConfigured]);

  // We still render immediately without waiting since Authenticator.Provider
  // will handle the auth state transitions internally
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
