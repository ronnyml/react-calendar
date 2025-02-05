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
      <button className="close-button" onClick={closeYearSelector}>
        X
      </button>
      <div className="year-selector-header">
        <button onClick={() => setYearRange(-YEAR_RANGE_SIZE)}>&lt;</button>
        <h3>{baseYear}</h3>
        <button onClick={() => setYearRange(YEAR_RANGE_SIZE)}>&gt;</button>
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
