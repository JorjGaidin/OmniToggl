# Requirements: OmniToggl

**Defined:** 2026-02-26
**Core Value:** Starting a timer on any OmniFocus task creates the right Toggl time entry — right project, right task, no manual double-entry — and changes in either app sync to the other.

## v1.1 Requirements

Requirements for task-level Toggl integration. Each maps to roadmap phases.

### Safety

- [x] **SAFE-01**: Plugin gates all task API calls behind plan tier check before making requests
- [x] **SAFE-02**: Plugin uses read-modify-write pattern for OF task note (never overwrites user content)

### Task Resolution

- [x] **TASK-01**: User can start a timer that attaches to a Toggl task (not just project + description)
- [x] **TASK-02**: Plugin resolves Toggl task by checking OF note for stored ID first, then exact name match
- [x] **TASK-03**: Plugin auto-creates Toggl task when no match found and stores ID back in OF note
- [x] **TASK-04**: Timer starts successfully even if task resolution fails (non-fatal fallback)

### Estimated Time

- [x] **EST-01**: Plugin syncs OF estimated duration to Toggl task estimated_seconds on task create
- [x] **EST-02**: Plugin syncs OF estimated duration to Toggl task estimated_seconds on timer start (if changed)

## v1.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Bidirectional Sync

- **SYNC-01**: Bidirectional project sync (create in either app, appears in both)
- **SYNC-02**: Bidirectional task sync (create in either app, appears in both)
- **SYNC-03**: Bidirectional estimated time sync (set in either app, syncs to other)

### Actions

- **ACT-01**: Manual "sync now" action alongside automatic sync on start/stop

### Conflict Resolution

- **CONF-01**: Conflict detection with alert prompt (OF as fallback authority)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-workspace support | Single workspace only, keeps sync logic simple |
| OF folder → Toggl client mapping | Projects + tasks sufficient for now |
| Background/scheduled sync | OmniFocus plugin API doesn't support background execution |
| Mobile support | OmniFocus plugin system is macOS only |
| OAuth authentication | API token sufficient for personal/small-audience use |
| Fuzzy name matching | Exact match is predictable; registry-first handles renamed tasks |
| Toggl → OF estimated time sync | One-way (OF → Toggl) for v1.1; bidirectional deferred to v1.2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SAFE-01 | Phase 2 | Complete |
| SAFE-02 | Phase 2 | Complete |
| TASK-01 | Phase 3 | Complete |
| TASK-02 | Phase 3 | Complete |
| TASK-03 | Phase 3 | Complete |
| TASK-04 | Phase 3 | Complete |
| EST-01 | Phase 4 | Complete |
| EST-02 | Phase 4 | Complete |

**Coverage:**
- v1.1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 after roadmap creation*
