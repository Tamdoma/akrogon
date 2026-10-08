# Names

## Question
Q1. Does a bare name search open owners only, or open and closed? Does an existing path named like an owner keep path precedence?

### Carries
- Intake: Tamdoma/akrogon#59. Correction: park/unpark resolve top-level issue names only (src/park.ts:13,52).

## Findings
Merged notes: [slots/names-merged.md](../slots/names-merged.md). Rebuttal: [slots/names-rebuttal-B.md](../slots/names-rebuttal-B.md).
- better-than-training · src/next.ts:1191-1195 (read 2026-10-08) · an existing folder from cwd wins, otherwise only leaf slugs match · names must be added without breaking path input.
- better-than-training · src/state.ts:114-118, :132-141 · nested issues sit one level under an epic and issue names need not be unique · two same-name nested issues must count as two matches.
- better-than-training · docs/guide/parts.md:28-35 · an issue and its only leaf may share a name, documented as normal · refusing every collision breaks `next <name>` for that pattern.
- B rebuttal · equal-set collapsing is unstable: adding a second leaf to issue `x` makes `next x` ambiguous later without any rename · changed A's lean from collapse to refuse.
- B rebuttal · owners derived from leaves cannot see an empty owner folder · added the empty-owner question.
- better-than-training · cargo pkgid man page (gitea.suzanne.soy man1/cargo-pkgid.1, read 2026-10-08) · a partial spec must match exactly one package or it errors · supports refusal.
- better-than-training · git-scm gitcli and gitrevisions, Jeff King commit 1418567 (2013-12-06) · Git separates explicit path intent from shorthand and keeps an escape syntax · supports keeping a path escape whichever precedence wins.
- Practitioner search for CLI name resolution case studies: none stronger found.

## Taken
Operator answer 2026-10-08: `1a | 2a | 3a | 4a`
- Open owners only. Bare names search open epics, open top-level issues and open issues nested one level under an epic. Leaf slugs keep today's open and closed search. Closed owners stay reachable by path. Reason: finished owners have nothing to start and would only cause false refusals.
- An existing folder from cwd keeps today's path meaning. Reason: nothing that works today breaks. Cost accepted: a same-named local folder shadows the name.
- Every collision refuses before any allocation and lists each match by kind and repo-relative path: two same-name owners, an epic and its same-name issue, and an issue and its same-name leaf even when they select the same work. Reason: a name keeps one meaning as an issue grows. docs/guide/parts.md is updated to show the path form for same-name pairs.
- Owners are recognized only from folders above discoverable leaves, independent of ISSUE.md or EPIC.md. An empty folder gets today's missing message. Discovery read errors stay errors and never become "not found".
- Binding tests: old closed owner name does not block a new open owner; same owner resolved from root, subfolder and worktree plus the shadowing case; refusal starts no Herdr call; unreadable leaf under a named issue reports its read error.
