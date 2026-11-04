import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchModal from '@/components/SearchModal';
import CourseModal from '@/components/CourseModal';
import { useAuthUiStore } from '@/modules/auth';

export default function LandingPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { openAuthModal } = useAuthUiStore();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Global Navigation Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => openAuthModal('login')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet context={{ onSelectCourse: setSelectedCourse }} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Shared Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCourse={setSelectedCourse}
      />

      <CourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}
