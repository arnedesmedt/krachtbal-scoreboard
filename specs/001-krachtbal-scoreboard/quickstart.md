# Quickstart: Krachtbal Scoreboard

## Prerequisites

| Tool       | Version     | Install                                   |
|------------|-------------|-------------------------------------------|
| Node.js    | ≥ 20 LTS    | https://nodejs.org or `nvm install 20`    |
| pnpm       | ≥ 10        | `npm install -g pnpm` or `corepack enable` |
| Rust       | stable      | https://rustup.rs (`rustup install stable`) |
| Tauri CLI  | 2.x         | bundled via `@tauri-apps/cli` devDependency |

**Linux only**: Install system dependencies:
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

**Windows**: Install Microsoft C++ Build Tools and WebView2 Runtime (usually pre-installed on Windows 10/11).

---

## Setup

```bash
git clone <repo-url>
cd krachtbal-scoreboard
pnpm install
```

---

## Development

```bash
pnpm tauri dev
```
Opens the control window in development mode with hot reload.

---

## Lint

```bash
pnpm lint          # ESLint check
pnpm lint:fix      # ESLint auto-fix
pnpm format        # Prettier format
```

---

## Test

```bash
pnpm test          # Run Vitest (watch mode)
pnpm test:run      # Run Vitest once (CI mode)
pnpm test:coverage # Coverage report (≥80% required on store/hooks/utils)
```

---

## Build (Production Binaries)

### Linux (run on Linux)
```bash
pnpm tauri build
# Output: src-tauri/target/release/bundle/deb/*.deb
#         src-tauri/target/release/bundle/appimage/*.AppImage
#         src-tauri/target/release/krachtbal-scoreboard  (raw binary)
```

### Windows (run on Windows or via cross-compile CI)
```bash
pnpm tauri build
# Output: src-tauri\target\release\bundle\msi\*.msi
#         src-tauri\target\release\krachtbal-scoreboard.exe
```

> **Cross-compilation**: Handled automatically via GitHub Actions with `tauri-apps/tauri-action`. See `.github/workflows/ci.yml` for the lint, test, build-linux, and build-windows jobs.

---

## Project Structure

```
krachtbal-scoreboard/
├── src/                          # React frontend
│   ├── components/
│   │   ├── config/               # ConfigWindow, PlayerRow, TeamConfigForm, etc.
│   │   ├── control/              # ControlWindow, ClockDisplay, ScorePanel, etc.
│   │   └── presentation/         # PresentationWindow, ScoreBoard, TimerDisplay, etc.
│   ├── store/                    # Zustand gameStore + syncListener
│   ├── hooks/                    # useGameTimer, useBuzzer
│   ├── utils/                    # formatTime, configSchema, gamePhaseLabel
│   ├── types/game.ts             # All TypeScript interfaces
│   ├── __mocks__/@tauri-apps/api/ # Vitest manual mocks for Tauri APIs
│   ├── App.tsx                   # Routes: / → ControlWindow, /presentation → PresentationWindow
│   └── main.tsx
├── src-tauri/                    # Tauri 2 / Rust backend
│   ├── src/
│   │   ├── main.rs               # Entry point
│   │   └── lib.rs                # Tauri Builder with single-instance plugin
│   ├── Cargo.toml
│   └── tauri.conf.json           # productName, identifier, window config
├── .github/workflows/ci.yml      # CI: lint + test + build-linux + build-windows
├── specs/001-krachtbal-scoreboard/ # Spec artifacts
├── .eslintrc.cjs
├── .prettierrc
├── vite.config.ts
├── vitest.config.ts
└── package.json
```
