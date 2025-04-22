"use client";

import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface ProtectedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function ProtectedLink({ href, children, className, onClick }: ProtectedLinkProps) {
  const router = useRouter();
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const isLoading = authStatus === "configuring";

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    if (authStatus !== "authenticated") {
      e.preventDefault();
      router.push("/auth");
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} aria-disabled={isLoading}>
      {children}
    </a>
  );
}
