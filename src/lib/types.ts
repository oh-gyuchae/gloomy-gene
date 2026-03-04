export type ThemeMode = "obsidian" | "aurora" | "ivory";

export type VersionState = "changed" | "maintained" | "repeated";

export interface UserProfile {
  nickname: string;
  archetype: "explorer" | "stoic" | "builder";
  theme: ThemeMode;
  tokenBalance: number;
  startedAt: string;
}

export interface AtomAction {
  id: string;
  title: string;
  rewardable: boolean;
  rewardToken: number;
  completedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  atoms: AtomAction[];
  createdAt: string;
}

export interface VersionRecord {
  id: string;
  atomId: string;
  atomTitle: string;
  state: VersionState;
  createdAt: string;
}

export interface MoodPoint {
  id: string;
  score: number;
  createdAt: string;
}

export interface AppData {
  profile?: UserProfile;
  challenges: Challenge[];
  versionHistory: VersionRecord[];
  moodLog: MoodPoint[];
}
