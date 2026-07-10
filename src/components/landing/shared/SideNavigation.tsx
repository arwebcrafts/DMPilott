'use client';

import { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'link-in-bio', label: 'Bio' },
  { id: 'what-dmpilot-does', label: 'How' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'faq', label: 'FAQ' },
  { id: 'join', label: 'Join' },
];

export function SideNavigation() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && scrollPosition >= element.offsetTop) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-1.5">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          title={section.label}
          className={`group flex items-center gap-2 transition-all ${
            activeSection === section.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
          }`}
          aria-label={`Go to ${section.label}`}
        >
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              activeSection === section.id ? 'scale-125' : ''
            }`}
            style={{ background: activeSection === section.id ? 'var(--accent)' : 'var(--text-muted)' }}
          />
          <span
            className="text-[10px] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            style={{ color: 'var(--text-secondary)' }}
          >
            {section.label}
          </span>
        </button>
      ))}
    </div>
  );
}
