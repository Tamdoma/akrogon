# Review A: verify-test-facts — check.review

Base: `085f2f88c3a1920732e10afbc0bad190cf32d540` (origin/main). Reviewed head: `66100fc4` (tree-identical to verified `1f85baff5a5ec33ba37043176eddc451b6db9c0b` — the only commit on top is trailer-only, no content change). Verdict: **fix**.

Verification evidence read: green verify receipt `b20a9453` on tree of `1f85baff` (format/typecheck/test all 0, ended 2026-11-25T03:51), the report's criterion logs, and my own probes below. The trailer-only commit does not change the tree, so the receipt covers the reviewed head by tree equality.

## Fix

### F1 — `scanBunOutput.names` is not byte-identical to the pre-change `failureNames` on inputs containing `\r`, U+2028 or U+2029

- Criterion: brief done-criterion 2 — "`failures` equal to what the same output gives today" — and design binding decision 2/6: "`failures` stays byte-identical to today" / "either way `failures` output is unchanged for every input". A literal, unconditional contract: every input, no exceptions.
- Source: any captured output whose lines terminate with `\r\n` or that holds `\r` inside a line — reachable input for a parser documented as byte-exact for every input; the defect needs no production incident because the criterion itself names the outcome.
- Consequence today: the scan iterates `text.split('\n')` and applies per-line regexes whose `$` is a line-end anchor only. The old regex ran with the multiline flag over the whole text, where `^`/`$` also match at `\r`, U+2028 and U+2029. Verified divergences (probe on the reviewed head, old implementation verbatim beside it):
  - `(fail) x\r\n(fail) y\n` → old `["x","y"]`, new `["y"]` — a failure name is lost entirely.
  - `(fail) a\rb\n` → old `["a"]`, new `[]` — mid-line `\r` is a regex line boundary, so the old scan treated `b` as a new line and matched `(fail) a`.
  - `(fail) z\r` (CR-only ending) → old `["z"]`, new `[]`.
  - `(fail) q\u2028\n` → old `["q"]`, new `[]`.
  - A 3000-iteration fuzz mixing `\r`/U+2028 atoms showed 2424/3000 inputs diverging; mismatches drop real failure names, so `failures` is no longer byte-identical and `(no test name)` can replace real titles. The 2000-iteration fuzz with `\n`-only atoms showed 2000/2000 identical, so the divergence is exactly the line-terminator class.
- Location: `src/flaky.ts` `scanBunOutput`'s `text.split('\n')` line iteration.
- Blocking: yes — criterion 2 is unproven for every input while this divergence exists, and the parser rewrite is the leaf's own mechanism.

## Nits

### N1 — timeout attachment never expires across a `(pass)` line of the same chain

The design text reads the caret as "the next line of that same chain after its `(fail)` line". The implementation keys `lastFail` per chain and never clears it on a `(pass)` line, so the synthetic ordering `(fail) x` → `(pass) y` → `  ^ this test timed out` in one chain attaches to `x`, although the caret is not adjacent to its fail line in the chain. Deferred because no real Bun output produces this ordering: Bun prints the caret synchronously after its own `(fail)` line within a test's report block, so the observed input class never reaches the defect. Promotion evidence: a real log or a real output-producing test whose own prints create a fail/pass/caret ordering in one stream, showing a wrongly-attached timeout name on a stored row.

### N2 — pre-existing doc drift: `tests/AREA.md` names `tests/budget.test.ts` and `tests/hc-*.test.ts`

Neither path exists on main (listing verified against HEAD and `git log` shows no such file in the branch history available here). This leaf did not write those lines (the AREA.md diff adds one clause elsewhere in the same file), so it is recorded as a Nit for this leaf's review rather than a Fix. Promotion evidence: none needed for the drift itself; it is simply outside this leaf's authoring scope.

## AREA.md path listing

`src/AREA.md` and `tests/AREA.md` (both touched by the diff): all backticked paths exist except `skills/<name>` (a literal placeholder pattern, not a path) and the two N2 entries. One command run from the repository root produced the listing; the verify paragraph's new clauses match the implementation (`timeouts` in every scope on red entries, `durations` merge-scope per leg, `attempt` on the run).

## Docs behavior

`docs/reference/files.md` is the page describing the changed behavior: its new `timeouts`/`durations`/`attempt` clauses match the implementation as written (checked line by line against `commandRow`, the schema and `durationsFor`). One wording difference exists: the criterion asks the page to state the ledger "does not parse under an older akrogon" and the page does exactly that. `src/AREA.md`/`tests/AREA.md` clauses match. No other documented behavior changed.

## Checks and proof review

- All seven criterion proofs and the schema-pin test ran green on the verified head; the combined rerun after the prettier commit (`impl-criteria-fmt`) covers the final test text.
- Deliberate breaks: chain-keying drop, cutoff drop and subset drop each red on behavior with correct logs; the invalid first attempts are honestly recorded in the report (uncommitted implementation destroyed by `git checkout`, re-applied and re-proven).
- Test corrections `f495002b` (caret chain shape) and `4589dc0a` (run-level attempt) each cite a real source in their trailers. Byte-identity of the scan for `\n`-only input is additionally pinned by 24 pre-existing flaky tests plus my 2000-case fuzz.
- The T6 fixture's rerun row is synthesized, documented as such in plan.md and the report.

## Verdict

`fix` — F1 blocks. Requesting `check.repair`.
