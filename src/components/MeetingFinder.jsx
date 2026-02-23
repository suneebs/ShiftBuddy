import { useState, useMemo } from 'react';
import { format, eachDayOfInterval, addDays } from 'date-fns';
import { Search, Users } from 'lucide-react';
import { SHIFT_CONFIG, CAN_MEET, getAvatarForName, getOverlapTime, ACTIVE_SHIFT_TYPES } from '../types';
import { useShiftStore } from '../store';
import { ShiftBadge } from './ShiftBadge';

export function MeetingFinder() {
  const { entries, getUniquePeople, getEntriesForDate } = useShiftStore();
  const people = getUniquePeople();

  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [daysAhead, setDaysAhead] = useState(7);

  // Find meeting days for two specific people
  const meetingDays = useMemo(() => {
    if (!person1 || !person2 || person1 === person2) return [];

    const today = new Date();
    const days = eachDayOfInterval({
      start: today,
      end: addDays(today, daysAhead - 1),
    });

    return days
      .map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayEntries = entries.filter((e) => e.date === dateStr);

        const p1Entry = dayEntries.find(
          (e) => e.personName.toLowerCase() === person1.toLowerCase()
        );
        const p2Entry = dayEntries.find(
          (e) => e.personName.toLowerCase() === person2.toLowerCase()
        );

        if (!p1Entry || !p2Entry) return null;
        if (p1Entry.shiftType === 'off' || p2Entry.shiftType === 'off') return null;

        const canMeet =
          CAN_MEET[p1Entry.shiftType].includes(p2Entry.shiftType) ||
          CAN_MEET[p2Entry.shiftType].includes(p1Entry.shiftType);

        if (!canMeet) return null;

        const overlapTime = getOverlapTime(p1Entry.shiftType, p2Entry.shiftType);

        return {
          date: dateStr,
          day,
          p1Shift: p1Entry.shiftType,
          p2Shift: p2Entry.shiftType,
          overlapTime,
        };
      })
      .filter(Boolean);
  }, [person1, person2, daysAhead, entries]);

  // Who's available right now?
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEntries = getEntriesForDate(todayStr);
  const currentHour = new Date().getHours();

  const currentlyAvailable = useMemo(() => {
    return todayEntries.filter((e) => {
      if (e.shiftType === 'off') return false;
      if (e.shiftType === 'roamer') return true;
      const config = SHIFT_CONFIG[e.shiftType];
      if (config.crossesDay) {
        return currentHour >= config.startHour || currentHour < (config.endHour - 24);
      }
      return currentHour >= config.startHour && currentHour < config.endHour;
    });
  }, [todayEntries, currentHour]);

  return (
    <div className="space-y-6">
      {/* Currently Available */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Available Right Now
        </h3>
        {currentlyAvailable.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentlyAvailable.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2 border border-emerald-100"
              >
                <span className="text-lg">{getAvatarForName(entry.personName)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{entry.personName}</p>
                  <p className="text-[10px] text-gray-400">
                    {SHIFT_CONFIG[entry.shiftType].emoji} {SHIFT_CONFIG[entry.shiftType].label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-600/60">
            {todayEntries.length === 0
              ? 'No shifts submitted for today yet 📭'
              : 'Nobody seems to be around right now 🦗'}
          </p>
        )}
      </div>

      {/* Shift Overlap Matrix */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📋</span> Shift Overlap Matrix
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          This shows which shifts can meet each other and their overlapping hours.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2" />
                {ACTIVE_SHIFT_TYPES.map((s) => (
                  <th key={s} className="p-2 text-center">
                    <span className="text-lg">{SHIFT_CONFIG[s].emoji}</span>
                    <br />
                    <span className="text-gray-500">{SHIFT_CONFIG[s].label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVE_SHIFT_TYPES.map((row) => (
                <tr key={row}>
                  <td className="p-2 font-medium text-gray-700">
                    {SHIFT_CONFIG[row].emoji} {SHIFT_CONFIG[row].label}
                  </td>
                  {ACTIVE_SHIFT_TYPES.map((col) => {
                    if (row === col) {
                      return (
                        <td key={col} className="p-2 text-center bg-gray-50 rounded">
                          <span className="text-gray-300">—</span>
                        </td>
                      );
                    }
                    const canMeet = CAN_MEET[row].includes(col);
                    const overlap = getOverlapTime(row, col);
                    return (
                      <td
                        key={col}
                        className={`p-2 text-center rounded ${
                          canMeet ? 'bg-emerald-50' : 'bg-red-50'
                        }`}
                      >
                        {canMeet ? (
                          <div>
                            <span className="text-emerald-500 font-bold">✓</span>
                            {overlap && (
                              <p className="text-[10px] text-emerald-600 mt-0.5">{overlap}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-red-300">✗</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Find Meeting Days */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4" /> Find When Two Buddies Can Meet
        </h3>

        {people.length < 2 ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-2">👥</p>
            <p className="text-sm text-gray-400">Need at least 2 people with submitted shifts!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Person 1</label>
                <select
                  value={person1}
                  onChange={(e) => setPerson1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none bg-white"
                >
                  <option value="">Select a buddy...</option>
                  {people.map((p) => (
                    <option key={p} value={p}>
                      {getAvatarForName(p)} {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-center">
                <Users className="w-5 h-5 text-violet-300 mb-2" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Person 2</label>
                <select
                  value={person2}
                  onChange={(e) => setPerson2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none bg-white"
                >
                  <option value="">Select a buddy...</option>
                  {people
                    .filter((p) => p !== person1)
                    .map((p) => (
                      <option key={p} value={p}>
                        {getAvatarForName(p)} {p}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysAhead(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    daysAhead === d
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Next {d} days
                </button>
              ))}
            </div>

            {person1 && person2 && (
              <div className="space-y-2">
                {meetingDays.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 mb-2">
                      Found <span className="font-bold text-violet-600">{meetingDays.length}</span>{' '}
                      days they can meet! 🎉
                    </p>
                    {meetingDays.map((md) =>
                      md ? (
                        <div
                          key={md.date}
                          className="flex items-center justify-between p-3 bg-violet-50 rounded-xl border border-violet-100"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {format(md.day, 'EEEE, MMM d')}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <ShiftBadge shift={md.p1Shift} size="sm" />
                                <span className="text-gray-300">×</span>
                                <ShiftBadge shift={md.p2Shift} size="sm" />
                              </div>
                            </div>
                          </div>
                          {md.overlapTime && (
                            <p className="text-xs text-violet-600 font-medium">
                              🕐 {md.overlapTime}
                            </p>
                          )}
                        </div>
                      ) : null
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <p className="text-3xl mb-2">😢</p>
                    <p className="text-sm text-gray-500">
                      No overlapping days found in the next {daysAhead} days.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Make sure both people have submitted their shifts!
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
