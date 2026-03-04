import { AppData, VersionState } from "@/lib/types";

export function resolveVersionState(data: AppData, atomTitle: string): VersionState {
  const history = data.versionHistory;
  if (history.length === 0) {
    return "changed";
  }

  const hasExactBefore = history.some((record) => record.atomTitle === atomTitle);
  if (!hasExactBefore) {
    return "changed";
  }

  const now = Date.now();
  const hasRecent = history.some(
    (record) => record.atomTitle === atomTitle && now - new Date(record.createdAt).getTime() < 1000 * 60 * 60 * 48,
  );

  return hasRecent ? "repeated" : "maintained";
}

export function stateLabel(state: VersionState) {
  if (state === "changed") {
    return "변경됨";
  }
  if (state === "maintained") {
    return "유지됨";
  }
  return "반복됨";
}

export function scoreFromState(state: VersionState) {
  if (state === "changed") {
    return 2;
  }
  if (state === "maintained") {
    return 1;
  }
  return 0;
}
