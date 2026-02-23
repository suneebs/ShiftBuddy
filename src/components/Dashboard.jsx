import { useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { SHIFT_CONFIG, CAN_MEET, getAvatarForName, getOverlapTime, SHIFT_TYPES } from '../types';
import { useShiftStore } from '../store';
import { ShiftTimeline } from './ShiftTimeline';
import { ShiftBadge } from './ShiftBadge';

export function Dashboard() {
  const { getEntriesForDate } = useShiftStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const entries = getEntriesForDate(selectedDate);
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  const prevDay = () => setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'));
  const nextDay = () => setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'));
  const goToday = () => setSelectedDate(format(new Date(), 'yyyy-MM-dd'));

  // Group by shift
  const grouped = useMemo(() => {
    const groups = {
      general: [], morning: [], evening: [], night: [], roamer: [], off: [],
    };
    entries.forEach((e) => {
      groups[e.shiftType].push(e);
    });
    return groups;
  }, [entries]);

  // Meeting pairs
  const meetingPairs = useMemo(() => {
    const pairs = [];
    const active = entries.filter((e) => e.shiftType !== 'off');

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];
        if (
          CAN_MEET[a.shiftType].includes(b.shiftType) ||
          CAN_MEET[b.shiftType].includes(a.shiftType)
        ) {
          const overlapTime = getOverlapTime(a.shiftType, b.shiftType);
          if (overlapTime) {
            pairs.push({ person1: a, person2: b, overlapTime });
          }
        }
      }
    }
    return pairs;
  }, [entries]);

  // Stats
  const activeCount = entries.filter((e) => e.shiftType !== 'off').length;
  const offCount = entries.filter((e) => e.shiftType === 'off').length;

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevDay}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {isToday ? '📍 Today' : format(dateObj, 'EEEE')}
            </h2>
            <p className="text-sm text-gray-400">{format(dateObj, 'MMMM d, yyyy')}</p>
          </div>

          <button
            onClick={nextDay}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!isToday && (
          <button
            onClick={goToday}
            className="w-full mt-2 py-1.5 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" /> Go to Today
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-violet-600">{activeCount}</p>
          <p className="text-xs text-gray-400 mt-1">Working</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{meetingPairs.length}</p>
          <p className="text-xs text-gray-400 mt-1">Can Meet</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-400">{offCount}</p>
          <p className="text-xs text-gray-400 mt-1">Day Off</p>
        </div>
      </div>

      {/* Timeline */}
      {entries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>⏰</span> Shift Timeline
          </h3>
          <ShiftTimeline entries={entries} />
        </div>
      )}

      {/* People by Shift */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>👥</span> Who's on what shift?
        </h3>

        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-400 text-sm">No shifts submitted for this day yet.</p>
            <p className="text-gray-300 text-xs mt-1">Head to "Submit Shifts" to add some!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {SHIFT_TYPES
              .filter((shift) => grouped[shift].length > 0)
              .map((shift) => (
                <div key={shift} className={`p-3 rounded-xl ${SHIFT_CONFIG[shift].bgColor} border ${SHIFT_CONFIG[shift].borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <ShiftBadge shift={shift} showTime />
                    <span className="text-xs font-medium text-gray-500">
                      {grouped[shift].length} {grouped[shift].length === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {grouped[shift].map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-1.5 bg-white/70 rounded-lg px-2.5 py-1.5"
                      >
                        <span className="text-sm">{getAvatarForName(entry.personName)}</span>
                        <span className="text-sm font-medium text-gray-700">{entry.personName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Meeting Possibilities */}
      {meetingPairs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🤝</span> Who can meet today?
          </h3>
          <div className="space-y-2">
            {meetingPairs.map((pair, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 flex-wrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>{getAvatarForName(pair.person1.personName)}</span>
                  <span className="text-sm font-medium text-gray-700">{pair.person1.personName}</span>
                  <ShiftBadge shift={pair.person1.shiftType} size="sm" />
                </div>
                <span className="text-gray-300 mx-1">↔</span>
                <div className="flex items-center gap-1.5">
                  <span>{getAvatarForName(pair.person2.personName)}</span>
                  <span className="text-sm font-medium text-gray-700">{pair.person2.personName}</span>
                  <ShiftBadge shift={pair.person2.shiftType} size="sm" />
                </div>
                <span className="ml-auto text-xs text-violet-500 font-medium whitespace-nowrap hidden sm:inline">
                  🕐 {pair.overlapTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
