import dayjs from "dayjs";
import { RemindersState } from "../interfaces/Reminder";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODEL = "gemini-1.5-flash";
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

export interface ParsedReminder {
  text: string;
  date: string;
  time: string;
  category: "work" | "personal" | "health" | "other";
  recurrence: "none" | "daily" | "weekly" | "monthly";
}

export async function parseReminderNL(
  input: string,
  today: string
): Promise<ParsedReminder> {
  const dayOfWeek = dayjs(today).format("dddd");

  const prompt = `Today is ${today} (${dayOfWeek}).

Parse this reminder request and reply with ONLY valid JSON — no markdown fences, no explanation.

Input: "${input}"

Required JSON format:
{
  "text": "<concise title for the reminder>",
  "date": "<YYYY-MM-DD, calculated from today>",
  "time": "<HH:MM in 24h, on 15-min boundaries: :00 :15 :30 :45>",
  "category": "<work | personal | health | other>",
  "recurrence": "<none | daily | weekly | monthly>"
}

Rules:
- tomorrow = ${dayjs(today).add(1, "day").format("YYYY-MM-DD")}
- "next [weekday]" = the coming occurrence of that weekday (not today if today matches)
- Default time: "09:00" when not specified. Round to nearest 15-min boundary.
- Category: doctor/dentist/gym/medicine/workout/health → health; meeting/deadline/project/sprint/review/work → work; family/birthday/personal/friend → personal; else → other
- Recurrence: "every day/daily" → daily; "every week/weekly" → weekly; "every month/monthly" → monthly; else → none`;

  const res = await fetch(`${BASE}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `API error ${res.status}`);
  }

  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(clean) as ParsedReminder;
  } catch {
    throw new Error("Couldn't parse that. Try being more specific.");
  }
}

export type ChatMessage = { role: "user" | "model"; text: string };

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
- If asked to add, edit, or delete reminders, tell the user to use the ✨ Smart Add field at the top of the reminder form, or click a day on the calendar.
- Keep responses brief and conversational. Use bullet points for lists.`;
}

export async function* streamChat(
  history: ChatMessage[],
  reminders: RemindersState,
  today: string
): AsyncGenerator<string, void, unknown> {
  const systemPrompt = buildSystemPrompt(reminders, today);

  const res = await fetch(`${BASE}:streamGenerateContent?alt=sse&key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: history.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message ?? `API error ${res.status}`);
  }

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
      if (!json) continue;
      try {
        const chunk = JSON.parse(json);
        const text: string | undefined =
          chunk.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}
