# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**
- JavaScript (ES6+) - OmniFocus plugin actions and shared library

## Runtime

**Environment:**
- OmniFocus macOS plugin environment
- OmniGroup JavaScript runtime (non-standard Node.js/browser environment)

**Requirements:**
- OmniFocus 3.x or later (macOS)
- No external package manager dependencies (plugin-based delivery)

## Frameworks

**Core:**
- OmniFocus JavaScript PlugIn API - Provides `PlugIn`, `PlugIn.Action`, `PlugIn.Library`, `Alert`, `Task`, `Project`, `Tag` interfaces

**Build/Dev:**
- Prettier - Code formatting (`v5.4.1` via package-lock.json)
- ESLint - Linting with Airbnb config (`v8.57.0` via package-lock.json)

## Key Dependencies

**Development:**
- prettier (`5.4.1`) - Code formatting with trailing commas and single quotes
- eslint (`8.57.0`) - JavaScript linting
- eslint-config-airbnb (`19.0.4`) - Airbnb style guide
- eslint-config-prettier (`9.1.0`) - Prettier integration

**OmniFocus Plugin Globals (Built-in):**
- `PlugIn` - Plugin framework
- `PlugIn.Action` - Action handler registration
- `PlugIn.Library` - Shared library for reuse across actions
- `URL.FetchRequest` - HTTP client for API calls
- `Data.fromString()` - String encoding for request bodies
- `Alert` - User alert dialogs
- `Task`, `Project`, `Tag` - OmniFocus entity classes
- `flattenedTags`, `flattenedTasks`, `flattenedProjects` - Global accessors for OmniFocus objects
- `Version` - Version handling

**Custom Polyfills:**
- `btoa()` polyfill - Base64 encoding implemented in `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` (lines 16-43) because native `btoa` is not available in OmniFocus environment

## Configuration

**Development:**
- ESLint: `.eslintrc.js` at project root
  - Extends Airbnb and Prettier configs
  - Disables `no-param-reassign` and `no-console` rules
  - Defines OmniFocus globals as readonly
- Prettier: `.prettierrc.js` at project root
  - Trailing commas on all arguments
  - Single quotes

**Plugin:**
- Plugin manifest: `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/manifest.json`
  - Default locale: en
  - Plugin ID: `com.github.benhughes.OmniToggl`
  - Version: `1.2.1`
  - Actions: `startTogglTimer`, `stopTogglTimer`
  - Libraries: `common`

**Runtime Configuration:**
- Configuration stored in `/Users/shaunlangley/Projects/OmniToggl/OmniToggl.omnifocusjs/Resources/common.js` (lines 169-173):
  - `TOGGL_AUTH_TOKEN` - Toggl API token (set manually, never committed)
  - `TRACKING_TAG_NAME` - OmniFocus tag for active tasks (default: `working-on`)
  - `TRACKING_NAME_PREFIX` - Emoji prefix for active task name (default: `🎯`)

## Platform Requirements

**Development:**
- macOS with OmniFocus 3.x installed
- Node.js (for development tools: ESLint, Prettier)
- npm (v8+ based on package-lock.json v3 format)

**Production:**
- OmniFocus 3.x macOS application
- Network access to `api.track.toggl.com` for Toggl API calls

**Installation:**
- Plugin delivered as `.omnifocusjs` bundle (OmniToggl.omnifocusjs directory)
- Copied to OmniFocus plugins directory or opened directly in OmniFocus to install

---

*Stack analysis: 2026-02-26*
