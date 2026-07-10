import React, { useState, useRef, useEffect } from "react";
import { streamChat, ChatMessage } from "../services/geminiService";
import { RemindersState } from "../interfaces/Reminder";

interface AiChatProps {
  reminders: RemindersState;
  today: string;
}

const SUGGESTIONS = [
  "What do I have this week?",
  "Am I free on Monday?",
  "Show my health appointments",
];

const AiChat: React.FC<AiChatProps> = ({ reminders, today }) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]); // role: "user" | "assistant"
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const next = [...history, userMsg];
    setHistory(next);
    setInput("");
    setError(null);
    setStreaming(true);

    // placeholder for streaming response
    setHistory((h) => [...h, { role: "assistant", text: "" }]);

    try {
      for await (const chunk of streamChat(next, reminders, today)) {
        setHistory((h) => {
          const copy = [...h];
          copy[copy.length - 1] = {
            role: "assistant",
            text: copy[copy.length - 1].text + chunk,
          };
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setHistory((h) => h.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button
        className={`ai-chat-fab${open ? " ai-chat-fab-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="AI assistant"
        title="AI Calendar Assistant"
      >
        {open ? "✕" : "✨"}
      </button>

      {open && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-header-title">
              <span className="ai-chat-header-icon">✨</span>
              AI Assistant
            </div>
            <button className="ai-chat-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="ai-chat-messages">
            {history.length === 0 && (
              <div className="ai-chat-empty">
                <p>Ask me anything about your calendar.</p>
              </div>
            )}
            {history.map((msg, i) => {
              const isLastModel =
                msg.role === "assistant" && i === history.length - 1;
              return (
                <div key={i} className={`ai-chat-msg ${msg.role === "user" ? "ai-chat-msg-user" : "ai-chat-msg-assistant"}`}>
                  {msg.text ? (
                    msg.text
                  ) : isLastModel && streaming ? (
                    <span className="ai-typing-dots">
                      <span /><span /><span />
                    </span>
                  ) : null}
                </div>
              );
            })}
            {error && <div className="ai-chat-error">{error}</div>}
            <div ref={bottomRef} />
          </div>

          <div className="ai-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="ai-suggestion-chip"
                onClick={() => send(s)}
                disabled={streaming}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ai-chat-input-row">
            <input
              ref={inputRef}
              className="ai-chat-input"
              type="text"
              placeholder="Ask anything about your calendar…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              disabled={streaming}
            />
            <button
              className="ai-chat-send"
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiChat;
