# Codebase Structure

**Analysis Date:** 2026-02-26

## Directory Layout

```
OmniToggl/
├── OmniToggl.omnifocusjs/      # OmniFocus plugin bundle (installable)
│   ├── manifest.json           # Plugin metadata, action/library declarations
│   └── Resources/              # Plugin code and localization
│       ├── common.js           # Shared library: Toggl API client, config, helpers
│       ├── startTogglTimer.js  # Action: start timer from selected task/project
│       ├── stopTogglTimer.js   # Action: stop current Toggl timer
│       └── en.lproj/           # English localization strings
│           ├── manifest.strings
│           ├── startTogglTimer.strings
│           └── stopTogglTimer.strings
├── img/                        # Screenshots and GIFs (documentation)
├── README.md                   # Project documentation
├── LICENSE                     # License file
├── package-lock.json          # npm dependency lock
├── .gitignore                 # Git ignore rules
├── .eslintrc.js               # ESLint configuration
├── .prettierrc.js             # Prettier configuration
└── CLAUDE.md                  # Project context for Claude Code
```

## Directory Purposes

**OmniToggl.omnifocusjs:**
- Purpose: The plugin bundle itself (OmniFocus installable format)
- Contains: Executable plugin code, manifest, and localization
- Key files: `manifest.json`, all `.js` files under Resources/

**Resources:**
- Purpose: Plugin source code and assets
- Contains: JavaScript action/library modules and localization
- Key files: `common.js` (library), `startTogglTimer.js` (action), `stopTogglTimer.js` (action)

**en.lproj:**
- Purpose: English localization strings for UI display
- Contains: Manifest strings (plugin name), action labels (short/medium/long variants)
- Key files: manifest.strings, startTogglTimer.strings, stopTogglTimer.strings

**img:**
- Purpose: Screenshots and animations for README documentation
- Contains: PNG images and GIF animations (not code)
- Not committed to plugin distribution

## Key File Locations

**Entry Points:**

- `OmniToggl.omnifocusjs/Resources/startTogglTimer.js`: Start timer action, invoked when user selects task/project and clicks "Start Toggl Timer"
- `OmniToggl.omnifocusjs/Resources/stopTogglTimer.js`: Stop timer action, invoked when user clicks "Stop Toggl Timer"

**Configuration:**

- `OmniToggl.omnifocusjs/manifest.json`: Plugin metadata (id, version, author), declares actions and libraries
- `OmniToggl.omnifocusjs/Resources/common.js` (lines 5-11): Configuration constants (TOGGL_AUTH_TOKEN, TRACKING_TAG_NAME, TRACKING_NAME_PREFIX)

**Core Logic:**

- `OmniToggl.omnifocusjs/Resources/common.js` (lines 52-161): Toggl API client methods (startTogglTimer, stopTogglTimer, getCurrentTogglTimer, getTogglProjects, createTogglProject, resetTasks)
- `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` (lines 3-93): Start timer action handler and validation
- `OmniToggl.omnifocusjs/Resources/stopTogglTimer.js` (lines 3-21): Stop timer action handler and validation

**Localization:**

- `OmniToggl.omnifocusjs/Resources/en.lproj/manifest.strings`: Plugin display name
- `OmniToggl.omnifocusjs/Resources/en.lproj/startTogglTimer.strings`: Action labels (label, shortLabel, mediumLabel, longLabel)
- `OmniToggl.omnifocusjs/Resources/en.lproj/stopTogglTimer.strings`: Action labels

## Naming Conventions

**Files:**

- Camel case for action files: `startTogglTimer.js`, `stopTogglTimer.js`
- Single-word utilities: `common.js` (shared library)
- Localization: `{locale}.lproj/` directory with `.strings` files (OmniFocus standard)

**Directories:**

- `.omnifocusjs` extension required for plugin bundle format
- `Resources/` standard OmniFocus plugin subdirectory
- `en.lproj/` standard macOS localization format

**Functions (within JavaScript):**

- camelCase for all functions: `startTogglTimer()`, `stopTogglTimer()`, `getCurrentTogglTimer()`, `resetTasks()`
- verb-first pattern: `getTogglProjects()`, `createTogglProject()`
- Private/internal: No underscore prefix used; scope via IIFE closures

**Constants:**

- UPPER_SNAKE_CASE: `TOGGL_AUTH_TOKEN`, `TRACKING_TAG_NAME`, `TRACKING_NAME_PREFIX`, `TOGGL_URL`

**Variables:**

- camelCase: `fetchRequest`, `trackingTag`, `workspaceId`, `projectName`, `toggleProject`, `taskTags`

**Types/Objects:**

- Time entry: Plain JavaScript object with properties: `description`, `created_with`, `tags`, `project_id`, `workspace_id`, `start`, `duration`
- Error object: `{ statusCode, data }` (from buildErrorObject)

## Where to Add New Code

**New Feature (e.g., task-level Toggl support):**
- Primary code: `OmniToggl.omnifocusjs/Resources/common.js` (add new API methods or helper functions)
- Action modifications: Update `OmniToggl.omnifocusjs/Resources/startTogglTimer.js` or create new action file
- Tests: None currently; would add alongside new features if test framework added

**New Action:**
- Implementation: Create `OmniToggl.omnifocusjs/Resources/{actionName}.js` following IIFE pattern (lines 1-2, return PlugIn.Action)
- Manifest entry: Add to `manifest.json` actions array with identifier and optional image
- Localization: Add `OmniToggl.omnifocusjs/Resources/en.lproj/{actionName}.strings` with label, shortLabel, mediumLabel, longLabel
- Library access: Import via `const { ... } = this.common;` at top of action handler

**New Utility/Helper Function:**
- Location: `OmniToggl.omnifocusjs/Resources/common.js` (add to dependencyLibrary object before return)
- Pattern: Use same naming as existing methods (verb-first, camelCase)
- Exposure: Add to returned dependencyLibrary object so actions can access via `this.common`

**Configuration Change:**
- Location: Top of `OmniToggl.omnifocusjs/Resources/common.js` (lines 5-11)
- Pattern: Add constant with UPPER_SNAKE_CASE name
- Exposure: Add to config object (lines 169-173) so actions can access via `this.common.config`

## Special Directories

**OmniToggl.omnifocusjs:**
- Purpose: Plugin bundle (OmniFocus-specific format)
- Generated: No; created manually but must follow OmniFocus structure
- Committed: Yes; this is the installable artifact
- Installation: Copy bundle to OmniFocus plugins directory or open with OmniFocus to install

**node_modules:**
- Purpose: npm dependencies (ESLint, Prettier, etc.)
- Generated: Yes (by npm install)
- Committed: No (.gitignore excludes)

**img:**
- Purpose: Documentation assets
- Generated: No; manually added screenshots/GIFs
- Committed: Yes; referenced in README

## Plugin Metadata

**manifest.json Structure:**
- `identifier`: Plugin bundle ID (com.github.benhughes.OmniToggl)
- `version`: Semantic versioning (currently 1.2.1)
- `author`: Plugin creator (Ben Hughes, extended by Shaun Langley)
- `description`: Human-readable purpose
- `actions`: Array of action declarations (each needs identifier and optional image)
- `libraries`: Array of library declarations (identifier "common" matches Resources/common.js)

**Action Declaration Pattern:**
```json
{
  "image": "SF Symbols name",
  "identifier": "actionIdentifier"
}
```
- Image: SF Symbols used for macOS UI display
- Identifier: Must match JavaScript PlugIn.Action return identifier

**Library Declaration Pattern:**
```json
{
  "identifier": "common"
}
```
- Identifier: Matches the PlugIn.Library identifier, accessible via `this.common` in actions

---

*Structure analysis: 2026-02-26*
