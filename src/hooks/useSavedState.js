import { useEffect, useState } from "react";

// useState that also remembers its value in localStorage,
// so your room is still arranged the way you left it next visit.
export default function useSavedState(key, makeDefault) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // storage unavailable or corrupted: fall back to the default
    }
    return makeDefault();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore (e.g. private browsing)
    }
  }, [key, value]);

  return [value, setValue];
}
