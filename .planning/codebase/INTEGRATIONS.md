# External Integrations

**Analysis Date:** 2026-02-26

## APIs & External Services

**Toggl Track:**
- Service: Toggl Track time tracking platform
- What it's used for: Start/stop time entries, manage projects, create projects, fetch current timer status
  - SDK/Client: Custom implementation using `URL.FetchRequest`
  - Base URL: `https://api.track.toggl.com/api/v9`
  - Auth: HTTP Basic authentication with Toggl API token (`token:api_token`)
  - Auth header generation: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` line 50

## Data Storage

**Databases:**
- Not used - Plugin operates in memory and uses OmniFocus native storage

**File Storage:**
- Local filesystem only - Plugin data persisted by OmniFocus application

**Caching:**
- Not implemented - API responses processed immediately in memory

## Authentication & Identity

**Auth Provider:**
- Toggl Track API token (user-supplied)

**Implementation:**
- Basic HTTP authentication
- Token configured in `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` line 5
- Base64 encoding: `Authorization: Basic ${btoa('TOGGL_AUTH_TOKEN:api_token')}`
- Applied to all Toggl API requests (lines 62, 84, 105, 131, 149 in common.js)

## Monitoring & Observability

**Error Tracking:**
- Custom error handling via Alert popups
- Console logging for debugging (never committed in production)

**Logs:**
- Browser console output via `console.log()` calls
- User-facing alerts via `Alert` class for critical errors
- Error object format: `{ statusCode, data }` from failed HTTP responses

## CI/CD & Deployment

**Hosting:**
- Not applicable - macOS plugin delivered as bundle

**Deployment:**
- Manual copy of `.omnifocusjs` bundle to OmniFocus plugins directory
- Or: Open bundle directly in OmniFocus to install
- Restart OmniFocus required after installation

**Version Control:**
- Tracked in `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/manifest.json`
- Current version: `1.2.1`

## Environment Configuration

**Required env vars/Configuration:**
- `TOGGL_AUTH_TOKEN` - Must be set in `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` line 5 before deployment
  - Located at: https://track.toggl.com/profile
  - Format: Toggl API token string
  - Scope: One token per workspace user

**Optional Configuration:**
- `TRACKING_TAG_NAME` - OmniFocus tag name (default: `working-on`)
- `TRACKING_NAME_PREFIX` - Active task prefix emoji (default: `🎯`)

**Secrets location:**
- `.env` file ignored in `.gitignore` (if used locally)
- Toggl token stored directly in plugin code (requires manual setup, never committed to git)

## Toggl Track API Endpoints Used

**Time Entries:**
- `POST /workspaces/{wid}/time_entries` - Start timer
  - Implementation: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` lines 54-76
  - Payload: `{ description, created_with, tags[], project_id, workspace_id, start, duration }`
  - Response: Time entry object with id

- `GET /me/time_entries/current` - Get currently running timer
  - Implementation: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` lines 78-95
  - Response: Current time entry object or null

- `PATCH /workspaces/{wid}/time_entries/{id}/stop` - Stop running timer
  - Implementation: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` lines 97-118
  - Response: Stopped time entry object

**Projects:**
- `POST /workspaces/{wid}/projects` - Create project
  - Implementation: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` lines 120-143
  - Payload: `{ active: true, name }`
  - Response: Project object with id

- `GET /me?with_related_data=true` - Fetch user data and projects
  - Implementation: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` lines 145-161
  - Response: User object with `default_workspace_id`, `projects[]`, workspace relations

## Webhooks & Callbacks

**Incoming:**
- None - Plugin only makes requests to Toggl, does not receive webhooks

**Outgoing:**
- None - No outgoing webhooks to external services

## Integration Flow

**Start Timer Flow:**
1. User invokes "Start Toggl Timer" action from OmniFocus task/project
2. Action fetches current projects from Toggl: `GET /me?with_related_data=true`
3. Matches OmniFocus project name to Toggl project (case-insensitive)
4. If no match, creates new Toggl project: `POST /workspaces/{wid}/projects`
5. Starts time entry: `POST /workspaces/{wid}/time_entries` with task name, tags, project
6. Tags OmniFocus task with `working-on` tag
7. Prefixes task name with 🎯 emoji in OmniFocus

**Stop Timer Flow:**
1. User invokes "Stop Toggl Timer" action
2. Fetches current running timer: `GET /me/time_entries/current`
3. Stops timer: `PATCH /workspaces/{wid}/time_entries/{id}/stop`
4. Removes `working-on` tag from all tagged OmniFocus tasks
5. Removes 🎯 emoji prefix from task names

---

*Integration audit: 2026-02-26*
