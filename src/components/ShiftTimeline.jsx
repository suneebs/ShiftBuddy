import { SHIFT_CONFIG, getAvatarForName } from '../types';

export function ShiftTimeline({ entries, compact = false }) {
  const hours = Array.from({ length: 25 }, (_, i) => i);

  // Filter out 'off' entries
  const activeEntries = entries.filter((e) => e.shiftType !== 'off');

  if (activeEntries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-4xl mb-2">🏖️</p>
        <p className="text-sm">No one's working today… or haven't submitted yet!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className={`min-w-[700px] ${compact ? '' : 'p-2'}`}>
        {/* Hour labels */}
        <div className="flex mb-1">
          <div className="w-28 shrink-0" />
          <div className="flex-1 flex">
            {hours.map((h) => (
              <div key={h} className="flex-1 text-[10px] text-gray-400 text-center">
                {h % 3 === 0 ? (h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`) : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Grid lines */}
        <div className="relative">
          {activeEntries.map((entry) => {
            const config = SHIFT_CONFIG[entry.shiftType];
            const avatar = getAvatarForName(entry.personName);

            let segments = [];

            if (entry.shiftType === 'roamer') {
              segments = [{ start: 0, end: 24 }];
            } else if (config.crossesDay) {
              // Night shift: show both parts
              segments = [
                { start: config.startHour, end: 24 },
                { start: 0, end: config.endHour - 24 },
              ];
            } else {
              segments = [{ start: config.startHour, end: config.endHour }];
            }

            return (
              <div key={entry.id} className="flex items-center mb-1.5 group">
                <div className="w-28 shrink-0 flex items-center gap-1.5 pr-2">
                  <span className="text-lg">{avatar}</span>
                  <div className="truncate">
                    <p className="text-xs font-medium text-gray-700 truncate">{entry.personName}</p>
                    <p className={`text-[10px] ${config.textColor}`}>
                      {config.emoji} {config.label}
                    </p>
                  </div>
                </div>
                <div className="flex-1 relative h-8 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  {/* Hour grid lines */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l border-gray-100"
                      style={{ left: `${(h / 24) * 100}%` }}
                    />
                  ))}
                  {/* Shift bar(s) */}
                  {segments.map((seg, i) => (
                    <div
                      key={i}
                      className={`absolute top-1 bottom-1 rounded-md bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} opacity-80 group-hover:opacity-100 transition-opacity shadow-sm`}
                      style={{
                        left: `${(seg.start / 24) * 100}%`,
                        width: `${((seg.end - seg.start) / 24) * 100}%`,
                      }}
                    >
                      {!compact && (seg.end - seg.start) >= 4 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow">
                          {config.time}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current time marker */}
        <div className="flex mt-2">
          <div className="w-28 shrink-0" />
          <div className="flex-1 relative h-1">
            {(() => {
              const now = new Date();
              const currentHour = now.getHours() + now.getMinutes() / 60;
              const pos = (currentHour / 24) * 100;
              return (
                <div
                  className="absolute top-0 h-full w-0.5 bg-red-400 rounded-full z-10"
                  style={{ left: `${pos}%`, height: '8px', marginTop: '-16px' }}
                  title={`Current time: ${now.toLocaleTimeString()}`}
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full -ml-[3px] -mt-1" />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
