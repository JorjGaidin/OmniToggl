# OmniToggl

## What This Is

An OmniFocus plugin that provides bidirectional integration with Toggl Track. Start/stop timers from OmniFocus with automatic project and task matching, sync projects and tasks between both apps, and keep estimated durations in sync. Forked from benhughes/OmniToggl and extended for full two-way sync.

## Core Value

Starting a timer on any OmniFocus task creates the right Toggl time entry — right project, right task, no manual double-entry — and changes in either app sync to the other.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from existing codebase. -->

- ✓ Start Toggl timer from selected OF task or project — existing
- ✓ Stop current Toggl timer from OmniFocus — existing
- ✓ Auto-match OF project name to Toggl project (create if missing) — existing
- ✓ Visual tracking indicator on active OF task (emoji prefix + working-on tag) — existing
- ✓ Toggl API v9 integration with Basic auth — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Fix emoji prefix breaking Toggl project name matching (project-safe start)
- [ ] Attach time entries to Toggl tasks (not just project + description)
- [ ] Auto-create Toggl tasks when starting timer on unmapped OF task
- [ ] Bidirectional project sync (create in either app, appears in both)
- [ ] Bidirectional task sync (create in either app, appears in both)
- [ ] Bidirectional estimated time sync (set in either app, syncs to other)
- [ ] Manual "sync now" action alongside automatic sync on start/stop
- [ ] Conflict detection with alert prompt (OF as fallback authority)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Multi-workspace support — single workspace only, keeps sync logic simple
- OF folder → Toggl client mapping — may revisit, but projects + tasks sufficient for now
- Background/scheduled sync — OmniFocus plugin API doesn't support background execution
- Mobile support — OmniFocus plugin system is macOS only
- OAuth authentication — API token is sufficient for personal/small-audience use

## Context

- **Existing codebase**: Forked from benhughes/OmniToggl, already handles start/stop with project matching
- **Known bug**: Emoji prefix on project names breaks Toggl project lookup on subsequent starts
- **OmniFocus plugin constraints**: No native btoa(), no background execution, OmniGroup-specific HTTP client (URL.FetchRequest), synchronous OF state changes with async API calls
- **Toggl tasks require paid plan**: Tasks API may have tier restrictions — research needed
- **Audience**: Personal use first, intent to publish fork for community
- **Plugin ID**: `com.github.benhughes.OmniToggl` (v1.2.1) — may need to update for fork

## Constraints

- **Runtime**: OmniFocus macOS plugin environment (OmniGroup JS runtime, not Node/browser)
- **API**: Toggl Track API v9 — all sync must go through REST endpoints
- **No background execution**: Plugin actions only run when user triggers them
- **Auth token in source**: Currently hardcoded in common.js — acceptable for personal use but needs config solution for publishing

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| True bidirectional sync | User creates in whichever app is convenient | — Pending |
| OF as conflict authority (fallback) | Alert user on conflicts when possible, OF wins when prompting isn't feasible | — Pending |
| Sync on action + manual trigger | No background execution available in plugin API | — Pending |
| Single workspace only | Simplifies sync mapping, user has one workspace | — Pending |
| Projects + tasks (not folders/clients) | Start simple, can add hierarchy mapping later | — Pending |

---
*Last updated: 2026-02-26 after initialization*
