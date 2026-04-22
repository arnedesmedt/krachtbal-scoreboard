# Krachtbal Scoreboard

A cross-platform desktop scoreboard application for Krachtbal (a Belgian sport), built with **Tauri 2 + React 18 + TypeScript**.

## Features

- Pre-game configuration: teams, players, referee, half-time length, presentation windows
- Real-time control window: clock (play/pause), scores, penalties, rest minutes
- Multiple presentation windows that sync game state in real time via Tauri IPC
- Buzzer sounds at half-time and rest minute initiation
- Full phase management: Setup → First Half → Half Time → Second Half → Ended → Reset

## Tech Stack

| Layer | Technology |
|-------|-----------|
| App shell | Tauri 2 |
| UI | React 18 + TypeScript |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Multi-window sync | Tauri IPC (`emit`/`listen`) |
| Audio | Web Audio API |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |
| CI | GitHub Actions |

## Quick Start

See [`specs/001-krachtbal-scoreboard/quickstart.md`](specs/001-krachtbal-scoreboard/quickstart.md) for full setup instructions.

```bash
pnpm install
pnpm tauri dev
```

## Development Commands

```bash
pnpm dev           # Start Vite dev server only
pnpm tauri dev     # Start full Tauri app in dev mode
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix lint errors
pnpm format        # Run Prettier
pnpm test          # Run tests in watch mode
pnpm test:run      # Run tests once
pnpm test:coverage # Run tests with coverage report
pnpm tauri build   # Build release binary
```

## Prerequisites

- Node.js 20+
- pnpm 10+
- Rust (stable) + cargo
- On Linux: `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, and other system deps (see quickstart)

## Specification

Full spec: [`specs/001-krachtbal-scoreboard/spec.md`](specs/001-krachtbal-scoreboard/spec.md)

