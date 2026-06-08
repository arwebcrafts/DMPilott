'use client';

import { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', label: 'HOME' },
  { id: 'sound-familiar', label: 'PROBLEM' },
  { id: 'what-dmpilot-does', label: 'SOLUTION' },
  { id: 'day-in-dmpilot', label: 'HOW IT WORKS' },
  { id: 'social-proof', label: 'STORIES' },
  { id: 'faq', label: 'FAQ' },
  { id: 'join', label: 'JOIN' },
];

export function SideNavigation() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
            activeSection === section.id
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          aria-label={`Navigate to ${section.label}`}
        >
          {section.label[0]}
        </button>
      ))}
    </div>
  );
}
