import { Benchmarks } from "@/components/landing/Benchmarks";
import { DeployCta } from "@/components/landing/DeployCta";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingAuthProvider } from "@/components/landing/LandingAuthContext";
import { Navbar } from "@/components/landing/Navbar";
import { WorkbenchPreview } from "@/components/landing/WorkbenchPreview";
import { getServerUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getServerUser();

  return (
    <LandingAuthProvider initialUser={initialUser}>
      <a
        href="#main"
        className="focus:bg-ink focus:text-canvas sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <WorkbenchPreview />
        <Benchmarks />
        <HowItWorks />
        <Features />
        <DeployCta />
      </main>
      <Footer />
    </LandingAuthProvider>
  );
}
