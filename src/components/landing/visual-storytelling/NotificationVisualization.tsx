'use client';

import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, Calendar, Clock } from 'lucide-react';

interface Notification {
  app: string;
  icon: React.ReactNode;
  time: string;
  message: string;
  urgent?: boolean;
}

const notifications: Notification[] = [
  { app: 'SLACK', icon: <MessageSquare className="w-4 h-4" />, time: 'now', message: 'Sarah Chen · #project-alpha', urgent: true },
  { app: 'CALENDAR', icon: <Calendar className="w-4 h-4" />, time: '1m', message: 'URGENT · Standup added', urgent: true },
  { app: 'GMAIL', icon: <Mail className="w-4 h-4" />, time: '3m', message: '47 new emails', urgent: false },
  { app: 'WHATSAPP', icon: <MessageSquare className="w-4 h-4" />, time: '14m', message: 'Mom', urgent: false },
  { app: 'REMINDERS', icon: <Clock className="w-4 h-4" />, time: '1h', message: 'Submit Q1 review', urgent: true },
];

export function NotificationVisualization() {
  return (
    <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">9:41 AM</span>
        <span className="text-sm text-gray-400">Tuesday, May 5</span>
      </div>
      
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              notification.urgent ? 'bg-white border border-red-200' : 'bg-white/50'
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              {notification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-900">{notification.app}</span>
                <span className="text-xs text-gray-400">{notification.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{notification.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">+ 3 NEW</span>
          <span className="text-red-500 font-medium">47 missed</span>
        </div>
      </div>
    </div>
  );
}
