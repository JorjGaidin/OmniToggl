# OmniToggl

## What This Is

An OmniFocus plugin that provides bidirectional integration with Toggl Track. Start/stop timers from OmniFocus with automatic project and task matching, secure Keychain-based authentication, and robust error handling. Forked from benhughes/OmniToggl and extended for full two-way sync.

## Core Value

Starting a timer on any OmniFocus task creates the right Toggl time entry — right project, right task, no manual double-entry — and changes in either app sync to the other.

## Requirements

### Validated

- ✓ Start Toggl timer from selected OF task or project — existing
- ✓ Stop current Toggl timer from OmniFocus — existing
- ✓ Auto-match OF project name to Toggl project (create if missing) — existing
- ✓ Visual tracking indicator on active OF task (emoji prefix + working-on tag) — existing
- ✓ Toggl API v9 integration with Basic auth — existing
- ✓ Fix emoji prefix breaking Toggl project name matching — v1.0
- ✓ Secure API token storage in macOS Keychain with first-run prompt — v1.0
- ✓ Plain-language error messages with fetchWithRetry — v1.0
- ✓ Plan tier detection for Toggl Tasks feature gating — v1.0

### Active

<!-- Current Milestone: v1.1 Task-Level Integration -->

- [ ] Attach time entries to Toggl tasks (not just project + description)
- [ ] Auto-create Toggl tasks when starting timer on unmapped OF task
- [ ] Store Toggl task ID in OF task note for registry-first matching
- [ ] Sync OF estimated duration to Toggl task estimated_seconds on create/start
- [ ] Plan tier gating — only attempt task features on Starter+ plan

### Out of Scope

- Multi-workspace support — single workspace only, keeps sync logic simple
- OF folder → Toggl client mapping — may revisit, but projects + tasks sufficient for now
- Background/scheduled sync — OmniFocus plugin API doesn't support background execution
- Mobile support — OmniFocus plugin system is macOS only
- OAuth authentication — API token is sufficient for personal/small-audience use
- Bidirectional sync — deferred to v1.2 (projects, tasks, estimated time both ways)
- Manual "sync now" action — deferred to v1.2
- Conflict detection — deferred to v1.2 (OF as fallback authority)

## Current Milestone: v1.1 Task-Level Integration

**Goal:** Enable task-level Toggl time tracking from OmniFocus — attach entries to Toggl tasks, auto-create when missing, sync estimated duration.

**Target features:**
- Task-level timer attachment (Toggl tasks, not just project + description)
- Registry-first matching via OF task note (stored Toggl task ID → exact name fallback)
- Auto-create Toggl task when no match found
- Estimated duration sync (OF → Toggl) on create/start
- Plan tier gating for task features (Starter+ only)

## Context

- **Shipped v1.0**: Secure auth, error handling, emoji prefix fix. 464 LOC JavaScript across 3 files.
- **OmniFocus plugin constraints**: No native btoa() (polyfilled), no background execution, OmniGroup-specific HTTP client (URL.FetchRequest), Credentials class must instantiate at IIFE load time
- **Toggl tasks require Starter plan**: Plan tier detection built (getWorkspaceInfo), Phase 2 will gate on hasTasksFeature
- **Research gaps for Phase 2**: modificationDate reliability unconfirmed, tracked_seconds units ambiguous, external_reference write permissions unverified
- **Audience**: Personal use first, intent to publish fork for community
- **Plugin ID**: `com.github.benhughes.OmniToggl` (v1.2.1) — may need to update for fork

## Constraints

- **Runtime**: OmniFocus macOS plugin environment (OmniGroup JS runtime, not Node/browser)
- **API**: Toggl Track API v9 — all sync must go through REST endpoints
- **No background execution**: Plugin actions only run when user triggers them
- **Auth**: Keychain-backed via Credentials class (solved in v1.0)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| True bidirectional sync | User creates in whichever app is convenient | — Pending |
| OF as conflict authority (fallback) | Alert user on conflicts when possible, OF wins when prompting isn't feasible | — Pending |
| Sync on action + manual trigger | No background execution available in plugin API | — Pending |
| Single workspace only | Simplifies sync mapping, user has one workspace | — Pending |
| Projects + tasks (not folders/clients) | Start simple, can add hierarchy mapping later | — Pending |
| OF task note for ID registry | Portable, visible, no external file dependency | — Pending |
| Registry-first matching | Check stored ID first, fall back to exact name match | — Pending |
| Est. time sync OF→Toggl only for v1.1 | Bidirectional deferred to v1.2 | — Pending |
| Credentials at IIFE load time | OmniFocus throws if Credentials() called inside action handlers | ✓ Good — v1.0 |
| HTTP codes to console only | Users see plain language errors, devs see codes in Console.app | ✓ Good — v1.0 |
| Silent retry on 5xx/network | Single retry on transient errors, immediate throw on 4xx | ✓ Good — v1.0 |
| Emoji prefix on tasks only | instanceof Task guard prevents project name corruption | ✓ Good — v1.0 |
| Auto-clear token on 403 | Bad token auto-removed from Keychain, next run re-prompts | ✓ Good — v1.0 |
| workspace.premium for tier detection | Toggl Starter plan = premium:true, enables task features | ✓ Good — v1.0 |

---
*Last updated: 2026-02-26 after v1.1 milestone start*
