"use client";

import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface ProtectedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function ProtectedLink({ href, children, className }: ProtectedLinkProps) {
  const router = useRouter();
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (authStatus !== "authenticated") {
      e.preventDefault();
      router.push("/auth");
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
