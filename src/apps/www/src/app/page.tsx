import { Benchmarks } from "@/components/landing/Benchmarks";
import { DeployCta } from "@/components/landing/DeployCta";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navbar } from "@/components/landing/Navbar";
import { WorkbenchPreview } from "@/components/landing/WorkbenchPreview";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-canvas"
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
    </>
  );
}
