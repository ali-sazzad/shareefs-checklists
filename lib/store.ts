"use client";

import { emptyForm, todayISO, type FormData } from "./form";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export { emptyForm, formatDate, todayISO } from "./form";
export type { FormData, Person } from "./form";

const key = (id: string, date: string) => `shareefs:${id}:${date}`;

function load(id: string, date: string): FormData {
  try {
    const raw = localStorage.getItem(key(id, date));
    if (raw) return { ...emptyForm(), ...JSON.parse(raw) };
  } catch {}
  return emptyForm();
}

/** false during SSR / hydration, true on the client afterwards. */
export const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/** Autosaving draft for one checklist on one date (stored on the device). Call only after mount. */
export function useDraft(id: string) {
  const [date, setDateState] = useState(todayISO);
  const [data, setData] = useState<FormData>(() => load(id, date));
  const loaded = useRef(date);

  useEffect(() => {
    if (loaded.current !== date) return;
    try {
      localStorage.setItem(key(id, date), JSON.stringify(data));
    } catch {}
  }, [id, date, data]);

  const setDate = useCallback(
    (d: string) => {
      if (!d) return;
      setDateState(d);
      setData(load(id, d));
      loaded.current = d;
    },
    [id],
  );

  const update = useCallback((fn: (f: FormData) => FormData) => setData((f) => fn(f)), []);
  const reset = useCallback(() => setData(emptyForm()), []);

  return { date, setDate, data, update, reset };
}

/** Quick progress lookup for the home screen (today's draft). */
export function readProgress(id: string, total: number) {
  try {
    const f = load(id, todayISO());
    const done = Object.values(f.checks).filter(Boolean).length;
    return { done, total };
  } catch {
    return { done: 0, total };
  }
}

export const settingsKey = "shareefs:settings";
export type Settings = { email: string; venue: string };
export const loadSettings = (): Settings => {
  try {
    return { email: "", venue: "", ...JSON.parse(localStorage.getItem(settingsKey) || "{}") };
  } catch {
    return { email: "", venue: "" };
  }
};
export const saveSettings = (s: Settings) => {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(s));
  } catch {}
};
