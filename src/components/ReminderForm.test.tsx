import { expect, vi } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import ReminderForm from "../components/ReminderForm";
import { ReminderDetail } from "../interfaces/Reminder";

describe("ReminderForm Component", () => {
  const mockAddReminder = vi.fn();
  const mockEditReminder = vi.fn();
  const mockCloseForm = vi.fn();

  const sampleDetail: ReminderDetail = {
    date: "2025-02-05",
    index: 0,
    reminder: {
      text: "Sample Reminder",
      time: "10:00",
      category: "work" as const,
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders the add reminder form correctly", () => {
    render(
      <ReminderForm
        date="2025-02-05"
        detail={null}
        addReminder={mockAddReminder}
        editReminder={mockEditReminder}
        closeForm={mockCloseForm}
      />
    );

    expect(screen.getByText(/Add Reminder — 2025-02-05/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Reminder text/i)).toBeInTheDocument();
    expect(screen.getByText(/Select time/i)).toBeInTheDocument();
  });

  test("renders the edit reminder form correctly", () => {
    render(
      <ReminderForm
        date="2025-02-05"
        detail={sampleDetail}
        addReminder={mockAddReminder}
        editReminder={mockEditReminder}
        closeForm={mockCloseForm}
      />
    );

    expect(screen.getByText(/Sample Reminder/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Sample Reminder/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/10:00/i)).toBeInTheDocument();
  });

  test("updates form fields on input change", () => {
    render(
      <ReminderForm
        date="2025-02-05"
        detail={null}
        addReminder={mockAddReminder}
        editReminder={mockEditReminder}
        closeForm={mockCloseForm}
      />
    );

    const textInput = screen.getByPlaceholderText(/Reminder text/i);
    const [timeSelect] = screen.getAllByRole('combobox');

    fireEvent.change(textInput, { target: { value: "New Reminder" } });
    fireEvent.change(timeSelect, { target: { value: "12:15" } });

    expect(screen.getByDisplayValue(/New Reminder/i)).toBeInTheDocument();
    expect(timeSelect).toHaveValue("12:15");
  });

  test("calls addReminder function on submit", () => {
    render(
      <ReminderForm
        date="2025-02-05"
        detail={null}
        addReminder={mockAddReminder}
        editReminder={mockEditReminder}
        closeForm={mockCloseForm}
      />
    );

    const textInput = screen.getByPlaceholderText(/Reminder text/i);
    const [timeSelect] = screen.getAllByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /add reminder/i });

    fireEvent.change(textInput, { target: { value: "New Reminder" } });
    fireEvent.change(timeSelect, { target: { value: "12:15" } });
    fireEvent.click(submitButton);

    expect(mockAddReminder).toHaveBeenCalledWith("2025-02-05", {
      text: "New Reminder",
      time: "12:15",
      category: "other",
    });
    expect(mockCloseForm).toHaveBeenCalled();
  });

  test("calls editReminder function on submit in edit mode", () => {
    render(
      <ReminderForm
        date="2025-02-05"
        detail={sampleDetail}
        addReminder={mockAddReminder}
        editReminder={mockEditReminder}
        closeForm={mockCloseForm}
      />
    );

    const textInput = screen.getByDisplayValue(/Sample Reminder/i);
    const submitButton = screen.getByRole('button', { name: /update reminder/i });

    fireEvent.change(textInput, { target: { value: "Updated Reminder" } });
    fireEvent.click(submitButton);

    expect(mockEditReminder).toHaveBeenCalledWith("2025-02-05", 0, {
      text: "Updated Reminder",
      time: "10:00",
      category: "work",
    });
    expect(mockCloseForm).toHaveBeenCalled();
  });

  test("closes the form when the close button is clicked", () => {
    render(
      <ReminderForm
        date="2025-02-05"
        detail={null}
        addReminder={mockAddReminder}
        editReminder={mockEditReminder}
        closeForm={mockCloseForm}
      />
    );

    const closeButton = screen.getByText(/✕/i);
    fireEvent.click(closeButton);

    expect(mockCloseForm).toHaveBeenCalled();
  });
});
