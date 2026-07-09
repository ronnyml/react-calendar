import React from "react";
import { YEAR_RANGE_SIZE } from "../utils/constants";
import { YearSelectorProps } from "../interfaces/YearSelector";

const YearSelector: React.FC<YearSelectorProps> = ({
  baseYear,
  setYearRange,
  selectYear,
  closeYearSelector,
}) => {
  return (
    <div className="year-selector">
      <div className="year-selector-header">
        <button className="year-nav-btn" onClick={() => setYearRange(-YEAR_RANGE_SIZE)}>&#8249;</button>
        <h3>{baseYear} – {baseYear + YEAR_RANGE_SIZE - 1}</h3>
        <button className="year-nav-btn" onClick={() => setYearRange(YEAR_RANGE_SIZE)}>&#8250;</button>
        <button className="year-close-btn" onClick={closeYearSelector}>✕</button>
      </div>
      <div className="year-grid">
        {Array.from(
          { length: YEAR_RANGE_SIZE },
          (_, i) => baseYear + i - YEAR_RANGE_SIZE / 2
        ).map((year) => (
          <div
            className="year-item"
            key={year}
            onClick={() => selectYear(year)}
          >
            {year}
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
