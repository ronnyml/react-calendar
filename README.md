# React Calendar Application

## Description

React calendar application built with TypeScript that allows users to manage reminders. The app provides functionalities like adding, editing, and deleting reminders for specific dates. It integrates weather forecast data for cities using the Visual Crossing Weather API, offering detailed weather conditions for the reminder's date and location.

## Code structure

The project structure is designed to enhance modularity, readability, and maintainability.

- **components folder**: Contains all reusable and modular components that encapsulate specific pieces of functionality. Each component is responsible for a distinct part of the application, promoting reusability and isolation.

  ***Calendar***: The main Calendar component responsible for rendering the calendar grid. It manages key states such as the current date, reminders, and UI interactions like toggling the year selector or opening the reminder form.

  ***DeleteConfirmation***: A confirmation dialog displayed when a user attempts to delete a reminder. It provides "Yes" and "No" options for confirmation.

  ***ReminderDetailView***: Displays the detailed view of a specific reminder. It shows the reminder's text, time, city, and weather information. Users can edit or delete the reminder from this view.

  ***ReminderForm***: A reusable form component that supports both adding new reminders and editing existing ones. Handles input fields for the reminder's text, time, and city.

  ***ReminderFormTest***: A set of unit tests for the ReminderForm component, written using React Testing Library and Jest. Ensures the reliability of add and edit functionalities.

  ***ReminderList***: A popup window that displays a list of reminders for a specific date. Includes clickable items to view details of individual reminders.

  ***YearSelector***: Provides a UI for selecting a year. Includes a grid layout of years and navigation controls to move through year ranges.

- **interfaces folder**: Contains TypeScript interfaces and types used across the application to enforce type safety. These interfaces define the structure of important objects like reminders, weather data, and component props, making the code more robust and maintainable.

- **services folder**: Centralizes API interactions. This abstraction ensures that UI components remain clean and focused on rendering rather than handling network requests. (e.g., `weatherService` for weather-related data).

- **state folder**: Contains the logic for state management and handling all reminder-related state updates in a single location using the reducer pattern. This centralization ensures consistent updates and predictable state changes.

- **utils folder**: Stores shared constants and helper functions to avoid duplication and centralize reusable logic.

## Design choices

1. **Reducer for state management**:
   - The `remindersReducer` file is used to manage the reminders' state. This approach centralizes state updates, ensuring that the logic for actions like adding, editing, and deleting reminders remains consistent and predictable.
   - Using a reducer over local state in each component avoids duplication and keeps the logic organized.

2. **API abstraction**:
   - All API calls are handled in the `weatherService` file. This abstraction decouples the UI logic from the network requests, making the app more modular and testable.

3. **Caching**:
   - To prevent unnecessary network requests, a caching mechanism has been implemented. When fetching weather data, the application first checks the cache using the weatherCache utility. If the data for the specified city and date is available in the cache, the app uses it directly without making another network request. This improves performance and reduces API usage.

## Libraries used

1. **[Day.js](https://day.js.org/)**:
   - A minimalist JavaScript library for parsing, validating, manipulating, and formatting dates.
   - Used to handle all date-related logic, ensuring reliable and readable date operations.

2. **[Visual Crossing Weather API](https://www.visualcrossing.com/weather-api)**:
   - Provides weather data for cities and specific dates.
   - Integrated to display weather conditions for reminders, offering a more personalized user experience.

## Installation

Follow these steps to get the app running locally:

1. **Install dependencies**:

   ```sh
   npm install
   ```

2. **Set up environment variables**:

   - Create a `.env` file in the root of the project in case you don't have the .env file.
   - Add the following env variable:
     ```
     VITE_VISUAL_CROSSING_API_KEY=YOUR_API_KEY
     ```

3. **Run the app**:

   ```sh
   npm run dev
   ```

3. **Running tests**:

   ```sh
   npm run test
   ```
