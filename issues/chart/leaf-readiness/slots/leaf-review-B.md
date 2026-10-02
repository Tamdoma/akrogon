# Leaf review B

Draft paths below are relative to `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/546713ff-19d7-4350-9e77-f5d4109e2e94/scratchpad/handoff/draft/leaf-readiness/`.

## R1: all five leaves, full-suite criterion needs its required justification

- Leaf/file/criterion: readiness-contract, `brief.md:16`, criterion 7. env-link, `brief.md:15`, criterion 6. failure-log, `brief.md:13`, criterion 4. door-readiness, `brief.md:14`, criterion 5. seat-input-rules, `brief.md:20`, criterion 5. Each requires `bun test --timeout=30000` to pass.
- Change: name the property the whole-suite invocation proves that no smaller test proves, as required by the handoff audit. Otherwise replace this acceptance requirement with the leaf's owned tests. This does not remove the lifecycle's separate obligation to run blocking checks.
- Evidence: `skills/chart-issues/assets/shapes.md:170` allows a repo-wide checks command only when the chart names that property. The inspected `issues/chart/leaf-readiness/CHART.md:3-24` names no such property. The designs instead describe existing fixture tests, one schema parse test, or one harness demonstration as sufficient. `skills/AREA.md:22` already requires implementation to run every blocking check.

## R2: readiness-contract, retention exposure has no declared representation

- File/line: `design.md:122-125`, literal `retainedSchema`, especially `resources, purpose, owner, remove_by, cost, cleanup, reason`.
- Change: give retention exposure an explicit field, or explicitly require and document where it is stored within an existing text field. Carry the same literal representation into door-readiness's example, field list and agreement test. Add a criterion proving the complete retained record preserves this information.
- Evidence: `issues/chart/leaf-readiness/forks/proof-fixtures.md:27` requires both cost and exposure before retention. The proposed strict schema has no exposure field, and neither `readiness-contract/design.md:122-125` nor `door-readiness/design.md:87` assigns exposure to an existing field. Adding an undeclared `exposure` field would fail this strict schema.

## R3: env-link, fixture preparation is outside the listed ownership

- File/line: `design.md:27`, “Owned surfaces: src/next.ts ... additions to tests/next.test.ts ... src/AREA.md”; `brief.md:13`, criterion 4's mandatory ignore checks.
- Change: include the necessary shared fixture preparation in this leaf's ownership, or explicitly assign equivalent preparation to the affected test callers. Test repositories used for successful dispatch must establish an ignored `.env` in both checkouts, while the refusal tests remove that prerequisite deliberately. Do not weaken the production checks to keep existing tests green.
- Evidence: `tests/helpers.ts:14-35` creates and commits a repository containing only `file`, with no `.env` ignore rule. `tests/next.test.ts:34-36` uses that fixture without adding one, and `tests/next.test.ts:98-107` expects successful dispatch. `tests/phase.test.ts:245-256` also uses dispatch outside next.test.ts. The proposed `linkEnv` in `env-link/design.md:29` now refuses these repositories unless a machine-specific Git ignore happens to cover them. No other leaf accepts ownership of shared fixture preparation.

## R4: env-link, “changing nothing” conflicts with the placement of linkEnv

- File/line: `brief.md:4`, “It refuses ... changing nothing ... when .env is not gitignored”; `design.md:29`, “called at the end of ensureWorktree ... before saveState”.
- Change: either narrow the refusal promise to preserving the env paths and starting no seat, explicitly acknowledging that a new branch/worktree can already exist, or move the checks that can be performed before creation ahead of `git worktree add` and specify how any remaining refusal preserves the promised state. Make criterion 4 match the chosen behavior.
- Evidence: `src/next.ts:264-269` creates the branch/worktree before the proposed call at the end of `ensureWorktree`. A missing ignore rule therefore refuses after that mutation. `src/next.ts:592-595` reports/skips errors without removing the new worktree or branch. The taken rule requires refusal without overwriting the env path (`issues/chart/leaf-readiness/forks/env-source.md:23`), rather than this broader no-change promise.

## R5: door-readiness, status cannot check the proposed leaves before handoff

- File/line: `brief.md:4`, “after forks settle and before proof calls ... the door checks presence with akrogon status”; `brief.md:11`, criterion 2 writes readiness.yaml before state.yaml.
- Change: specify a pre-handoff presence check over the draft contracts using readiness-contract's exported schema/gap functions, with a concrete invocation and an owned test. Keep `akrogon status` as validation after the final leaf files are emitted. Do not create dispatchable states early merely to make status see the drafts. Declare the consumed helper interfaces in this leaf's design.
- Evidence: `src/status.ts:63-70` recognizes a leaf only when state.yaml exists, and `src/status.ts:77-78` scans issues/open. `src/status.ts:291-292` resolves a named leaf through findLeaf. readiness-contract's accepted implementation changes gap output for discovered leaves (`readiness-contract/design.md:144`), not discovery of scratch drafts. Its `readReadiness` and `gaps` exports are offered at `design.md:137-139`. `skills/chart-issues/assets/shapes.md:168` requires complete review before handoff writes, and `:174` writes state last because it enables dispatch.

## R6: seat-input-rules, the operator prerequisite is asserted without completion evidence

- File/line: `design.md:74`, “completed and recorded in the chart before this leaf is written”; `design.md:87`, removal of `Bash(* .env*)` and confirmation that merge checks may read .env.example. This also gates `brief.md:19`, criterion 4's actual-harness demonstration.
- Change: supply a dated completion record and evidence reference for both operator actions before emitting this leaf. Until then, identify this as an unmet handoff prerequisite rather than completed work. A blocked-by code leaf cannot replace it.
- Evidence: `issues/chart/leaf-readiness/forks/blocker-record.md:26` requires recorded completion, refined by `forks/save-route.md:26`. The inspected Taken sections and `CHART.md:3-24` record the requirement and ownership, but no completion. `skills/chart-issues/assets/shapes.md:148` and `skills/chart-issues/assets/standing-design.md:14` require known human prerequisites to be complete before handoff/opening.

## R7: seat-input-rules, deleting the demo files can delete its required evidence

- File/line: `brief.md:19`, criterion 4 requires the report to record “the transcript path”; `design.md:83`, “Scratch demo files ... are deleted after the report records them”.
- Change: retain the harness transcripts as pass artifacts, or copy them into the implementation artifact directory before deleting scratch inputs and repositories. Record the retained paths, not paths into deleted scratch directories.
- Evidence: `skills/chart-issues/assets/standing-design.md:9` requires an artifact for runtime evidence and records its path in the implementation report. This leaf chooses a real harness demonstration because permission behavior cannot be proved by a smaller check (`seat-input-rules/design.md:75`). A path to a deleted transcript cannot supply that evidence.
