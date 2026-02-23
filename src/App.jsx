import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubmitShifts } from './components/SubmitShifts';
import { MeetingFinder } from './components/MeetingFinder';
import { PeopleList } from './components/PeopleList';
import { useShiftStore } from './store';
import { SHIFT_CONFIG, ACTIVE_SHIFT_TYPES } from './types';
// Import Firebase service
import { addItem, getItems } from './db-service';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Destructure setEntries to load data from Firebase
  const { getUniquePeople, entries, setEntries } = useShiftStore(); 
  const people = getUniquePeople();

  const [seeded, setSeeded] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data from Firebase when the app loads
  useEffect(() => {
    const loadFirebaseData = async () => {
      setLoading(true);
      const data = await getItems();
      // Ensure your store.js has a setEntries action
      if (setEntries) {
        setEntries(data);
      } else {
        console.warn("Please add a 'setEntries' action to your useShiftStore");
      }
      setLoading(false);
    };

    loadFirebaseData();
  }, [setEntries]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        peopleCount={people.length}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-10 text-violet-600">
            Loading data from cloud...
          </div>
        )}

        {/* Welcome Banner - shown when no data and not loading */}
        {!loading && entries.length === 0 && !seeded && (
          <div className="mb-6 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-200/50 relative overflow-hidden">
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
                
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'submit' && <SubmitShifts />}
            {activeTab === 'meeting' && <MeetingFinder />}
            {activeTab === 'people' && <PeopleList />}
          </>
        )}
      </main>

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

// 3. Updated Seed Function to use Firebase instead of LocalStorage
async function seedDemoData() {
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

      // Remove ID here, Firebase creates its own
      demoEntries.push({
        personName: name,
        shiftType: shift,
        date: dateStr,
        createdAt: Date.now()
      });
    });
  }

  // Batch upload to Firebase
  try {
    const promises = demoEntries.map(entry => addItem(entry));
    await Promise.all(promises);
    console.log("Demo data seeded to Firebase");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}