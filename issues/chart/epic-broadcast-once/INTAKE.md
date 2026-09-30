# Intake: epic-broadcast-once

## Scope
Destination akrogon, one issue with one leaf: an issue inside an epic no longer triggers a broadcast, the epic triggers one broadcast when its last leaf merges, standalone issues are unchanged.

## Provenance
- GitHub: Tamdoma/akrogon#42
- Operator: 2026-09-30 chart-issues invocation

## Source: Tamdoma/akrogon#42
# Discord broadcast fires when an issue inside an epic completes, not when the whole epic completes

Source: Tamdoma/akrogon#42
URL: https://github.com/Tamdoma/akrogon/issues/42

Unverified intake.

## Observation
A Discord broadcast went out on 2026-09-30 around 13:33Z when leaf `emdash-access-gate` merged. That merge completed the issue `emdash-runtime` (leaves `emdash-deploy-profile` and `emdash-access-gate`), but its epic `emdash-cms` still has 8 unmerged leaves across `emdash-build`, `emdash-landing` and `emdash-operations`.

`completeOwner` in `src/phase.ts` prints `issue complete <issue>` whenever every leaf in the leaf's parent issue folder is merged, even when the owning epic is not complete (`if (justMerged) console.log(...)` runs before `if (!complete) return;`). `skills/merge-issue/SKILL.md` tells the merge slot to run broadcast-issue whenever that line prints, so each finished issue inside an epic posts its own broadcast.

Operator's wanted rule: an issue with no epic broadcasts when the issue completes. An issue that is part of an epic does not broadcast on its own; one broadcast goes out only when the entire epic is complete.

## Location
akrogon: `src/phase.ts` (`completeOwner`), `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`. Seen in the registered repo `Tamdoma/framework` at `issues/open/emdash-cms/emdash-runtime/`.

## Reproduction
1. Have an epic with two or more issues, each with leaves.
2. Merge every leaf of one issue while another issue in the same epic still has unmerged leaves.
3. `akrogon phase <slug> merged --slot B` prints `issue complete <issue>` and the merge slot sends a Discord broadcast.

Happens every time an issue inside an unfinished epic completes.

## Expected behavior
Issues without an epic: broadcast when the issue completes (current behavior). Issues inside an epic: no broadcast until every leaf in the whole epic is merged, then one broadcast covering the epic.

## Urgency
Team channel gets posts about internal building blocks that ship nothing usable yet. Low severity. No workaround other than ignoring the intermediate posts.

## Source: operator 2026-09-30
We need to resolve the issue that I just pulled. It should be a simple change. You can consult with slot B (already open pane).

## Agent findings
- `src/phase.ts:169` prints `issue complete <issue>` before the `if (!complete) return` at :170, so the line fires when an inner issue finishes. (A,B)
- `src/phase.ts:144-146` already computes the completion owner and whether it is complete. (A,B)
- Only consumers of the line: `skills/merge-issue/SKILL.md:47` and `skills/broadcast-issue/SKILL.md:10`. (A,B)
- Recovery callers `src/phase.ts:282` and `src/next.ts:521` pass `justMerged=false` and print nothing. (A,B)
- Private GitHub source closure for an inner issue happens before the completion guard and is verified by `tests/phase.test.ts:608-613,644-649`. It must keep its timing. (A,B)
