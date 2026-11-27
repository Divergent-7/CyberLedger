import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/AuthShell";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to cyberLedger to monitor Linux servers, inspect live incidents, and manage automated blocks.",
};

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/");
  }

  return <AuthShell mode="login" />;
}
