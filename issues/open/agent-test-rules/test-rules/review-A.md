# Review A: test-rules

Base: `a97d4a11eae4bbc4f1d460eb5fa6a343ef895552`. Reviewed head: `b39642f97bb8bfa7971b8e892cc27da8c45b9d1b`. `git status --porcelain` empty; base is ancestor; 5 commits, 7 files, +18/-15, all prose.

## Verification

- `bun test --timeout=30000`: 408 pass, 0 fail (14.56s).
- `bun run typecheck` (`tsc --noEmit`): clean.
- `bun run format`: 42 files, all unchanged.
- `bun test --changed=$AKROGON_BASE --timeout=30000`: 0 tests selected; prose-only diff, consistent with the leaf's grep proofs.
- No red test or check in the diff's path, so no base-run trigger.
- `git diff` read fully: every planned surface hit, no file outside the plan's owned paths, no `Test-Change:` trailer or `--check` wording (correctly absent - sibling leaf's), no `issues/` paths on the branch.
- Sweep `grep -rn "a test this leaf adds|scenarios a criterion names|red on base"` outside the six owned surfaces: no stale copies.

## Criterion judgment

1. shapes.md :134/:252: outcome-only criteria, audit refuses test file/assertion/count, `merge_checks`/repo-health refusals intact; plan-issue :59-63 untouched (verified already conforming). Met.
2. check-issue :39 (brief done-criteria in judging inputs), :51 (5a/6a/7a, cited-source judging, unsourced change is a defect), :55 (scenario blocks as named outcome never named test), :59 (wrong base test -> Fix with brief/real source, B repairs first; really-broken keeps `failed`), :75 (canonical cited-source sentence). Met.
3. Canonical rule-2 sentence present once each in implement-issue (:57, plus check.fix :75), check-issue (:51, :75), merge-issue (:45); 5a/6a/7a in implement-issue, brief-template :13, standing-design (three bullets after cheapest-test line). Met.
4. 8a case in implement-issue :38 (own commit, reason, may touch non-owned paths, A commits never worker, `failed` stop kept), merge-issue :45 (wrong test exposed by rebase fixed in own commit, broken default branch keeps fix-forward), phases.md :92/:94/:102 parity. Met.

## Findings

No Fixes. No Nits.

Debate was `no` for this leaf; no positions/rebuttals to weigh. `learnings/LESSONS.md` not used as input. The standing-design bullet placement and the merge-issue sentence packing both read correctly in context; no defect worth a Nit.

Verdict: ready
