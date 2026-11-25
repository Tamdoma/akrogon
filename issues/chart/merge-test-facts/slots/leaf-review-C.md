# Leaf review: slot C, chart merge-test-facts

Reviewed: `issues/chart/merge-test-facts/slots/leaf-draft/` (`ISSUE.md`, `verify-test-facts/brief.md`, `design.md`, `readiness.yaml`, `state.yaml`) against `forks/test-facts.md` `## Taken` and `shapes.md` (`## Leaf files`, `## Preflight and validation`), 2026-11-25.

---

## Defect 1 — `brief.md` Done-criterion 4 cannot be met for `reused` command rows through the real CLI

- **Where:** `verify-test-facts/brief.md` `## Done-criteria` item 4: *"Blocked and reused command rows carry neither field. Proof: own test through the real CLI."*
- **Evidence:**
  - `src/verify.ts` (`runOnce`, `verify`, `verifyRunSchema`, read 2026-11-25): `akrogon verify` never writes a command row with `reused`. Whole-receipt reuse in `verify` prints `reuse receipt <run> tree=<tree>` and appends no row at all (as `design.md` `## Leaf architecture` itself states: *"Green-receipt reuse writes no row"*). `reused` remains in `verifyRunSchema` only for historical rows.
  - `tests/verify.test.ts` (read 2026-11-25): `a same-tree retry re-executes every unblocked command and writes no reused entry` and `a same-tree retry re-executes every merge member and writes no reused entry` explicitly assert the CLI produces no `reused` command entries; `the receipt schema accepts both old entries and entries carrying a reused source run` can only test one by writing a fixture JSONL row.
- **Consequence if built as written:** The implementer cannot prove the `reused` clause of Done-criterion 4 through the real `akrogon verify` CLI, forcing either a dead-end search for a non-existent writer or a fixture test that contradicts the criterion's proof clause.
- **Fix:** Restrict Done-criterion 4's real-CLI proof to `blocked` (and setup-failed) command rows emitted by `runOnce`, and cover legacy `reused` command rows (if retained as a check) under Done-criterion 6's fixture-ledger schema test.

## Defect 2 — `readiness.yaml` proof 1 (and `forks/test-facts.md` `### Charting proofs` P1) makes a false claim about Bun 1.4.5 sub-ms `(pass)` lines and fails to cover Done-criterion 1's no-bracket case

- **Where:** `verify-test-facts/readiness.yaml` `proofs` entry 1 (`result`: `without CLAUDECODE, "(pass) <title> [<n>ms]" for every pass (sub-ms included)`), referenced by `design.md` `## Standing design` as the source of fixture shapes for tests.
- **Evidence:**
  - Live Bun 1.4.5 non-TTY probe (2026-11-25, `bun test` with stdout/stderr redirected to files): fast sub-0.005 ms tests (`expect(1 + 1).toBe(2)` and empty body) print `(pass) fast pass` and `(pass) zero-ish pass` **without** a `[<n>ms]` suffix; only tests >= 0.005 ms print `[<n>ms]`.
  - Real framework Bun 1.4.5 merge logs (measured 2026-11-25): `check-verify-1795553672666-2146688.log` contains **130** `(pass)` lines with no `[<n>ms]` suffix (for example, `test:wiring-checks                   | (pass) input-manifest-vocabulary > integer presence semantics reject or accept NaN`), and `check-verify-1795487484756-1065562.log` contains **123** such lines.
  - Internal contradiction: `brief.md` Done-criterion 1 requires *"Lines without a `[<n>ms]` suffix ... add nothing"* and `forks/test-facts.md` `## Taken` item 1 requires *"a line with no bracket stores nothing"*, yet proof 1 asserts every pass (sub-ms included) carries `[<n>ms]` and neither P1 nor P2 records the real no-bracket `(pass)` shape.
- **Consequence if built as written:** The proof record misstates the pre-existing Bun 1.4.5 output format and omits the real no-bracket `(pass)` line shape that `design.md` `## Standing design` directs the implementer to copy verbatim from P1/P2 into test fixtures.
- **Fix:** Update `readiness.yaml` proof 1 (and `forks/test-facts.md` `### Charting proofs` P1/P2) to record the observed Bun 1.4.5 behavior: passes rounding to `0.00ms` omit `[<n>ms]` (123–130 lines per framework merge log), while slower passes print `[<n>ms]`.

## Defect 3 — `brief.md` Done-criterion 5 names an existing test

- **Where:** `verify-test-facts/brief.md` `## Done-criteria` item 5: *"Proof: own test through the real CLI, alongside the existing `--attempt` test."*
- **Evidence:** `shapes.md` `## Leaf files` and `## Preflight and validation` (read 2026-11-25) keep test-file and test-structure directives out of brief done-criteria; `design.md` `## Standing design` already points the implementer to the existing `--attempt` harness in `tests/verify.test.ts`.
- **Consequence if built as written:** Leaks test-placement instruction into a brief done-criterion that should state only the observable behavior and proof form.
- **Fix:** Trim `, alongside the existing --attempt test` from `brief.md` Done-criterion 5 (leaving the pointer in `design.md` `## Standing design`).

---

Checks passed without defect: `state.yaml` and `readiness.yaml` both validate against `src/state.ts` (`stateSchema`) and `src/readiness.ts` (`readinessSchema`); no slug collision exists in `issues/open/` or `issues/closed/`; all seven binding decisions in `forks/test-facts.md` `## Taken` have homes or explicit exclusions in `brief.md` and `design.md`; `docs/reference/files.md` `## Repo records` matches Done-criterion 7's target row.
