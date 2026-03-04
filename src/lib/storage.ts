import { AppData } from "@/lib/types";

const STORAGE_KEY = "gloomy-gene-v1";

export const emptyData: AppData = {
  challenges: [],
  versionHistory: [],
  moodLog: [],
};

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return emptyData;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return emptyData;
  }

  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return emptyData;
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
