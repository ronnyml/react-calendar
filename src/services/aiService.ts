import dayjs from "dayjs";
import { RemindersState } from "../interfaces/Reminder";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const MODEL = "llama-3.3-70b-versatile";
const BASE = "https://api.groq.com/openai/v1/chat/completions";

export interface RescheduleSuggestion {
  date: string;
  time: string;
  reason: string;
}

const stripFences = (raw: string): string =>
  raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

async function apiFetch(body: object, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${res.status}`);
  }
  return res;
}

async function* readSSE(res: Response): AsyncGenerator<string, void, unknown> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const json = line.slice(5).trim();
      if (json === "[DONE]") return;
      try {
        const chunk = JSON.parse(json);
        const text: string | undefined = chunk.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

export type ChatMessage = { role: "user" | "assistant"; text: string };

function buildSystemPrompt(reminders: RemindersState, today: string): string {
  const label = dayjs(today).format("dddd, MMMM D, YYYY");

  const lines: string[] = [];
  const sorted = Object.entries(reminders).sort(([a], [b]) => a.localeCompare(b));
  for (const [date, list] of sorted) {
    const dateLabel = dayjs(date).format("dddd, MMMM D");
    for (const r of list) {
      const rec = r.recurrence !== "none" ? ` (repeats ${r.recurrence})` : "";
      lines.push(`• ${dateLabel} at ${r.time} — ${r.text} [${r.category}]${rec}`);
    }
  }

  const schedule = lines.length ? lines.join("\n") : "No reminders scheduled.";

  return `You are a helpful calendar assistant. Today is ${label}.

User's scheduled reminders:
${schedule}

Guidelines:
- Answer questions about their schedule concisely and clearly.
- Use friendly date formats like "this Monday" or "July 14" instead of raw dates.
- If asked to add, edit, or delete reminders, tell the user to click a day on the calendar to open the reminder form.
- Keep responses brief and conversational. Use bullet points for lists.`;
}

export async function* streamChat(
  history: ChatMessage[],
  reminders: RemindersState,
  today: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = buildSystemPrompt(reminders, today);

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.text })),
  ];

  const res = await apiFetch(
    { model: MODEL, messages, temperature: 0.7, max_tokens: 512, stream: true },
    signal
  );

  yield* readSSE(res);
}

export async function suggestReschedule(
  reminderText: string,
  reminderDate: string,
  reminderTime: string,
  userRequest: string,
  reminders: RemindersState,
  today: string
): Promise<RescheduleSuggestion> {
  const lines: string[] = [];
  const sorted = Object.entries(reminders).sort(([a], [b]) => a.localeCompare(b));
  for (const [date, list] of sorted) {
    const dateLabel = dayjs(date).format("ddd, MMM D");
    for (const r of list) {
      if (date === reminderDate && r.text === reminderText) continue;
      lines.push(`• ${dateLabel} at ${r.time} — ${r.text}`);
    }
  }
  const schedule = lines.length ? lines.join("\n") : "No other reminders.";

  const systemPrompt = `You are a smart calendar scheduling assistant.
Today is ${today} (${dayjs(today).format("dddd, MMMM D, YYYY")}).

Reminder to reschedule: "${reminderText}"
Currently: ${dayjs(reminderDate).format("MMMM D, YYYY")} at ${reminderTime}

Other reminders to avoid conflicts:
${schedule}

Based on the user's request, suggest a new date and time. Reply ONLY with valid JSON, no markdown:
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM (24h, 15-min boundary)",
  "reason": "one-line explanation"
}`;

  const res = await apiFetch({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userRequest },
    ],
    temperature: 0.3,
    max_tokens: 150,
  });

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? "";

  try {
    return JSON.parse(stripFences(raw)) as RescheduleSuggestion;
  } catch {
    throw new Error("Couldn't parse the suggestion. Try rephrasing your request.");
  }
}

export async function* streamDigest(
  reminders: RemindersState,
  weekStart: string,
  weekEnd: string,
  today: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const lines: string[] = [];
  const sorted = Object.entries(reminders)
    .filter(([date]) => date >= weekStart && date <= weekEnd)
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [date, list] of sorted) {
    const dateLabel = dayjs(date).format("dddd, MMM D");
    for (const r of list) {
      const rec = r.recurrence !== "none" ? ` (repeats ${r.recurrence})` : "";
      lines.push(`• ${dateLabel} at ${r.time} — ${r.text} [${r.category}]${rec}`);
    }
  }

  const schedule = lines.length ? lines.join("\n") : "No reminders scheduled this week.";
  const weekStartLabel = dayjs(weekStart).format("MMMM D");
  const weekEndLabel = dayjs(weekEnd).format("MMMM D, YYYY");

  const systemPrompt = `You are a helpful calendar assistant. Today is ${dayjs(today).format("dddd, MMMM D, YYYY")}.

Analyze the user's schedule for the week of ${weekStartLabel} – ${weekEndLabel} and produce a short, friendly digest. Structure it with these bold section labels on their own lines:

**Overview** — how busy is the week overall (light / moderate / packed)?
**Busiest day** — which day has the most events and what are they?
**Free time** — which days look light or empty?
**Balance** — work vs health vs personal distribution.
**Tip** — one concrete, specific suggestion to improve the week.

Keep it under 200 words total. Be friendly and specific, not generic.`;

  const res = await apiFetch(
    {
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My schedule:\n${schedule}\n\nGive me a weekly digest.` },
      ],
      temperature: 0.6,
      max_tokens: 400,
      stream: true,
    },
    signal
  );

  yield* readSSE(res);
}
