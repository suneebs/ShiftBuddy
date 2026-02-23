import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'shift-buddy-data';

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Simple event emitter for cross-component sync
const listeners = new Set();
function notify() {
  listeners.forEach((fn) => fn());
}

export function useShiftStore() {
  const [entries, setEntries] = useState(loadEntries);

  const refresh = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [refresh]);

  const addEntries = useCallback((newEntries) => {
    const current = loadEntries();
    // Remove existing entries for same person+date combos
    const keys = new Set(newEntries.map((e) => `${e.personName.toLowerCase()}|${e.date}`));
    const filtered = current.filter(
      (e) => !keys.has(`${e.personName.toLowerCase()}|${e.date}`)
    );
    const merged = [...filtered, ...newEntries];
    saveEntries(merged);
    setEntries(merged);
    notify();
  }, []);

  const removeEntry = useCallback((id) => {
    const current = loadEntries().filter((e) => e.id !== id);
    saveEntries(current);
    setEntries(current);
    notify();
  }, []);

  const removePerson = useCallback((name) => {
    const current = loadEntries().filter(
      (e) => e.personName.toLowerCase() !== name.toLowerCase()
    );
    saveEntries(current);
    setEntries(current);
    notify();
  }, []);

  const getEntriesForDate = useCallback(
    (date) => entries.filter((e) => e.date === date),
    [entries]
  );

  const getUniquePeople = useCallback(() => {
    const names = new Set(entries.map((e) => e.personName));
    return Array.from(names).sort();
  }, [entries]);

  const clearAll = useCallback(() => {
    saveEntries([]);
    setEntries([]);
    notify();
  }, []);

  return {
    entries,
    addEntries,
    removeEntry,
    removePerson,
    getEntriesForDate,
    getUniquePeople,
    clearAll,
  };
}
