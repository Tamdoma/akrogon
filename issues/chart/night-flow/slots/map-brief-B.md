# Opening map brief: the night's stalls, blocks and failures

You are a chart-issues peer. Map this territory independently and blind (you will not see the other slots' maps until all are done). Read only. Do not run `akrogon next`, `akrogon phase`, `akrogon unhold`, `akrogon sync` or any other command that changes state, do not edit any file except your return file, and do not open or print `.env` files.

## Operator note, verbatim (2026-10-11)

> I just pulled more issues from the repos that made this night miserable when it comes to merging. Why were all these things stalled, blocked and failed. Please do a deep systems thinking analysis (stock and flow problems, reinforcing and balancing feedback loop problems, sensor and target problems, etc) along with slot b and slot c which are active panes in your herdr tab. We need to make sure things are moving and are automated without having failed issues or stopped processes for me in the morning. I only need the most elegant solutions that are holistic, that will simplify things and make them move much faster. Has anything we have merged in the last 48 hours worsen the whole situation?

Standing operator preferences from earlier sessions: "I don't want more complexity." No manual operator work, prefer systemic fixes. A fix that deletes machinery beats one that adds a guard.

## Intake (new, unverified reports)

/home/ivan/Work/infra/akrogon/issues/seeds/79-a-leaf-s-live-proof-rig-needs-no-fast.md
/home/ivan/Work/infra/akrogon/issues/seeds/80-self-update-skips-with-diverged-from.md
/home/ivan/Work/infra/akrogon/issues/seeds/81-copyfile-install-failed-at-check-fix.md
/home/ivan/Work/infra/akrogon/issues/seeds/82-fix-round-cap-sends-a-leaf-to-failed.md
/home/ivan/Work/infra/akrogon/issues/seeds/83-a-check-repair-finding-that-rests-on-a.md
/home/ivan/Work/infra/akrogon/issues/seeds/84-a-failed-leaf-sits-unnoticed-overnight.md
/home/ivan/Work/infra/akrogon/issues/seeds/85-recovering-a-leaf-at-the-fix-round-cap.md

Context only, already charted and handed off (do not re-chart, but count them in the analysis): #76 and #77 (`issues/seeds/76-*.md`, `77-*.md`), owned by `/home/ivan/Work/infra/akrogon/issues/chart/red-base-wait/` (CHART.md and forks/*.md Taken sections are locks: no leaf waits on a red main, per-test comparison, the repo hold and hold-fix/unhold are retired). Its leaves are in `/home/ivan/Work/infra/akrogon/issues/open/red-base-wait/`.

## Live surfaces

- Live state: `akrogon status` run in `/home/ivan/Work/infra/akrogon` and in `/home/ivan/Work/infra/tamdoma/framework` (read only). At 05:37Z framework shows `(held)`, four leaves at `merge` for 13m to 450m, and `copyfile-install` failed with "akrogon guard ancestors red on base 35bd4ce…". akrogon shows `leaf-env-file` in check.fix at fix round 4 with three leaves blocked behind it.
- Phase logs: `/home/ivan/Work/infra/akrogon/issues/log.jsonl`, `/home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl`; merge attempts: `issues/merge-attempts.jsonl` in each repo. Other registered repos are listed by `akrogon config` `repos`; check their logs only if they show activity in the window.
- Leaf records: `issues/open/**` and `issues/closed/**` in both repos (review-B.md, implementation/report.md, plan.md, state.yaml).
- Code and rules: `/home/ivan/Work/infra/akrogon/src/` (phase.ts, next.ts, hold.ts, batch.ts, turn.ts, self-update.ts, sync.ts, guard.ts, run-check.ts, status.ts), `skills/*/SKILL.md`, `docs/guide/phases.md`, `docs/guide/install.md`, `issues/config.yaml` in both repos, `~/.config/akrogon/config.yaml` via `akrogon config`.
- History: `git log origin/main --since='2026-10-09T05:37Z'` in both repos (akrogon has about 131 commits in that window), `learnings/LESSONS.md`, `learnings/history/`, and the earlier charts in `/home/ivan/Work/infra/akrogon/issues/chart/` (many address the same symptoms: merge-throughput, leaf-run-stalls, stuck-seat-recovery, failed-leaf-routing, seat-stall-detection, merge-load-flakes, repo-pause).

Window: the night is roughly 2026-10-10T16:00Z to 2026-10-11T05:37Z. "Last 48 hours" of merges is since 2026-10-09T05:37Z.

## Task

Write a proportional territory map, grounded in what you inspected (path:line or log timestamp for every claim), covering:

1. Ledger: every stall, block and failure in the window across repos, with leaf, time lost, wait cause and evidence. Group by cause class, not by leaf.
2. System structure: the stocks (what piles up), the flows in and out, the reinforcing and balancing loops, the delays, and the sensors and targets (what the system measures, what it aims for, what nobody measures). Name the archetype when one fits, and say which loop dominated last night.
3. The 48-hour question: which merged commits made the night worse, each with the mechanism and the observed effect, and which helped. Say plainly if the answer is none.
4. Leverage: the fewest holistic changes that remove whole problem classes and make work flow faster. For each: what it removes, what it deletes or retires (fewer moving parts wins), what it could break or invite later, and how it relates to the red-base-wait locks. Prefer removing a fragile part over guarding it.
5. Right now: what keeps things stopped this morning and the smallest action that gets each moving, marked as an operator action you recommend, not one you take.
6. Material forks the operator must decide, each as a sharp question with options.
7. Practitioner questions and outside sources (practitioner tier first: named people or teams with a track record on flow, feedback loops or CI merge queues), each with the finding and what it changes, or the searches that found nothing stronger.
8. Pitfalls over the work's lifetime and what removes each.

Keep it compact. Mark low-confidence claims.

Return path (write only this file): /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/night/map-B.md
