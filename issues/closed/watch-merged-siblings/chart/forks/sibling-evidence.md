# How the watch knows a merged leaf's siblings

## Question

### Q1 · How does the watch learn whether a merged leaf's owner folder still holds an unmerged leaf: an `owner=` field in the observe line, or the judge reading the `issues/open` tree?

### Carries
- Seed expectation (operator tier): "Minimal wording change."
- Operator lock: no watchers added beyond necessity; the watch is opt-in and read-only except `next`/`phase`.
- Owner definition from `src/phase.ts:143-147`: the top-level folder under `issues/open`, an issue or an epic.

## Findings
- better-than-training (B, verified A) · `src/next.ts:525-527,664-672`, read 2026-09-21 · a merged dispatch returning `completed` runs `sweepAll` over every registered repo · the per-tick `next` is not a no-op, so the rule must avoid it while siblings are unmerged.
- better-than-training (B) · `src/phase.ts:114-126,148`, read 2026-09-21 · merged state is saved before `completeOwner`, which can throw · a retry via `next` must survive for the all-merged case.
- Slot files: slots/sibling-evidence-B.md, slots/sibling-evidence-merged.md, slots/sibling-evidence-rebuttal-B.md (two citation and lock corrections accepted).
- better-than-training · `skills/watch-issues/scripts/observe.ts:218-230`, read 2026-09-21 · the line is the judge's only structured evidence and has no owner field; the script already walks `issues/open` and holds each leaf path · one `owner=<top-level folder>` field is a few lines plus a test line in `observe.test.ts`.
- better-than-training · `src/phase.ts:138-176`, read 2026-09-21 · completion is per top-level owner, not per issue · the rule must group by the first path segment under `issues/open`, not by parent folder.
- better-than-training · `skills/watch-issues/SKILL.md:30,53`, read 2026-09-21 · the watch may run read-only commands and must not edit `issues/`; reading the tree is allowed · prose-only is possible but moves grouping into per-tick prose judgment.

## Taken
1-A (operator 2026-09-21). Wording only in the watch skill: a merged leaf still under `issues/open` has its top-level owner folder's state files read; any sibling not merged means report waiting on siblings and run no `next`; all merged means run `akrogon next <slug>` once this fire, re-observe, and apply the existing command-error rule; remaining under open alone is never an error; unreadable sibling state is reported as a gap. Reason: smallest change that meets the seed's no-next expectation and keeps the completion retry. Foreclosed: keeping the per-tick `next` (B); an `owner=` observe field (C); deleting the merged rule (D).
