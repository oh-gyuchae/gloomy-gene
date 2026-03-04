export const metadata = {
  title: "이용약관 | gloomy-gene",
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">이용약관</h1>
      <p className="mt-4 text-sm text-zinc-300">최종 업데이트: 2026-02-27</p>

      <section className="mt-6 space-y-3 text-sm leading-6 text-zinc-200">
        <p>본 서비스는 개인 행동 변화 기록을 지원하기 위한 도구이며, 의료행위나 전문 진단을 대체하지 않습니다.</p>
        <p>사용자는 관련 법령 및 타인의 권리를 침해하지 않는 범위 내에서 서비스를 이용해야 합니다.</p>
        <p>서비스 안정성 향상을 위해 점검/업데이트 과정에서 일시적 중단이 발생할 수 있습니다.</p>
        <p>운영 정책 위반 시 서비스 이용이 제한될 수 있습니다.</p>
      </section>
    </main>
  );
}
