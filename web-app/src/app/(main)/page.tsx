import { Hero } from "./components/sections/Hero";
import { AIScienceBanner } from "./components/sections/AIScienceBanner";
import { AccreditationBar } from "./components/sections/AccreditationBar";
import { FeatureSection } from "./components/sections/FeatureSection";
import { WorkflowDifferentiator } from "./components/sections/WorkflowDifferentiator";
import { PromoSection } from "./components/sections/PromoSection";
import { FeaturedCourses } from "./components/sections/FeaturedCourses";
import { InstructorSection } from "./components/sections/InstructorSection";
import { MemberPerksSection } from "./components/sections/MemberPerksSection";
import { LiveQnASection } from "./components/sections/LiveQnASection";
import { LatestPosts } from "./components/sections/LatestPosts";
import { Testimonials } from "./components/sections/Testimonials";
import { CTASection } from "./components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background selection:bg-primary/30">
      <Header />
      <Hero />
      <AIScienceBanner />
      <AccreditationBar />
      <FeaturedCourses />
      <WorkflowDifferentiator />
      <InstructorSection />
      <LiveQnASection />
      <PromoSection />
      <FeatureSection />
      <MemberPerksSection />
      <Testimonials />
      <LatestPosts />
      <CTASection />
      <Footer />
    </main>
  );
}
