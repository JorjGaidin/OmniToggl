# Roadmap: OmniToggl

## Overview

Starting from a working but buggy start/stop timer plugin, the roadmap moves through phases in strict dependency order: fix the known corruption bug and secure the API token first, then attach time entries to Toggl tasks with estimated time sync, then build true bidirectional sync across projects and tasks, then harden conflict resolution and rate limit handling.

## Milestones

- ✅ **v1.0 Foundation** — Phase 1 (shipped 2026-02-27)
- 🚧 **v1.1 Task-Level Integration** — Phases 2-4 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

<details>
<summary>✅ v1.0 Foundation (Phase 1) — SHIPPED 2026-02-27</summary>

- [x] **Phase 1: Foundation and Bug Fixes** (2/2 plans) — completed 2026-02-27
  - Secure Keychain auth, fetchWithRetry, classifyError, emoji prefix fix, plan tier detection

</details>

### 🚧 v1.1 Task-Level Integration (In Progress)

**Milestone Goal:** Enable task-level Toggl time tracking from OmniFocus — attach entries to Toggl tasks, auto-create when missing, sync estimated duration.

- [x] **Phase 2: Safety Prerequisites** - Plan-gate guard and safe note read/write land before any task API code (completed 2026-02-27)
- [x] **Phase 3: Task Resolution and Timer Integration** (0/2 plans) - Timer start attaches to correct Toggl task, creates it if missing, falls back gracefully (completed 2026-02-27)
- [x] **Phase 4: Estimated Time Sync** (0/1 plans) - OF estimated duration flows to Toggl task on create and on start if changed (completed 2026-03-02)

## Phase Details

### Phase 2: Safety Prerequisites
**Goal**: The plugin safely handles plan-gated task API calls and reads/writes OF task notes without destroying user content
**Depends on**: Phase 1
**Requirements**: SAFE-01, SAFE-02
**Success Criteria** (what must be TRUE):
  1. On a Free plan workspace, starting a timer does not clear the Keychain token or show a spurious auth error
  2. After the plugin writes a Toggl task ID to an OF note, the user's pre-existing note text is still present and unchanged
  3. Writing a Toggl task ID to a note twice does not produce duplicate marker lines
**Plans**: TBD

### Phase 3: Task Resolution and Timer Integration
**Goal**: Starting a timer on an OmniFocus task attaches the time entry to the correct Toggl task, creating it when necessary, without ever blocking the timer start
**Depends on**: Phase 2
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04
**Success Criteria** (what must be TRUE):
  1. Starting a timer on an OF task attaches the resulting Toggl time entry to a Toggl task (not just the project + description)
  2. Starting a timer twice on the same OF task reuses the same Toggl task and does not create a duplicate
  3. When no matching Toggl task exists, the plugin creates one in Toggl and stores its ID in the OF task note before starting the timer
  4. If task resolution fails for any reason, the timer still starts successfully (project-level fallback, no error shown to user)
**Plans**: 2 plans
- [ ] 03-01-PLAN.md -- Task resolution helpers and resolveTogglTask orchestrator in common.js
- [ ] 03-02-PLAN.md -- Wire task resolution into startTogglTimer action with SAFE-01 gate and fallback

### Phase 4: Estimated Time Sync
**Goal**: OmniFocus estimated duration flows to Toggl on task create and stays current if the estimate changes before a subsequent timer start
**Depends on**: Phase 3
**Requirements**: EST-01, EST-02
**Success Criteria** (what must be TRUE):
  1. When a Toggl task is auto-created, its estimated_seconds matches the OF task's estimatedMinutes converted to seconds
  2. Starting a timer on an OF task whose estimate changed since the Toggl task was created updates the Toggl task's estimated_seconds before the timer starts
  3. An OF task with no estimated duration creates a Toggl task with no estimated_seconds (no zero or null pollution)
**Plans**: 1 plan
- [ ] 04-01-PLAN.md — Add updateTogglTask helper and wire estimate sync into resolveTogglTask

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation and Bug Fixes | v1.0 | 2/2 | Complete | 2026-02-27 |
| 2. Safety Prerequisites | 1/1 | Complete   | 2026-02-27 | - |
| 3. Task Resolution and Timer Integration | 3/3 | Complete   | 2026-03-01 | - |
| 4. Estimated Time Sync | 1/1 | Complete   | 2026-03-02 | - |
