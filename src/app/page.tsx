"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { resolveVersionState, scoreFromState, stateLabel } from "@/lib/logic";
import { loadRemoteAppData, saveRemoteAppData } from "@/lib/remote-storage";
import { emptyData, loadAppData, saveAppData } from "@/lib/storage";
import { getSupabaseClient } from "@/lib/supabase";
import { AppData, AtomAction, Challenge, ThemeMode, UserProfile, VersionRecord } from "@/lib/types";

const philosophyByState: Record<string, string> = {
  changed: "" +
    "새로운 행동은 새로운 자아의 시작이다.",
  maintained: "" +
    "흔들리지 않는 반복은 존재를 단단하게 만든다.",
  repeated: "" +
    "반복은 퇴행이 아니라, 패턴을 의식화하는 신호다.",
};

function createAtom(title: string): AtomAction {
  return {
    id: crypto.randomUUID(),
    title,
    rewardable: true,
    rewardToken: 10,
  };
}

function cardClass(theme: ThemeMode) {
  if (theme === "aurora") {
    return "border-violet-400/40 bg-violet-500/10";
  }
  if (theme === "ivory") {
    return "border-zinc-300 bg-white/90 text-zinc-900";
  }
  return "border-cyan-400/40 bg-cyan-500/10";
}

export default function Home() {
  const [data, setData] = useState<AppData>(emptyData);
  const [hydrated, setHydrated] = useState(false);
  const [introState, setIntroState] = useState<"gate" | "scared" | "started">("gate");
  const [authReady, setAuthReady] = useState(false);
  const [authUserId, setAuthUserId] = useState("");
  const [skipAuth, setSkipAuth] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [nickname, setNickname] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("obsidian");
  const [archetype, setArchetype] = useState<UserProfile["archetype"]>("explorer");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [pulseAtomId, setPulseAtomId] = useState("");
  const [decomposeLoading, setDecomposeLoading] = useState(false);
  const [decomposeError, setDecomposeError] = useState("");
  const userIdRef = useRef("");
  const remoteHydratedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const loaded = loadAppData();

    const frame = window.requestAnimationFrame(() => {
      if (!isMounted) {
        return;
      }

      setData(loaded);
      if (loaded.profile) {
        setTheme(loaded.profile.theme);
      }
      setHydrated(true);
    });

    return () => {
      isMounted = false;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data: sessionData }) => {
        if (!isMounted) {
          return;
        }
        setAuthUserId(sessionData.session?.user?.id ?? "");
        setAuthReady(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setAuthReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user?.id ?? "");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    remoteHydratedRef.current = false;
    userIdRef.current = authUserId;
  }, [authUserId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!authUserId) {
      return;
    }

    if (remoteHydratedRef.current) {
      return;
    }

    remoteHydratedRef.current = true;
    userIdRef.current = authUserId;

    let isMounted = true;

    const run = async () => {
      const remote = await loadRemoteAppData(authUserId);
      if (!isMounted || !remote) {
        return;
      }

      setData(remote);
      if (remote.profile) {
        setTheme(remote.profile.theme);
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [authUserId, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveAppData(data);

    if (!userIdRef.current) {
      return;
    }

    const syncTimer = window.setTimeout(() => {
      void saveRemoteAppData(userIdRef.current, data);
    }, 350);

    return () => window.clearTimeout(syncTimer);
  }, [data, hydrated]);

  const completedCount = useMemo(() => {
    return data.challenges.flatMap((challenge) => challenge.atoms).filter((atom) => atom.completedAt).length;
  }, [data.challenges]);

  const rewardableCompletedCount = useMemo(() => {
    return data.challenges
      .flatMap((challenge) => challenge.atoms)
      .filter((atom) => atom.completedAt && atom.rewardable).length;
  }, [data.challenges]);

  const recentRecords = useMemo(() => {
    return data.versionHistory.slice(-5).reverse();
  }, [data.versionHistory]);

  const moodGraph = useMemo(() => {
    return data.versionHistory.slice(-10).map((record) => ({
      id: record.id,
      score: scoreFromState(record.state),
      label: stateLabel(record.state),
    }));
  }, [data.versionHistory]);

  const currentThemeClass = theme === "ivory" ? "theme-ivory" : theme === "aurora" ? "theme-aurora" : "theme-obsidian";

  function handleStartYes() {
    setIntroState("started");
  }

  function handleStartNo() {
    setIntroState("scared");
    window.setTimeout(() => {
      setIntroState("gate");
    }, 2000);
  }

  async function handleGoogleLogin() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoginError("Supabase 환경변수가 설정되지 않았습니다.");
      return;
    }

    setLoginError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const raw = error.message || "Google 로그인에 실패했습니다.";
        if (/Unsupported provider/i.test(raw) || /provider is not enabled/i.test(raw)) {
          setLoginError(
            "Supabase에서 Google Provider가 비활성화되어 있습니다. Supabase Dashboard > Authentication > Providers > Google 을 Enable 한 뒤, Redirect URL에 /auth/callback 을 추가해주세요.",
          );
        } else {
          setLoginError(raw);
        }
      }
    } catch {
      setLoginError("Google 로그인 요청에 실패했습니다.");
    }
  }

  function handleContinueAsGuest() {
    setSkipAuth(true);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nickname.trim()) {
      return;
    }

    const profile: UserProfile = {
      nickname: nickname.trim(),
      archetype,
      theme,
      tokenBalance: 0,
      startedAt: new Date().toISOString(),
    };

    setData((prev) => ({ ...prev, profile }));
  }

  async function addChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = challengeTitle.trim();
    if (!title || decomposeLoading) {
      return;
    }

    setDecomposeLoading(true);
    setDecomposeError("");

    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeTitle: title }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let payload: { error?: unknown; detail?: unknown; status?: unknown } | null = null;
        try {
          const parsed: unknown = text ? JSON.parse(text) : null;
          payload =
            parsed && typeof parsed === "object"
              ? (parsed as { error?: unknown; detail?: unknown; status?: unknown })
              : null;
        } catch {
          payload = null;
        }
        const errorText = payload?.error ? String(payload.error) : "원자 행동 분해에 실패했습니다.";
        const detailText = payload?.detail ? String(payload.detail) : "";
        const statusText = payload?.status ? ` (status: ${String(payload.status)})` : "";
        setDecomposeError(detailText ? `${errorText}${statusText}\n${detailText}` : `${errorText}${statusText}`);
        return;
      }

      const text = await res.text();
      const payloadUnknown: unknown = JSON.parse(text);
      const payload = payloadUnknown as { atoms?: unknown };
      const lines = Array.isArray(payload.atoms) ? payload.atoms.filter((x) => typeof x === "string") : [];
      const atoms = lines.map((line) => createAtom(String(line)));
      if (atoms.length === 0) {
        setDecomposeError("원자 행동을 생성하지 못했습니다.");
        return;
      }

    const challenge: Challenge = {
      id: crypto.randomUUID(),
      title,
      atoms,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({ ...prev, challenges: [challenge, ...prev.challenges] }));
    setChallengeTitle("");
    } catch {
      setDecomposeError("원자 행동 분해 요청에 실패했습니다.");
    } finally {
      setDecomposeLoading(false);
    }
  }

  function completeAtom(challengeId: string, atomId: string) {
    setData((prev) => {
      if (!prev.profile) {
        return prev;
      }

      const challenge = prev.challenges.find((item) => item.id === challengeId);
      const atom = challenge?.atoms.find((item) => item.id === atomId);

      if (!atom || atom.completedAt) {
        return prev;
      }

      const state = resolveVersionState(prev, atom.title);
      const newRecord: VersionRecord = {
        id: crypto.randomUUID(),
        atomId,
        atomTitle: atom.title,
        state,
        createdAt: new Date().toISOString(),
      };

      const reward = atom.rewardable ? atom.rewardToken : 0;
      setPulseAtomId(atomId);
      setTimeout(() => setPulseAtomId(""), 900);

      return {
        ...prev,
        profile: {
          ...prev.profile,
          tokenBalance: prev.profile.tokenBalance + reward,
        },
        versionHistory: [...prev.versionHistory, newRecord],
        moodLog: [...prev.moodLog, { id: crypto.randomUUID(), score: scoreFromState(state), createdAt: new Date().toISOString() }],
        challenges: prev.challenges.map((item) => {
          if (item.id !== challengeId) {
            return item;
          }

          return {
            ...item,
            atoms: item.atoms.map((atomItem) => {
              if (atomItem.id !== atomId) {
                return atomItem;
              }
              return { ...atomItem, completedAt: new Date().toISOString() };
            }),
          };
        }),
      };
    });
  }

  function toggleRewardable(challengeId: string, atomId: string) {
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.map((challenge) => {
        if (challenge.id !== challengeId) {
          return challenge;
        }
        return {
          ...challenge,
          atoms: challenge.atoms.map((atom) => {
            if (atom.id !== atomId || atom.completedAt) {
              return atom;
            }
            return { ...atom, rewardable: !atom.rewardable };
          }),
        };
      }),
    }));
  }

  if (introState !== "started") {
    return (
      <div className={`min-h-screen p-6 ${currentThemeClass}`}>
        <main className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
          <AnimatePresence mode="wait">
            {introState === "gate" ? (
              <motion.section
                key="gate"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className={`w-full rounded-3xl border p-8 shadow-xl backdrop-blur ${cardClass(theme)}`}
              >
                <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Boot Sequence</p>
                <h1 className="mt-3 text-3xl font-bold">Do you want to play the game</h1>
                <p className="mt-3 text-sm text-zinc-300">Yes를 누르면 로그인으로 이동합니다.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-zinc-900"
                    type="button"
                    onClick={handleStartYes}
                  >
                    Yes
                  </button>
                  <button
                    className="rounded-xl border border-zinc-500/40 bg-black/20 px-4 py-3 font-semibold"
                    type="button"
                    onClick={handleStartNo}
                  >
                    No
                  </button>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="scared"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className={`w-full rounded-3xl border p-10 text-center shadow-xl backdrop-blur ${cardClass(theme)}`}
              >
                  <p className="text-sm text-zinc-200">{"you're afraid. Am I right?"}</p>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  if (introState === "started" && (!skipAuth && (!authReady || !authUserId))) {
    return (
      <div className={`min-h-screen p-6 ${currentThemeClass}`}>
        <main className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className={`w-full rounded-3xl border p-8 shadow-xl backdrop-blur ${cardClass(theme)}`}
          >
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Landing</p>
            <h1 className="mt-3 text-3xl font-bold">Google 로그인</h1>
            <p className="mt-3 text-sm text-zinc-300">우선 Google로만 로그인이 가능합니다.</p>

            <div className="mt-6 grid gap-3">
              <button
                className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-zinc-900 disabled:opacity-50"
                type="button"
                onClick={() => void handleGoogleLogin()}
                disabled={!authReady}
              >
                Google로 로그인
              </button>
              <button
                className="rounded-xl border border-zinc-500/40 bg-black/20 px-4 py-3 font-semibold"
                type="button"
                onClick={handleContinueAsGuest}
              >
                계정 없이 계속하기
              </button>
              <p className="text-xs text-zinc-400">게스트 모드는 기기(브라우저) 내 저장만 지원합니다.</p>
              {loginError ? <p className="text-sm text-rose-200">{loginError}</p> : null}
            </div>

            <div className="mt-6 flex gap-4 text-xs text-zinc-400">
              <Link href="/privacy" className="underline underline-offset-2">
                개인정보 처리방침
              </Link>
              <Link href="/terms" className="underline underline-offset-2">
                이용약관
              </Link>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  if (!data.profile) {
    return (
      <div className={`min-h-screen p-6 ${currentThemeClass}`}>
        <main className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className={`w-full rounded-3xl border p-8 shadow-xl backdrop-blur ${cardClass(theme)}`}
          >
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Self Reassembly Protocol</p>
            <h1 className="mt-3 text-3xl font-bold">Registration</h1>
            <p className="mt-3 text-sm text-zinc-300">지금 이 순간부터 당신의 취약성은 결함이 아니라 설계 가능한 재료가 됩니다.</p>
            <form onSubmit={handleLogin} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm">
                닉네임
                <input
                  className="rounded-xl border border-zinc-500/40 bg-black/20 p-3 outline-none focus:border-cyan-300"
                  placeholder="예: Relight_01"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm">
                자아 타입
                <select
                  className="rounded-xl border border-zinc-500/40 bg-black/20 p-3 outline-none"
                  value={archetype}
                  onChange={(event) => setArchetype(event.target.value as UserProfile["archetype"])}
                >
                  <option value="explorer">Explorer</option>
                  <option value="stoic">Stoic</option>
                  <option value="builder">Builder</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                테마
                <select
                  className="rounded-xl border border-zinc-500/40 bg-black/20 p-3 outline-none"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as ThemeMode)}
                >
                  <option value="obsidian">Obsidian</option>
                  <option value="aurora">Aurora</option>
                  <option value="ivory">Ivory</option>
                </select>
              </label>

              <button className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-zinc-900" type="submit">
                재조립 시작하기
              </button>
            </form>
            <div className="mt-4 flex gap-4 text-xs text-zinc-400">
              <Link href="/privacy" className="underline underline-offset-2">
                개인정보 처리방침
              </Link>
              <Link href="/terms" className="underline underline-offset-2">
                이용약관
              </Link>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  const lastState = data.versionHistory.at(-1)?.state;

  return (
    <div className={`min-h-screen p-4 md:p-6 ${currentThemeClass}`}>
      <main className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
        <section className={`rounded-3xl border p-5 shadow-xl backdrop-blur ${cardClass(data.profile.theme)}`}>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Dashboard</p>
          <h2 className="mt-2 text-2xl font-bold">{data.profile.nickname} 님의 재조립 현황</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-zinc-400/20 p-3">
              <p className="text-xs text-zinc-400">토큰</p>
              <p className="text-2xl font-bold">{data.profile.tokenBalance}</p>
            </div>
            <div className="rounded-xl border border-zinc-400/20 p-3">
              <p className="text-xs text-zinc-400">완료 행동</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
            <div className="rounded-xl border border-zinc-400/20 p-3">
              <p className="text-xs text-zinc-400">보상 행동</p>
              <p className="text-2xl font-bold">{rewardableCompletedCount}</p>
            </div>
          </div>

          <h3 className="mt-5 text-sm font-semibold text-zinc-300">감정 파고(최근 10회)</h3>
          <div className="mt-3 rounded-xl border border-zinc-500/20 p-4">
            {moodGraph.length === 0 ? (
              <p className="text-sm text-zinc-400">아직 기록이 없습니다. 첫 원자 행동을 완료해보세요.</p>
            ) : (
              <div className="flex h-24 items-end gap-2">
                {moodGraph.map((point) => (
                  <div key={point.id} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md bg-cyan-300/80"
                      style={{ height: `${30 + point.score * 22}px` }}
                      title={point.label}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3 className="mt-5 text-sm font-semibold text-zinc-300">Version Record</h3>
          <ul className="mt-3 grid gap-2">
            {recentRecords.length === 0 ? (
              <li className="rounded-xl border border-zinc-500/20 p-3 text-sm text-zinc-400">기록 없음</li>
            ) : (
              recentRecords.map((record) => (
                <li key={record.id} className="rounded-xl border border-zinc-500/20 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{record.atomTitle}</span>
                    <span className="rounded-full border border-cyan-300/40 px-2 py-0.5 text-xs text-cyan-200">
                      {stateLabel(record.state)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>

          {lastState && (
            <p className="mt-5 rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              {philosophyByState[lastState]}
            </p>
          )}
        </section>

        <section className={`rounded-3xl border p-5 shadow-xl backdrop-blur ${cardClass(data.profile.theme)}`}>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Action Forge</p>
          <h2 className="mt-2 text-2xl font-bold">도전 과제 분해</h2>
          <p className="mt-2 text-sm text-zinc-300">무엇을 도전할까요? 입력하면 AI가 미세 행동으로 분해합니다.</p>

          <form onSubmit={addChallenge} className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm">
              무엇을 도전할까요?
              <input
                className="rounded-xl border border-zinc-500/40 bg-black/20 p-3 outline-none focus:border-cyan-300"
                value={challengeTitle}
                onChange={(event) => setChallengeTitle(event.target.value)}
                placeholder="예: 근처 도서관 가기"
              />
            </label>

            <button
              className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-zinc-900 disabled:opacity-50"
              type="submit"
              disabled={decomposeLoading}
            >
              {decomposeLoading ? "분해 중..." : "AI로 원자 행동 생성"}
            </button>

            {decomposeError ? <p className="text-sm text-rose-200">{decomposeError}</p> : null}
          </form>

          <div className="mt-5 grid gap-3">
            {data.challenges.length === 0 ? (
              <p className="rounded-xl border border-zinc-500/20 p-3 text-sm text-zinc-400">아직 생성된 도전 과제가 없습니다.</p>
            ) : (
              data.challenges.map((challenge) => (
                <article key={challenge.id} className="rounded-2xl border border-zinc-500/30 p-4">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <ul className="mt-3 grid gap-2">
                    {challenge.atoms.map((atom) => (
                      <motion.li
                        key={atom.id}
                        animate={pulseAtomId === atom.id ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="rounded-xl border border-zinc-500/25 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm">{atom.title}</p>
                            <p className="text-xs text-zinc-400">보상 {atom.rewardable ? `${atom.rewardToken} 토큰` : "제외"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border border-zinc-400/30 px-2 py-1 text-xs"
                              onClick={() => toggleRewardable(challenge.id, atom.id)}
                              type="button"
                              disabled={Boolean(atom.completedAt)}
                            >
                              {atom.rewardable ? "보상 해제" : "보상 적용"}
                            </button>
                            <button
                              className="rounded-lg bg-emerald-400 px-2 py-1 text-xs font-semibold text-zinc-900 disabled:opacity-40"
                              onClick={() => completeAtom(challenge.id, atom.id)}
                              type="button"
                              disabled={Boolean(atom.completedAt)}
                            >
                              {atom.completedAt ? "완료" : "완료 처리"}
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
