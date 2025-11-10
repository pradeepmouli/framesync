# FrameSync Project Constitution

## Core Principles

### I. TypeScript First
All new code uses TypeScript with strict settings. Prefer ESM modules. Shared types live in a dedicated package.

### II. Mobile + Server Separation
Expo (React Native) mobile app and Express server evolve independently with a clear HTTP/SSE contract. No direct shared runtime logic besides types/schemas.

### III. Contract-Driven Development
APIs are defined by shared zod schemas and OpenAPI-style docs before implementation. Breaking changes require versioning or compatibility shim.

### IV. Test-First, Minimal Surface
Write minimal smoke/contract tests alongside features (vitest). Keep APIs small and stable. Avoid premature abstraction.

### V. Simplicity & DX
Use oxlint + oxfmt, sensible scripts, and format-on-save. Keep local dev simple; prefer Node 20+, no global state, environment via .env.

## Technology Constraints

- Runtime: Node 20+, iOS via Expo SDK 51 (React Native 0.74+).
- Server: Express, zod, axios. Logging with pino; CORS configurable. SSE for events.
- Mobile: expo-router, expo-media-library, axios, jotai. iOS permissions for Photos and Local Network.
- Validation: zod. Tests: vitest. Lint: oxlint. Format: oxfmt.
- Package manager: npm workspaces (monorepo). CI: GitHub Actions.

## Workflow & Quality Gates

1) Specify → Plan → Tasks → Implement → Verify.
2) PRs must pass: typecheck (noEmit), lint, tests.
3) Public API changes require schema updates and migration notes.
4) Security: server binds to LAN by default; document risks; no secrets in repo.

## Governance

This constitution guides decisions and review. Changes require an explicit amendment in this file with rationale and impact.

**Version**: 1.0.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
