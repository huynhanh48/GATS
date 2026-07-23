import { Hero } from "@/components/sections/Hero";
import { FeaturedCourses } from "@/components/sections/FeaturedCourses";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative">
      <Header />
      <Hero />
      <FeaturedCourses />
      <LatestPosts />
      <CTASection />
      <Footer />
    </main>
  );
}
