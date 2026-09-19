# Implementation report: watch-issues-skill

Base: `e7d74ae70bb8a412c9f7f25e4f31c5aa6486a901` — Head: `391bc82` (`watch-issues-skill` branch, clean worktree).

## Changed files and reasons

- `skills/watch-issues/SKILL.md` — operator-invoked watch procedure: three invocations with zero/one/several job behavior, Observe/Judge/Stop/Never/Reply sections, required-seat table, recovery-bound algorithm, ≤5-line reply contract.
- `skills/watch-issues/package.json`, `tsconfig.json`, `bun.lock` — skill-local package mirroring `skills/broadcast-issue` (`@akrogon/watch-issues`, zod, @types/bun, typescript).
- `skills/watch-issues/scripts/observe.ts` — read-only inventory: `akrogon config` repo key (injectable `OBSERVE_AKROGON`), recursive `issues/open` state parse with the command's field names and legacy-key strip, depth 2/3 validation, repo-key and duplicate-slug refusal, one `herdr agent list` call (injectable `OBSERVE_HERDR`), one line per leaf per plan D5, non-zero exit naming the cause on every failure class.
- `skills/watch-issues/scripts/observe.test.ts` — 20 tests, 53 expects: all fixture trees, missing pane `-`, every non-zero error case, empty open exits 0 without calling herdr.
- `tests/install.test.ts` — one assertion `expect(skills).toContain('watch-issues')` (criterion 4; install enumerates `skills/` dynamically so no code change).

Pass artifacts (this folder, not the branch): `implementation/brief-1.md`, `brief-2.md`, `brief-3.md`, `walkthrough.md`.

## Commands run

- `cd skills/watch-issues && bun run test` — 20 pass, 0 fail, 53 expects.
- `cd skills/watch-issues && bun run typecheck` — exit 0.
- `bun install --cwd skills/watch-issues --frozen-lockfile` — `Checked 7 installs across 27 packages (no changes)`.
- `bun test tests/install.test.ts` — 15 pass, 0 fail.
- `bun run format` — all files unchanged.
- `bun run typecheck` (root) — exit 0.
- `bun test` (root, full suite) — 270 pass, 0 fail, 3260 expects.
- `AKROGON_BASE=e7d74ae… bun test --changed="$AKROGON_BASE"` — `5 changed files, but no test files are affected` (skill tests live outside `bunfig` root `tests/`; covered by the skill's own suite).

## Walk-through evidence

`implementation/walkthrough.md` (619+ lines, self-contained with fake-herdr source appendix) records all criterion-5 scenarios against scratch `AKROGON_HOME` repos with real `akrogon`/`observe.ts` and a fake herdr: genuine `attempts@check.review` leaf recovered (§1b, produced via `check.fix --verdict fix` at `fix_rounds: 3`); same leaf failing again recovered a second time; third identical failure notify-only; progress between failures resets the count; failed-blocked human-prerequisite leaf never recovered (notification only); mixed A working / B idle dispatches B only; looping seat yields esc → wait → read → prompt once, notification on the next fire, no second esc; empty open tree reaches the stop rule with the simulated CronDelete noted.

## Known limitations

- Notification dedup beyond the context carry does not exist (design-accepted): after a lost context carry a human-prerequisite notice may repeat; the skill cannot write `failure.delivery`.
- `observe.ts` `reason="..."` does not escape embedded quotes; invalid `busy_since` dates omit the age suffix.
- Pane reads use `--lines 80` everywhere (design mentioned 60 in one spot; noted in plan implementation notes for review).
- Real CronCreate/CronDelete behavior is operator-verified on first use, per the brief.

## Unverified criteria

None. Criterion 5's literal `attempts` evidence exists in walkthrough §1b; the `phase failed` command always writes `cause: blocked` (src/phase.ts), which the artifact notes.
