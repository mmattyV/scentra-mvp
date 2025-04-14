"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import AuthWrapper from "../ui/components/AuthWrapper";

export default function AuthPage() {
  const router = useRouter();
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // If user is already authenticated, redirect them back to home
    if (authStatus === "authenticated") {
      router.push("/");
    }
  }, [authStatus, router]);

  // Don't render anything on server to prevent hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <AuthWrapper>
      <div className="text-center py-4">
        <p>You have successfully logged in!</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Return to Home
        </button>
      </div>
    </AuthWrapper>
  );
}
