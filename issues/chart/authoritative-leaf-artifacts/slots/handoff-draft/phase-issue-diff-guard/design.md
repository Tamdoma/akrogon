# Design: phase-issue-diff-guard

## Binding decisions, verbatim
From `issues/chart/authoritative-leaf-artifacts/forks/artifact-placement.md`, operator 2026-09-18, "1 - I'm for a, but what happens then, does it autocorrect? | 2a | 3a":
- Q1: A. `akrogon phase` refuses `issues/` diffs on the branch at every move with a recorded worktree; the empty-branch refusal stays at check.review only. No autocorrect: the command refuses with a message naming the authoritative folder and the offending paths, and the seat repairs (write the file in the authoritative folder, remove it from the branch, rerun the move). Foreclosed: review-only gate; akrogon moving or copying files itself.
- Q3: A. No artifact-existence gate; today's debate gate stays. Foreclosed: phase-to-artifact table.
- Q2 (A) is excluded from this leaf: the prompt path and skill write lines belong to `prompt-leaf-folder`.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no user-visible browser flow, so verification is the real `akrogon phase` invocation in an isolated fixture repo (`tests/helpers.ts`) with a real worktree and commits. Negative tests are the refusals in criteria 3 and 6; the edge cases are the empty planning branch (4) and the leaf without a worktree (6). No secrets, no auth.

## Leaf architecture
Owned: `src/phase.ts` (`requireCodeOnly` split into `requireNoIssueFiles(repo, worktree, leafPath)` and `requireNonEmpty(repo, worktree)`, or equivalent names; `transition()` call sites), `tests/phase.test.ts` additions, `src/AREA.md` line, prose hits in `docs/guide/` and `skills/*/SKILL.md` that state the review-only rule.
Interfaces: `transition(repo, leaf, requested, explicitSlot, verdict)` unchanged. `target(repo)` from the existing import stays the diff base. The issues check reads `leaf.path` for the message; it is the authoritative folder because `phase` resolves leaves from the registered root.
Excluded: `src/next.ts` dispatch, the debate gate at `src/next.ts:482-487`, `commitMove` failure bookkeeping at `src/next.ts:380`, any file move or copy, the prompt text, `requireClean`.
Dependencies: none. Runs in parallel with `prompt-leaf-folder`; both may touch `skills/*/SKILL.md` prose, which is not a dependency.
