# Position B: base-red-exit

## Recommendation

D1. Implement the locked design as prose in the three skills, `skills/AREA.md`, and `docs/guide/phases.md`. Add no runner, helper, tests of wording, source changes, or dependency on leaf-temp-dir. Keep the current red-criterion and failed-check gates.

D2. Put the complete base-run rule in implement-issue Shared context, explicitly applying to implement and check.fix, and put the same behavioral rule in check-issue for check.review. Reference the shared rule from both implementation pass endings so the generic repair instruction cannot send an unrelated base failure into worker repair first.

D3. Add the planning limit to plan-issue Shared context so it governs positions, rebuttal, and synthesis. Plans prove the brief's done-criteria with leaf-owned tests and configured `checks`. They add no `merge_checks` or whole-suite requirement the brief does not name. Keep whole runs explicitly named by the brief, including this leaf's `bun test`.

## Grounding and read-first paths

- Authoritative leaf: `brief.md` and `design.md` in `/home/ivan/Work/infra/akrogon/issues/open/base-red/base-red-exit/`.
- `docs/reference-index.md`, `skills/AREA.md`, `src/AREA.md`, and `tests/AREA.md`.
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, and `skills/plan-issue/SKILL.md`.
- `docs/guide/phases.md`, with `docs/guide/setup.md` and `docs/guide/merge.md` for the existing checks/merge boundary.
- `skills/chart-issues/assets/shapes.md:132` and `:170`, and `skills/chart-issues/assets/standing-design.md` for the existing chart proof rule. These are read-only.
- `src/phase.ts:193` for the existing failed transition, mandatory reason, and explicit seat. Read-only.
- `package.json`, `bunfig.toml`, `tests/docs-links.test.ts`, and `tests/command-reference.test.ts` for actual proof commands and unchanged consumers.
- `learnings/LESSONS.md` and `learnings/history/2026-09-11-stale-rule-in-docs.md`. The cited history supports sweeping the guide after changing a skill rule.

F1. Live HEAD and configured `AKROGON_BASE` are both `88f252f02eb36aacee6dadf6668c303374b692d5`. The worktree is clean. None of the three skills currently states the requested base-run rule, and plan-issue currently has no limit on adding broad checks.

F2. `docs/guide/phases.md:91` currently describes an exception for a criterion needing a whole run without saying the brief must name it. Its planning, implementation, and review sections are the human documentation affected. Other guide hits describe configuration, recovery, unrelated uses of “whole,” or merge behavior and do not require edits on present evidence.

F3. `src/phase.ts` already allows an active reviewing seat to declare `failed` with `--reason` and no verdict. The failed branch precedes clean-worktree and review-verdict guards. No command change is needed.

## Concrete changes

1. A1. In `skills/implement-issue/SKILL.md`, preserve the existing sentence that a red criterion is never handed off as pre-existing, base red, or modulo anything. Add the base comparison before ordinary repair when diff inspection finds no cause in the leaf. Explicitly cover implement-end validation and check.fix validation.
2. A2. In `skills/check-issue/SKILL.md`, add the matching check.review rule beside the blocking-check and rerun paragraphs. Preserve failed checks always block and rerun only for changed code, missing evidence, or a specific concern. A triggered base comparison is that specific concern, not an automatic second run after every failure.
3. A3. In both skills, require the same command once at the configured `AKROGON_BASE`, in the same mode and scope. Use `base_worktree=$(mktemp -d)` followed by `git worktree add --detach "$base_worktree" "$AKROGON_BASE"`. Install dependencies there using the leaf's installation method. Explain that mktemp uses exported leaf `TMPDIR`, otherwise system temp, without assigning TMPDIR or inventing a fixed path.
4. A4. In both skills, capture the base exit result and both log paths, failing test names, and log tails before cleanup. Keep raw logs outside the directory being removed. Remove the detached worktree with `git worktree remove --force "$base_worktree"` before either outcome. Red on base ends the current pass immediately with `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>`. Implementation uses A and writes `implementation/report.md`. Review uses the reviewing seat and writes `review-<slot>.md`. Green on base returns to the existing leaf repair path. No red-on-base review handoff or ready/nits verdict is permitted.
5. A5. In `skills/plan-issue/SKILL.md`, add D3 without changing chart shapes, acceptance criteria, synthesis interfaces, or lifecycle dispatch.
6. A6. In `skills/AREA.md`, summarize the base-red stop and the plan proof limit within the existing four sections and 40-line cap. In `docs/guide/phases.md`, state the planning limit, describe implementation/repair and review base comparison, and narrow the whole-run exception to one the brief names. Keep merge red checks routing to check.fix.

These are the five affected agent/human documentation files. The grep sweep can identify another guide line describing the same changed rule, but incidental matches alone do not expand the change list.

## Acceptance evidence

| Criterion | Evidence and failure caught | Size | Rerun trigger |
| --- | --- | --- | --- |
| 1 | Read the implement-issue diff against A1/A3/A4 and both pass endings. Catches an omitted trigger, phase, cleanup, evidence field, outcome, or weakened red-criterion gate. | Minutes | Relevant prose changes. |
| 2 | Read the check-issue diff against A2/A3/A4. Catches a wrong slot/artifact, review handoff on base red, or weakened blocking/rerun rule. | Minutes | Relevant prose changes. |
| 3 | Read the plan-issue diff against D3 and chart shapes. Catches a planner-added suite/merge gate or removal of a brief-named whole run. | Minutes | Planning prose changes. |
| 4 | Run and paste `grep -rn "base" skills/implement-issue skills/check-issue skills/plan-issue skills/AREA.md docs/guide` and `grep -rn "whole\|full suite\|merge_checks" skills/plan-issue docs/guide` into `implementation/report.md`. Judge every hit by meaning, including unrelated Git rebase and merge-only mentions. Catches stale or contradictory documentation. | Seconds plus minutes to assess | Any owned prose changes. |
| 5 | Run `bun run format`, `bun test`, and `bun run typecheck`. The full test result must include unchanged docs-links and command-reference tests. Confirm those files have no diff. Catches configured check failures, broken guide links, and damaged command contracts. | Unknown until timed | Missing evidence, changed inputs, or specific concern. |

No new tests are warranted for skill prose. Existing command tests validate executable contracts, and the design already records the mktemp/detached-worktree/forced-remove/failed-transition operation proofs. Do not create another runtime harness for this leaf.

Before implementation checks, install this project's recorded dependencies with its normal Bun installation method. `node_modules` is absent in the current worktree. Format targets only `src` and `tests`, so a passing format command does not prove the skill prose.

## Concrete scenarios for semantic review

1. S1. A's whole-folder command fails on an unrelated test and diff inspection finds no cause. The identical whole-folder command runs once at base with equivalent dependency installation. It is red there too. A saves both outputs' names/tails and paths, removes the base worktree, and declares failed. It does not run a narrowed single-file substitute or begin unrelated repairs.
2. S2. The same trigger occurs during check.fix, but the identical command is green at base. A removes the worktree and repairs the leaf through the existing protocol. A still cannot hand off until the criterion and blocking checks pass.
3. S3. B encounters missing or specifically suspect review evidence for a failing single-file command with no cause in the leaf diff. B repeats that same single-file command once at base. If red, B records durable evidence in review-B.md, removes the worktree, and declares failed with slot B rather than requesting merge or ordinary check.fix.
4. S4. A failure traces directly to changed leaf code. The seat repairs it under the existing protocol without a base comparison. A brief requiring only a leaf test gains no suite requirement during planning. A brief explicitly requiring `bun test`, like this one, retains it.
5. S5. With TMPDIR exported, mktemp allocates inside it. Without TMPDIR, it uses system temp. Dependencies and tests leave untracked files, so forced worktree removal is required in both cases. Saved names/tails remain in the authoritative leaf artifact after scratch expires.

## Risks and limitations

R1. Cleanup can erase raw logs if they live inside the detached worktree. A4 requires capturing the result and durable artifact evidence first and retaining log paths outside the removable directory.

R2. Different dependency setup or narrowing a whole-folder run can produce a misleading comparison. The rule must require the same command/mode and leaf-equivalent installation, without silently substituting a cheaper command.

R3. A base comparison still costs one full command when the original failure came from a whole-folder run. It stops repeated off-scope investigation but does not make that one run cheap. Outside inputs can also differ between executions. This design supplies a stop, not a cached or hermetic causality proof.

## Simpler alternative

Keep each skill self-contained with a short prose rule and the mandated literal commands. A separate helper or shared rule file adds a new owned surface and invocation contract without helping this prose-only leaf. Merely retaining the generic red-criterion stop is insufficient because it leaves the unrelated-failure investigation unbounded. No substantive design fork, brief/design conflict, credential, human prerequisite, or execution dependency was found.
