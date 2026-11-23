import { useCallback, useEffect, useState } from 'react';

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; loading: boolean; error?: string }>({ loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    fn()
      .then((data) => live && setState({ data, loading: false }))
      .catch((e) => live && setState({ loading: false, error: (e && e.message) || 'Something went wrong. Try again.' }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useDebounced<T>(value: T, ms = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export function useLocalList(key: string, max = 8): [string[], (v: string) => void, () => void] {
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || '[]') as string[]; } catch { return []; } };
  const [items, setItems] = useState<string[]>(read);
  const add = (v: string) => { const n = [v, ...items.filter((x) => x !== v)].slice(0, max); setItems(n); localStorage.setItem(key, JSON.stringify(n)); };
  const clear = () => { setItems([]); localStorage.removeItem(key); };
  return [items, add, clear];
}