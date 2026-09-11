# Plan: tree-preflight

## Basis and read-first paths

Direct synthesis by slot B. The authoritative state has `debate: no`, so no positions or rebuttals are required. The locked design governs scope. Its explicit depth rule also rejects depth one, although the brief only names depth zero and excessive nesting.

Read these paths in the live worktree unless marked authoritative:

- Authoritative leaf `brief.md` and `design.md` beside this plan.
- `REFERENCE.md`, `learnings/LESSONS.md`.
- `skills/chart-issues/assets/shapes.md`: tree shapes and handoff preflight.
- `skills/chart-issues/SKILL.md`: handoff audit.
- `src/state.ts`: discovery, lookup and enclosing locks.
- `src/next.ts`: `discover`, explicit selection, `dispatchLeaf`, global lock boundary.
- `src/status.ts`: independent overview walker and detailed lookup.
- `src/park.ts`: `issueFolders` and subtree scans.
- `src/phase.ts`: completion subtree scans; `src/pull.ts`: `closeSources` scan.
- `tests/helpers.ts`, `tests/next.test.ts`, `tests/status.test.ts`, `tests/park.test.ts` and `package.json`.

Live inspection found three separate discovery walkers. `next` discovers inside the global lock, then rediscovers under the repo lock before acquiring leaf locks. `leavesUnder` is also called at owner and issue subtrees by parking and completion. All 29 current authoritative open/closed state paths are at depth two or three. No required grounding resource is missing.

## Decisions and interfaces

D1. A discovered state belongs only at depth two (`issue/leaf`) or three (`epic/issue/leaf`) from its area root. Reject depth zero, one and four or greater before parsing that state or admitting it to the leaf inventory. Name the offending absolute state path in the diagnostic. Empty intermediate directories are not leaves and do not fail merely for their depth. Keep the existing terminal-leaf traversal behavior.

D2. Put one shared `validateLeafDepth(areaRoot: string, leafPath: string): void` boundary validator in `src/state.ts`. Compute depth with `relative` and path components, not basename guesses, absolute path segment counts, or index-file presence. Use a Zod validation error so the existing status unreadable-repo handling can carry the failure without a new catch-all. Change `leavesUnder` to require its area root explicitly, retaining that root throughout recursion. Update all existing call sites with their known open, closed or parked root, including subtree calls in park, phase and pull. These call-site changes only supply context and do not alter parking or completion behavior.

D3. Reuse D2 in `next.discover` and the status overview walker at each discovered state. Keep their existing distinct error policies: next reports and excludes malformed leaves while continuing eligible independent work; status overview reports an unreadable repository while continuing other repositories. Do not replace these walkers with fail-fast `allLeaves`, change capacity accounting, or broaden their catch behavior. Set the status diagnostic path to `state.yaml` before validation.

D4. For ordinary explicit next selection (slug or path), perform the existing read-only repo resolution, discovery and selection before acquiring the global lock. An invalid-only selection reports its original path diagnostic, exits nonzero, and never enters any lock. Carry valid selected identities into the existing locked dispatch, which must still rediscover under the repo lock before leaf locks. Preserve hook ownership resolution and all-repository sweep behavior. Every route excludes invalid-depth leaves before leaf locks, including merged cleanup. A mixed sweep may lock for valid leaves, but cannot lock or dispatch an invalid leaf. Do not add a second fail-fast global scan. This satisfies the brief's literal no-lock invalid-target case without weakening the locked recheck or malformed-leaf isolation.

D5. Share `missingLeafMessage(repo: Repo, slug: string): string` between `findLeaf` and the ordinary explicit-slug missing branch of next. Return `Missing leaf: <slug> (parked)` when the requested leaf folder with a state file exists at a supported depth under parked, otherwise `Missing leaf: <slug>`. Enumerate parked directories through the existing `issueFolders` helper, supporting both issue/leaf and epic/issue/leaf shapes. Do not parse dormant parked state, add parked work to active discovery, mistake an owner directory for its leaf, or search arbitrary nesting. Existing active/closed lookup wins. Preserve next's original unreadable diagnostic when discovery failed rather than replacing it with a missing message. The state/park import cycle contains functions, not eager calls; exercise the real CLI and park tests to verify it.

D6. The chart preflight refuses a proposed top-level completion owner if `issues/closed/<owner-folder-name>` already exists, even when the folder has no state or index. For an epic, check the epic folder, not each child issue name as though it were a top-level owner. Apply before any handoff write and name the conflicting destination. Add this to both shapes.md preflight and the SKILL.md audit sentence. Leave runtime completion handling unchanged.

D7. No dependency on sibling leaves is required. Necessary edits to next/status and the subtree call sites are integration work for the locked behavior, despite their omission from the architecture's abbreviated owned-surface list. Do not change repo mismatch messages, schema fields, source closure behavior, or adjacent documentation.

## Acceptance criteria

C1. Real `next <slug>` invocations against isolated depth-zero, depth-one and depth-four state fixtures exit nonzero with the offending path before global, repo or leaf lock acquisition. Cover open and closed, including a merged invalid leaf. No state, log, worktree, tab or agent is created or changed. Use a bounded child invocation that kills on timeout so a regression cannot hang the test runner. Demonstrate no flock invocation with a fixture executable that records and fails if called, rather than relying only on absence of persistent lock files.

C2. `allLeaves` rejects the same invalid depths. Both supported depths remain readable in open and closed. Subtree scans retain their area-relative depth through park/unpark and completion. A next mixed-tree test shows the invalid path is reported and excluded while an otherwise eligible independent leaf retains existing dispatch behavior. Existing malformed YAML, capacity, duplicate identity and unreadable-target scenarios continue passing.

C3. `status <slug>` and `next <slug>` return the exact required parked message for both supported parked shapes. An absent slug keeps the ordinary missing message, an owner name alone is not a parked leaf, and active/closed leaves take precedence. A malformed dormant parked state does not need parsing to identify its folder. Parked work remains absent from dispatch.

C4. Status overview rejects invalid open depth with a path-bearing unreadable diagnostic and nonzero exit, while still displaying a separate valid repo. Detailed status rejects invalid open/closed discovery without mutation. Existing status layout and read-only guarantees remain intact.

C5. Both chart skill paragraphs explicitly require the closed-owner check before writes. Review scenarios: standalone owner collision is refused, epic owner collision is refused, an empty closed owner folder also blocks, a free owner proceeds, and a matching nested child issue name under a different closed epic does not itself conflict. Judge the instruction's behavior, not exact wording.

C6. All existing authoritative records load with the changed discovery. `bun run format`, `bun run typecheck`, and `bun test` pass. Formatting leaves no unrelated changes.

## Ordered implementation checklist

1. A1 — `src/state.ts`, necessary callers in `src/park.ts`, `src/phase.ts`, `src/pull.ts`: implement D1/D2 and the parked message helper D5. Add focused discovery and parked boundary coverage in the existing next/status suites or a small state test file if direct assertions are clearer. Satisfies C2/C3 without changing completion logic.
2. A2 — `src/next.ts`, `src/status.ts`, `tests/next.test.ts`, `tests/status.test.ts`: integrate shared validation and missing diagnostics, move explicit selection ahead of the global lock, and exercise C1–C4. Reuse fixture helpers. Any bounded subprocess helper must reap its child and preserve stdout/stderr and exit status. Add no global timeout or production fallback.
3. A3 — `skills/chart-issues/assets/shapes.md`, `skills/chart-issues/SKILL.md`: add D6 and manually evaluate C5. No wording-snapshot test.
4. A4 — run the verification below, inspect the final diff for scope, and record commands, outcomes and artifact paths in the implementation report. No implementation changes or tests are claimed complete by this plan.

## Concrete verification

- Run `bun test tests/next.test.ts tests/status.test.ts tests/park.test.ts tests/phase.test.ts tests/pull.test.ts` after integration. The existing helper launches `src/akrogon.ts` as a real child process, so the new CLI cases exercise the public flow.
- Retain that run's combined output and exit code as `verification-tree-preflight.txt` beside this authoritative plan. Capture without masking the test process exit status. This is the required non-browser end-to-end artifact. Record fixture diagnostics in test output where needed so the artifact demonstrates invalid path and parked cases, not only test names.
- Load all authoritative open/closed leaves with the worktree's changed `allLeaves` and a Repo resolved from the registered checkout. Record the count and successful result in the same evidence file. Do not run next against production records for verification.
- Run `bun run format`, inspect `git --no-pager diff`, then `bun run typecheck` and `bun test`. Record results. Remove iteration scratch files and keep evidence outside the leaf branch. Before handoff, verify saved changes are committed and `git status --porcelain` is empty as required by the implementation workflow.

## Open limitations

R1. Closed-owner prevention is an agent handoff preflight. A manual write or later concurrent creation can still collide at runtime; the existing completion error remains the final guard. This leaf adds no transactional chart command.

R2. A filesystem can change after the unlocked explicit preflight. The existing locked rediscovery remains necessary and rejects newly invalid leaves before leaf locks, although the global/repo locks have then already been acquired. The no-lock evidence covers a tree already invalid when invocation starts.

R3. Discovery still stops at a state-bearing leaf. Detecting hidden nested states beneath an otherwise valid leaf would change that traversal contract and is not part of this plan.

## Repair integration on a4f0b5d

The merge rebase introduced the completed identity, failure-notification and resumable-source-closure changes. D2's caller adaptation now applies to the upstream issueLeaves/ownerLeaves scans in completeOwner, both under open after the closed-leaf return. The old pull.ts scan no longer exists, so the upstream closeSources(repo, sources, leaf) interface remains unchanged. Next retains the upstream completion sweep before merged cleanup alongside D4's unlocked ordinary selection. Acceptance criteria and scope remain unchanged.
