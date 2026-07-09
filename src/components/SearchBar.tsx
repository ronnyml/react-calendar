import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="search-bar">
    <span className="search-icon">🔍</span>
    <input
      type="text"
      placeholder="Search reminders…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button className="search-clear" onClick={() => onChange("")} aria-label="Clear search">
        ✕
      </button>
    )}
  </div>
);

export default SearchBar;
