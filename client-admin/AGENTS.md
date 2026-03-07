# AGENTS.md

## Workspace Overview
- This workspace contains a Vite + React frontend app in `excel-haters/`.
- The frontend is a single-page application using `react-router-dom`.
- Styling is done with Tailwind CSS classes and shared component classes in `excel-haters/src/index.css`.
- Keep structure separated across CSS, JSX, and JS/data files.

## App Structure
- `excel-haters/src/main.jsx`: React entry point and router setup.
- `excel-haters/src/App.jsx`: root shell, tabs, and route declarations.
- `excel-haters/src/shared/TabNav.jsx`: top navigation component.
- `excel-haters/src/configurator/ConfiguratorPage.jsx`: main configurator dashboard route with terminal actions and the terminals table.
- `excel-haters/src/configurator/CreateTerminalWithAiPage.jsx`: configurator route for `/configurator/create-terminal-with-ai`, with an editable terminal shell and local image upload preview.
- `excel-haters/src/configurator/TerminalComponentsPage.jsx`: terminal detail page for `/configurator/:terminalName`.
- `excel-haters/src/configurator/components/TerminalTable.jsx`: terminals table with loading/error states, search, pagination, and row action links.
- `excel-haters/src/configurator/components/ComponentTable.jsx`: reusable components table with loading/error states, search, sorting, and pagination.
- `excel-haters/src/configurator/components/ComponentTypeColumns.jsx`: grouped component layout that renders Desk, Security, Gate, and Stand sections in `configurator-type-rows`.
- `excel-haters/src/configurator/components/TerminalPhotoUploadPanel.jsx`: upload-and-preview panel used on the AI terminal page.
- `excel-haters/src/configurator/hooks/useTablePagination.js`: shared client-side pagination hook with a 7-row page size.
- `excel-haters/src/configurator/hooks/useTerminalManager.js`: loads terminals from the API and components from local JSON.
- `excel-haters/src/configurator/hooks/useTerminalComponents.js`: loads a terminal by name and fetches its components from the API.
- `excel-haters/src/configurator/hooks/useImageUploadPreview.js`: local image preview state and object URL cleanup for uploaded photos.
- `excel-haters/src/configurator/data/terminals.json`: local terminal seed data file.
- `excel-haters/src/configurator/data/components.json`: local component dataset used by the main configurator page.
- `excel-haters/src/configurator/config/configuratorContent.js`: configurator labels and titles.
- `excel-haters/src/configurator/config/terminalTypeOptions.js`: allowed terminal types.
- `excel-haters/src/configurator/config/componentTypeOptions.js`: allowed component types.
- `excel-haters/src/timetables/TimetablesPage.jsx`: timetables page.
- `excel-haters/src/flights/FlightsPage.jsx`: flights feature entry page.
- `excel-haters/src/flights/components/AddFlightModal.jsx`: modal form for manual flight entry.
- `excel-haters/src/flights/hooks/useFlightForm.js`: local state and submit flow for the flights modal.
- `excel-haters/src/flights/config/flightFieldDefinitions.js`: field list for the flight form.
- `excel-haters/src/flights/config/flightsContent.js`: flights page and modal labels.
- `excel-haters/src/recommendation/RecommendationPage.jsx`: recommendation page.
- `excel-haters/src/index.css`: global styles and Tailwind import.
- `excel-haters/vite.config.js`: Vite config with `/api` proxy to `http://10.1.0.135:8080` for local development.

## Conventions
- Add feature pages under `excel-haters/src/<feature>/`.
- Put feature-specific reusable components in `excel-haters/src/<feature>/components/`.
- Put shared cross-feature components in `excel-haters/src/shared/`.
- Put static local datasets in `excel-haters/src/<feature>/data/`.
- Put simple feature configuration constants in `excel-haters/src/<feature>/config/`.
- Put data-fetching and normalization logic in `excel-haters/src/<feature>/hooks/`.
- Prefer functional React components.
- Keep styling consistent with the current square-edged admin layout in `index.css`.
- Add new top-level sections in `excel-haters/src/App.jsx`.
- Prefer same-origin frontend requests and use the Vite `/api` proxy in development instead of hardcoding backend origins in components.

## Current State
- The app shell and routing are in place.
- The configurator page is implemented.
- The main configurator view currently shows terminal actions and the terminals table.
- Terminals are fetched from `/api/terminals` and normalized in `useTerminalManager`.
- Components on the main configurator page are loaded from local JSON.
- The reusable configurator tables support local search, sorting/filter controls, and client-side pagination with 7 rows per page.
- Terminal search supports matching by terminal name letters as well as other terminal fields.
- Each terminal row includes a `View` action linking to `http://10.1.0.171:5173/configurator/{terminalName}`.
- The terminal detail page fetches `/api/terminals`, resolves the selected terminal by name, then fetches `/api/terminals/{id}/components`.
- The terminal detail page shows grouped Desk / Security / Gate / Stand sections for the selected terminal, plus a placeholder `Update` modal and a `Back` link.
- The AI terminal page mirrors the detail layout, keeps grouped component sections empty, and includes an upload photo action with in-page image preview.
- The Flights feature is now split into `components/`, `config/`, and `hooks/` folders to match the configurator feature structure.
- The Flights page includes an `Add Flight with Form` action that opens a modal with `flightID`, `terminal`, `desk`, `security`, `gate`, `stand`, `departureTime`, and `arrivalTime` inputs.
- Submitting the Flights modal logs the entered flight payload as formatted JSON in the browser console.
- Timetables and Recommendation are still placeholder sections.
