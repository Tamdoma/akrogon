# Report: command-owner

Base: `96a96979d15bc355115a70f409ec297a9fa81587` (`AKROGON_BASE`, branch already at remote tip — refresh fetched origin, rebase no-op).
Committed head: `92498f6de81daf6ce3f4f64009068a516f82baae`.
Mode: delegated (`implement: subagents`), one wave of 3 workers, all landed cleanly.

## Changed files and reasons

- `skills/plan-issue/SKILL.md` (commit `50afdefe`, worker u1): added the proof-command rule as one paragraph in `plan.synthesis` — criterion locks its result, `plan.md` owns the command, A corrects a wrong command preferring the configured runner under the equivalence guard, records old/new/reason/guard evidence, in-criterion runner command is proof, product-invocation stays locked, no live/paid widening. Done-criterion 1.
- `skills/implement-issue/SKILL.md` (commit `50afdefe`, worker u1): criterion-red stop scoped to results that cannot be shown in the leaf, with wrong proof commands corrected under the rule before any failure ending; red-check paragraph's `test-proof-rules` citation replaced; `implement` test-writing paragraph same split; `check.fix` merge-returned path keeps the rejected run's evidence, records the correction, reruns the corrected command, may return to review without the old command green; `Direct form` records corrections in `<chart>/direct/plan.md`. Done-criteria 2, 5.
- `skills/check-issue/SKILL.md` (commit `dd420c6c`, worker u2): `check.review` routes a wrong criteria unit to A under the rule; B judges each recorded correction against the rule's equivalence guard naming the `plan-issue` `plan.synthesis` section; `check.repair` exceptions hand a needed proof-command correction to A; `Standalone review` uses `<chart>/direct/plan.md` and judges proof mapping and corrections from it. Done-criteria 3, 5.
- `skills/merge-issue/SKILL.md` (commit `92498f6d`, worker u3): `attempt top` in-place repair exceptions now exclude proof-command corrections (route to A through `check.fix`); `Shared endings` red-verify paragraph's `test-proof-rules` citation replaced with A correcting wrong expectations and needed proof-command corrections under the rule. Done-criterion 3.

## Commands run

- Worker targeted checks (all green): `check u1-sweep: 0 .../check-u1-sweep-1792429002336-3208573.log`, `check u2-sweep: 0 .../check-u2-sweep-1792428937240-3172262.log`, `check u3-file-sweep: 0 .../check-u3-file-sweep-1792428940929-3172765.log`, `check u3-docs-sweep: 0 .../check-u3-docs-sweep-1792428941118-3172914.log`; `check u3-repo-sweep: 1 .../check-u3-repo-sweep-1792428941026-3172824.log` (expected red in the u3 worktree: sibling hits `implement-issue:40`, `check-issue:69` still held there, none in `docs/`/`README.md`, none in merge-issue).
- Criterion 4 proof, green on committed head: `git grep -n "test-proof-rules" -- skills docs README.md` exits nonzero — `check c4-green: 0 .../check-c4-green-1792429027525-3238415.log`. Intended red recorded at planning: `check c4-red: 0 .../check-c4-red-1792428729373-2971492.log` (3 citations).
- `akrogon verify` on `92498f6d`: `verify leaf 92498f6de81daf6ce3f4f64009068a516f82baae: green` — format, test (1072 pass, 0 fail), typecheck all 0; logs `check-test-1792429223404-3242288.log`, `check-typecheck-1792429225847-3242288.log` under this folder.

## Proof results per done-criterion

- C1 (rule stated once in `plan.synthesis`): model-facing proof — the paragraph is present verbatim-shaped per plan D1; judged at review. No runnable command by design (prose).
- C2 (implement + check.fix correction paths): five edits verified in diff `96a96979..HEAD`; judged at review.
- C3 (check-issue judges/routes, merge-issue routes): edits verified in diff; judged at review.
- C4 (no `test-proof-rules` under skills/docs/README.md): `check c4-green: 0` on `92498f6d` — zero hits.
- C5 (direct route): `Direct form` and `Standalone review` edits verified in diff; judged at review.

No `merge_checks` configured; none run.

## Known limitations and unverified criteria

None. All worker worktrees removed (`command-owner-u1..u3` gone); lane worktree clean; no `Test-Change` trailers needed — no file matched by `src/test-files.ts` changed.
