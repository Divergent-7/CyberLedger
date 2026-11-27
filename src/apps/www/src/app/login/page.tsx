import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Secura to monitor Linux servers, inspect live incidents, and manage automated blocks.",
};

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
