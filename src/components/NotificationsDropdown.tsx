"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsDropdown() {
  const { profile } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
    }
  }, [profile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${profile?.id}`);
      const json = await res.json();
      if (json.notifications) {
        setNotifications(json.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile?.id, notificationIds: unreadIds })
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Formatter helper
  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
            )}
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl ${n.is_read ? 'bg-white border border-slate-100' : 'bg-slate-50 border border-slate-200'}`}>
                  <p className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                    <span>{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-indigo-500 mt-2 font-semibold">{timeAgo(n.created_at)}</p>
                </div>
              ))
            )}
          </div>

          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="w-full mt-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
}
