# Unit 2 — store-sweep surface: `akrogon leftovers` host block + docs

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/store-sweep-u2` (detached at `189f1dc`, the leaf test commit). Bun+TypeScript repo.

## 1. Goal

Plan decision D9 of leaf `store-sweep` (`/home/ivan/Work/infra/akrogon/issues/open/worktree-cleanup/store-sweep/plan.md`): the leftovers host block, today titled `systemd units`, becomes `host` and also lists retired filesystem paths kept by the host sweep; host entries carrying a path that no longer exists are skipped. Update the three doc sites to match.

## 2. Acceptance criteria

1. `akrogon leftovers` prints its host block as `host`, not `systemd units`.
2. Host entries whose `path` is a filesystem path (starts with `/` or contains `/` — match the rule the per-repo existence filter uses conceptually) are skipped when `existsSync` fails; unit names have no path check and always list while their reason isn't in `unitInUse`.
3. `retired`, `delete failed`, `process inside`, `live process inside`, `pane list unavailable` reasons list; `unitInUse` stays exactly `{'own slice','live run record','live tab'}`.
4. `docs/guide/next.md` line ~161 retitles the block and says retired paths/unprovable items appear there; `README.md` leftovers row/paragraph covers retired host paths; `src/AREA.md` `src/reconcile.ts` clause mentions the host report holds retired leftovers (only where it already describes the kept report).
5. `tests/status.test.ts` leftovers tests pass unmodified (they assert `host\n … retired\n    ~/host-junk` and `host-gone` absent); `tests/command-reference.test.ts` green; no other test file changes behavior (you touch only `src/leftovers.ts` + docs).

## 3. Read-first list

- `src/leftovers.ts` (whole file, 60 lines) — `unitInUse`, `leftover()`, `lines()`, `blocks` array with `['systemd units', …]`.
- `src/reconcile.ts` `readHostKept`/`readKept` signatures only.
- `tests/status.test.ts` test `leftovers lists kept paths by reason and host items…` (~line 205) — the exact expected output string.
- `docs/guide/next.md` ~line 161; `README.md` ~lines 121 and 141; `src/AREA.md` ~line 23.
- `plan.md` D9; `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and owned paths

Owned: `src/leftovers.ts`, `README.md`, `docs/guide/next.md`, `src/AREA.md`.

- `src/leftovers.ts`: block title `systemd units` → `host`; add the path-existence skip for host entries (paths only — a unit like `akrogon-lpanes.slice` contains no `/`; simplest: `entry.path.startsWith('/')` → `existsSync`). Keep `Kept` type and filters otherwise untouched.
- `docs/guide/next.md`: `systemd units` → `host` block; one clause that retired host paths (old temp roots, unregistered worktree dirs, stale locks/reports) appear there too.
- `README.md`: extend the leftovers row/paragraph to cover retired host paths under `host`.
- `src/AREA.md`: only the kept-report clause of the `src/reconcile.ts` bullet — host report now also carries retired filesystem leftovers listed by `leftovers` under `host`. Keep ≤40 lines, sections untouched.

## 5. Do-not

- Do not edit tests (the merged expectations already assert `host`).
- Do not touch `src/reconcile.ts`, `src/next.ts`, `src/config.ts` (Unit 1 owns them); do not touch `src/akrogon.ts` or `src/status.ts`.
- No new exports or helpers beyond the tiny filter; match file style.
- Mismatch rule applies: contradiction → return a mismatch, don't deviate.

## 6. Ordered steps (advisory: 4 files, <16 turns)

1. `src/leftovers.ts` edits.
2. Run `bun test tests/status.test.ts -t 'leftovers'` — expect the host-items test green; invalid-report test already green upstream.
3. Docs edits (§4).
4. Run the full `tests/status.test.ts` + `tests/command-reference.test.ts` via run-check.

## 7. Commands

- `akrogon run-check --name u2-status -- bun test tests/status.test.ts`
- `akrogon run-check --name u2-cmdref -- bun test tests/command-reference.test.ts`
- `bun run typecheck` if package.json has that script

## 8. Done-when, evidence, report

`host` block green in tests/status.test.ts; command-reference green; docs consistent; one commit with only your files.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
