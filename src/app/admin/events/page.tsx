"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, MapPin, Clock, Star, Plus, Megaphone, 
  Users, CheckCircle2, Bell, Tag, Sparkles, AlertCircle 
} from 'lucide-react';
import Modal from '@/components/Modal';
import { useAuthStore } from '@/store/useAuthStore';

interface EventItem {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  color: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  target: string;
  category?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const initialEvents: EventItem[] = [
  { title: "First Term Mid-Term Assessment", date: "Oct 15", time: "09:00 AM", location: "Main Examination Hall", color: "indigo" },
  { title: "Parent-Teacher Association (PTA) General Assembly", date: "Oct 22", time: "02:00 PM", location: "Campus Auditorium", color: "pink" },
  { title: "Inter-House Sports Heat Trials", date: "Oct 28", time: "03:30 PM", location: "Sports Pavilion", color: "emerald" },
  { title: "First Term Mid-Term Break Begins", date: "Nov 02", time: "All Day", location: "Campus Wide", color: "purple" }
];

export default function EventsAndAnnouncementsPage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');
  
  // Events state
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', location: '' });

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceForm, setAnnounceForm] = useState({
    title: '',
    content: '',
    target: 'ALL',
    category: 'ACADEMIC'
  });
  const [announceLoading, setAnnounceLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch('/api/announcements');
      const json = await res.json();
      if (json.data) {
        setAnnouncements(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) return;

    const dateObj = new Date(eventForm.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const colors = ['indigo', 'pink', 'emerald', 'purple', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEvent: EventItem = {
      title: eventForm.title,
      date: formattedDate,
      time: eventForm.time || "All Day",
      location: eventForm.location || "TBA",
      color: randomColor
    };

    setEvents([newEvent, ...events]);
    setIsEventModalOpen(false);
    setEventForm({ title: '', date: '', time: '', location: '' });
    setSuccessToast('New event scheduled on calendar!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceForm.title || !announceForm.content) return;

    setAnnounceLoading(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announceForm,
          created_by: profile?.id || null
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to post announcement');

      setIsAnnounceModalOpen(false);
      setAnnounceForm({ title: '', content: '', target: 'ALL', category: 'ACADEMIC' });
      setSuccessToast('Official announcement broadcasted to school community!');
      setTimeout(() => setSuccessToast(''), 3500);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement');
    } finally {
      setAnnounceLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Communications & Life</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Noticeboard & Calendar</h1>
            <p className="text-slate-300 text-sm mt-1">Broadcast institutional bulletins, schedule terms, and manage assemblies.</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'announcements' ? (
              <button 
                onClick={() => setIsAnnounceModalOpen(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-400/20 transition-all flex items-center space-x-2 hover:scale-105"
              >
                <Megaphone className="w-4 h-4" />
                <span>Broadcast Notice</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsEventModalOpen(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Event</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center space-x-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex items-center space-x-2 w-fit">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'announcements'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Official Announcements</span>
          <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-full">
            {announcements.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'events'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Events & Calendar</span>
          <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        </button>
      </div>

      {/* Announcements Tab Content */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {loadingAnnouncements ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700">No active announcements</p>
              <p className="text-xs text-slate-400 mt-1">Click &quot;Broadcast Notice&quot; above to publish your first announcement.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {ann.category || 'GENERAL'}
                    </span>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                      Target: {ann.target}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(ann.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{ann.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Posted by: {ann.profiles ? `${ann.profiles.first_name} ${ann.profiles.last_name}` : 'School Administration'}</span>
                  <span className="font-semibold text-emerald-600 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Bulletin
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Events Tab Content */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {events.map((ev, i) => (
              <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:border-indigo-200">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:scale-105 transition-transform shrink-0">
                    <span className="text-[11px] font-bold uppercase">{ev.date.split(' ')[0]}</span>
                    <span className="text-xl font-black">{ev.date.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{ev.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />{ev.time}</span>
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />{ev.location}</span>
                    </div>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-amber-50 hover:text-amber-500 transition-colors">
                  <Star className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
            <div className="flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto mb-4">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-lg">Schedule School Event</h3>
            <p className="text-center text-xs text-slate-500 mt-1 mb-5">Add holidays, examinations, sports competitions, or parent meetings to the academic calendar.</p>
            <button 
              onClick={() => setIsEventModalOpen(true)}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      <Modal isOpen={isAnnounceModalOpen} onClose={() => setIsAnnounceModalOpen(false)} title="Broadcast Official Announcement">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Announcement Title *</label>
            <input 
              type="text" 
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="e.g. Resumption Guidelines for Second Term"
              value={announceForm.title}
              onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Target Audience</label>
              <select
                value={announceForm.target}
                onChange={(e) => setAnnounceForm({ ...announceForm, target: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="ALL">Entire School (All)</option>
                <option value="STUDENT">Students Only</option>
                <option value="TEACHER">Teachers / Staff Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
              <select
                value={announceForm.category}
                onChange={(e) => setAnnounceForm({ ...announceForm, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="EXAM">Examinations</option>
                <option value="FEES">Fees & Bursary</option>
                <option value="EVENT">Sports & Events</option>
                <option value="GENERAL">General Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Message Body *</label>
            <textarea 
              rows={5}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Type your official announcement here..."
              value={announceForm.content}
              onChange={(e) => setAnnounceForm({ ...announceForm, content: e.target.value })}
            />
          </div>

          <div className="pt-3 flex space-x-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsAnnounceModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={announceLoading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {announceLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Megaphone className="w-4 h-4" /><span>Broadcast</span></>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Event Modal */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Schedule New Event">
        <form onSubmit={handleCreateEvent} className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Event Title *</label>
            <input 
              type="text" 
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. End of Term Speech Day"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Date *</label>
              <input 
                type="date" 
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Time</label>
              <input 
                type="time" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={eventForm.time}
                onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Location / Venue</label>
            <input 
              type="text" 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. School Hall or Online via Zoom"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
            />
          </div>

          <div className="pt-3 flex space-x-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsEventModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Save Event</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}