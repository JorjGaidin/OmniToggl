# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**
- camelCase for action files: `startTogglTimer.js`, `stopTogglTimer.js`
- camelCase for library/utility files: `common.js`
- Matches action identifier names in `manifest.json`

**Functions:**
- camelCase for all function names
- Async functions use verb-first pattern: `startTogglTimer()`, `stopTogglTimer()`, `getCurrentTogglTimer()`, `createTogglProject()`
- Action handlers follow pattern: `[actionName]Action` (e.g., `startTogglTimerAction`, `stopTogglTimerAction`)
- Validation functions follow pattern: `[actionName]Validate` (e.g., `startTogglTimerValidate`)
- Utility functions are descriptive: `resetTasks()`, `log()`, `btoa()`

**Variables:**
- camelCase for all variables: `trackingTag`, `projectName`, `workspaceId`, `toggleProject`
- Configuration constants use UPPER_SNAKE_CASE: `TOGGL_AUTH_TOKEN`, `TRACKING_TAG_NAME`, `TRACKING_NAME_PREFIX`, `TOGGL_URL`
- Descriptive names for loop variables: `t` for tags, `p` for projects, `task` for task objects
- Single-letter variables acceptable in mathematical/bitwise operations (base64 encoding): `a`, `b`, `c`, `i`

**Types:**
- OmniFocus classes are capitalized as provided by API: `Task`, `Tag`, `Alert`, `PlugIn`, `Version`, `Data`, `URL`
- No custom type definitions (plain JavaScript)

## Code Style

**Formatting:**
- Prettier configured in `.prettierrc.js`
  - `trailingComma: "all"` — trailing commas in multiline structures
  - `singleQuote: true` — single quotes for strings
- 2-space indentation (inferred from Prettier defaults and package ecosystem)
- Line length: appears to respect ~80-100 character limit

**Linting:**
- ESLint configured in `.eslintrc.js`
- Extends `airbnb` and `prettier` presets for consistency
- Key disabled rules:
  - `no-param-reassign: off` — allows function parameter modification
  - `no-console: off` — allows `console.log()` for debugging
- Global OmniFocus API objects declared: `PlugIn`, `Version`, `Data`, `flattenedTags`, `Alert`, `Tag`
- Bitwise operations and plusplus allowed in base64 polyfill (eslint-disable pragma used)

## Import Organization

**Module Pattern:**
- IIFE (Immediately Invoked Function Expression) pattern used for encapsulation: `(() => { ... })()`
- All code wrapped in IIFE to prevent global scope pollution
- Actions and libraries use `new PlugIn.Action()` and `new PlugIn.Library()` constructors
- Libraries attached to `dependencyLibrary` object and returned

**Order in common.js (library file):**
1. Configuration constants (tokens, tag names, prefixes)
2. API base URL constant
3. Utility functions (btoa polyfill, error builder)
4. Auth header construction
5. Plugin library initialization
6. API wrapper functions (startTogglTimer, getCurrentTogglTimer, etc.)
7. Helper functions (log, resetTasks)
8. Config object assembly
9. Library return

**Order in action files:**
1. Action handler function definition
2. Validation function definition
3. Action return

## Error Handling

**Patterns:**
- Errors caught with try-catch blocks, no error propagation expected in OmniFocus context
- HTTP errors checked by status code: `if (r.statusCode !== 200) throw buildErrorObject(r);`
- `buildErrorObject()` helper creates consistent error shape: `{ statusCode, data }`
- User-facing errors shown via Alert dialog: `await log('Error message', 'Title')`
- Console logging for debugging: `console.log()` and `console.log(JSON.stringify(e, null, 2))`
- Nested try-catch for non-critical operations (e.g., fetching projects) that should not block timer start

## Logging

**Framework:** Native OmniFocus `Alert` API (popup dialogs)

**Patterns:**
- User-visible alerts use custom `log()` function: `await log(message, title)`
- Technical debugging logged to console: `console.log()`
- JSON stringification for complex objects: `console.log(JSON.stringify(e, null, 2))`
- No structured logging framework; all logging is imperative
- Success messages logged: `'Timer started successfully'`, `'Timer stopped successfully'`
- Debug info: project creation, project lookup results, timer details

## Comments

**When to Comment:**
- Inline comments for non-obvious logic or API modifications
- Comments document API version changes: `// modified to json data format`, `// modified to cut '.data' from the return value`
- Comments clarify setup steps: `// Replace the string below with your API Token...`
- Comments explain design choices: `// To determine the final padding`
- Comments document selector behavior: `// selection options: tasks, projects, folders, tags`

**JSDoc/TSDoc:**
- Not used in this codebase (no type annotations or formal documentation)
- Configuration and function purpose explained via inline comments

## Function Design

**Size:**
- Functions are typically 10-50 lines
- Longer functions (50-100 lines) used for complex orchestration logic (startTogglTimer action)
- No functions exceed ~100 lines

**Parameters:**
- Action handlers receive `selection` parameter from OmniFocus context
- API wrapper functions receive specific parameters: `async startTogglTimer(timeEntry)`, `async stopTogglTimer(workspaceId, id)`
- Helper functions are parameter-minimal: `resetTasks()`, `getCurrentTogglTimer()`
- Configuration passed via closure/library object, not as function parameters

**Return Values:**
- Async functions return parsed JSON from API: `return JSON.parse(r.bodyString);`
- Validation functions return boolean: `return taskSelected || projectSelected;`
- Helper functions void (no explicit return)
- Alert/log functions await the promise without returning value
- Error object returned as consistent shape on failure

## Module Design

**Exports:**
- OmniFocus actions exported as `return action;` (PlugIn.Action instance)
- Libraries exported as `return dependencyLibrary;` (PlugIn.Library instance)
- Actions bound to library via `this.common` context in handler function
- IIFE prevents any direct module exports; all module interface via PlugIn API

**Barrel Files:**
- Not applicable (single-file modules per action/library)
- `common.js` serves as centralized library with all shared utilities

**Library Pattern:**
- Central `common.js` library contains all Toggl API wrappers, configuration, and helpers
- Actions import functionality via `this.common` reference (provided by OmniFocus runtime)
- Destructuring used to extract needed functions: `const { config, startTogglTimer, createTogglProject } = this.common;`

---

*Convention analysis: 2026-02-26*
