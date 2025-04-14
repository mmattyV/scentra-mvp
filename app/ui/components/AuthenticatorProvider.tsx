"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { ReactNode } from "react";

export default function AuthenticatorProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
