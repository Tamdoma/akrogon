# Opening map brief: known-red-intake (slot B)

You are consultant slot B for the chart door. Work independently. Do not read `/home/ivan/Work/infra/akrogon/issues/chart/known-red-intake/slots/map-A.md` or any other slot's file.

## Task

Write an independent territory map for this intake: the material forks that change the outcome, the questions a practitioner would ask, and pitfalls over the work's lifetime (what each option could break or invite later, not only now). Ground each claim in inspected files with path and line, or an outside source with URL and date. Give your pick per fork with reason and cost, rejected options with reasons, and anything you would ask that this brief does not.

Write your return to exactly: `/home/ivan/Work/infra/akrogon/issues/chart/known-red-intake/slots/map-B.md`

## Intake

`/home/ivan/Work/infra/akrogon/issues/chart/known-red-intake/INTAKE.md` (read `## Source: Tamdoma/akrogon#121` and `## Agent findings`). Destination repo: akrogon at `/home/ivan/Work/infra/akrogon`.

## Live surfaces

- `skills/implement-issue/SKILL.md` (Shared context, known-red paragraph), `skills/check-issue/SKILL.md` (check.review known-red paragraph), `skills/merge-issue/SKILL.md` (red verify paragraph)
- `skills/seed-issue/SKILL.md` (Destination, Report, Submit and finish)
- `src/verify.ts` (`sendMainRedNotice`, `noticeCovers`, the `--known-red` path)
- Earlier decisions: `issues/chart/base-red/forks/red-base-policy.md` `## Taken`, `issues/chart/red-base-wait/CHART.md`

## Locks

- Known reds pass inside `akrogon verify`; nothing waits, nothing is marked failed for a base red (base-red, 2026-10-17).
- No classifier model API (chart jev-classifier). No new timers or polling (chart autopilot, seat-stall-detection).
- Done-criteria proofs stay blocking.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when reading process text.
