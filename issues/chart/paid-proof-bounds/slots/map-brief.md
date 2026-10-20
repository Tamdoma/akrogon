# Opening map brief (slots B and C)

You are a charting consultant for the akrogon chart door. Slot A (the door) and each consultant map independently. You will not see the other maps until all finish. Work read-only: do not edit any repo file, do not run `akrogon next`, `akrogon phase`, `akrogon close` or any command that writes issue state. Running tests or scratch reproductions under a temp directory is fine.

## Reading rule

Read process text (skills, guides, AREA.md files) by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. Source code under `src/` that a seed names is the subject of the work, so read it in full where needed.

## Operator intake (verbatim)

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## The pulled issues

Read each in full. They are unverified intake. Their line numbers cite release `9e0df5b0`, which equals the akrogon checkout HEAD at `/home/ivan/Work/infra/akrogon` (verified, `main..origin/main` is 0).

- /home/ivan/Work/infra/akrogon/issues/seeds/102-one-leaf-state-yaml-with-unknown-keys.md
- /home/ivan/Work/infra/akrogon/issues/seeds/103-merged-leaves-with-github-sources-never.md
- /home/ivan/Work/infra/akrogon/issues/seeds/104-merge-stacks-almost-never-land-31-of-32.md
- /home/ivan/Work/infra/akrogon/issues/seeds/105-done-criterion-command-already-red-at.md
- /home/ivan/Work/infra/akrogon/issues/seeds/106-akrogon-sync-refuses-to-move-the.md

## Live surfaces

- Code: /home/ivan/Work/infra/akrogon/src/ (start from /home/ivan/Work/infra/akrogon/src/AREA.md), tests in /home/ivan/Work/infra/akrogon/tests/
- Skills: /home/ivan/Work/infra/akrogon/skills/ (chart-issues, check-issue, implement-issue, merge-issue)
- Lessons: /home/ivan/Work/infra/akrogon/learnings/LESSONS.md
- Framework repo where the reports came from (read-only): /home/ivan/Work/infra/tamdoma/framework, its `issues/merge-attempts.jsonl`, `issues/log.jsonl`, `issues/open/`
- Earlier related charts (read only if relevant): /home/ivan/Work/infra/akrogon/issues/chart/ (for example merge-throughput, merge-green-rate, base-red, red-base-wait, state-cutover, sources)

## Existing locks

None for this chart yet. Earlier charts' Taken answers stand unless a seed shows them wrong.

## Task

Produce a proportional territory map of these five reports. For each report:

1. Verify the suspected cause against the current code (file and function), and say whether the report is confirmed, partly confirmed or wrong.
2. Find the root cause one level deeper than the report states. The operator wants systemic fixes that remove the whole problem class, and prefers deleting redundant or complicated code over adding new code. For each report name the smallest removal or simplification that makes the defect impossible, if one exists, and what new code (if any) is still needed.
3. List the material forks (decisions that change the outcome), questions an experienced practitioner would ask, and pitfalls over the work's lifetime: what each option could break or invite later, not only now.

Then across all five:

4. Name any shared root cause or shared mechanism between reports, and say whether they belong in one chart or separate charts. A chart is one destination with one observable outcome. Only an actual dependency orders work.
5. Give your recommended split into charts, each with a one-line destination.

Cite every claim with path and function, or path:line where needed, and the tier of each outside source (operator, practitioner, better-than-training, model-knowledge with the searches run).

## Return

Write your map to the exact path given in your prompt line below and end your turn:

- Slot B: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/map-B.md
- Slot C: /home/ivan/Work/infra/akrogon/issues/chart/paid-proof-bounds/slots/map-C.md
