<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: N/A (initial version)
- Added sections: All
- Removed sections: None
- Templates requiring updates: plan-template.md (✅ aligned), spec-template.md (✅ aligned), tasks-template.md (✅ aligned)
- Follow-up TODOs: RATIFICATION_DATE must be set on first adoption.
-->
# Krachtbal Scoreboard Constitution

## Core Principles

### I. Frontend Application Discipline
The project is a frontend application. All code must be structured for clarity, maintainability, and modularity. UI components, state management, and business logic must be separated.

**Rationale:** Clear separation of concerns enables easier testing, maintenance, and future enhancements.

### II. Linting Enforcement
All code MUST pass linting checks before merging or deployment. The linter configuration is authoritative and must be kept up to date with project standards.

**Rationale:** Linting ensures code consistency, prevents common errors, and improves readability across contributors.

### III. Mandatory Testing
Automated tests (unit and integration) MUST be written for all features and bug fixes. No code may be merged without passing tests. Test coverage must be maintained or improved with each change.

**Rationale:** Testing prevents regressions, documents expected behavior, and ensures reliability.

### IV. Cross-Platform Single Binary Build
The application MUST be buildable and executable as a single binary for both Linux and Windows platforms. Build scripts and documentation must guarantee reproducible builds for both targets.

**Rationale:** Single-binary distribution simplifies deployment and ensures users on both platforms have equal access.

### V. Build and Execution Simplicity
Build and run processes must be documented and require minimal steps. All dependencies and environment requirements must be clearly specified. No hidden steps or undocumented requirements are allowed.

**Rationale:** Simplicity reduces onboarding friction and operational risk.

## Additional Constraints

- Technology stack must support cross-platform binary builds (e.g., using frameworks like Tauri, Electron, or similar if applicable).
- All dependencies must be open source and compatible with both Linux and Windows.
- Security updates and dependency checks must be performed regularly.

## Development Workflow

- All code changes require code review for linting, testing, and build compliance.
- CI/CD pipelines must enforce linting, testing, and successful cross-platform builds before merge.
- Documentation must be updated with any change affecting build, run, or test procedures.

## Governance

- This constitution supersedes all other development practices for this project.
- Amendments require documentation, team approval, and a migration plan if breaking changes are introduced.
- All PRs and reviews must verify compliance with these principles.
- Constitution versioning follows semantic versioning: MAJOR for breaking/removal, MINOR for new principles/sections, PATCH for clarifications.
- Compliance reviews are required at least quarterly or after any major dependency or build system change.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2024-06-13
