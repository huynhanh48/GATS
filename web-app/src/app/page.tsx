import { Hero } from "@/components/sections/Hero";
import { LogoTicker } from "@/components/sections/LogoTicker";
import { FeatureSection } from "@/components/sections/FeatureSection";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { EnterpriseFeatures } from "@/components/sections/EnterpriseFeatures";
import { TransformBusiness } from "@/components/sections/TransformBusiness";
import { CourseCards } from "@/components/sections/CourseCards";
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
      <FeatureSection />
      <CapabilitiesSection />
      <EnterpriseFeatures />
      {/* <TransformBusiness /> */}
      <CourseCards />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
