export const SHIFT_CONFIG = {
  general: {
    label: 'General',
    emoji: '☀️',
    time: '9 AM – 6 PM',
    startHour: 9,
    endHour: 18,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    gradientFrom: 'from-amber-400',
    gradientTo: 'to-orange-400',
    textColor: 'text-amber-600',
    crossesDay: false,
  },
  morning: {
    label: 'Morning',
    emoji: '🌅',
    time: '6 AM – 3 PM',
    startHour: 6,
    endHour: 15,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    gradientFrom: 'from-sky-400',
    gradientTo: 'to-cyan-400',
    textColor: 'text-sky-600',
    crossesDay: false,
  },
  evening: {
    label: 'Evening',
    emoji: '🌆',
    time: '2 PM – 11 PM',
    startHour: 14,
    endHour: 23,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    gradientFrom: 'from-violet-400',
    gradientTo: 'to-purple-400',
    textColor: 'text-violet-600',
    crossesDay: false,
  },
  night: {
    label: 'Night',
    emoji: '🌙',
    time: '10 PM – 7 AM',
    startHour: 22,
    endHour: 31, // 7 AM next day = 24+7
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-slate-700',
    textColor: 'text-indigo-600',
    crossesDay: true,
  },
  roamer: {
    label: 'Roamer',
    emoji: '🦸',
    time: '24/7 Around',
    startHour: 0,
    endHour: 24,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    gradientFrom: 'from-emerald-400',
    gradientTo: 'to-teal-400',
    textColor: 'text-emerald-600',
    crossesDay: false,
  },
  off: {
    label: 'Day Off',
    emoji: '😴',
    time: 'Not Available',
    startHour: 0,
    endHour: 0,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    gradientFrom: 'from-gray-300',
    gradientTo: 'to-gray-400',
    textColor: 'text-gray-500',
    crossesDay: false,
  },
};

// Who can meet whom (based on meaningful shift overlap)
export const CAN_MEET = {
  general: ['morning', 'evening', 'roamer'],
  morning: ['general', 'evening', 'roamer'],
  evening: ['general', 'morning', 'night', 'roamer'],
  night: ['evening', 'roamer'],
  roamer: ['general', 'morning', 'evening', 'night', 'roamer'],
  off: [],
};

export function getOverlapTime(a, b) {
  if (a === 'off' || b === 'off') return null;
  if (a === 'roamer') return SHIFT_CONFIG[b].time;
  if (b === 'roamer') return SHIFT_CONFIG[a].time;

  if (!CAN_MEET[a].includes(b)) return null;

  const overlaps = {
    'general-morning': '9 AM – 3 PM',
    'general-evening': '2 PM – 6 PM',
    'morning-evening': '2 PM – 3 PM',
    'evening-night': '10 PM – 11 PM',
  };

  const key1 = `${a}-${b}`;
  const key2 = `${b}-${a}`;
  return overlaps[key1] || overlaps[key2] || null;
}

export const AVATARS = [
  '😎', '🤓', '🧑‍💻', '👩‍💻', '🦊', '🐱', '🐶', '🐼',
  '🦄', '🐸', '🦁', '🐯', '🐻', '🐨', '🐰', '🦋',
  '🌟', '🎮', '🎸', '🎯', '🚀', '⚡', '🔥', '💎',
];

export function getAvatarForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return AVATARS[Math.abs(hash) % AVATARS.length];
}

export const SHIFT_TYPES = ['general', 'morning', 'evening', 'night', 'roamer', 'off'];
export const ACTIVE_SHIFT_TYPES = ['general', 'morning', 'evening', 'night', 'roamer'];
