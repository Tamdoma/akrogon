# Leaf draft review brief: merge-lanes

You are a consultant to chart door A (hc terminal t2z2). Review each leaf draft as the implementer who must build it, one pass.

## Drafts

`/tmp/claude-1000/-home-ivan-Work-infra-akrogon/a6b8daac-b25d-4f61-aa42-e82a6f320dc1/scratchpad/leaves/` holds ISSUE.md and five leaf folders (merge-red-exit, main-red-cover, flaky-merge-flips, merge-seat-cap, slow-alarm-baseline), each with brief.md, design.md, readiness.yaml and state.yaml.draft.

## Check against

- The chart's Taken sections: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/{signposts,red-exit,waiting-seats,extras}.md` `## Taken`.
- Leaf shape rules: `/home/ivan/.claude/skills/chart-issues/assets/shapes.md` sections `## Leaf files` and `## Preflight and validation` (the audit paragraph), and the standing design file the designs name.
- akrogon source under `/home/ivan/Work/infra/akrogon/src/`, tests under `tests/`, skills and docs.

## Task

Return disagreements only, each with evidence (path and function, or rule text) and the fix: a done-criterion that cannot pass within its leaf's ownership, misses a Taken item, or breaks the audit rules (names a test file or count, rests on a text match for a model choice, claims repo health); a missing owned surface or consumer; a wrong interface claim; a dependency between leaves that should be `blocked-by`; a binding decision missing or misplaced. "None" for a leaf is valid.

## Return

- slot B: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/leaves-review-B.md`
- slot C: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/leaves-review-C.md`

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

Edit only your return file. Run nothing that changes leaf state, pushes or starts a test suite.

## Report

When the return file is written, run: `hc send t2z2 "done <your slot letter>: <your return path>"`
