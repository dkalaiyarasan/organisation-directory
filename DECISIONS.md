# Technical Decisions – Organisation Directory

## 1. Architecture and technology choices

### Angular standalone architecture
- **Chosen:** Angular standalone components without NgModules.
- **Why:** Standalone components simplify application structure and make dependencies explicit.
- **Alternative considered:** NgModule-based architecture.
- **Why rejected:** It adds module configuration that is unnecessary for this application.

### Component state management
- **Chosen:** Angular Signals for organisation data, loading state, errors, filters and sorting.
- **Why:** Signals provide reactive state updates and computed values without requiring a separate state-management library.
- **Alternative considered:** BehaviorSubject-based view state.
- **Why rejected:** Signals are more suitable for the component and application state required by this assignment.

### Dependency injection
- **Chosen:** Angular `inject()` function.
- **Why:** It keeps dependency injection consistent with modern Angular standalone architecture.

### Reactive forms
- **Chosen:** Typed, non-nullable reactive form controls with validators.
- **Why:** They provide predictable form values and centralised validation.
- **Validation behaviour:** Field errors are displayed after blur, while submission marks invalid fields as touched.

## 2. Handling inconsistent API data

The supplied fixture contains inconsistent and corrupted organisation records. I normalise the raw API data before using it in the UI.

| Data issue | Handling decision |
|---|---|
| Missing or empty ID | Reject the record |
| Missing or empty name | Reject the record |
| Duplicate IDs | Preserve records; do not silently discard data |
| Inconsistent status casing | Trim and convert to lowercase |
| Unknown status | Map to `unknown` |
| Missing or invalid member count | Default to `0` |
| Negative member count | Default to `0` |
| String member count | Convert to a number when valid |
| Missing or nested owner | Extract email when available; otherwise use an empty value |
| Invalid date | Store as `null` |
| Numeric date | Parse as a JavaScript timestamp |
| Corrupted Arabic text | Preserve the original text rather than guessing a correction |

Rejected records are tracked separately so that invalid data is not silently lost.

The UI displays a translated fallback for missing owner and date values.

## 3. Conflict resolution – API pagination and request limits

**Conflict:**
- Operations requested all organisations on one page without pagination.
- The API allows a maximum of 25 records per request.
- The dataset contains 137 records.
- The API has a maximum of 5 requests per minute.

**Decision:**
- Display all successfully loaded organisations in one table without user-facing pagination.
- Retrieve data in logical batches of 25 records.
- Respect the five-request-per-minute limit in the simulated request layer.
- Cache successfully loaded pages.
- Retry failed pages without unnecessarily requesting cached pages again.

**Implementation limitation:**

There is no backend available for this assessment. The fixture is fetched locally, and the service simulates paginated requests by slicing the local dataset into batches. Therefore, these are simulated page requests, not separate real API network requests.

**Trade-off:**
The UI meets the requirement of showing all organisations together while demonstrating how pagination, request limits, caching and retry behaviour would be handled when integrating with a real API.

## 4. Conflict resolution – Status accessibility

**Conflict:**
- The design preference was to show status using coloured dots only.
- Accessibility requirements state that information must not be communicated through colour alone.

**Decision:**
- Display a coloured status indicator alongside its textual status label.
- Use distinct colours for active, inactive, pending and unknown statuses.

**Why:**
Users can identify the organisation status through text even if they cannot distinguish the colours.

## 5. Search, filtering and sorting

- Search is debounced to reduce unnecessary filtering work while the user types.
- Status filtering and free-text search can work together.
- Search and status filter values are reflected in URL query parameters.
- This allows the current filtered view to be shared or restored.
- Sorting is performed locally on the loaded organisation data.

## 6. Create organisation form

- Organisation name is required and must contain between 3 and 80 characters.
- Duplicate names are checked without case sensitivity.
- Status is required.
- Owner email is required and validated.
- Member count is optional and cannot be negative.
- Empty member count defaults to `0`.
- A generated UUID is used as the new organisation ID.

**Limitation:** Created organisations are held in application state. They are not persisted to a backend and will not survive a browser refresh.

## 7. Loading, empty and error states

The application distinguishes between:
- Loading state while organisation data is being retrieved.
- Empty state when no records match the current search or filter.
- Error state when a request fails.
- Retry action to attempt loading failed data again.

The service simulates request failures to demonstrate error handling in the absence of a backend.

## 8. Translation and design tokens

### Translation
- **Chosen:** A central `en.json` translation file for user-facing text.
- Components use translation keys instead of hardcoded display messages.
- This makes future language support easier.

### Design tokens
- **Chosen:** CSS custom properties for colours, spacing, typography, borders and shadows.
- Brand and theme-related values can be updated centrally.
- Components consume tokens instead of defining their own colour and spacing values.

## 9. AI tool declaration

ChatGPT was used as an AI-assisted development tool during this assessment.

Areas where AI assistance was used:
- Discussing implementation approaches and architecture decisions.
- Generating and refining code suggestions.
- Debugging Angular and TypeScript compilation issues.
- Reviewing form validation, data normalisation and styling.
- Reviewing the implementation against the assessment requirements.
- Preparing technical explanations and documentation.

All suggested changes were reviewed and applied during development. The application was built and manually tested throughout the process.

I am responsible for understanding and explaining the final implementation and its trade-offs. I will also demonstrate my ability to make changes independently during the live coding discussion.

## 10. Assessment clarification

The assessment refers to an additional section as "R3", but that section was not included in the supplied assessment document.

Clarification was requested. The implementation follows the requirements and constraints explicitly provided in the assessment.

## 11. Future improvements

Given additional development time, I would:
- Integrate a real paginated backend API.
- Add automated unit and integration tests.
- Improve observability with structured error logging.
- Add server-side search and sorting if the dataset grows significantly.
- Persist newly created organisations through an API.
- Add additional translation languages.
