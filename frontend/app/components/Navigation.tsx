'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Overview', href: '/overview' },
  { label: 'Shortages', href: '/shortages' },
  { label: 'Payments', href: '/payments' },
  { label: 'Interactions', href: '/interactions' },
  { label: 'Modeling', href: '/scenario' },
];

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const now = new Date();
    const formatted = (offsetMinutes: number) => {
      const d = new Date(now.getTime() - offsetMinutes * 60000);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    setNotifications([
      {
        id: 'notif-1',
        title: 'AI outreach queued',
        body: 'Smart outreach drafted for all Bexar County high-risk borrowers after projected appraisal surge.',
        timestamp: formatted(12),
      },
      {
        id: 'notif-2',
        title: 'New shortage watchlist',
        body: '6 medium-risk borrowers flagged for manual review due to tax reassessment variance.',
        timestamp: formatted(28),
      },
      {
        id: 'notif-3',
        title: 'Payment reminder sent',
        body: 'Auto-reminders delivered to Houston borrowers with insurance due within 21 days.',
        timestamp: formatted(45),
      },
    ]);
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-6">
          <div className="flex items-center shrink-0">
            <Image
              src="/rocket_logo_new.svg"
              alt="Rocket Companies"
              width={140}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive
                        ? 'bg-[#ffebee] text-[#b71c1c]'
                        : 'text-gray-600 hover:text-[#d32f2f] hover:bg-[#ffebee]/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-white/60 border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg bg-white/60 border border-gray-200 shadow-sm hover:shadow-md relative"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 ? (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[#d32f2f] text-white text-[10px] font-semibold flex items-center justify-center">
                      {notifications.length}
                    </span>
                  ) : null}
                </button>
                {isOpen ? (
                  <div className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">Notifications</span>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-gray-400 hover:text-[#d32f2f]"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">All caught up.</div>
                      ) : (
                        notifications.map((note) => (
                          <div key={note.id} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                            <p className="text-sm font-medium text-slate-900">{note.title}</p>
                            <p className="mt-1 text-xs text-gray-600 leading-relaxed">{note.body}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-wider text-gray-400">{note.timestamp}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
                      AI-generated outreach suggestions to keep borrowers engaged.
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="w-10 h-10 bg-[#d32f2f] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                AJ
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

