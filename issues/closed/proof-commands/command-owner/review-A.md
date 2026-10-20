# Review A: command-owner

Base: `96a96979d15bc355115a70f409ec297a9fa81587`
Reviewed head: `92498f6de81daf6ce3f4f64009068a516f82baae`
Verdict: **ready**

## Evidence

- Diff scope: 4 skill files, 13 insertions / 11 deletions (`git diff 96a96979...HEAD --stat`). Nothing outside `skills/`.
- `test-proof-rules` sweep: `grep -rn "test-proof-rules" skills docs README.md` exits 1 — zero hits. Criterion 4 proven.
- `akrogon verify` green on reviewed head (report cites `verify leaf 92498f6d: green`; test log 1072 pass, 0 fail).
- `Test-Change:` trailers in range: none required — no path matched by `src/test-files.ts` changed.

## Criterion reads

- C1 — `skills/plan-issue/SKILL.md` `plan.synthesis` holds one paragraph (new line 63) stating: result locks / `plan.md` owns the command, wrong-command definition (runner-semantics departure or outside-cause red while result holds), A replaces preferring configured runner, equivalence guard (same tests and cases still run, deliberate break still fails), recorded fields (old, new, reason, guard evidence) in `implementation/report.md` or `<chart>/direct/plan.md`, in-criterion runner command is proof, product invocation stays locked, no live/paid widening. Every element the criterion names is present, stated once. Met.
- C2 — `implement-issue`: criterion-red stop now scoped to "whose result cannot be shown" with the correction-before-failure sentence; red-check paragraph routes a wrong criteria unit to correction and keeps the stop for unshowable results; `implement` test-writing paragraph splits worker mismatch (wrong test) from unshowable criterion (locked-decision stop — correct, since an unshowable locked result is a wrong criterion) from wrong command (correction); `check.fix` merge-returned keeps the rejected run's evidence, records the correction, treats the corrected command as the reproducing command, green corrected rerun returns to review without the old command green; configured `checks` receipt/known-red wording untouched. Met.
- C3 — `check-issue` line 57 judges recorded corrections against the rule's equivalence guard by naming the `plan-issue` `plan.synthesis` section; `check.repair` exceptions hand needed proof-command corrections to A; `merge-issue` `attempt top` excludes them from B's in-place repair and `Shared endings` routes them to A through `check.fix`. Met.
- C5 — `implement-issue` `Direct form` records the door's correction in `<chart>/direct/plan.md`; `check-issue` `Standalone review` substitutes `<chart>/direct/plan.md` for `plan.md` and adds the proof-mapping and correction judgment. Met.

## Checks on the rule's own text

- Guard preserved: corrected command keeps same tests/cases, deliberate break still fails — stated in the rule and referenced, not restated, at every citation site.
- No widening: "never widens a live or paid action" present; grant/checks machinery untouched in the diff.
- Replaced not stacked: each `test-proof-rules` site rewritten in place; no new second definition of the rule exists outside `plan.synthesis` (verified: rule text lives only at line 63; other sites cite "the `plan-issue` `plan.synthesis` proof-command rule").
- No mechanical check added (locked 3a honored); `shapes.md` untouched; `learnings/` untouched per design exclusions.

## Docs/index check

No `AREA.md` changed and none needed: the leaf edits skill internals, not folder structure or commands; `skills/AREA.md` still accurate. One line: no documented behavior outside the four files changed.

## Findings

None — no Fixes, no Nits.
