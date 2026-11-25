# Leaf review: slot B, verify-test-facts, 2026-11-25

One defect, low severity. Everything else in the draft verified against src/ and the real ledgers.

## F1 (defect) — done-criterion 4's "reused command rows carry neither field" cannot be proven through the real CLI

The criterion's proof reads "own test through the real CLI", but no code path in the current source constructs a command row with `reused`. Per-command reuse was removed by commit 37d5975e (2026-11-01, "drop per-command reuse"): grep of src/ finds `reused` only in the schema (src/verify.ts:79), consumer guards and the whole-run `greenRun` receipt reuse, which writes no row at all. Confirming measurement: every `reused` command entry in both real ledgers predates that commit — akrogon ledger entries all start 2026-10-26 to 2026-10-29, framework examples 2026-10-25 (measured 2026-11-25).

Consequence if built as written: the implementer either skips the reused half of criterion 4 unproven, satisfies it vacuously (no writer exists, so the property holds without demonstrating anything), or invents a fixture path the criterion does not name. Fix direction: drop "reused" from the CLI-proven clause (keeping it in the binding decision costs nothing since no writer exists), or restate the clause as what is actually provable — a legacy ledger row with `reused` is carried verbatim through a completion rewrite (part of criterion 6's fixture).

## Verified with no defect

- Timeout pairing is implementable as specified: programmatic scan of a real interleaved framework merge log found both timeout annotations immediately following their same-chain `(fail)` line (2 good, 0 separated), and `killed N dangling process` precedes the `(fail)` line rather than splitting the pair (check-verify-1795566622096-2368929.log, 2026-11-25).
- Criterion 2's negative (thrown error reading `this test timed out after <n>ms.`) is correctly excluded by the anchored grammar: P1 shows that text prints as `error: this test timed out after 50ms.`, which matches neither the `^` shape nor attaches to a `(fail)`.
- `(unnamed)` durations join correctly: unnamed tests only ever appear in output as failures (zero `(pass) (unnamed)` lines across all surviving framework logs, one `(fail) (unnamed) [241101.39ms]` instance, measured 2026-11-25), so the failureNames naming rule applies to the only lines that ever carry it, and the rule's edge the design doesn't spell out is unreachable in practice.
- The merge-vs-leaf scope test setup exists in the harness: `--attempt` requires a leaf in phase `merge` with a matching `batch.attempt` (verify.ts verifyCaller), leaf scope comes from any other phase, and merge scope without an attempt is reachable with `--holder` (the existing `--attempt from the repo root` test at tests/verify.test.ts:234 confirms the harness shape).
- Criterion 3's rerun fixture is constructible: the rerun path requires merge scope, `compares` undefined, ≤3 named failures and no `(no test name)` (verify.ts commandRow), all scriptable in a temp repo with a configured `rerun` entry.
- Criterion 7's docs claim is true: `verifyRunSchema` is `z.strictObject` at both row and command level, so a ledger with the new fields fails to parse under an older akrogon, and old rows parse under the new schema because every addition is optional.
- Rerun placement is consistent under green reruns: a first leg that red-then-green passes its rerun keeps its `durations`/`timeouts` inside `rerun` even though the top-level row is exit 0, which matches binding decision 3's leg-beside-log rule.
- All seven binding decisions have homes: decisions 1–5 and 7 map to brief criteria or explicit exclusions, decision 6 is explicitly `Open for the plan` in the design with the invariant (`failures` unchanged) stated in both places.
