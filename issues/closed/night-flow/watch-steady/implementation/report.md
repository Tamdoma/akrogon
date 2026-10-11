# Implementation report: watch-steady

Base `c53f6196533289555518577f08907ec9c713721c`; head `f0b4e79` (`docs: watch never self-deletes; tick gates on pause`), one commit cherry-picked from worker worktree `watch-steady-u1` (worker commit `56ed0dd`, sub-brief `implementation/brief-1.md`). Worktree clean, worker worktree removed.

## Changed files and reasons

- `skills/watch-issues/SKILL.md` — D1–D4:
  - `## Invocations`: added "The watch never self-deletes: it ends only on `/watch-issues stop`, session loss or the job's own expiry." Removed the creation refusal clause and the tick's "It may delete through the stop rule." Added "A paused check still runs the CronList and creation step: creation is not an act on a leaf."
  - `## Observe`: pause gate is first content — a check runs `akrogon status` at `<root>` and a repo it reports paused (`<repo> (paused)` or `paused: <name>`) is observed and acted on never, reported paused.
  - `## Judge`: removed the defect-notice self-stop clause and the "count as shown for the stop rule" sentence; `delivery`/`shown` judgments kept.
  - Deleted the whole `## Stop` section. `/watch-issues stop` keeps its CronDelete path; `## Never` keeps "Create a job from a tick."

## Criterion proof

- C1 `grep -n -E 'stop rule|CronDelete|delete|stops|expir|self-delet' skills/watch-issues/SKILL.md`: 3 lines — the never-self-deletes statement (`:14`), the creation report with 7-day expiry (`:16`), the `/watch-issues stop` bullet (`:18`). No self-delete or self-decline path remains; only the operator stop deletes.
- C2 same file: gate at `## Observe` line 1 of the section, ahead of the observe script and every `next`/`phase`/herdr instruction. Live probe (scratch `AKROGON_HOME` with copied `config.yaml`, real checkout): `bun src/akrogon.ts pause` → `akrogon paused`; `status` printed `akrogon (paused)` (list) and `paused: akrogon` (slug); `unpause` restored and `paused.yaml` read `{}`. Real `paused.yaml` untouched.
- C3 sweep `grep -rln -i 'watch' skills/ docs/ README.md --include='*.md'` → 6 files, each read: `skills/AREA.md`, `docs/guide/cheat.md`, `docs/guide/install.md`, `README.md` contain only factual optional-watch text; `skills/watch-issues/SKILL.md` is the edit. Out-of-scope hits: `docs/guide/in-practice.md:81` describes conditional cron creation ("if work still needs watching") and `:89` states "The watch stops when the readable open tree is empty, or when every remaining leaf is waiting on a human prerequisite that has been reported." Both stale after this leaf; reported, not edited.

## Commands run

- `bun install --frozen-lockfile` — 9 packages, no changes.
- `AKROGON_BASE=c53f619… bun test --changed=… --timeout=30000` — "1 changed file, but no test files are affected", 0 tests (markdown-only diff). Seconds.
- `akrogon run-check` format — green, no drift (`git status` empty after). Seconds.
- `akrogon run-check` typecheck (`tsc --noEmit`) — green. Seconds.
- `akrogon run-check` test (`bun test --timeout=30000`) — 792 pass, 0 fail, 41 files. ~123 s.
- `akrogon run-check` test_changed — 0 tests, same as changed-test run. Seconds.

No comparison records: nothing failed.

## Worker return

Commit `56ed0dd`, all four brief criteria verified by A against the landed diff; no mismatch; pasted changed-test output above. Worker's C3 out-of-scope list confirmed by A's own sweep.

## Docs

`skills/watch-issues/SKILL.md` is the doc. `skills/AREA.md` line stays accurate. Out-of-scope stale lines listed under C3.

## Known limitations / unverified criteria

- `docs/guide/in-practice.md:81,:89` remain stale by scope decision D4 (reported hits).
- No unverified criteria.
