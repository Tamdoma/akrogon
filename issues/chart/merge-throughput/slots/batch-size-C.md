# Fork notes: batch-size, slot C (blind)

Code cites are origin/main at 2e78945. Log numbers computed 2026-10-10 from `tamdoma/framework/issues/log.jsonl` (last record 01:38 UTC). Simulation numbers are from a scratch script this pass, assumptions listed under Evidence.

## 1. Why 2, and what sets the size

"2" comes from maximizing n·p^n, leaves landed per green run: the peak is n = 1/ln(1/p), 2.1 at p=0.62, 3.5 at 0.75, 6.6 at 0.86. That formula ignores what a red run costs, and the red handling is where the throughput goes. With today's red handling (halve, holder stays, no culprit named) a batch of 2 at p=0.62 lands 0.48 leaves per run against 0.62 for no batching at all; today's whole-queue first batch lands 0.14. first-package 2a (start 2, halve, no growth) collapses to 1 and lands exactly what solo lands. An AIMD rule (+1 on green, halve on red, cap 8) only beats solo above p≈0.8. Framework p since batching began (10-08 22:15) is 0.62 on 10-08 and 0.64 on 10-09 by merge exits (27 merged of 42 exits, 15 bounces), not the 0.86 that #68 reports for 10-09. So at today's pass rate no size rule wins: neither p, queue length, nor a control rule fixes the size as long as a red batch throws away every green member's run.

Change the red handling and the size stops mattering. If a red run ejects the one culprit and reruns the rest, simulated leaves per run at p=0.62 is 0.87 with AIMD and 1.56 with the whole queue, at p=0.86 it is 2.9 and 5.4. Bigger is then always better, bounded only by conflict risk and the length of one wasted run.

## 2. Loops

- R3 reinforcing, queue length sets batch size: an undefined limit takes the whole queue (`src/next.ts:1017-1020`), the limit dies when the holder leaves `merge` (`src/phase.ts:154`), so every new holder restarts at the full queue. Longer queue, bigger batch, p^n smaller, nothing lands, queue longer. Seed 62's 7-leaf conflict wave on 10-08 is this loop with DRIFT added.
- R2' reinforcing, holder in every red run: the split keeps the holder and the first half of the members (`src/phase.ts:788-798`). When the holder is the culprit every halving is red, log2(n)+1 runs are wasted at 11-35 min each, and the queue grows through all of them. Green groups in the log since 10-08 22:15 are size 1 (18), 2 (3), 3 (1): the batches that reached green were nearly all already halved to nothing.
- B-halve balancing on the wrong target: `limit = floor(members/2)` (`src/phase.ts:795`) aims at "a smaller next run", not "find the culprit". It discards green members' evidence, keeps the one leaf guaranteed to be in every red run, and has no counter-step on green, so its fixed point is 1 (first-package 2a made this permanent and per repo).
- B-solo balancing on the wrong target: a conflict marks the member `solo: true` for good (`src/next.ts:1179-1181`), shrinking batches to protect the stack build, not to land leaves; first-package 2a's clear-after-clean-run is the fix and is kept.
- B1 `max_active` balances seat load (`src/config.ts:25`, framework 20), not turn capacity; the queue it feeds is the stock R3 reads. Not this fork, noted so nobody tunes batch size to absorb it.
- Back-of-queue on bounce (`src/phase.ts:152`) is fine once a bounce means "this leaf was the culprit"; it is wrong today only because the holder bounces for any member's defect.

## 3. Smallest change

Pick: eject the culprit, no size tuning. The red ending becomes `akrogon phase <slug> check.fix --slot B --attempt <id> --culprit <member-or-holder-slug>` (`--red-on-base` stays the other ending, checked first per red-main-hold). The command refuses a stale attempt (`src/phase.ts:781-784`) and a slug not in the batch, moves only the culprit to `check.fix` through `transition` (new stamp, counts under bounce-counting 1a), restores the other members and the holder to their saved heads with the existing `restoreMembers`/`restoreHolder` (`src/phase.ts:790-794`), clears the batch record and leaves `batch_limit` alone. `mergeTurn` then builds a fresh stack from the remaining queue through `src/next.ts:1008-1042` with no new restack code; if the holder was the culprit the next leaf is holder. When B cannot name a member, the culprit is the holder: its `check.fix` reruns the exact rejected command in its own seat (first-package 1a), off the turn, and a green rerun returns it to `merge` with evidence.
Size: batch = whole eligible queue up to a per-repo `batch_limit` in `issues/config.yaml` (default 8), halving removed, state key `batch_limit` dropped. The cap bounds one wasted run and the conflict count per build, nothing else.
Reason: one run per red leaf instead of one run per halving; sim 1.56 vs 0.48 leaves per run at today's p. Cost: one flag, one config key, one skill paragraph at merge-issue:65, one attempt-records outcome (`ejected <slug>` instead of `split`). B's naming can be wrong (pitfall P1).
Rejected: halve-keep-holder (current, reason above). Bisect by the command (rerun first half): mechanical but spends log2(n) full turn runs on identification that B's failing output usually gives for free, and still needs an ending for "half green, half red". AIMD size rule alone: below solo until p>0.8, and it tunes the symptom. Per-leaf prior pass rate: needs attempt records that do not exist yet; revisit with attempt-records data if ejection proves not enough.

## Evidence

- primary, code 2e78945: `src/next.ts:1017-1020, 1179-1181`; `src/phase.ts:152-154, 781-798`; `src/batch.ts:42-76` (members stacked in order, holder on top, so the holder is never a prefix); `src/config.ts:25`.
- primary, framework log, computed 2026-10-10: since 10-08 22:15, 42 merge exits, 27 merged, 15 bounces; green rate by day 0.62 (10-08), 0.64 (10-09); green groups by size 1:18, 2:3, 3:1; at most 0.73 leaves per run (red batches never `logMove`, so real is lower).
- model, scratch simulation this pass: 20k leaves, each green with probability p independent of the others, one run per attempt, every run equal length, culprit named correctly on first try, queue never empty. Perfect naming is the optimistic assumption; a wrong name costs one extra run and one unfair bounce.
- practitioner: GitHub merge queue removes only the failing PR and re-tests the rest (docs.github.com managing-a-merge-queue, read 2026-10-09); Zuul gating window +1 on success, halve on failure, and re-tests changes behind a failure (zuul-ci.org gating.html, read 2026-10-09); RFC 5681 s3.1 AIMD. Both systems identify the culprit per change; neither halves and keeps a fixed member.

## Pitfalls

- P1 B names the wrong member: one more red run, the green leaf spends a `fix_rounds` on a bounce (bounce-counting 1a) and a 0.34 h check.fix cycle off the turn. Removed by first-package 1a: the ejected leaf's seat reruns the exact command, green returns it to `merge`.
- P2 red caused by two members together, each green alone: eject one, the other lands, the ejected one is red on the new main at its next turn, which is now its real defect. Nothing to remove.
- P3 red main mistaken for a culprit: removed by order in the skill, base comparison and `--red-on-base` first (red-main-hold Taken).
- P4 large stacks conflict more and mark `solo`: bounded by the cap and by 2a's solo clear after a clean run.
- P5 old `batch_limit` state keys on leaves: `readState` drops unknown keys (`src/state.ts:104`).
- P6 long-running `next`/`phase` processes keep halving code: operator restart at handoff (carried).

## Questions the fork does not ask

- Q2 should the holder sit at the bottom of the stack instead of the top (`src/batch.ts:66-72`), so the holder's own change is tested as the first prefix? With ejection it does not matter; without it, bottom would at least make "holder alone" a prefix of every stack.
- Q3 does an ejected member that was green-by-reuse keep its reuse evidence? Pick: no, `transition` resets as for any bounce.
- Q4 what does `akrogon status` show for a culprit while the rest rebuilds? Pick: the ordinary `check.fix` line; the attempt record names it.
