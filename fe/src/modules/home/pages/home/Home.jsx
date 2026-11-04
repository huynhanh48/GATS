import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '@/components/Hero';
import PopularCourses from '@/components/PopularCourses';
import SubjectBanner from '@/components/SubjectBanner';
import InstructorCTA from '@/components/InstructorCTA';
import SubjectsGrid from '@/components/SubjectsGrid';
import Newsletter from '@/components/Newsletter';
import WhyChooseUs from '@/components/WhyChooseUs';
import RecentCourses from '@/components/RecentCourses';
import FAQ from '@/components/FAQ';
import StatsSection from '@/components/StatsSection';
import Testimonials from '@/components/Testimonials';
import LatestNews from '@/components/LatestNews';

export default function Home() {
  const navigate = useNavigate();

  const handleSelectCourse = (course) => {
    if (course?.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  return (
    <>
      <Hero />
      <PopularCourses onSelectCourse={handleSelectCourse} />
      <SubjectBanner />
      <InstructorCTA />
      <SubjectsGrid />
      <Newsletter />
      <WhyChooseUs />
      <RecentCourses onSelectCourse={handleSelectCourse} />
      <FAQ />
      <StatsSection />
      <Testimonials />
      <LatestNews />
    </>
  );
}
