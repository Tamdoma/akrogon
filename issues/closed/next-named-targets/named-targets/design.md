# Design: named-targets

## Binding decisions, verbatim

### Names (issues/chart/next-named-targets/forks/names.md)
Operator answer 2026-10-08: `1a | 2a | 3a | 4a`
- Open owners only. Bare names search open epics, open top-level issues and open issues nested one level under an epic. Leaf slugs keep today's open and closed search. Closed owners stay reachable by path. Reason: finished owners have nothing to start and would only cause false refusals.
- An existing folder from cwd keeps today's path meaning. Reason: nothing that works today breaks. Cost accepted: a same-named local folder shadows the name.
- Every collision refuses before any allocation and lists each match by kind and repo-relative path: two same-name owners, an epic and its same-name issue, and an issue and its same-name leaf even when they select the same work. Reason: a name keeps one meaning as an issue grows. docs/guide/parts.md is updated to show the path form for same-name pairs.
- Owners are recognized only from folders above discoverable leaves, independent of ISSUE.md or EPIC.md. An empty folder gets today's missing message. Discovery read errors stay errors and never become "not found".
- Binding tests: old closed owner name does not block a new open owner; same owner resolved from root, subfolder and worktree plus the shadowing case; refusal starts no Herdr call; unreadable leaf under a named issue reports its read error.

### Leaf split (issues/chart/next-named-targets/forks/leaf-split.md)
Operator answer 2026-10-08: `1a`. B final-shape check: [slots/leaf-split-final-check-B.md](../slots/leaf-split-final-check-B.md), no problem.
- Leaves `named-targets` and `blocked-report` in one standalone issue, no blocked-by. Reason: each outcome is checkable alone and parallel is fastest.
- Composition proven by two criteria, not a combined test. named-targets: for an epic and a nested issue, `next <name>` from the repo root gives the same Selection (repo and leaf set) as `next <its repo-relative folder path>`. blocked-report: reporting subjects are the Selection's leaves (or the --all inventory), independent of input form; a one-leaf folder target and that leaf's slug give the same report, and a multi-leaf folder target reports each subject.
- Docs: named-targets owns target forms and the same-name path example (docs/guide/parts.md, target text in docs/guide/next.md). blocked-report owns report and automatic-silence text in docs/guide/next.md.
- Whichever merges second resolves the overlap in src/next.ts, tests/next.test.ts and docs/guide/next.md.

Exclusions: Blocked report (issues/chart/next-named-targets/forks/blocked-report.md) belongs to the sibling leaf blocked-report. This leaf does not change what dispatch prints for leaves that cannot start, and does not change exit codes for waits.

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md: no auth, secrets, outside calls or chains here. Proof is the smallest test at the CLI boundary: `akrogon next` run against isolated registered repos (tests/helpers.ts) with the fake herdr (tests/fake-herdr.ts), asserting the selected leaves, herdr calls made or not made, and exit codes, never prose wording beyond the kind and path of each ambiguity match. Criterion 1's Selection equivalence is the composition proof the Leaf split decision names; compare the leaf set dispatched by the name with the one dispatched by the folder path. Each new behavior shows one deliberate break turning its test red. No live herdr run is required.

## Leaf architecture
- Owned: name resolution inside `selectLeaves` (src/next.ts:1167-1204), any owner-candidate helper it needs (derived from discovered leaf paths and their ancestor folders under issues/open, never from index files), the ambiguity error, tests under tests/, docs/guide/parts.md and the target-form text in docs/guide/next.md.
- Resolution order: an input that exists from cwd and is a directory keeps today's path selection; otherwise collect open owner candidates (top-level folders under issues/open that hold leaves, and issue folders one level under an epic) plus leaf slugs from the open and closed inventory; one candidate selects its leaves; two or more refuse with every match's kind and repo-relative path; zero falls through to today's discovery-error and `missingLeafMessage` handling (src/next.ts:1197-1203, src/state.ts:146).
- Repo identity stays the Git common directory resolution already in `selectLeaves` (src/next.ts:1177-1189), so worktrees resolve to the registered root.
- Interface: `Selection` (`{ repo, leaves }`) is unchanged; a name produces the same Selection as its folder path.
- Excluded: no change to dispatch, eligibility (src/turn.ts), wait reporting, exit codes for waits, `akrogon park`/`unpark`, or anything under `issues/`. The second leaf of this issue to merge resolves overlap in src/next.ts, tests/next.test.ts and docs/guide/next.md.
