import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a cyberLedger account to monitor Linux servers with real-time threat detection and automatic blocking.",
};

export default async function SignupPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/");
  }

  return <AuthShell mode="signup" />;
}
