"use client";
import { useState } from 'react';
import { CalendarDays, MapPin, Clock, Star, Plus } from 'lucide-react';
import Modal from '@/components/Modal';

const initialEvents = [
  { title: "Science Fair 2026", date: "Oct 15", time: "10:00 AM", location: "Main Hall", color: "pink" },
  { title: "Parent-Teacher Association", date: "Oct 22", time: "02:00 PM", location: "Auditorium", color: "indigo" },
  { title: "Mid-Term Break Begins", date: "Oct 30", time: "All Day", location: "Campus", color: "emerald" }
];

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', location: '' });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    // Convert YYYY-MM-DD to "Mon DD"
    const dateObj = new Date(formData.date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);

    const colors = ['pink', 'indigo', 'emerald', 'purple', 'amber', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEvent = {
      title: formData.title,
      date: formattedDate,
      time: formData.time || "All Day",
      location: formData.location || "TBA",
      color: randomColor
    };

    setEvents([newEvent, ...events]);
    setIsModalOpen(false);
    setFormData({ title: '', date: '', time: '', location: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay animate-pulse"></div>
        <h1 className="text-3xl font-black tracking-tight relative z-10">School Events Calendar</h1>
        <p className="text-indigo-100 mt-2 relative z-10">Manage assemblies, PTA meetings, and holidays.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {events.map((ev, i) => (
            <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:border-purple-200">
              <div className="flex items-center space-x-5">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center bg-${ev.color}-50 text-${ev.color}-600 border border-${ev.color}-100 group-hover:scale-105 transition-transform`}>
                  <span className="text-xs font-bold uppercase">{ev.date.split(' ')[0]}</span>
                  <span className="text-xl font-black">{ev.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{ev.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{ev.time}</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{ev.location}</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-purple-100 hover:text-purple-600 transition-colors">
                <Star className="w-5 h-5" />
              </button>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">
              No events scheduled.
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full mx-auto mb-4 animate-spin-slow" style={{animationDuration: '10s'}}>
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-center font-bold text-lg">Add New Event</h3>
          <p className="text-center text-sm text-slate-500 mt-2 mb-6">Schedule a new activity for the school using the calendar.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
        <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title</label>
            <input 
              type="text" 
              required
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
              placeholder="e.g. End of Year Party"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
              <input 
                type="time" 
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
              placeholder="e.g. Main Auditorium"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 flex items-center space-x-2"
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