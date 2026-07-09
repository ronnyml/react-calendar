# React Calendar

A calendar app for managing reminders, built with React 19, TypeScript, and Vite 8.

## Live demo

[https://react-calendar-seven-beta.vercel.app](https://react-calendar-seven-beta.vercel.app)

![React Calendar screenshot](docs/screenshot.png)

## Features

- **Month and Agenda views** — switch between a classic calendar grid and a chronological list of all upcoming reminders
- **Reminder management** — add, edit, and delete reminders with a title, time, and category
- **Categories** — Work, Personal, Health, and Other; each with a distinct color that appears on the calendar grid and in the detail view
- **Today button** — jump back to the current month from anywhere
- **Dark mode** — toggle between light and dark themes; preference is saved across sessions
- **Persistent storage** — all reminders are saved in `localStorage` and survive page refreshes

## Project structure

```
src/
├── components/
│   ├── AgendaView.tsx        # Chronological list view of reminders
│   ├── Calendar.tsx          # Main component: grid, state, routing between views
│   ├── DeleteConfirmation.tsx
│   ├── ReminderDetailView.tsx
│   ├── ReminderForm.tsx      # Add / edit form
│   ├── ReminderForm.test.tsx
│   ├── ReminderList.tsx      # Overflow popup for days with many reminders
│   └── YearSelector.tsx
├── interfaces/               # TypeScript types for reminders and component props
├── state/
│   └── remindersReducer.tsx  # Reducer handling add / edit / delete actions
└── utils/
    └── constants.tsx         # Shared constants and category color palettes
```

## Design decisions

**Reducer for state management** — all reminder mutations go through `remindersReducer`, keeping add/edit/delete logic in one place and making the state predictable.

**CSS custom properties for theming** — the dark mode toggle flips a `data-theme` attribute on the root element; every color in the app is a CSS variable that overrides automatically. No runtime style injection needed.

**Category colors via inline styles** — pill colors on the grid are applied as inline `style` props rather than dynamic class names so the palette can be swapped cleanly between light and dark mode without doubling the CSS.

**localStorage with lazy reducer init** — the reducer is initialized from `localStorage` using the third argument of `useReducer` (the lazy initializer), so the app never renders with an empty state that immediately gets replaced.

## Tech stack

| Tool | Version |
|------|---------|
| React | 19.2 |
| TypeScript | 5.9 |
| Vite | 8 |
| Vitest | 4 |
| Day.js | 1.11 |
| React Testing Library | 16 |
| ESLint | 10 |

## Installation

```sh
npm install
npm run dev
```

## Running tests

```sh
npm test
```
