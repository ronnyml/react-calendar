import React, { useState } from "react";
import { parseReminderNL, ParsedReminder } from "../services/geminiService";

interface AiInputProps {
  today: string;
  onParsed: (result: ParsedReminder) => void;
}

const AiInput: React.FC<AiInputProps> = ({ today, onParsed }) => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await parseReminderNL(trimmed, today);
      onParsed(result);
      setValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-input-section">
      <div className="ai-input-label">✨ Smart Add — describe your reminder</div>
      <div className="ai-input-row">
        <input
          className="ai-input-text"
          type="text"
          placeholder='e.g. "Dentist next Friday at 2pm" or "Team meeting tomorrow at 10"'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
          disabled={loading}
          autoComplete="off"
        />
        <button
          className="ai-parse-btn"
          onClick={handleParse}
          disabled={!value.trim() || loading}
        >
          {loading ? <span className="ai-spinner" /> : "Parse"}
        </button>
      </div>
      {error && <div className="ai-input-error">{error}</div>}
    </div>
  );
};

export default AiInput;
