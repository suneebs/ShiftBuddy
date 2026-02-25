import { useState } from 'react';
import { format, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { SHIFT_CONFIG, getAvatarForName, SHIFT_TYPES } from '../types';
import { useShiftStore } from '../store';
import { ShiftBadge } from './ShiftBadge';

export function PeopleList() {
  const { entries, removePerson, clearAll, getUniquePeople } = useShiftStore();
  const people = getUniquePeople();

  const [expandedPerson, setExpandedPerson] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleExpand = (name) => {
    setExpandedPerson((prev) => (prev === name ? null : name));
  };

  // Get upcoming shifts for a person (next 14 days)
  const getUpcomingShifts = (name) => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: subDays(today, 1),
      end: addDays(today, 13),
    });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = entries.find(
        (e) => e.personName.toLowerCase() === name.toLowerCase() && e.date === dateStr
      );
      return {
        date: dateStr,
        day,
        shift: entry?.shiftType || null,
        isToday: dateStr === format(today, 'yyyy-MM-dd'),
      };
    });
  };

  // Shift distribution per person
  const getShiftStats = (name) => {
    const personEntries = entries.filter(
      (e) => e.personName.toLowerCase() === name.toLowerCase()
    );
    const stats = {};
    personEntries.forEach((e) => {
      stats[e.shiftType] = (stats[e.shiftType] || 0) + 1;
    });
    return { stats, total: personEntries.length };
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {people.length} {people.length === 1 ? 'Buddy' : 'Buddies'} 🎯
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {entries.length} total shift entries tracked
            </p>
          </div>
          {/* {entries.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )} */}
        </div>
      </div>

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="font-medium text-red-800">Are you sure?</p>
          </div>
          <p className="text-sm text-red-600 mb-3">This will delete ALL shift data for everyone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearAll();
                setShowClearConfirm(false);
              }}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              Yes, Clear Everything
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-2 bg-white text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* People Cards */}
      {people.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-5xl mb-3">👻</p>
          <p className="text-gray-500 font-medium">No buddies yet!</p>
          <p className="text-sm text-gray-400 mt-1">
            Head to "Submit Shifts" to add your first buddy.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {people.map((name) => {
            const avatar = getAvatarForName(name);
            const { stats, total } = getShiftStats(name);
            const isExpanded = expandedPerson === name;
            const upcoming = getUpcomingShifts(name);

            return (
              <div
                key={name}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Person Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(name)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-2xl">
                      {avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{name}</p>
                      <p className="text-xs text-gray-400">{total} shifts recorded</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mini shift pills */}
                    <div className="hidden sm:flex gap-1">
                      {Object.keys(stats).map((shift) => (
                        <span
                          key={shift}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${SHIFT_CONFIG[shift].bgColor} ${SHIFT_CONFIG[shift].color}`}
                          title={`${SHIFT_CONFIG[shift].label}: ${stats[shift]} days`}
                        >
                          {SHIFT_CONFIG[shift].emoji} {stats[shift]}
                        </span>
                      ))}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    {/* Upcoming Shifts Calendar Strip */}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">📅 Upcoming Shifts</p>
                      <div className="flex gap-1 overflow-x-auto pb-2">
                        {upcoming.map((dayItem) => {
                          const config = dayItem.shift ? SHIFT_CONFIG[dayItem.shift] : null;
                          return (
                            <div
                              key={dayItem.date}
                              className={`flex-shrink-0 w-14 p-1.5 rounded-lg text-center border ${
                                dayItem.isToday
                                  ? 'border-violet-300 bg-violet-50'
                                  : 'border-gray-100 bg-gray-50'
                              }`}
                            >
                              <p className="text-[10px] text-gray-400">{format(dayItem.day, 'EEE')}</p>
                              <p className={`text-xs font-medium ${dayItem.isToday ? 'text-violet-600' : 'text-gray-600'}`}>
                                {format(dayItem.day, 'd')}
                              </p>
                              {config ? (
                                <p className="text-sm mt-0.5" title={config.label}>
                                  {config.emoji}
                                </p>
                              ) : (
                                <p className="text-sm mt-0.5 text-gray-300">—</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shift Stats */}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">📊 Shift Distribution</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.keys(stats).map((shift) => (
                          <ShiftBadge key={shift} shift={shift} size="sm" />
                        ))}
                      </div>
                    </div>

                    {/* Remove Person */}
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePerson(name);
                        setExpandedPerson(null);
                      }}
                      className="mt-4 w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove {name}
                    </button> */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
