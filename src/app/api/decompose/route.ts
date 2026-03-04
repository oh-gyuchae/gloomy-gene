import { NextResponse } from "next/server";

type DecomposeRequestBody = {
  challengeTitle?: unknown;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: unknown;
      }>;
    };
  }>;
};

function normalizeLines(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 },
    );
  }

  let body: DecomposeRequestBody;
  try {
    body = (await req.json()) as DecomposeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const challengeTitle =
    typeof body.challengeTitle === "string" ? body.challengeTitle.trim() : "";

  if (!challengeTitle) {
    return NextResponse.json(
      { error: "challengeTitle is required" },
      { status: 400 },
    );
  }

  if (challengeTitle.length > 120) {
    return NextResponse.json(
      { error: "challengeTitle is too long" },
      { status: 400 },
    );
  }

  const prompt =
    "도전: \"" +
    challengeTitle +
    "\"\n\n" +
    "이 도전을 실제로 실행/성취하기 위한 미세 행동(원자 행동) 6~10개를 한국어로 분해해줘.\n" +
    "조건:\n" +
    "- 각 항목은 짧은 명령문(예: '가방에 책 넣기')\n" +
    "- 너무 사소한 행동(예: '숨쉬기')은 제외\n" +
    "- 순서가 자연스럽게 진행되도록\n" +
    "- 번호/불릿 없이 문자열 배열(JSON)만 반환\n" +
    "\n" +
    "반환 예시: [\"...\", \"...\"]";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    }),
    },
  );

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text().catch(() => "");
    let detail = text.slice(0, 800);

    if (contentType.includes("application/json") && text) {
      try {
        const parsed: unknown = JSON.parse(text);
        const message =
          parsed && typeof parsed === "object"
            ? // common Google error shapes
              (parsed as { error?: { message?: unknown } }).error?.message
            : undefined;
        if (typeof message === "string" && message.trim()) {
          detail = message.trim().slice(0, 800);
        }
      } catch {
        // ignore JSON parse errors
      }
    }

    return NextResponse.json(
      { error: "Gemini request failed", status: response.status, detail },
      { status: 502 },
    );
  }

  const json = (await response.json()) as GeminiGenerateContentResponse;
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof content !== "string") {
    return NextResponse.json(
      { error: "Invalid Gemini response" },
      { status: 502 },
    );
  }

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: "Expected JSON array" }, { status: 502 });
    }

    const atoms = normalizeLines(parsed.filter((x) => typeof x === "string"));
    if (atoms.length === 0) {
      return NextResponse.json(
        { error: "No atoms generated" },
        { status: 502 },
      );
    }

    return NextResponse.json({ atoms }, { status: 200 });
  } catch {
    const fallbackAtoms = normalizeLines(
      content
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean),
    );

    if (fallbackAtoms.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse model output" },
        { status: 502 },
      );
    }

    return NextResponse.json({ atoms: fallbackAtoms }, { status: 200 });
  }
}
