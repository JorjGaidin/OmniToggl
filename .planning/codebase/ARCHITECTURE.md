# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Plugin Action Pattern with Shared Library Services

OmniToggl implements the OmniFocus plugin architecture using a shared library (`common.js`) that exposes Toggl API client functions and OmniFocus state management utilities. Two independent actions (`startTogglTimer`, `stopTogglTimer`) consume these library services to coordinate time tracking between OmniFocus and Toggl.

**Key Characteristics:**
- Plugin library model: Shared code module (common.js) imported by action modules
- Action-driven: Two discrete UI actions that trigger handlers based on user selection
- Stateful: Maintains tag-based tracking state in OmniFocus (working-on tag + emoji prefix)
- Synchronous API with async I/O: OmniFocus state changes are synchronous; Toggl API calls are async
- Single workspace model: Uses default workspace from Toggl; workspace_id extracted from API responses

## Layers

**HTTP/API Layer:**
- Purpose: Low-level Toggl API client using OmniGroup's URL.FetchRequest
- Location: `OmniToggl.omnifocusjs/Resources/common.js` (lines 54-161)
- Contains: HTTP request builders, response parsing, error handling
- Depends on: OmniFocus URL.FetchRequest, Data encoding, Base64 polyfill
- Used by: Timer control layer

**Timer Control Layer:**
- Purpose: High-level Toggl timer operations (start, stop, fetch current)
- Location: `OmniToggl.omnifocusjs/Resources/common.js` (methods: startTogglTimer, stopTogglTimer, getCurrentTogglTimer)
- Contains: Methods that wrap HTTP calls with validation and error transformation
- Depends on: HTTP/API layer
- Used by: Action layer

**Project Management Layer:**
- Purpose: Toggl project CRUD and lookup (matches OF projects to Toggl)
- Location: `OmniToggl.omnifocusjs/Resources/common.js` (methods: getTogglProjects, createTogglProject)
- Contains: Project matching, auto-create logic
- Depends on: HTTP/API layer
- Used by: Start timer action

**OmniFocus State Layer:**
- Purpose: Manage working-on tag and emoji prefix on OF tasks
- Location: `OmniToggl.omnifocusjs/Resources/common.js` (resetTasks method), action files (tag add/remove)
- Contains: Tag creation, task name prefixing, tag association
- Depends on: OmniFocus API (flattenedTags, Task.addTag, Task.removeTag)
- Used by: Both actions

**Action Layer (UI Orchestration):**
- Purpose: Handle user-triggered action events and orchestrate layer calls
- Location: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js`, `stopTogglTimer.js`
- Contains: Action handlers, validation functions, user flow logic
- Depends on: Timer control, project management, OmniFocus state layers
- Used by: OmniFocus UI

## Data Flow

**Start Timer Flow:**

1. User selects task or project in OmniFocus, clicks "Start Toggl Timer"
2. `startTogglTimer.js` validates selection (1 task OR 1 project)
3. Action handler calls `resetTasks()` to clean previous tracking state
4. Calls `getTogglProjects()` to fetch Toggl projects + workspace ID
5. Extracts source item name and determines Toggl project ID:
   - If task: use containing project name
   - If project: use project name
6. Matches against Toggl projects by name (case-insensitive, trimmed)
7. If no match: creates new project via `createTogglProject()`
8. Calls `startTogglTimer()` with time entry object containing:
   - description: task/project name
   - project_id: matched or created Toggl project
   - tags: OmniFocus task tags
   - start: ISO timestamp
   - duration: -1 (running state)
9. On success: prefixes source item name with emoji, adds working-on tag
10. Error: shows alert popup, logs to console

**Stop Timer Flow:**

1. User clicks "Stop Toggl Timer" (no selection required)
2. `stopTogglTimer.js` calls `getCurrentTogglTimer()` to fetch running entry
3. If timer exists: calls `stopTogglTimer()` with workspace_id and entry ID
4. Calls `resetTasks()` to remove emoji prefix and working-on tag from all tagged tasks
5. Error: shows alert popup, logs to console

**State Management:**

OmniFocus state is the source of truth for tracking status:
- **Working-on tag**: Marks which tasks/projects have active timers
- **Emoji prefix**: Visual indicator on task name
- Reset on every start and stop ensures consistency

Toggl timer state is independent; OmniFocus state tracks local action history.

## Key Abstractions

**Toggl API Client (PlugIn.Library):**
- Purpose: Abstract Toggl API v9 HTTP details
- Examples: `startTogglTimer()`, `stopTogglTimer()`, `getCurrentTogglTimer()`, `getTogglProjects()`, `createTogglProject()`
- Pattern: Each method builds URL.FetchRequest, handles auth header, parses JSON response, throws on non-200
- Configured via: TOGGL_AUTH_TOKEN (line 5 in common.js), TOGGL_URL constant

**Base64 Polyfill:**
- Purpose: Provide btoa() for OmniFocus environment (missing native implementation)
- Examples: `btoa('token:api_token')` in AuthHeader construction (line 50)
- Pattern: Bit-shift operations over character codes, padding logic

**Project Matcher:**
- Purpose: Find Toggl project by name matching against OmniFocus project
- Pattern: Case-insensitive, trim whitespace, find first match
- Location: startTogglTimer.js lines 45-46

**Config Object:**
- Purpose: Centralize plugin settings
- Contains: TOGGL_AUTH_TOKEN, TRACKING_TAG_NAME, TRACKING_NAME_PREFIX
- Location: common.js lines 169-173
- Pattern: Plain object exported from library, accessed via `this.common.config`

## Entry Points

**Start Toggl Timer Action:**
- Location: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js`
- Triggers: User selects task or project, invokes action from context menu/shortcuts
- Responsibilities:
  - Validate selection (exactly 1 task or 1 project)
  - Reset previous tracking state
  - Determine source item and project name
  - Fetch Toggl projects and workspace
  - Match or create Toggl project
  - Start time entry with task/project metadata
  - Update OF task with tracking indicator
  - Handle errors with alert popups

**Stop Toggl Timer Action:**
- Location: `OmniToggl.omnifocusjs/Resources/stopTogglTimer.js`
- Triggers: User invokes action (always available, no selection required)
- Responsibilities:
  - Fetch current running timer
  - Stop timer if running
  - Reset tracking state from all tasks
  - Handle errors with alert popups

**Shared Library:**
- Location: `OmniToggl.omnifocusjs/Resources/common.js`
- Exported as: PlugIn.Library identified by "common"
- Available to: Both actions via `this.common`

## Error Handling

**Strategy:** Try-catch with user-facing alerts and console logging

**Patterns:**

1. **API Error Transformation** (lines 45-48):
   ```javascript
   const buildErrorObject = (r) => ({
     statusCode: r.statusCode,
     data: r.bodyString,
   });
   ```
   Catches non-200 responses, extracts status and body.

2. **Action-Level Try-Catch** (startTogglTimer.js lines 17-92):
   - Outer try-catch wraps entire handler
   - Inner try-catch around API calls (getTogglProjects, createTogglProject, startTogglTimer)
   - Each catch shows Alert popup to user
   - All errors logged to console for debugging

3. **Validation Before Operations** (startTogglTimer.js lines 95-101):
   - `validate()` function checks selection before handler runs
   - Prevents invalid invocations

4. **Graceful Degradation**:
   - Project creation failure doesn't block timer start (pid may be null)
   - Missing tracking tag is created on demand (lines 176-180)

## Cross-Cutting Concerns

**Logging:**
- Console.log() for info/debug messages
- Alert popups for user-facing errors with title and message
- All API responses logged: `console.log('Timer started successfully', JSON.stringify(r))`

**Validation:**
- Action level: Selection validation in `validate()` function
- Project matching: Case-insensitive, trimmed string comparison
- Time entry: Required fields structured before POST to Toggl API

**Authentication:**
- Basic auth header: `Basic ${btoa(${TOGGL_AUTH_TOKEN}:api_token)}`
- Token stored in common.js as constant (requires manual replacement: line 5)
- Applied to all fetch requests via headers object

**Configuration:**
- Centralized in common.js top-level constants (lines 5-11)
- Exported as config object for action access
- Configurable: TRACKING_TAG_NAME, TRACKING_NAME_PREFIX

---

*Architecture analysis: 2026-02-26*
