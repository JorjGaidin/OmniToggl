# Codebase Concerns

**Analysis Date:** 2026-02-26

## Security Considerations

**Hardcoded API Token in Source:**
- Risk: Toggl API token stored as plaintext constant in `common.js` line 5. This token authenticates all API requests to Toggl and grants full workspace access. If token is leaked or committed, attacker gains complete access to user's Toggl account and time data.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (line 5: `const TOGGL_AUTH_TOKEN = 'REPLACE_ME'`)
- Current mitigation: Placeholder value requires manual token entry, documented in README step 8
- Recommendations:
  - Implement secure credential storage (use OmniFocus native preferences API if available, or OS keychain)
  - Add validation to warn if token is still placeholder value
  - Never commit actual tokens to version control (currently mitigated by REPLACE_ME placeholder)
  - Document security best practices for token handling

**Basic Auth Header Construction:**
- Risk: Auth header built with `Base64(token:api_token)` format on line 50. If response logs or error messages inadvertently include auth headers, credentials could leak in console logs or error reporting.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (line 50)
- Current mitigation: Auth header only used internally, not logged directly
- Recommendations:
  - Sanitize error messages to exclude auth headers
  - Add guard to prevent logging of Authorization headers
  - Use token revocation endpoint if token exposure is detected

## Tech Debt

**Base64 Polyfill - Manual Implementation:**
- Issue: Custom `btoa()` implementation (lines 16-43) due to OmniFocus JS environment lacking native `btoa()`. This is a shortcut/duplicate of external functionality that must be maintained manually.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (lines 16-43)
- Impact: Code maintenance burden; any bug fixes to base64 encoding need manual implementation; risk of encoding errors in auth header generation
- Fix approach: Monitor OmniFocus JS API updates for native base64 support; document reason for polyfill; consider abstracting to separate utility module if further encoding needs emerge

**Inconsistent HTTP Status Code Handling:**
- Issue: API methods check `r.statusCode !== 200` for all responses, but Toggl API uses standard REST conventions (201 for creation, 204 for no-content, etc.). Current implementation only accepts 200, rejecting valid successful responses.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (lines 70, 90, 113, 138, 155)
- Impact: `createTogglProject()` may fail silently if API returns 201; project creation could fail unexpectedly
- Fix approach: Check for success status range (200-299) or specific expected codes per endpoint; document API contract for each method

**Unvalidated Toggl API Response Data:**
- Issue: All API responses parsed with `JSON.parse()` without validation. If Toggl API schema changes or returns unexpected structure, code fails with cryptic JSON parse errors instead of meaningful diagnostics.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (lines 75, 94, 117, 142, 160)
- Impact: Difficult debugging when API contracts change; production errors not captured effectively
- Fix approach: Add TypeScript/JSDoc type definitions; implement response validation schema (even lightweight); add more descriptive error messages on parse failure

**Weak Error Object Construction:**
- Issue: `buildErrorObject()` at line 45-48 only captures `statusCode` and `bodyString`, losing structured error data, headers, timing, and other diagnostic context from failed API calls.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (lines 45-48)
- Impact: Error messages vague and unhelpful; difficult to debug API issues, rate-limiting, or transient failures
- Fix approach: Extend error object to include URL, method, headers, request body (sanitized), response timestamp, retry count

**commented-out Code:**
- Issue: Line 159 in `common.js` has commented-out return statement: `// return JSON.parse(r.bodyString).projects;` followed by active line returning full user object.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (line 159)
- Impact: Code smell; unclear intent; maintenance burden; risk of accidental re-activation breaking code
- Fix approach: Remove commented code; if full user object needed vs. projects-only, document reason and add explicit comment explaining design

## Known Issues and Fragile Areas

**Project Name Emoji Prefix Breaks Toggl Matching:**
- Issue: When a timer is started, the OF task name is prefixed with `🎯` (line 80 in `startTogglTimer.js`). However, project name matching relies on exact text comparison (line 45-47). If project names are also prefixed, the Toggl project lookup will fail.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 35-46, 80)
- Current behavior: Works because emoji only applied to task names, not project names
- Risk: Planned enhancement to make projects timeable may break this assumption
- Fix approach: Separate project name from task name handling; never apply prefix to projects; refactor matching logic to strip prefixes before comparing

**No Workspace ID Validation:**
- Issue: `workspaceId` extracted from API response (line 32) without validation that workspace actually exists or is accessible. Code assumes default workspace always exists.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 32, 56, 65-66)
- Impact: If default workspace is deleted or access revoked, API calls will fail with cryptic errors
- Fix approach: Add explicit workspace validation on startup; cache workspace ID after first successful use; handle workspace not found with clear error message

**Project Creation Race Condition:**
- Issue: At lines 45-66 in `startTogglTimer.js`, if project not found, code attempts to create it. However, there's no guarantee another instance didn't create it simultaneously (no idempotency check). Multiple rapid timer starts on same project could create duplicates.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 45-66)
- Current mitigation: Unlikely in practice for single user, but not thread-safe
- Risk: If plugin support for multiple rapid invocations or shared workspaces added, projects could duplicate
- Fix approach: Add idempotency key to project creation; retry with lookup if creation fails with conflict; implement project cache with timestamp invalidation

**Tag Mapping Loses Custom Tag Context:**
- Issue: Tags extracted from OF task (line 68: `const taskTags = source.tags.map((t) => t.name)`) and sent as simple string array to Toggl. Toggl tags may not match OF tag context (hierarchies, colors, custom attributes lost).
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (line 68)
- Impact: Tag sync one-directional and incomplete; no feedback if Toggl rejects tags
- Limitations: By design per current requirements, but should be documented as limitation
- Future work: Bidirectional tag sync planned; will need tag mapping/translation layer

**resetTasks Always Finds or Creates Tracking Tag:**
- Issue: In `common.js` line 176-180, `resetTasks()` finds the tracking tag or creates it if missing. This function is called every time timer starts (line 18 of `startTogglTimer.js`), but logic to create tag only if not found runs on each call.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (lines 175-188); called from `startTogglTimer.js` (line 18)
- Impact: Minor inefficiency; tag creation happens on every start even after first use
- Fix approach: Check if tag exists globally once and cache result; only create on first use; add validation that tag exists before operations

**No Retry Logic for Transient Failures:**
- Issue: All API calls fail immediately on any error (network, timeout, rate-limiting). No retry mechanism for transient failures.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (all async functions)
- Impact: User sees error if Toggl API briefly unavailable, even if retry would succeed
- Fix approach: Implement exponential backoff retry for 5xx errors and 429 (rate limit); user-configurable retry count

**User Alert Blocks on Network Errors:**
- Issue: Error handling uses `await log()` (lines 26-29, 84, 89 in actions) which shows modal Alert and blocks until user clicks OK. If API is slow, user sits waiting.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 26-29, 84, 89); `stopTogglTimer.js` (line 18)
- Impact: Poor UX; blocks OmniFocus UI; frustrating for flaky networks
- Fix approach: Use non-blocking notification system if OmniFocus API supports; log errors to file instead of modal; show transient toast instead of modal Alert

## Performance Bottlenecks

**Full User Data Fetched Every Start:**
- Issue: Every timer start calls `getTogglProjects()` which fetches entire user object with all projects via `?with_related_data=true` (line 152). This could be thousands of projects in large workspaces.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (line 152); called from `startTogglTimer.js` (line 24)
- Impact: Slow startup; unnecessary bandwidth; scales poorly with workspace size
- Current: No caching between calls
- Fix approach: Implement client-side project cache with TTL (e.g., cache for 1 hour); add manual refresh button; cache after each project creation

**Linear Project Lookup:**
- Issue: Project lookup uses `.find()` on full projects array (line 45-47 in `startTogglTimer.js`), which is O(n) and case-insensitive. For large workspaces with hundreds of projects, each start incurs linear scan.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 45-47)
- Impact: Scales linearly with workspace size
- Fix approach: Use Map with lowercase name as key for O(1) lookup; build index once per fetch

**resetTasks Iterates All Tagged Tasks:**
- Issue: `resetTasks()` iterates through all tasks with tracking tag and removes prefix/tag (line 182-187). Could be slow if many tasks are tagged.
- Files: `OmniToggl.omnifocusjs/Resources/common.js` (lines 182-187)
- Impact: Visible delay if hundreds of tasks are tagged
- Fix approach: Only iterate tasks, don't rebuild entire collection; batch operations if API supports

## Scaling Limits

**Single Project-Containment Logic:**
- Issue: Code assumes each task belongs to at most one project (line 38: `source.containingProject`). OmniFocus supports hierarchical projects; code only looks at immediate parent.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 38-40)
- Impact: Nested projects not fully captured; task in deep hierarchy maps only to immediate parent
- Fix approach: Walk project hierarchy to build full path; support nested project matching in Toggl

**No Limit on Concurrent Timers:**
- Issue: Code doesn't check if timer already running before starting new one. Toggl API allows only one running timer per workspace.
- Files: `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (no check before line 71)
- Impact: Attempting to start timer while one running will fail; no warning to user
- Fix approach: Check `getCurrentTogglTimer()` before starting; warn user if timer already running; offer to stop and start new one

## Test Coverage Gaps

**No Tests:**
- What's not tested: All functionality is untested; no unit tests, no integration tests, no automation tests
- Files: `OmniToggl.omnifocusjs/Resources/common.js`, `startTogglTimer.js`, `stopTogglTimer.js`
- Risk: Regressions undetected; API changes break silently; feature interactions not validated
- Priority: High - OmniFocus plugin testing is difficult but critical for reliability
- Mitigation: Add integration tests with mock Toggl API; test OmniFocus API mocks if available; at minimum, add smoke tests for happy path

**No Validation Tests for Toggl API Contracts:**
- What's not tested: Whether plugin still works when Toggl API changes schema, adds fields, or changes status codes
- Files: All API integration points
- Risk: Silent failures when API updates
- Priority: Medium - document API contract and add schema validation

**No Error Scenario Testing:**
- What's not tested: Network failures, auth errors, invalid workspaces, duplicate projects, missing tags, etc.
- Files: Error handling in all async functions
- Risk: Error paths untested; error messages unhelpful
- Priority: Medium

## Missing Critical Features

**No Configuration UI:**
- Problem: Token and config settings must be manually edited in source file (documented in README step 8). No UI to configure without file editing.
- Blocks: Easy installation for non-technical users; token rotation without file editing
- Current workaround: Edit `common.js` lines 5-11
- Recommendations: Add configuration action in OmniFocus menu; store settings in OmniFocus preferences API if available; generate setup wizard on first run

**No Activity Feedback During API Calls:**
- Problem: User has no indication that something is happening during API call (could be seconds for network request). OmniFocus UI appears frozen.
- Blocks: Understanding why system seems unresponsive; confidence that action is working
- Recommendations: Show status message; add progress indicator if OmniFocus API supports; return control to UI immediately and show async status

**No Workspace/Project Selection UI:**
- Problem: Code assumes single default workspace; users with multiple workspaces can't select which workspace to use. Project creation happens silently without confirmation.
- Blocks: Multi-workspace support; project management
- Recommendations: Add workspace selector; confirm before creating projects; allow mapping OF projects to specific Toggl projects

**No Bidirectional Sync (Planned):**
- Problem: Toggl time data not synced back to OmniFocus (estimated time, actual logged time). One-directional only.
- Blocks: Automated time tracking feedback in OmniFocus
- Fix approach: Scheduled sync task; webhook integration if Toggl supports; manual refresh action

---

*Concerns audit: 2026-02-26*
