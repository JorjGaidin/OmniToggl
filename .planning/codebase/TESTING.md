# Testing Patterns

**Analysis Date:** 2026-02-26

## Test Framework

**Status:** No automated testing framework configured

**Runner:** Not detected

**Assertion Library:** Not applicable

**Test Dependencies:** No testing dependencies in package-lock.json (contains only linting and formatting tools: ESLint, Prettier, Airbnb config)

**Run Commands:**
- No test scripts defined in project configuration
- Testing not part of development workflow

## Test File Organization

**Location:** Not applicable — no test files exist in codebase

**Naming:** Not applicable

**Structure:** Not applicable

## Test Strategy

**Current Approach:** Manual testing only

**Manual Testing Process:**
- Actions tested directly in OmniFocus UI: Automation > OmniToggle > Start/Stop Timer
- User must:
  1. Install plugin per README instructions (unzip to OmniFocus plugins directory)
  2. Configure Toggl API token in `common.js` line 5
  3. Restart OmniFocus
  4. Select a task/project and trigger Start Timer action
  5. Verify timer appears in Toggl Track UI
  6. Verify task name gets emoji prefix and tracking tag added
  7. Stop timer and verify task returns to original name and tag is removed

**Constraints for Automated Testing:**
- OmniFocus JS API is not suitable for unit testing (requires OmniFocus application context)
- `PlugIn.Action`, `PlugIn.Library`, OmniFocus data model objects (Task, Tag, Project) only available at runtime
- Network calls to Toggl API require live API credentials and network access
- Alert dialog API is synchronous and UI-dependent
- No Node.js/server-side testing possible

## Testable Components

**Would require mocking:**
- OmniFocus API objects: `PlugIn`, `Task`, `Tag`, `Alert`, `flattenedTags`
- URL.FetchRequest (HTTP client)
- Data.fromString (string encoding)

**Current testability:**
- Pure functions (no external dependencies):
  - `btoa()` polyfill — could be unit tested in isolation
  - `buildErrorObject()` — could be unit tested
  - String manipulation logic in `resetTasks()` — could be partially tested
- Error handling flow logic — currently verified manually through Alert popups
- Toggl API integration — currently verified by checking Toggl Track UI after timer starts

## Critical Code Paths Without Tests

**Start Timer Flow (`startTogglTimer.js`):**
- Task/project selection validation: `selection.tasks[0] || selection.projects[0]`
- Project name matching (case-insensitive trim): `p.name.trim().toLowerCase() === projectName.trim().toLowerCase()`
- Project creation when not found
- Tag mapping from OmniFocus to Toggl
- Name prefix addition and tag assignment
- No test coverage for edge cases: empty project names, special characters, name collisions

**Stop Timer Flow (`stopTogglTimer.js`):**
- Current timer fetch and stop logic
- Task prefix removal: `task.name.replace(TRACKING_NAME_PREFIX, '')`
- No test coverage for edge cases: prefix appears multiple times, partial prefix matches

**Configuration & Library (`common.js`):**
- Base64 polyfill edge cases not tested (multi-byte characters, empty strings)
- HTTP status code checking only for 200 (no handling of 4xx/5xx beyond generic error wrapper)
- JSON parsing failures not caught (async parsing)
- Authentication header construction not tested

## Error Cases Without Tests

| Error Scenario | Current Handling | Test Coverage |
|---|---|---|
| Invalid API token | Generic error alert, logs to console | None — requires manual testing |
| Network timeout | Thrown as error, caught by action handler | None |
| Project name collision in Toggl | Creates duplicate project with same name | None |
| Special characters in task/project names | Passed as-is to API | None — undefined behavior |
| Missing `workspace_id` in response | Used directly without validation | None |
| Concurrent timer requests | No synchronization mechanism | None |

## Suggested Testing Approach (If Implemented)

**Unit Tests (Node.js Jest/Vitest):**
```javascript
// Test the btoa polyfill in isolation
describe('btoa', () => {
  it('encodes ASCII strings', () => {
    expect(btoa('token:api_token')).toBe(btoa('token:api_token'));
  });

  it('throws on non-Latin1 characters', () => {
    expect(() => btoa('emoji 🎯')).toThrow();
  });
});

// Test error object builder
describe('buildErrorObject', () => {
  it('extracts status code and body', () => {
    const response = { statusCode: 401, bodyString: 'Unauthorized' };
    const error = buildErrorObject(response);
    expect(error).toEqual({ statusCode: 401, data: 'Unauthorized' });
  });
});

// Test string transformation logic
describe('resetTasks', () => {
  it('removes tracking prefix from task names', () => {
    const task = { name: '🎯 My Task' };
    removeTrackingPrefix(task);
    expect(task.name).toBe(' My Task');
  });
});
```

**Integration Tests (Requires OmniFocus environment or mocking):**
- Mock `PlugIn.Library`, `PlugIn.Action` constructors
- Mock OmniFocus data objects: `Task`, `Tag`, `flattenedTags`
- Mock `URL.FetchRequest` to verify API calls
- Test action handler behavior with mocked selection

**E2E Tests (Manual or via UI automation):**
- Requires OmniFocus running
- Could use Xcode UI testing or AppleScript automation
- Verify timer appears in Toggl UI after action execution
- Currently the only practical approach

## Coverage

**Requirements:** None enforced

**Current Coverage:** 0% — no automated tests

**Recommendation:**
For OmniFocus plugins, focus on:
1. Extracting pure logic (API client construction, string transforms) into testable modules
2. Creating integration test suite with mocked OmniFocus API
3. Maintaining manual testing checklist in README for critical user flows

---

*Testing analysis: 2026-02-26*
