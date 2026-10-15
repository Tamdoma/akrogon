# Plan: kept-status

## Decisions

- D1 — Plain `akrogon status` reads only the reconcile report: `readKept(scan.repo)` after each repo's leaf rows, inside the per-repo board loop of `statusCommand` in `src/status.ts`. Status never calls `reconcile` (locked). An unreadable repo (`!scan.ok`) prints no kept lines.
- D2 — Placement and label (design's open question): after the repo's leaf table or `no open leaves` line, one line per entry, same two-space indent as leaf rows: `  Kept by last cleanup: <path> — <reason>`. `Kept by last cleanup` carries the "last cleanup's result" label verbatim in the line.
- D3 — Only entries whose `path` still exists at read time are printed (`existsSync` filter at the plain branch). Scope is the plain branch only; `status <slug>` keeps printing the full report, so the record of a removed path is still reachable for the leaf it names (open limitation).
- D4 — No kept lines under `--charts`: chart mode replaces the leaf table with the chart store; kept lines belong to the board layout.
- D5 — README.md line ~121 is updated: kept entries are now shown by plain `akrogon status` too, labelled as the last cleanup's result, not only `akrogon status <slug>` `Kept:` lines. No other doc describes the status output surface.

## Open for the plan (design), resolved

- Placement: after each repo's leaf rows → D2.
- Wording of the label → D2.

## Read-first

- `src/status.ts` — `statusCommand` plain branch, per-repo loop, `readKept` import already present.
- `src/reconcile.ts` — `readKept`, `keptReportPath`, `writeKeptReport`, report schema `{kept: [{path, reason}]}` under `<AKROGON_HOME>/reconcile/<repo>.json`.
- `tests/helpers.ts` — `fixture`, `cli`, `registerTemp`, `storeDir`, `fakeHerdr`.
- `tests/status.test.ts` — status boundary tests, `snapshot` helper for no-write proofs.
- `tests/reconcile.test.ts` — `dispatchLeaf`, `next --all` reconcile driver, `status <slug>` kept-line assertions.

## Interfaces

- Existing: `readKept(repo: Repo): { path: string; reason: string }[]`, `existsSync` from `node:fs` (already imported in `src/status.ts`).
- No new interfaces, no new test machinery.

## Units

- U1 (wave 1, sole unit — serial-solo): `src/status.ts`, `README.md`, `tests/status.test.ts`, `tests/reconcile.test.ts`. No test file shared with any other unit; no prerequisite ordering. Run is serial-solo.

## Checklist

- [ ] `src/status.ts` — after the leaf-table render / `no open leaves` in the non-charts per-repo loop, print one `  Kept by last cleanup: <path> — <reason>` line per `readKept(scan.repo)` entry with `existsSync(entry.path)`.
- [ ] `README.md` — extend the reconcile sentence so kept entries are also shown by plain `akrogon status` under each repo, labelled as the last cleanup's result.
- [ ] `tests/status.test.ts` — new test (DC1–DC3).
- [ ] `tests/reconcile.test.ts` — extend `dirty merged worktree is kept and reported` with plain-status assertions and the removed-path stale case (DC4 + end-to-end DC2); add `rmSync` to its `node:fs` import.

## Docs affected

- `README.md` (human doc): line ~121 updated per D5.
- `tests/AREA.md` (agent doc): no change — file already describes both touched test files correctly; no new file.
- `src/AREA.md` (agent doc): no change — no new command surface.

## Criterion proofs

| Criterion | Test | Command | Observation | Size | Rerun trigger |
| --- | --- | --- | --- | --- | --- |
| 1: kept entry printed under a repo with no open leaves, labelled as last cleanup's result | `status.test.ts` "plain status lists kept-by-last-cleanup entries under each repo, skips missing paths and writes nothing" | `akrogon run-check --name 'test' -- bun test tests/status.test.ts` | Seeded `<home>/reconcile/repo.json` + existing dir; `status` prints `Kept by last cleanup: <dir> — <reason>` after `  no open leaves`. Catches: kept entries invisible without `status <slug>` (the #93 bug). | seconds | `src/status.ts` plain branch, report path or format |
| 2: entry with missing path not printed | same test | same command | Report holds a second entry for a removed path; output never contains it. Catches: stale report entries printed for gone paths. | seconds | existsSync filter in D3 |
| 3: status writes nothing | same test | same command | Snapshot of `f.home` before/after is identical; report file, kept dir unchanged. Catches: status mutating state (e.g. running reconcile). | seconds | any write added to the plain branch |
| 4: merged leaf's dirty worktree survives reconcile and shows in plain status with reason `uncommitted changes` | `reconcile.test.ts` extension of "dirty merged worktree is kept and reported with path and reason" | `akrogon run-check --name 'test' -- bun test tests/reconcile.test.ts` | Real `next --all` reconcile over a merged leaf with an untracked file: worktree still on disk, plain `status` prints `Kept by last cleanup: <worktree> — uncommitted changes`; after `rmSync(worktree)` the same plain status no longer prints it (report file unchanged). Catches: uncommitted work silently destroyed, and plain status missing the kept line. | seconds | reconcile keep rules, plain branch kept lines |

Both tests go red before the change: the label line never appears while the plain branch prints nothing for kept entries.

Red run before product code, `akrogon run-check --name 'test' -- bun test tests/status.test.ts`:

```text
(fail) plain status lists kept-by-last-cleanup entries under each repo, skips missing paths and writes nothing
Expected to contain: "  Kept by last cleanup: <keptDir> — uncommitted changes"
Received: [ "repo", "  no open leaves" ]
```

Red run before product code, `akrogon run-check --name 'test' -- bun test tests/reconcile.test.ts`:

```text
(fail) dirty merged worktree is kept and reported with path and reason
Expected to contain: "  Kept by last cleanup: <worktree> — uncommitted changes"
Received: "repo\n  no open leaves"
```

All other tests in both files passed on the same runs (31 pass / 1 fail, 22 pass / 1 fail).

## Known limitations

- `status <slug>` still prints kept entries whose paths no longer exist; the record stays reachable for the leaf it names (D3).
- A kept entry under an unreadable registered repo is silent; the repo's `unreadable` diagnostic already explains the gap (D1).
