# Implementation report: test-rules

Base: `a97d4a11eae4bbc4f1d460eb5fa6a343ef895552`. Head: `b39642f` (lane), 5 commits. Prose-only leaf: no code, no tests.

## Changed files and reasons

- `skills/chart-issues/assets/shapes.md` (:134, :252): Done-criteria template and implementer audit now require an observable result, never a test file/assertion/count; audit refuses such criteria; `merge_checks` and repo-health refusals kept. (criterion 1)
- `skills/chart-issues/assets/standing-design.md`: three bullets after the cheapest-test line carrying 5a boundary order, 6a deletion rule, 7a break proof. Lines 8, 9, 13 untouched. (criterion 3)
- `skills/implement-issue/SKILL.md` (:57 test set, :75 check.fix, :38 base-run): canonical cited-source sentence, 5a/6a/7a, and the 8a case - wrong expectation fixed in its own commit with the reason, may touch tests outside owned paths, A commits in the lane never a worker; really-broken base keeps `failed`. (criteria 3, 4)
- `skills/implement-issue/brief-template.md` (:13): worker copy of the same additions. (criterion 3)
- `skills/merge-issue/SKILL.md` (:45): canonical cited-source sentence for the merger and the 8a fix-forward for a wrong test exposed by rebase. (criteria 3, 4)
- `skills/check-issue/SKILL.md` (:39, :51, :55, :59, :75): brief done-criteria in judging inputs; 5a/6a/7a and cited-source judging in test blocking; scenario blocks as named outcome never a named test; wrong base test recorded as a Fix routed to check.repair (no commits during blind review); cited-source rule in check.repair. (criteria 2, 3, 4)
- `docs/guide/phases.md` (:92, :94, :102): guide parity for rules 1-4. (criterion 4)

`skills/plan-issue/SKILL.md` read, verified proof-not-contract wording already correct, not edited (0 diff lines). No `AREA.md`, index or README referenced the changed rules (grep-verified at plan); none edited.

## Commits

- `8f0338f` docs(chart-issues): outcome-only done-criteria and test-worth rules (worker U1 `deae029`)
- `8fc0852` docs(skills): cited-source, test-worth and wrong-base-test rules (worker U2 `e1ea2c9`)
- `5ad1e5d` docs(check-issue): outcome blocking, cited-source judging and wrong-base-test route (worker U3 `f5d6c75`)
- `671722f` docs(implement-issue): clarify cited-source phrasing in base-run and check.fix (A lane fix)
- `b39642f` docs(guide): outcome criteria, cited-source and wrong-base-test rules (worker U4 `ff6a370`)

## Commands and results

- `bun run format` - all files unchanged (pass), ~seconds.
- `bun run typecheck` (`tsc --noEmit`) - clean, ~seconds.
- `bun test --timeout=30000` - 408 pass, 0 fail, 19 files, 13.66s.
- `AKROGON_BASE=a97d4a11 bun test --changed=$AKROGON_BASE --timeout=30000` - 0 tests selected (prose-only diff, pass); run by A after each cherry-pick and by each worker.
- Criterion proofs (all seconds): `grep -n "observable result\|test file, assertion or test count" shapes.md` hits :134 and :252 with refusals intact; `git diff` on `plan-issue/SKILL.md` empty and "test this leaf adds" gone from shapes.md (C1). `grep -n` on `check-issue/SKILL.md` shows `brief's done-criteria` (:39), `never as a named test` (:55), `real cited source` and break-proof rules (:51), Fix route to check.repair (:59) (C2). `grep -cF` prints the canonical sentence once in each of implement-issue, check-issue, merge-issue; 5a/6a/7a present in brief-template and standing-design (C3). `grep -n` shows the 8a case in implement-issue :38, merge-issue :45, check-issue :59 and phases.md :92-102, with the `failed` stop kept (C4).
- No base-run was needed: every check passed on the leaf diff. No `merge_checks` configured; none added.

## Known limitations

None known. Parallel leaf `test-change-check` edits the same skill files; a rebase conflict resolves by keeping both sentences per the design. `Test-Change:` trailer and `akrogon phase --check` are not this leaf's scope.

## Unverified criteria

None.
