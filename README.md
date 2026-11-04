# Organisation Directory

A responsive organisation management application built with Angular. It allows users to browse, search, filter, sort and create organisations while handling inconsistent API data and simulated network failures.

## Features

- **Organisation listing:** Displays organisation name, status, member count, owner and creation date.
- **Search:** Debounced free-text search by organisation name.
- **Filtering:** Filter organisations by status.
- **Shareable URL:** Search and status filter values are reflected in URL query parameters.
- **Sorting:** Sort organisations by name and creation date in ascending or descending order.
- **Create organisation:** Modal form with validation for organisation name, status, owner email and member count.
- **Data normalisation:** Handles missing values, inconsistent statuses, invalid dates, duplicate IDs and malformed records.
- **Loading and error handling:** Distinct loading, empty and error states with retry functionality.
- **Accessibility:** Status is communicated through both text and colour.
- **Design tokens:** Centralised CSS custom properties for colours, spacing, typography and other design values.
- **Translations:** User-facing text is managed through a central English translation file.

## Technology Stack

- Angular 22
- TypeScript
- Standalone components
- Angular Signals
- Reactive Forms
- RxJS
- SCSS
- Angular Router
- Angular HttpClient

## Getting Started

### Prerequisites

- Node.js 26+
- npm 9+
- Angular CLI 22+

### Installation

Clone the repository:

```bash
git clone https://github.com/dkalaiyarasan/organisation-directory.git
```

Navigate to the project directory:

```bash
cd organisation-directory
```

Install dependencies:

```bash
npm install
```

### Development Server

Start the local development server:

```bash
ng serve
```

Open your browser at:

http://localhost:4200/

The application automatically reloads when source files are changed.

## Build

Run the production build:

```bash
ng build
```

Build output is generated in:

`dist/organisation-directory/browser/`

## Testing

Run the configured unit test runner:

```bash
ng test
```

## Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   └── utils/
│   ├── features/
│   │   └── organisations/
│   │       ├── components/
│   │       ├── models/
│   │       ├── pages/
│   │       └── services/
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
│   ├── data/
│   └── i18n/
└── styles.scss

DECISIONS.md
README.md
```

## Data Handling and API Simulation

The application uses a local organisation fixture containing 137 records, including intentionally inconsistent and corrupted data.

A normalisation layer converts raw records into a consistent application model. Records without a valid ID or name are rejected, while other invalid or missing values are handled using defined fallback rules.

Out of the 137 fixture records, 135 are accepted after normalisation and 2 are rejected because they have missing or invalid required identifiers or names.

Since the assessment does not provide a backend, the service simulates paginated requests by splitting the local fixture into batches of 25 records. It also demonstrates request rate limiting, caching, simulated failures and retry behaviour.

These are simulated API behaviours rather than separate real backend requests.

## Design and Architecture Decisions

Important implementation decisions, trade-offs and conflict resolutions are documented in [DECISIONS.md](./DECISIONS.md).

## AI Assistance

ChatGPT was used during development for implementation guidance, code review, debugging and documentation support.

The final implementation was reviewed and manually verified. Details of AI assistance and development decisions are documented in `DECISIONS.md`.