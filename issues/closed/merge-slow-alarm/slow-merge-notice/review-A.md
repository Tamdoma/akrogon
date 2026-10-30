# Review A: slow-merge-notice

Base `3e49c3d5ddc7a178a9c5ff448015e525b85fb345`, reviewed head `769d246e` (diff: `d76f26f4` mechanism + `fe15b81f` docs + test commits).

## Verification

- `check slow-merge: 0 .../check-slow-merge-1793194249243-2096744.log` — rerun at head `769d246e` (the report's green run `check-slow-merge-1793193934508` predates the prettier commit `488ace4e` that rewrote the test file; this rerun covers it). 6/6 pass.
- `check test: 0` (1234 tests, `check-test-1793194019595`), `check format: 0`, `check typecheck: 0`, `akrogon verify` green on `488ace4e` — same tree as head, receipt covers.
- AREA.md paths: every path named by `src/AREA.md` and `tests/AREA.md` exists (listed from repo root, no missing entries).
- Docs claims in `docs/reference/checks.md` paragraph verified against `decideSlow` — one claim fails today (F2 below); `commands.md` status row and `files.md` receipt row match the code.

## Fix findings

### F1 — the episode closes `accepted` one eligible run late and can stay open forever

`src/verify.ts:407` computes `window = earlier.filter(slowEligible).slice(-20)` — the current row is excluded from the "last 20 eligible runs". The locked design (2a) and brief criterion 3 close the episode "once the last 20 eligible runs all lie inside the episode"; at the moment the check runs inside the final rewrite, the current run is complete and, when eligible, is itself one of the last 20 eligible runs.

Source: a real merge sequence — episode opens, then the run that is the 20th eligible in-episode run and is flagged (wall >1.5× episode normal + 120s, the everyday alarm case). `!flagged` is false so `recovered` is skipped; the `else if` sees only the 19 earlier eligible in-episode rows → `window.length === 19` → no `close`.

Consequence today: the row records `close: undefined`, no `verify slow: … accepted as new normal` line prints, and the `Slow merge:` status line stays up until a 21st eligible run completes — if merges pause, the operator is told the repo is slow indefinitely. The planned test seeds 20 earlier in-episode rows, so it closes on the 21st eligible run and cannot distinguish the boundary; the criterion names the outcome directly, which blocks regardless of source.

### F2 — an accepted close on an unflagged row produces no `verify slow:` line

`src/verify.ts:419` — `const print = flagged ? 'verify slow: ' + … : undefined`, so `close === 'accepted'` on a row that is not flagged prints nothing. The locked design (4a) gives the `verify slow:` line "naming an accepted close" as its own case, and the docs written by this leaf say the accepted close adds `; accepted as new normal` to the line (`docs/reference/checks.md`, `src/AREA.md`).

Source: the same criterion outcome — an in-episode run that is not flagged and not eligible (a `reused`-entry or `blocked` partial head run — the "partial head runs are still checked" case criterion 2 requires) completing while the last 20 eligible rows all lie inside the episode. Recovered does not apply (not eligible, and not flagged), `else if` fires, `close === 'accepted'` is recorded but no line prints.

Consequence today: the episode's documented termination signal never reaches stdout — the operator's only synchronous evidence of the acceptance is the absence of `Slow merge:` at the next status call, which the brief gives the episode's close a line for precisely so it is seen.

## Nits

- N1 `akrogon status <slug>` shows no slow-episode state — the brief names `akrogon status` and the design's "every repo's latest episode" reads board-level, so this is deferred; promote to Fix if an operator workflow is shown to use the targeted view for episode state.
- N2 `plan.md` C2 narrative still says the ineligible seed wall is `5500ms` discriminating to `5250` in one stale sentence — test computes the real discriminant; doc-only noise, promote if B disagrees the plan's own test text is authoritative.
- N3 The mid-pass `start` backdate test seam writes the ledger outside the receipt lock between append and final rewrite; any future code path that writes between those two points races it. Deferred: the only writer today is the pass itself.

## Verdict

`fix` — F1 and F2 are both deviations from locked done-criterion outcomes in `decideSlow`, each in one or a few lines.
