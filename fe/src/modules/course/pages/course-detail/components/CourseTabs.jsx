import React from 'react';

/**
 * CourseTabs - Thanh điều hướng chuyển Tab nội dung
 * 6 Tabs: Description, Curriculum, FAQ, Notice, Reviews, Grade
 */
export default function CourseTabs({ activeTab, onTabChange, tabsCount = {} }) {
  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'curriculum', label: 'Curriculum', count: tabsCount.lessons },
    { id: 'faq', label: 'FAQ' },
    { id: 'notice', label: 'Notice' },
    { id: 'reviews', label: 'Reviews', count: tabsCount.reviews },
    { id: 'grade', label: 'Grade' },
  ];

  return (
    <div className="border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
      <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-bold text-sm sm:text-base transition-colors cursor-pointer select-none ${
                isActive
                  ? 'border-[#1a56db] text-[#1a56db]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-blue-100 text-[#1a56db]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
