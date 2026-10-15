# Review A: folder-pack

Base: `fb60ccdceba56e8c0b28fd9c2d7eae74f2387307`. Reviewed head: `d938256`. A's own diff reviewed blind against brief, design, plan and report; no contact with B.

## Evidence

- `akrogon verify` green on `311f32b` (897 pass / 0 fail, format + typecheck clean); `d938256` is trailer-only on top.
- All six criterion proofs green via `akrogon run-check` (report.md cites each `check criterion-N: 0` log).
- AREA.md path check: every path named in `src/AREA.md` and `tests/AREA.md` exists from the repo root (live listing, no dead pointers).
- Doc check: `docs/guide/files.md`, `README.md` command row, SKILL.md marker sites opened and compared with behavior — claims match, one overclaim under N3.
- `Test-Change:` trailers on `37465ac` (3), `311f32b` (2), `d938256` (1): each cites its path with source; `tests/AREA.md` correctly carries one since `src/test-files.ts` matches `tests/` segments.

## Findings

### Fix

- F1 — `packCommand` rethrows non-RefusalError/PackFailure errors mid-loop, violating criterion 4. Realistic source: a real build/user run — the migration (design item 7) and every retry run `akrogon pack` over several folders; a `git ls-files` failure inside `trackedRefusals` (index lock, corrupt repo), an `ENOSPC`/`EACCES` on the `.closing` `writeFileSync`, or a `git rev-parse` error propagates as an uncaught throw. Consequence today: `akrogon pack` on 40 folders crashes at folder 2 and names none of 3–40, so the call "exits non-zero naming every folder not packed" fails exactly when the operator needs the name list for `akrogon sync`-before-pack triage; folder 2 is also not named. Criterion 4, the multi-folder contract. Fix: treat any `packOne` error as that folder's failure (the error already prints via packOne or can be printed with the folder arg), so every arg gets a packed/refused result before the summary.

### Nits

- N1 — `Unpacked:` lines carry no repo name. In a multi-repo plain `status` from HOME, a path could theoretically exist under two registered roots and the `pack` command would be ambiguous which repo it means; `Failed:`/`Missing:` are repo-prefixed. Deferred: paths under `issues/` are repo-relative and the current single-cwd scope makes wrong-repo use unreachable in the reported cases; a `repo:` or `repo/path` prefix would promote it.
- N2 — Unused `readFileSync` import in `src/pack-command.ts:1`. Dead code, zero consequence today; cosmetic.
- N3 — `docs/guide/files.md` now says plain status lists "every folder still holding loose logs or a stranded `.closing`"; parked owners are intentionally unlisted (plan/report limitation). No reachable consequence today since no writer produces parked `.closing`; a future reader could take "every" literally. Promotion: any scenario where a parked `.closing` matters.
- N4 — `tests/folder-pack.test.ts` 'unaccepted' asserts `stderr+stdout` contains 'closed'/'chart' loosely; wording-coupled but the form string is a fixed reference and would still catch a dropped refusal message. Deferred: assert the full `accepted forms:` line if the message is ever tightened.

## Verdict

`fix` — one defect against criterion 4's multi-folder naming contract.

Next: `akrogon phase folder-pack check.repair --slot A --verdict fix`? No — verdict is `fix`, so the phase call is `check.review --slot A --verdict fix` requesting `check.repair`.
