// useBirthday.js
// Persists the user's birthday in LocalStorage. Nothing leaves the device.

import { useCallback, useEffect, useState } from 'react';
import { parseBirthday } from '../utils/dateCalculations.js';

const STORAGE_KEY = 'lifeline.birthday.v1';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.date) return null;
    const result = parseBirthday(parsed.date, parsed.time);
    if (!result) return null;
    return {
      date: parsed.date,
      time: parsed.time || null,
      hasTime: result.hasTime,
      birthDate: result.date,
    };
  } catch {
    return null;
  }
}

export function useBirthday() {
  const [birthday, setBirthday] = useState(() => readStored());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Re-read once mounted (guards against SSR / hydration edge cases).
    setBirthday(readStored());
    setReady(true);
  }, []);

  const save = useCallback((dateStr, timeStr) => {
    const result = parseBirthday(dateStr, timeStr);
    if (!result) return false;
    const payload = { date: dateStr, time: result.hasTime ? timeStr : null };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage may be unavailable (private mode); keep it in memory anyway.
    }
    setBirthday({
      date: dateStr,
      time: payload.time,
      hasTime: result.hasTime,
      birthDate: result.date,
    });
    return true;
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setBirthday(null);
  }, []);

  return { birthday, ready, save, clear };
}
