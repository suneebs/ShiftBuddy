import { useState, useEffect, useCallback } from 'react';
import { addItem, deleteItem } from './db-service';

// --- GLOBAL STATE ---
// We use a global variable so all components share the same data source
// independent of when they mount.
let globalEntries = [];
const listeners = new Set();

// Notify all components to re-render
function notify() {
  listeners.forEach((fn) => fn());
}

export function useShiftStore() {
  // Local state that syncs with global state
  const [entries, setLocalEntries] = useState(globalEntries);

  // Subscribe to changes
  useEffect(() => {
    const listener = () => setLocalEntries([...globalEntries]);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  // --- ACTIONS ---

  // 1. SET: Called by App.jsx when data loads from Firebase
  const setEntries = useCallback((data) => {
    globalEntries = data || [];
    notify();
  }, []);

  // 2. ADD: logic to handle overlaps + Save to Firebase
  const addEntries = useCallback(async (newEntries) => {
    // A. Identify overlaps (same person, same date) to remove old ones
    const newKeys = new Set(newEntries.map((e) => `${e.personName.toLowerCase()}|${e.date}`));
    
    // Find items in current state that are being overwritten
    const itemsToDelete = globalEntries.filter(
      (e) => newKeys.has(`${e.personName.toLowerCase()}|${e.date}`)
    );

    // Filter them out of the local state
    const remaining = globalEntries.filter(
      (e) => !newKeys.has(`${e.personName.toLowerCase()}|${e.date}`)
    );

    // B. Optimistic Update (Update UI immediately with temporary IDs)
    // We'll update the real IDs once Firebase responds
    const tempEntries = newEntries.map(e => ({ ...e, id: 'temp-' + Date.now() + Math.random() }));
    globalEntries = [...remaining, ...tempEntries];
    notify();

    // C. Perform Cloud Operations
    try {
      // 1. Delete overwritten shifts from Firebase
      const deletePromises = itemsToDelete
        .filter(item => item.id && !item.id.startsWith('temp-'))
        .map(item => deleteItem(item.id));
      await Promise.all(deletePromises);

      // 2. Add new shifts to Firebase and get real IDs
      for (let i = 0; i < newEntries.length; i++) {
        const rawEntry = newEntries[i];
        const newId = await addItem(rawEntry);
        
        // Update the temporary entry in global state with the Real ID
        const tempId = tempEntries[i].id;
        const index = globalEntries.findIndex(e => e.id === tempId);
        
        if (index !== -1) {
          globalEntries[index] = { ...rawEntry, id: newId };
        }
      }
      // Final notify to ensure IDs are consistent
      notify();

    } catch (err) {
      console.error("Error syncing with cloud:", err);
    }
  }, []);

  // 3. REMOVE SINGLE ENTRY
  const removeEntry = useCallback((id) => {
    // Update Local
    globalEntries = globalEntries.filter((e) => e.id !== id);
    notify();
    // Update Cloud
    deleteItem(id); 
  }, []);

  // 4. REMOVE PERSON (Bulk Delete)
  const removePerson = useCallback((name) => {
    const nameLower = name.toLowerCase();
    
    // Find IDs to delete
    const toDelete = globalEntries.filter(e => e.personName.toLowerCase() === nameLower);
    
    // Update Local
    globalEntries = globalEntries.filter((e) => e.personName.toLowerCase() !== nameLower);
    notify();

    // Update Cloud
    toDelete.forEach(e => {
      if (e.id) deleteItem(e.id);
    });
  }, []);

  // 5. CLEAR ALL
  const clearAll = useCallback(() => {
    const allIds = globalEntries.map(e => e.id);
    
    // Update Local
    globalEntries = [];
    notify();

    // Update Cloud
    allIds.forEach(id => deleteItem(id));
  }, []);

  // --- GETTERS ---

  const getEntriesForDate = useCallback(
    (date) => entries.filter((e) => e.date === date),
    [entries]
  );

  const getUniquePeople = useCallback(() => {
    const names = new Set(entries.map((e) => e.personName));
    return Array.from(names).sort();
  }, [entries]);

  return {
    entries,
    setEntries, // Explicitly exported for App.jsx
    addEntries,
    removeEntry,
    removePerson,
    getEntriesForDate,
    getUniquePeople,
    clearAll,
  };
}