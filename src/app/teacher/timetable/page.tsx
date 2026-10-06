"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Calendar as CalendarIcon, Clock, MapPin, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherTimetablePage() {
  const { profile } = useAuthStore();
  const teacherId = profile?.id;
  
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    fetch(`/api/teacher/timetable?teacher_id=${teacherId}`)
      .then(res => res.json())
      .then(data => {
        if (data.timetables) {
          setTimetables(data.timetables);
        }
      })
      .finally(() => setLoading(false));
  }, [teacherId]);

  const todayTimetables = timetables.filter(t => t.day_of_week === selectedDay);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Timetable</h2>
          <p className="text-slate-500 text-sm mt-1">View your weekly class and examination schedule.</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          {DAYS.map((day, idx) => {
            if (idx === 0 || idx === 6) return null; // Skip weekends for now
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(idx)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                  selectedDay === idx ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{DAYS[selectedDay]}'s Schedule</h3>
          <div className="px-3 py-1 bg-violet-50 text-violet-600 font-semibold text-xs rounded-full uppercase tracking-wider">
            {todayTimetables.length} Classes
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : todayTimetables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-lg">No classes scheduled for this day.</p>
            <p className="text-slate-400 text-sm mt-1">Take a break or prepare for your next sessions.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[39px] top-4 bottom-4 w-px bg-slate-200"></div>
            <div className="space-y-6 relative">
              {todayTimetables.map((item, idx) => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-20 flex-shrink-0 text-right pt-3">
                    <p className="text-sm font-bold text-slate-900">{formatTime(item.start_time)}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{formatTime(item.end_time)}</p>
                  </div>
                  
                  <div className="relative flex-1">
                    <div className="absolute -left-[30px] top-4 w-3 h-3 rounded-full bg-white border-2 border-violet-500 group-hover:scale-125 transition-transform z-10"></div>
                    
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                            item.type === 'EXAMINATION' ? 'bg-red-100 text-red-700' : 'bg-violet-100 text-violet-700'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-sm font-bold text-slate-700">{item.classes?.name}</span>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{item.subjects?.name} <span className="text-slate-400 font-normal">({item.subjects?.code})</span></h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
                        </div>
                        {item.room && (
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Room {item.room}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
