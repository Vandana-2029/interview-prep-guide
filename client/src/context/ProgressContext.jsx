import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { todayISO } from '../utils/dates.js';
import { useToast } from './ToastContext.jsx';

// ProgressContext loads, once, everything the pages share:
//   sheet    = the 20 steps and 495 problems (same for everyone)
//   progress = this user's ticks: { key: { solvedOn, revise } }
//   known    = interview questions this user can explain (a Set of ids)
//   stats    = streak, calendar counts and totals, calculated by the server
const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const toast = useToast();
  const [sheet, setSheet] = useState(null);
  const [progress, setProgress] = useState({});
  const [known, setKnown] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const refreshStats = useCallback(() => api(`/progress/stats?today=${todayISO()}`).then(setStats), []);

  useEffect(() => {
    Promise.all([api('/sheet'), api('/progress'), api(`/progress/stats?today=${todayISO()}`)])
      .then(([s, p, st]) => {
        setSheet(s);
        setProgress(p.progress);
        setKnown(new Set(p.known));
        setStats(st);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Optimistic update: change the screen first, then tell the server.
  // If the server says no, put the old value back and show a message.
  const setSolved = useCallback(
    async (key, solved) => {
      const before = progress[key];
      const next = { revise: !!before?.revise, solvedOn: solved ? todayISO() : null };
      setProgress((p) => ({ ...p, [key]: next }));
      try {
        await api(`/progress/${encodeURIComponent(key)}`, { method: 'PUT', body: { solved, today: todayISO() } });
        const st = await api(`/progress/stats?today=${todayISO()}`);
        setStats(st);
        return st;
      } catch (e) {
        setProgress((p) => ({ ...p, [key]: before }));
        toast(`Could not save: ${e.message}`);
        return null;
      }
    },
    [progress, toast]
  );

  const setRevise = useCallback(
    async (key, revise) => {
      const before = progress[key];
      setProgress((p) => ({ ...p, [key]: { solvedOn: before?.solvedOn ?? null, revise } }));
      try {
        await api(`/progress/${encodeURIComponent(key)}`, { method: 'PUT', body: { revise } });
      } catch (e) {
        setProgress((p) => ({ ...p, [key]: before }));
        toast(`Could not save: ${e.message}`);
      }
    },
    [progress, toast]
  );

  const setKnownQuestion = useCallback(
    async (qid, isKnown) => {
      setKnown((s) => {
        const n = new Set(s);
        isKnown ? n.add(qid) : n.delete(qid);
        return n;
      });
      try {
        await api(`/progress/known/${encodeURIComponent(qid)}`, { method: 'PUT', body: { known: isKnown } });
      } catch (e) {
        toast(`Could not save: ${e.message}`);
      }
    },
    [toast]
  );

  const resetAll = useCallback(async () => {
    await api('/progress', { method: 'DELETE' });
    setProgress({});
    setKnown(new Set());
    await refreshStats();
  }, [refreshStats]);

  const value = useMemo(
    () => ({ sheet, progress, known, stats, error, setSolved, setRevise, setKnownQuestion, resetAll, refreshStats }),
    [sheet, progress, known, stats, error, setSolved, setRevise, setKnownQuestion, resetAll, refreshStats]
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgress = () => useContext(ProgressContext);
