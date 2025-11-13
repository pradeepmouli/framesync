# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Available Workflows

### 1. CI (`ci.yml`)
**Triggers:** Push to main, Pull requests to main

Comprehensive continuous integration workflow that runs:
- Linting
- Type checking
- Building (server and shared packages)
- Testing

All checks must pass for the workflow to succeed.

### 2. Lint (`lint.yml`)
**Triggers:** Push to main, Pull requests to main, Manual dispatch

Runs the project linter (oxlint) to check code quality and style.

### 3. Build (`build.yml`)
**Triggers:** Push to main, Pull requests to main, Manual dispatch

Builds all TypeScript packages:
- `@framesync/shared` - Shared utilities and types
- `@framesync/server` - Express server

Build artifacts are uploaded and retained for 7 days.

### 4. Test (`test.yml`)
**Triggers:** Push to main, Pull requests to main, Manual dispatch

Runs all test suites across the monorepo using vitest:
- Server package tests
- Mobile package tests
- Shared package tests

### 5. Verify (`verify.yml`)
**Triggers:** Push to main, Pull requests to main, Manual dispatch

Comprehensive verification workflow that runs all checks in parallel:
- Linting
- Type checking
- Building
- Testing

A final verification job confirms all checks passed.

### 6. Release (`release.yml`)
**Triggers:** Push of version tags (v*), Manual dispatch

Automated release workflow:
1. Verifies all checks pass (lint, typecheck, test, build)
2. Builds production artifacts
3. Creates GitHub release with artifacts

**Manual Release:**
```bash
# Trigger manually via GitHub Actions UI
# Input: version (e.g., 1.0.0)
```

**Tag-based Release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Workflow Dependencies

- **pnpm:** All workflows use pnpm v10 for package management
- **Node.js:** Node.js v20 is required
- **Cache:** pnpm cache is enabled to speed up installations

## Local Testing

Before pushing, ensure all checks pass locally:

```bash
# Install dependencies
pnpm install

# Run linter
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Build packages
pnpm --filter @framesync/shared build
pnpm --filter @framesync/server build
```

## Notes

- All workflows use pnpm workspaces to manage the monorepo
- Build artifacts exclude mobile builds (Expo-based, built separately)
