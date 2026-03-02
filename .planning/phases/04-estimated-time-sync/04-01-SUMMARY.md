---
phase: 04-estimated-time-sync
plan: 01
subsystem: api
tags: [toggl, omnifocus, estimated-time, sync, tasks]

# Dependency graph
requires:
  - phase: 03-task-resolution-and-timer-integration
    provides: resolveTogglTask four-step orchestrator, createTogglTask with estimated_seconds, getTogglTask, getTogglTasksForProject, matchTaskByName
provides:
  - updateTogglTask PUT helper for updating existing Toggl tasks
  - estimateChanged comparator for detecting estimate drift between OF and Toggl
  - Estimate sync wired into resolveTogglTask stored-ID path (step 1)
  - Estimate sync wired into resolveTogglTask name-match path (steps 2+3)
affects: [05-bidirectional-sync, any phase that reads or writes Toggl task estimated_seconds]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Non-fatal try/catch wrapper pattern for estimate sync — update failure never blocks timer start
    - Both-absent guard in estimateChanged — prevents spurious PUT when neither side has an estimate
    - Capture-then-use: getTogglTask result captured as const togglTask before inner try/catch

key-files:
  created: []
  modified:
    - OmniToggl.omnifocusjs/Resources/common.js

key-decisions:
  - "updateTogglTask and estimateChanged are internal helpers — NOT exported on dependencyLibrary (same pattern as readTogglIdFromNote/writeTogglIdToNote)"
  - "estimateChanged both-absent guard: ofSeconds === undefined AND togglEstimatedSeconds == null|0 returns false — avoids PUT when neither side has an estimate"
  - "When OF has no estimate, send null (not 0, not omit) to PUT body to clear Toggl's estimated_seconds field"
  - "Estimate sync failure is non-fatal — inner try/catch ensures storedId/matchedId always returned"
  - "Step 4 (auto-create) not modified — createTogglTask already sends estimated_seconds via ofMinutesToTogglEstimatedSeconds"

patterns-established:
  - "Non-fatal inner try/catch: wrap side-effect calls (estimate sync) in separate try/catch inside outer error-handling block"
  - "tasks.find for object retrieval: matchTaskByName returns only ID, tasks.find recovers full object needed for field comparison"

requirements-completed: [EST-01, EST-02]

# Metrics
duration: 1min
completed: 2026-03-02
---

# Phase 4 Plan 01: Estimated Time Sync Summary

**updateTogglTask PUT helper and estimateChanged comparator added to common.js, wired into resolveTogglTask stored-ID and name-match paths for non-fatal estimate sync on every timer start**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-02T00:06:00Z
- **Completed:** 2026-03-02T00:07:12Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added `updateTogglTask` async function: PUT `/workspaces/{wid}/projects/{pid}/tasks/{tid}` with fetchWithRetry, matching createTogglTask pattern exactly
- Added `estimateChanged` pure comparator: handles both-absent case (no spurious updates), compares OF estimatedMinutes (converted to seconds) vs Toggl estimated_seconds
- Wired estimate sync into resolveTogglTask step 1 (stored ID path): captures getTogglTask return, compares via estimateChanged, PUTs update if changed — non-fatal inner try/catch
- Wired estimate sync into resolveTogglTask steps 2+3 (name-match path): uses tasks.find to recover full task object from ID-only matchTaskByName result, same non-fatal pattern
- EST-01 (create-time sync via createTogglTask) verified unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add updateTogglTask and estimateChanged helpers** - `d82b1cc` (feat)
2. **Task 2: Wire estimate sync into resolveTogglTask stored-ID and name-match paths** - `2771b0b` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `OmniToggl.omnifocusjs/Resources/common.js` - Added updateTogglTask, estimateChanged; modified resolveTogglTask step 1 and steps 2+3

## Decisions Made
- `updateTogglTask` and `estimateChanged` kept as internal module-scoped functions — not exported on `dependencyLibrary` (matches the pattern of `readTogglIdFromNote`/`writeTogglIdToNote`)
- Both-absent case in `estimateChanged` returns `false` to avoid unnecessary PUT calls when neither OF nor Toggl has an estimate set
- When clearing an estimate (OF has none, Toggl has one): send `null` in PUT body — not `0`, not omit — to explicitly clear the field
- Non-fatal inner try/catch wraps only the estimate sync block, not the full step — outer error handling for 404/stale ID is preserved
- `tasks.find((t) => t.id === matchedId)` recovers full task object after `matchTaskByName` returns ID only — guarded with `if (matchedTask && ...)` for safety

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EST-01 (create-time estimate sync) and EST-02 (start-time estimate sync when changed) are both complete
- Phase 4 plan 01 is the only plan in phase 04-estimated-time-sync — phase is now complete
- Estimate sync is live: every timer start on a previously-seen Toggl task will PUT the current OF estimate if it has drifted

---
*Phase: 04-estimated-time-sync*
*Completed: 2026-03-02*

## Self-Check: PASSED

- FOUND: .planning/phases/04-estimated-time-sync/04-01-SUMMARY.md
- FOUND: OmniToggl.omnifocusjs/Resources/common.js
- FOUND commit: d82b1cc (Task 1)
- FOUND commit: 2771b0b (Task 2)
