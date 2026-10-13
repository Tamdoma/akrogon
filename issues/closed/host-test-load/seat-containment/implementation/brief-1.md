# Brief 1: slice install (U1)

## 1. Goal
akrogon install and self-update link `~/.config/systemd/user/akrogon.slice` to this checkout's `systemd/akrogon.slice` and then run `systemctl --user daemon-reload`. Plan decision D6, criterion C1 (fixture part).

## 2. Acceptance criteria
1. `systemd/akrogon.slice` exists with exactly this content:
```
[Unit]
Description=Akrogon leaves, seats and test runs
Before=slices.target

[Slice]
CPUWeight=20
CPUQuota=1600%
MemoryHigh=64G
MemoryMax=96G
MemorySwapMax=0
```
2. `planSkillLinks(home, sourceRoot)` includes `{ source: <sourceRoot>/systemd/akrogon.slice, destination: <home>/.config/systemd/user/akrogon.slice }`, so a non-link or foreign-link path there is a conflict exactly like a skill link.
3. `install()` runs `systemctl --user daemon-reload` (via `command`) after `applySkillLinks`.
4. self-update `installStage` runs `systemctl --user daemon-reload` after applying the links. A non-zero exit returns `reload failed: <errorLine(result)>`. Existing conflict reporting stays.
Planned tests (already committed, you run them, never edit them):
- tests/install.test.ts "install links akrogon.slice with the ceiling values and reloads the user manager after linking"
- tests/install.test.ts "install reports a non-link akrogon.slice path as a conflict"
- tests/self-update.test.ts "self-update links akrogon.slice from the deployed checkout and reloads the user manager"
All other tests in those two files must stay green.

## 3. Read first
- src/install.ts (whole file), src/self-update.ts `installStage` (~line 188) and its `run`/`errorLine` usage.
- tests/install.test.ts `installEnv`, tests/self-update.test.ts `selfUpdateFixture`, tests/fake-systemctl.sh.
- /home/ivan/.claude/skills/implement-issue/ponytail.md

## 4. Change list and interfaces
- New `systemd/akrogon.slice`.
- `src/install.ts`: one more entry in `links`, plus the reload in `install()`.
- `src/self-update.ts`: reload in `installStage`.
Owned paths: systemd/akrogon.slice, src/install.ts, src/self-update.ts. Nothing must land first. Shared test resource: none.

## 5. Do-not, reasons, exceptions
- Do not edit any file under tests/. Planned tests are the contract. If one is wrong or stays red with correct code, return a mismatch with evidence.
- Do not touch src/next.ts, src/run-check.ts, src/config.ts, src/scope.ts. Other workers own them.
- Do not add TasksMax, IO or other slice properties. The design locks the values.
- Do not run the real `systemctl` against the user manager outside tests. Live linking is a later unit's job.
- Do not add fallbacks. A reload failure propagates in install and is reported in installStage.
Reasons and exceptions: the tests and the design are locked. The only exception is a revised brief from A.

## 6. Steps
1. Create systemd/akrogon.slice (AC1).
2. Add the link entry in planSkillLinks (AC2).
3. Add the reload to install() and installStage (AC3, AC4).
4. Run the command in section 7. All three planned tests go green.
Advisory size: 3 files, under 12 turns.

## 7. Commands
From the worktree, after `bun install --frozen-lockfile`:
`AKROGON_BASE=99a5ada582267e92d227c005eb1705ce7dc80576 bun test --changed=99a5ada582267e92d227c005eb1705ce7dc80576 --timeout=30000`

## 8. Done-when
All AC hold and the section 7 command passes. Commit only your files with message `feat: install akrogon.slice and reload the user manager`. Add no co-author line. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
