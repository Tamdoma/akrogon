# Plan: merged-siblings-rule

Direct synthesis (`debate: no` in state.yaml). Brief and locked design agree; no conflict to record. Prose-only leaf: one Judge bullet replaced, everything else untouched.

## Decisions

- D1: Replace only the one "Merged still under open" bullet (`skills/watch-issues/SKILL.md:37`, confirmed live). No other line of the skill changes.
- D2: Replacement keeps the design's fixed content order; wording may vary. Order: (1) read the state files beneath the leaf's top-level owner folder under `issues/open`, an issue or an epic; (2) any not merged → report waiting on siblings, run no `next` for this leaf; (3) all merged → run `akrogon next <slug>` once this fire, re-observe, failed command follows the command-error rule, remaining under open alone is not an error; (4) unreadable sibling state → report the gap, never assume completion.
- D3: Owner means the top-level folder under `issues/open`. An epic's leaf groups with leaves of sibling issues under that epic, not only its immediate issue. Matches `src/phase.ts:138-176` (`owner` = issue, or its parent when the parent is not `open`).
- D4: The all-merged branch runs `next` exactly once per fire per leaf, then re-observes. Any failure defers to the existing command-error bullet (re-observe, report, no further mutation this fire). No new error path.
- D5: Unreadable sibling state (missing or unparseable `state.yaml`) is reported as a gap and blocks the all-merged branch; it never counts as merged and never triggers `next`.
- D6: Exclusions locked: `scripts/observe.ts`, `scripts/observe.test.ts`, `src/`, `tests/`, `docs/`, every other skill, the Never list, and all headings, fields, commands and files stay unchanged. The tree read is read-only, so no conflict with the Never list (`git status` must show only `SKILL.md` modified).
- D7: No new tests. Verification is the unchanged suites: repo-root `bun test`, skill `bun test`, and the docs-links test (part of the repo suite).

## Read-first

- `skills/watch-issues/SKILL.md` — owned surface (Judge section) plus Never list to not conflict with.
- `src/phase.ts:138-176` — read-only evidence that completion is per top-level owner.
- `tests/docs-links.test.ts` — what the prose must not break (relative links, heading anchors).
- `learnings/LESSONS.md` — `stale-rule-in-docs` (grep `docs/` for the changed rule before claiming exclusion), `lock-vs-criterion` (done-criteria already checked against verbatim standing text).

## Needed interfaces

One literal interface, the replacement bullet (design §Leaf architecture; wording may vary, order and content may not):

"Merged still under open: read the state files beneath the leaf's top-level owner folder under `issues/open`, an issue or an epic. If any is not merged, report waiting on siblings and run no `next` for this leaf. If all are merged, run `akrogon next <slug>` once this fire, then re-observe; a failed command follows the command-error rule, and remaining under open alone is not an error. If sibling state cannot be read, report that gap rather than assume completion."

## Acceptance criteria

- AC1: Judge section holds the replacement bullet with all four ordered elements: owner-folder read, any-unmerged branch (waiting on siblings, no `next`), all-merged branch (`next` once, re-observe, command-error rule, open-alone-not-error), unreadable-gap branch.
- AC2: Wording names the top-level folder as the owner, covering the epic case (leaf grouped with sibling-issue leaves).
- AC3: Only `skills/watch-issues/SKILL.md` differs from base; observe line format, `src/`, `tests/`, `docs/`, other skills unchanged.
- AC4: No new heading, field, command or file; Never list byte-identical; prose performs a read-only tree read only.
- AC5: `bun test` from the worktree root passes, `bun test` inside `skills/watch-issues` passes, `tests/docs-links.test.ts` passes.
- Concrete scenario: epic E holds issue I1 (leaf L1 merged, L2 open) and issue I2 (leaf L3 merged). Watch observes L1 merged still under open → reads state files beneath E → L2 not merged → reports L1 waiting on siblings, runs no `next` for L1. After L2 merges → runs `akrogon next L1` once, re-observes, applies the command-error rule on failure.

## Ordered checklist

1. Edit the one bullet in `skills/watch-issues/SKILL.md` per D1–D5 → AC1, AC2, AC4.
2. Confirm exclusions: `git status --porcelain` shows only `skills/watch-issues/SKILL.md`; grep `docs/` for "Merged still under open" to confirm no human doc states the rule → AC3.
3. Run `bun test` from the worktree root → AC5.
4. Run `bun test` inside `skills/watch-issues` → AC5.
5. Run `bun test tests/docs-links.test.ts` from the worktree root → AC5.

## Docs affected

- Agent doc `skills/watch-issues/SKILL.md`: one Judge bullet replaced per the interface above.
- No human doc states the merged rule (`docs/guide/in-practice.md` grep-confirmed clean), so no human doc changes.

## Verification

From the worktree root `/home/ivan/Work/infra/akrogon/issues/worktrees/merged-siblings-rule`:

```sh
git status --porcelain
bun test
bun test tests/docs-links.test.ts
cd skills/watch-issues && bun test
```

`git status` must list exactly `M skills/watch-issues/SKILL.md`. All three test runs must pass.

## Open limitation

Prose-only enforcement: nothing at runtime verifies the agent read every sibling state file or ran `next` exactly once; compliance rests on instruction, not code. The seed's fork explicitly foreclosed the machine-checked `owner=` observe field as a larger change.

## Dependencies

None. Execution needs no ordering.

## Credentials

None named by brief or design; no env presence check applies.
