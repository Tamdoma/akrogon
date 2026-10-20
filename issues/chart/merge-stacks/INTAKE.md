# Intake: merge-stacks

## Scope

Merge turns stop spending verify runs on multi-leaf stacks that fail, without slowing solo merges.

Part of a six-chart pass opened 2026-10-18 over seeds #102-#108; sibling charts: paid-proof-bounds, merge-stacks, owner-completion, state-unknown-keys, criterion-outcomes, sync-identical-ignored. No dependency between them.

## Provenance

- GitHub: Tamdoma/akrogon#104
- Operator: 2026-10-18 chart-issues invocation
- Operator: 2026-10-18 split round answer

## Source: operator 2026-10-18 invocation

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## Source: operator 2026-10-18 split round

> 1a | 2a | 3a | 4a

Round answered 2026-10-18: 1a fold #103 and #108 into one chart; 2a order #107, #104, #103+#108, #102, #105, #106; 3a leave the two flaky tests out; 4a no framework replay-resume chart now.

## Source: Tamdoma/akrogon#104

# Merge stacks almost never land: 31 of 32 multi-leaf stacks went red, so every merge turn pays for a wasted stacked verify before the solo attempt

Source: Tamdoma/akrogon#104
URL: https://github.com/Tamdoma/akrogon/issues/104

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In the framework repo, the merge queue lands about one leaf every 15-40 minutes. On 2026-10-18 at 07:50Z, 11 leaves were waiting in `merge` and only the holder was being worked. Several of them had been in `merge` for 5-10 hours (`akrogon status` TIME column): shown-prop-coverage 10h14m, extracted-entries 8h03m, frozen-status-read 7h01m.

Data from `issues/merge-attempts.jsonl` (241 attempts, 2026-10-10T13:37Z to 2026-10-18T07:54Z):

- **Multi-member stacks:** 32 stacks had more than one member. 31 went red and 1 merged (fork-terminal-stop with 2 members). Only 4 of 143 merges ever carried members.
- **Stack sizes:** usually 10-18 members. The counts were 16 members ×7, 17 ×5, 15 ×4, 13 ×3, 10 ×3, and smaller sizes less often.
- **Time spent on stacks:** 137 minutes in total, ranging from 2 to 15 minutes each. After every red stack the turn falls back to a solo attempt (`members: []`).
- **Solo attempts:** 201 attempts and 139 merges. A solo merge takes about 13 minutes, and 27 minutes under load.
- **Culprit:** the `culprit` field was never set on any red stack.
- **Outcomes overall:** merged 143, red 79, ejected 14, held 5, reuse 1.

Recent turns show the pattern (start, holder, member count, outcome, minutes):

```
05:43 landing-composition  11 red 2  -> 05:46 solo merged 13
06:00 dilutor-liveness     10 red 2  -> 06:02 solo red 14
06:36 extracted-entries    10 red 2  -> 06:38 solo red 2
06:58 inventory-projection 10 red 14 -> 07:12 solo merged 27
```

## Location

The merge turn, in installed release `~/.akrogon/releases/9e0df5b049fdcbe71bdd85d55e28d2955f9c2595`:

- `src/batch.ts:85-108`, `pickMembers`: every waiting leaf behind the holder becomes a member, with no size limit.
- `src/attempts.ts:59-68`, `redMemberHeads`: it skips member heads only when they were red on the same `built_on`.
- `src/next.ts:1100-1140`: the stack is applied, otherwise the turn falls back to `members: []`.
- `src/turn.ts:82`, `mergeQueue`.

## Reproduction

Keep 10 or more leaves in `merge` at once while some of them are red against current main. Each turn stacks all of them, the stack goes red, and the turn retries the holder solo. This is seen on nearly every turn since 2026-10-10.

## Expected behavior

Stacking speeds up the queue: green waiting leaves land together with the holder instead of one at a time.

## Urgency

The queue takes hours to drain (11 queued leaves is roughly 3-4 hours). Dependents wait on unmerged prerequisites the whole time, and each turn adds 2-15 minutes of host load for a stack that almost never lands. No workaround is known other than keeping fewer leaves in `merge` at once.

## Suspected cause

Supported hypothesis:

- **Main condition:** `pickMembers` puts every waiting leaf into the stack (`batch.ts:92-106`), so a single red or conflicting member fails all 10-18 of them. With red outcomes this common (79 of 241 attempts), a stack of that size is almost always red.
- **Contributing conditions:**
  - A red stack names no culprit (0 of 32), so its members are not told apart.
  - `redMemberHeads` excludes heads only for the same `built_on` (`attempts.ts:62-66`). After each merge the base moves, so the same red members are stacked again on the next turn.
- **Not established:** how many of the 2-minute reds are stack build conflicts (`buildStack` rebase failure, `batch.ts` `ok: false`) rather than verify failures.

Whose view: agent. The reporter saw the slow queue.

Files read: the lines above in the installed release. This is not the akrogon source checkout, and its match to `/home/ivan/Work/infra/akrogon` HEAD was not checked. Also read `issues/merge-attempts.jsonl` and `issues/log.jsonl` in the framework repo.

Not inspected:
- Verify logs of the red stacks, to find which members failed.
- `buildStack` beyond the holder rebase.
- `mergeQueue` ordering.

Related reports:
- Tamdoma/akrogon#69 (closed): heavy check load bounced leaves at merge. Load may add to the red rate, but that is a different defect.
- Tamdoma/akrogon#88 (closed): parallel full suites overloaded the host. Different defect.
- Searched Tamdoma/akrogon, all states, limit 8, with "merge stack red", "batch members bisect", "merge queue slow" and "pickMembers".

## Agent findings

Opening map merged with attribution: issues/chart/paid-proof-bounds/slots/map-merged.md, sections for #104.
