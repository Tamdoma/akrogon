# Review B: operator-only-items

Base: `22c447039b192f4caae6cad4d5b56092941d1bed`
Reviewed head: `d334a7b042dea9845c3d37e85a70ac0a21b2bd38`
Verdict: `ready`

## Findings

No Fixes or Nits. Initial blind review completed without reading the peer review. Debate artifacts are absent as expected for `debate: no`.

## Verification

- Criterion 1: `skills/check-issue/SKILL.md:29` contains the single operator-only definition, fixed heading, exact action, attempted operation, credential or identity, observed error, exclusion from repair Fixes, criterion-gated merge hold and one failed stop after all doable Fixes. The action comes first in the reason.
- Criterion 2: the diff preserves each own-step stop and adds its pointer. The check.fix paragraph points to the same rule and overrides the normal check.review handoff for open operator actions. The live `rg -n "Operator actions|operator-only rule" skills` confirms one definition and the planned pointers.
- Traced the mixed-batch scenario against `src/phase.ts:206-213,230-238` and `src/routing.ts:31-32`: a review-seat failed exit ends the leaf immediately, whereas a gating operator item with verdict fix waits for both reviews and routes to check.fix. The repair instruction finishes doable Fixes before stopping. With only a gating operator item, check.fix stops without code repair. A nongating item leaves the review verdict to the other findings, as D3 requires. The extra check.fix turn is the plan's accepted D2 limitation, not a new requirement.
- `git diff --check 22c447039b192f4caae6cad4d5b56092941d1bed...HEAD` passed. The worktree is clean and the diff contains only the four planned prose files. No code, severity rule, watch rule or planning rule changed.
- Reused the implementation report's passing format and typecheck evidence. Inspected its full-suite log `/var/tmp/akrogon-1000/operator-only-items-22cfb7b3db74/tmp.XfxPbMqGPW`: 353 pass, 0 fail, 4122 assertions across 15 files. No code change, missing check evidence or specific check concern warrants rerunning checks. No prose-wording test is needed under the design and the recorded wording-test lesson.
- Opened `docs/guide/problems.md`, `docs/guide/in-practice.md` and `docs/reference-index.md`. No documented operator-guide behavior changed: recorded human-only blockers still end the execution pass and need operator recovery. The detailed changed review ordering lives in the updated skill. The referenced lesson histories support the docs sweep and avoidance of wording tests.

## AREA path listing

One command from the worktree root listed every path named in changed `skills/AREA.md`:

```text
src/akrogon.ts: exists
tests/install.test.ts: exists
tests/phase.test.ts: exists
skills/init-akrogon/SKILL.md: exists
skills/implement-issue/SKILL.md: exists
skills/implement-issue/worker-protocol.md: exists
skills/check-issue/SKILL.md: exists
skills/watch-issues/SKILL.md: exists
scripts/observe.ts -> skills/watch-issues/scripts/observe.ts: exists
skills/implement-issue/brief-template.md: exists
src/routing.ts: exists
docs/reference-index.md: exists
```

The short `scripts/observe.ts` reference is scoped by its watch-issues bullet. The AREA file retains its four required sections and 31 lines. No dead pointer was found.

## Merge verification

Rebased without conflicts onto `origin/main` at `00ccfb9f396ecae00578f64927e04135474db44d`.
Prior reviewed head: `d334a7b042dea9845c3d37e85a70ac0a21b2bd38`.
Rebased head: `6ab5e82b6cee3986ce635fdae406f6440a92956d`.
`git range-diff` shows all three patches unchanged (`=` for each).

- `bun run format`: exit 0, all files unchanged, clean worktree.
- `bun run typecheck`: exit 0.
- `bun test --changed=00ccfb9f396ecae00578f64927e04135474db44d`: exit 0, four changed files, no affected tests.
- `bun test`: exit 0, 353 pass, 0 fail, 4123 assertions across 15 files, 81.06 seconds. Log: `/var/tmp/akrogon-1000/operator-only-items-22cfb7b3db74/tmp.mx0mtdkHgH`.
- `merge_checks` and `advisory` are empty. No operator actions remain on this leaf.

Push confirmed: `git push origin HEAD:main` exited 0, advancing main from `00ccfb9` to `6ab5e82`.
