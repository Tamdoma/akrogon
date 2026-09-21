# Round granularity

## Question

### Q1 · Does one operator round take one fork, with the next fork researched and asked only after the answer?

### Carries
- Operator 2026-09-21 (#27): "Forks are taken one at a time, each in its own full-detail round with its own research ... If there's only one fork for smaller problems, that's okay ... Minimum changes: simplicity, clarity, elegance."
- Lock: no watchers, no new state fields, no widening scope.
- Related: forks/fork-order.md, forks/fog-graduation.md (both moot if the single round stays).

## Findings
- better-than-training · `git show c547564:skills/chart-issues/SKILL.md` lines 226-236, read 2026-09-21 · one decision per session, dependents unblocked and fog graduated after each answer · this is the rule that was dropped.
- better-than-training · `git show 308d5ed:skills/chart-issues/SKILL.md` line 16 and current `assets/questions.md` line 29, read 2026-09-21 · "Present all currently material questions in one complete round" is the only surviving round rule · with no per-fork sentence, every fork's questions land in one round and the reshape step has nothing left to reshape.
- better-than-training · chart fork counts under `issues/closed/*/chart/forks` and `issues/chart/*/forks`, counted 2026-09-21 · 30 forks over 45 dates before the rewrite, 1 to 2 forks on one date after 2026-09-14 · confirms the reported effect.
- better-than-training · `SKILL.md` Take, B exchange sentence, read 2026-09-21 · B is sent "current Question and carries" per fork · the peer protocol was written for per-fork rounds.

## Taken
Operator 2026-09-21: 1-A. A round takes one fork. The agent picks the next fork, redoes research from the answers so far, asks that fork's questions, records Taken, and reshapes the remaining forks and fog before the next round. A one-fork destination is one round. Reason: every later fork is asked against a settled chart, which is where the old depth came from.

Forecloses: one complete round holding every fork's questions; bundling independent forks into one round to save turns.
