import { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubmitShifts } from './components/SubmitShifts';
import { MeetingFinder } from './components/MeetingFinder';
import { PeopleList } from './components/PeopleList';
import { useShiftStore } from './store';
import { SHIFT_CONFIG, ACTIVE_SHIFT_TYPES } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { getUniquePeople, entries } = useShiftStore();
  const people = getUniquePeople();

  const [seeded, setSeeded] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        peopleCount={people.length}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Banner - shown when no data */}
        {entries.length === 0 && !seeded && (
          <div className="mb-6 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-200/50 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Welcome to ShiftBuddy! 👋</h2>
              <p className="text-violet-100 text-sm mb-4 max-w-lg">
                Track your friends' work shifts and find out when you can hang out together.
                Start by adding some shifts, or load demo data to explore!
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('submit')}
                  className="px-4 py-2 bg-white text-violet-600 rounded-xl text-sm font-semibold hover:bg-violet-50 transition-colors"
                >
                  📝 Submit Shifts
                </button>
                <button
                  onClick={() => {
                    seedDemoData();
                    setSeeded(true);
                  }}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur"
                >
                  🎲 Load Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'submit' && <SubmitShifts />}
        {activeTab === 'meeting' && <MeetingFinder />}
        {activeTab === 'people' && <PeopleList />}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-300">
        <p>
          Made with 💜 for the squad · ShiftBuddy v1.0
        </p>
        <div className="flex justify-center gap-3 mt-2 flex-wrap">
          {ACTIVE_SHIFT_TYPES.map((s) => (
            <span key={s} className="text-gray-400">
              {SHIFT_CONFIG[s].emoji} {SHIFT_CONFIG[s].label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

// Seed demo data for first-time users
function seedDemoData() {
  const STORAGE_KEY = 'shift-buddy-data';
  const names = ['Arun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Divya'];
  const shifts = ['general', 'morning', 'evening', 'night', 'roamer', 'general'];

  const today = new Date();
  const demoEntries = [];

  for (let d = -2; d < 14; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    names.forEach((name, idx) => {
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const shiftIdx = (idx + Math.floor(d / 7)) % shifts.length;
      const shift = isWeekend ? 'off' : shifts[shiftIdx];

      demoEntries.push({
        id: `demo-${name}-${dateStr}-${Date.now()}-${idx}`,
        personName: name,
        shiftType: shift,
        date: dateStr,
      });
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoEntries));
  window.location.reload();
}
