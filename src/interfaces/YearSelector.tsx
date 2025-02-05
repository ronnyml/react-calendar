export interface YearSelectorProps {
  baseYear: number;
  setYearRange: (offset: number) => void;
  selectYear: (year: number) => void;
  closeYearSelector: () => void;
}
