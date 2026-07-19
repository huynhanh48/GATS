import { Hero } from "@/components/sections/Hero";
import { LogoTicker } from "@/components/sections/LogoTicker";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { FeaturedCourses } from "@/components/sections/FeaturedCourses";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ParticlesBackground } from "@/components/common/ParticlesBackground";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative">
      <ParticlesBackground id="global-particles" />
      <Header />
      <Hero />
      <LogoTicker />
      <FeaturedCourses />
      <FeatureSection />
      <Testimonials />
      <LatestPosts />
      <CTASection />
      <Footer />
    </main>
  );
}
