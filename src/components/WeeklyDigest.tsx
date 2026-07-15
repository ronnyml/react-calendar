import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { RemindersState } from "../interfaces/Reminder";
import { streamDigest } from "../services/aiService";

interface WeeklyDigestProps {
  reminders: RemindersState;
  today: string;
  onClose: () => void;
}

const renderLine = (line: string, i: number) => {
  const boldified = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  if (!line.trim()) return <div key={i} className="digest-spacer" />;
  if (/^\*\*[^*]+\*\*/.test(line)) {
    return (
      <p key={i} className="digest-section" dangerouslySetInnerHTML={{ __html: boldified }} />
    );
  }
  return <p key={i} dangerouslySetInnerHTML={{ __html: boldified }} />;
};

const WeeklyDigest: React.FC<WeeklyDigestProps> = ({ reminders, today, onClose }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dow = dayjs(today).day();
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  const weekStart = dayjs(today).subtract(daysFromMonday, "day");
  const weekEnd = weekStart.add(6, "day");

  useEffect(() => {
    setContent("");
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const d = dayjs(today);
    const dow2 = d.day();
    const ws = d.subtract(dow2 === 0 ? 6 : dow2 - 1, "day");
    const we = ws.add(6, "day");

    const run = async () => {
      try {
        const gen = streamDigest(
          reminders,
          ws.format("YYYY-MM-DD"),
          we.format("YYYY-MM-DD"),
          today,
          controller.signal
        );
        let firstChunk = true;
        for await (const chunk of gen) {
          if (firstChunk) {
            setLoading(false);
            firstChunk = false;
          }
          setContent((prev) => prev + chunk);
        }
        if (firstChunk) setLoading(false);
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setLoading(false);
        }
      }
    };

    run();
    return () => { controller.abort(); };
  }, [reminders, today]);

  return (
    <div className="digest-overlay" onClick={onClose}>
      <div className="digest-panel" onClick={(e) => e.stopPropagation()}>
        <div className="digest-header">
          <div className="digest-title-row">
            <span className="digest-icon">📊</span>
            <div>
              <h3 className="digest-title">Weekly Digest</h3>
              <span className="digest-dates">
                {weekStart.format("MMM D")} – {weekEnd.format("MMM D, YYYY")}
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="digest-body">
          {loading && (
            <div className="digest-loading">
              <span className="ai-spinner" />
              Generating your digest…
            </div>
          )}
          {error && <p className="digest-error">{error}</p>}
          {content && (
            <div className="digest-content">
              {content.split("\n").map((line, i) => renderLine(line, i))}
              {!loading && <span className="digest-cursor" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDigest;
