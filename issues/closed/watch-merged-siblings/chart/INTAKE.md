# Intake: watch-merged-siblings

## Scope
Destination: the watch-issues skill in akrogon. A merged leaf whose top-level owner folder still holds an unmerged leaf is reported as waiting on siblings and gets no `akrogon next`; the completion-error rule applies only when every leaf of the owner is merged and the folder still sits under `issues/open`.

## Provenance
- GitHub: Tamdoma/akrogon#28
- Operator: 2026-09-21 message "look at the new issue that was pulled. This is a small thing to update, so let's chart it."

## Source: Tamdoma/akrogon#28
# watch-issues: merged leaf of a multi-leaf issue is reported as a completion error

Source: Tamdoma/akrogon#28
URL: https://github.com/Tamdoma/akrogon/issues/28

Unverified intake.

## Observation
The watch-issues skill rule "Merged still under open: run `akrogon next <slug>` once; if the leaf stays, report the completion error and keep the watch" assumes one leaf per issue. On a multi-leaf issue a merged leaf stays under `issues/open` by design until every sibling leaf is merged.

Supporting facts (2026-09-21, framework repo, issue framework-update-snapshot with three leaves):
- `akrogon next release-producer` on the merged leaf printed nothing and the leaf stayed under open. This is akrogon `completeOwner` (src/phase.ts:142) returning early because siblings snapshot-updater and update-replay-harness are not merged, then `next` returning `completed` (src/next.ts:525-527).
- The watch reported a "completion error" with no error present and would repeat the no-op `next` on every 20-minute tick until the issue closes.

## Location
Repository akrogon, skill watch-issues (SKILL.md Judge section, "Merged still under open" rule).

## Reproduction
Watch an issue with two or more leaves. Merge one leaf. Every tick: observe shows `phase=merged` under open, the watch runs `akrogon next <slug>`, nothing happens, the watch reports a completion error. Every time.

## Expected behavior
A merged leaf whose issue still has unmerged siblings is reported as waiting on those siblings and gets no `next`. `next` and the completion error report apply only when every leaf of the issue is merged and the issue still sits under open. Minimal wording change.

## Urgency
Low. Harmless no-op per tick plus a misleading line in every watch reply. Workaround: operator ignores the report.


## Source: operator 2026-09-21
look at the new issue that was pulled. This is a small thing to update, so let's chart it.

## Agent findings
- `skills/watch-issues/SKILL.md:37`: "Merged still under open: run `akrogon next <slug>` once; if the leaf stays, report the completion error and keep the watch." No sibling condition.
- `src/phase.ts:138-176` `completeOwner`: returns early unless every leaf of the issue is merged; the folder moves to `issues/closed` only when every leaf of the top-level owner (standalone issue or epic) is merged. So a merged leaf legitimately stays under open until the whole owner is complete, including sibling issues of an epic.
- `src/next.ts:525-527`: a merged leaf calls `completeOwner` and returns `completed` with no output, so the watch's `next` is a silent no-op.
- `skills/watch-issues/scripts/observe.ts:227-230`: the observe line carries slug, phase, attempts, blocked, seats and notified. No owner or issue field, so the judge cannot tell siblings from the line alone. `observe.test.ts` exists beside it.
- `docs/guide/in-practice.md:79-95` describes the watch without naming the merged rule; no doc change needed beyond the skill.
