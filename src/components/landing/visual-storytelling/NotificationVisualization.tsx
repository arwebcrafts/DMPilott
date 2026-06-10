'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Notification {
  app: string;
  time: string;
  title: string;
  color: string;
}

const notifications: Notification[] = [
  { app: 'INSTAGRAM', time: 'now', title: 'New DM from @fashionista', color: '#E1306C' },
  { app: 'INSTAGRAM', time: '2m', title: 'Comment: "How much?"', color: '#833AB4' },
  { app: 'GMAIL', time: '5m', title: '12 new leads', color: '#EA4335' },
  { app: 'WHATSAPP', time: '14m', title: 'Supplier reply', color: '#25D366' },
  { app: 'REMINDERS', time: '1h', title: 'Post content at 3pm', color: '#FF9500' },
];

export function NotificationVisualization() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-sm mx-auto">
      {/* iPhone frame */}
      <div className="rounded-[3rem] p-3 shadow-2xl phone-frame">
        {/* Notch */}
        <div className="flex justify-center mb-1">
          <div className="w-28 h-6 rounded-full phone-notch" />
        </div>
        {/* Screen */}
        <div className="rounded-[2.4rem] overflow-hidden p-5 phone-screen">
          {/* Status bar */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold phone-time">9:41 AM</span>
            <span className="text-sm phone-date">Tuesday, May 5</span>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            {notifications.map((notif, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 border transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  background: 'var(--surface-1)',
                  borderColor: 'var(--surface-3)',
                  transitionDelay: `${i * 150}ms`,
                  transitionDuration: '500ms',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: notif.color }}>
                    {notif.app.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wide notif-app">{notif.app}</span>
                      <span className="text-xs notif-time">{notif.time}</span>
                    </div>
                    <div className="text-sm font-medium truncate notif-title">{notif.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer badges */}
          <div className="flex justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--surface-2)' }}>
            <span className="text-xs font-bold px-2 py-1 rounded-full badge-new">+ 3 NEW</span>
            <span className="text-xs font-bold px-2 py-1 rounded-full badge-missed">47 missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
