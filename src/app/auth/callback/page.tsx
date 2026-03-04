"use client";

import { getSupabaseClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exchangeErrorMessage, setExchangeErrorMessage] = useState("");

  const supabase = getSupabaseClient();
  const urlError = searchParams.get("error");
  const urlErrorDescription = searchParams.get("error_description");
  const initialErrorMessage = !supabase
    ? "Supabase 환경변수가 설정되지 않았습니다."
    : urlError || urlErrorDescription
      ? decodeURIComponent(urlErrorDescription ?? urlError ?? "로그인에 실패했습니다.")
      : "";

  useEffect(() => {
    if (!supabase) {
      return;
    }

    if (initialErrorMessage) {
      return;
    }

    const code = searchParams.get("code");
    if (!code) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (cancelled) {
          return;
        }
        if (error) {
          setExchangeErrorMessage(error.message || "로그인 세션 설정에 실패했습니다.");
          return;
        }
        router.replace("/");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setExchangeErrorMessage("로그인 세션 설정에 실패했습니다.");
      });

    return () => {
      cancelled = true;
    };
  }, [initialErrorMessage, router, searchParams, supabase]);

  return (
    <div className="min-h-screen p-6">
      <main className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
        <section className="w-full rounded-3xl border border-zinc-500/30 bg-black/30 p-8 shadow-xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.32em] text-zinc-300">Auth Callback</p>
          <h1 className="mt-3 text-2xl font-bold">로그인 처리 중…</h1>
          {initialErrorMessage || exchangeErrorMessage ? (
            <p className="mt-4 text-sm text-rose-200">{initialErrorMessage || exchangeErrorMessage}</p>
          ) : null}
          <p className="mt-4 text-xs text-zinc-400">잠시 후 자동으로 메인 화면으로 이동합니다.</p>
        </section>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6">
          <main className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
            <section className="w-full rounded-3xl border border-zinc-500/30 bg-black/30 p-8 shadow-xl backdrop-blur">
              <p className="text-sm uppercase tracking-[0.32em] text-zinc-300">Auth Callback</p>
              <h1 className="mt-3 text-2xl font-bold">로그인 처리 중…</h1>
            </section>
          </main>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
