import { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CalendarDays, Check, Sparkles, X, Loader2 } from 'lucide-react';
import { SHIFT_CONFIG, SHIFT_TYPES } from '../types';
import { useShiftStore } from '../store';
import { getItems } from '../db-service';

export function SubmitShifts() {
  const { addEntries, setEntries } = useShiftStore();
  const [name, setName] = useState('');
  const [mode, setMode] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedShift, setSelectedShift] = useState('general');
  const [weeklyShifts, setWeeklyShifts] = useState({});
  const [monthlyShift, setMonthlyShift] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, type: '', message: '', subtitle: '' });

  const showToast = (type, message, subtitle = '') => {
    setToast({ show: true, type, message, subtitle });
    setTimeout(() => setToast({ show: false, type: '', message: '', subtitle: '' }), 4000);
  };

  const dismissToast = () => {
    setToast({ show: false, type: '', message: '', subtitle: '' });
  };

  // Week days for the selected date's week
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Month days
  const monthStart = startOfMonth(new Date(selectedDate));
  const monthEnd = endOfMonth(new Date(selectedDate));

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('error', 'Name is required!', 'Please enter your name before submitting.');
      return;
    }

    setSubmitting(true);

    let newEntries = [];

    if (mode === 'daily') {
      newEntries = [{
        personName: name.trim(),
        shiftType: selectedShift,
        date: selectedDate,
        createdAt: Date.now(),
      }];
    } else if (mode === 'weekly') {
      newEntries = weekDays.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayIdx = day.getDay();
        const shift = weeklyShifts[dateStr] || (dayIdx === 0 || dayIdx === 6 ? 'off' : 'general');
        return {
          personName: name.trim(),
          shiftType: shift,
          date: dateStr,
          createdAt: Date.now(),
        };
      });
    } else {
      const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
      newEntries = allDays.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayIdx = day.getDay();
        return {
          personName: name.trim(),
          shiftType: dayIdx === 0 || dayIdx === 6 ? 'off' : monthlyShift,
          date: dateStr,
          createdAt: Date.now(),
        };
      });
    }

    try {
      // Save to Firebase
      await addEntries(newEntries);

      // Refresh data from Firebase to ensure consistency
      const freshData = await getItems();
      setEntries(freshData);

      // Show success toast
      const count = newEntries.length;
      showToast(
        'success',
        `Shifts submitted successfully! 🎉`,
        `${count} shift${count > 1 ? 's' : ''} saved for ${name.trim()}.`
      );

      // Reset form completely
      setName('');
      setSelectedShift('general');
      setMonthlyShift('general');
      setWeeklyShifts({});
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));

    } catch (error) {
      console.error('Submission error:', error);
      showToast('error', 'Submission failed!', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWeekShiftChange = (dateStr, shift) => {
    setWeeklyShifts((prev) => ({ ...prev, [dateStr]: shift }));
  };

  return (
    <div className="space-y-6 relative">

      {/* ===== TOAST NOTIFICATION ===== */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-slide-down">
          <div
            className={`rounded-2xl p-4 shadow-2xl border flex items-start gap-3 backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 shadow-emerald-100'
                : 'bg-red-50/95 border-red-200 shadow-red-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}
            >
              {toast.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-sm ${
                  toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                }`}
              >
                {toast.message}
              </p>
              {toast.subtitle && (
                <p
                  className={`text-xs mt-0.5 ${
                    toast.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {toast.subtitle}
                </p>
              )}
            </div>
            <button
              onClick={dismissToast}
              className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${
                toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Name Input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          👋 What's your name, buddy?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-700 text-lg"
        />
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <CalendarDays className="w-4 h-4 inline mr-1" />
          How would you like to submit?
        </label>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-violet-100 text-violet-700 border-2 border-violet-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              {m === 'daily' && '📅 Daily'}
              {m === 'weekly' && '📆 Weekly'}
              {m === 'monthly' && '🗓️ Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'daily' && '📅 Pick a date'}
          {mode === 'weekly' && '📆 Pick any day in the week'}
          {mode === 'monthly' && '🗓️ Pick any day in the month'}
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-700"
        />
        {mode === 'weekly' && (
          <p className="text-xs text-gray-400 mt-2">
            Week: {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
          </p>
        )}
        {mode === 'monthly' && (
          <p className="text-xs text-gray-400 mt-2">
            Month: {format(monthStart, 'MMMM yyyy')}
          </p>
        )}
      </div>

      {/* Shift Selection */}
      {mode === 'daily' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ⏰ What shift are you on?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SHIFT_TYPES.map((shift) => {
              const config = SHIFT_CONFIG[shift];
              return (
                <button
                  key={shift}
                  onClick={() => setSelectedShift(shift)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedShift === shift
                      ? `${config.bgColor} ${config.borderColor} shadow-sm`
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-xl">{config.emoji}</span>
                  <p className={`text-sm font-medium mt-1 ${selectedShift === shift ? config.color : 'text-gray-700'}`}>
                    {config.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{config.time}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'weekly' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📆 Set shift for each day
          </label>
          <div className="space-y-2">
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayIdx = day.getDay();
              const isWeekend = dayIdx === 0 || dayIdx === 6;
              const currentShift = weeklyShifts[dateStr] || (isWeekend ? 'off' : 'general');

              return (
                <div
                  key={dateStr}
                  className={`flex items-center gap-3 p-3 rounded-xl ${isWeekend ? 'bg-gray-50' : 'bg-white'} border border-gray-100`}
                >
                  <div className="w-20 shrink-0">
                    <p className="text-sm font-medium text-gray-700">{format(day, 'EEE')}</p>
                    <p className="text-xs text-gray-400">{format(day, 'MMM d')}</p>
                  </div>
                  <select
                    value={currentShift}
                    onChange={(e) => handleWeekShiftChange(dateStr, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none bg-white"
                  >
                    {SHIFT_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {SHIFT_CONFIG[s].emoji} {SHIFT_CONFIG[s].label} — {SHIFT_CONFIG[s].time}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'monthly' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🗓️ What shift for the whole month? (Weekends auto = Day Off)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SHIFT_TYPES.filter((s) => s !== 'off').map((shift) => {
              const config = SHIFT_CONFIG[shift];
              return (
                <button
                  key={shift}
                  onClick={() => setMonthlyShift(shift)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    monthlyShift === shift
                      ? `${config.bgColor} ${config.borderColor} shadow-sm`
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-xl">{config.emoji}</span>
                  <p className={`text-sm font-medium mt-1 ${monthlyShift === shift ? config.color : 'text-gray-700'}`}>
                    {config.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{config.time}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!name.trim() || submitting}
        className="w-full py-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:from-violet-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving your data...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Submit Shifts
          </>
        )}
      </button>
    </div>
  );
}