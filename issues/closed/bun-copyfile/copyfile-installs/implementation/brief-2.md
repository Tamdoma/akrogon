# Brief 2 — U2: `--backend=copyfile` in prose install examples

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/copyfile-installs-u2`

## 1. Goal

Every documented `bun install` example carries `--backend=copyfile`, keeping each command's existing `--frozen-lockfile` choice. Plan decisions D3–D4, brief done-criteria 2 and 3.

## 2. Acceptance criteria

1. `skills/init-akrogon/SKILL.md` line ~27 commented example reads `# setup: bun install --frozen-lockfile --backend=copyfile — proposed only when a lockfile is committed in HEAD`.
2. Same file, line ~42 mapping paragraph: `` `bun.lock` maps to `bun install --frozen-lockfile --backend=copyfile` ``. The `npm ci`, `pnpm install --frozen-lockfile` and `yarn install --immutable` mappings are unchanged.
3. `skills/broadcast-issue/SKILL.md` line ~27: `bun install --cwd <skill-folder> --frozen-lockfile --backend=copyfile`.
4. `docs/reference/config.md` `setup` row (~line 58): `bun install --frozen-lockfile --backend=copyfile`.
5. `docs/reference/checks.md` `setup` paragraph (~line 22): `bun install --frozen-lockfile --backend=copyfile`.
6. `docs/reference/releases-and-updates.md` (~line 11): `git archive` plus `bun install --frozen-lockfile --backend=copyfile`.
7. `docs/start/install.md` (~line 64): `bun install` becomes `bun install --backend=copyfile` (it has no `--frozen-lockfile`; do not add one).
8. Flag appended last in every command; no other prose wording changes.

## 3. Read-first

- The six files above at the named lines.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- Owns: `skills/init-akrogon/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `docs/reference/config.md`, `docs/reference/checks.md`, `docs/reference/releases-and-updates.md`, `docs/start/install.md`.
- One-word edits only. No interfaces.
- No prerequisite units; consumes no worker output. Shares no test resource.

## 5. Do-not, reasons and exceptions

- Do not touch `issues/config.yaml` (operator-owned config), `tests/config.test.ts` (opaque wrap fixtures), `docs/use/roll-back-a-release.md` (`akrogon.ts install` is the akrogon CLI verb, not Bun), `src/AREA.md` (names `bun install` without flags — still true) or any code file.
- Do not add `--frozen-lockfile` where absent (`docs/start/install.md`, fixture installs elsewhere): the brief forbids it.
- Do not edit or add tests: prose criteria are diff-verified, per the locked design's no-string-test rule.
- Do not run `akrogon verify` or any test suite: no changed-test runner applies to prose; A runs checks.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Apply the seven edits in section 2.
2. Verify: `grep -n "bun install" skills/init-akrogon/SKILL.md skills/broadcast-issue/SKILL.md docs/reference/config.md docs/reference/checks.md docs/reference/releases-and-updates.md docs/start/install.md` — every hit carries `--backend=copyfile`, each keeping its `--frozen-lockfile` (or absence).
3. Verify npm/pnpm/yarn mappings unchanged in `skills/init-akrogon/SKILL.md` (~line 42).
4. Commit all six files in one commit, e.g. `docs: pass --backend=copyfile in install examples`.
5. Fill in section 8's report lines below and return with the commit ID.

Advisory size: 6 files, under 20 turns.

## 7. Commands

- Verification greps in step 2–3 only; no test runner applies to prose.

## 8. Done-when, evidence and report

The greps show every `bun install` mention carrying the flag; `git status --porcelain` in the worktree is clean.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
