export const metadata = {
  title: "개인정보 처리방침 | gloomy-gene",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">개인정보 처리방침</h1>
      <p className="mt-4 text-sm text-zinc-300">최종 업데이트: 2026-02-27</p>

      <section className="mt-6 space-y-3 text-sm leading-6 text-zinc-200">
        <p>gloomy-gene는 서비스 제공을 위해 최소한의 데이터(프로필, 행동 기록, 버전 기록)를 저장합니다.</p>
        <p>데이터는 사용자의 서비스 이용 목적 외로 판매하거나 제3자 광고 목적으로 제공하지 않습니다.</p>
        <p>사용자는 언제든 데이터 삭제를 요청할 수 있으며, 요청 시 합리적인 기간 내에 삭제 처리합니다.</p>
        <p>운영 및 보안 목적의 로그는 일정 기간 보관 후 파기합니다.</p>
      </section>
    </main>
  );
}
