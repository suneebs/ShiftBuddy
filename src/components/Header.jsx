import { Clock, Users } from 'lucide-react';

export function Header({ activeTab, onTabChange, peopleCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'submit', label: 'Submit Shifts', icon: '📝' },
    { id: 'meeting', label: 'Meeting Finder', icon: '🤝' },
    { id: 'people', label: 'People', icon: '👥' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
  src="/logo.png" 
  alt="Logo" 
  className="w-15 h-15" 
/>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                ShiftBuddy
              </h1>
              <p className="text-[10px] text-gray-400 -mt-0.5 tracking-wide">Know when your crew is around</p>
            </div>
          </div>

          {/* People counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-full">
            <Users className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-medium text-violet-700">{peopleCount} buddies</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-1 -mb-px overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
