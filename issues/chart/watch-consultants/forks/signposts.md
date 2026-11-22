# Signposts: watch-consultants

Original, held in this chart. Session: door t126, 2026-11-21, autopilot (operator answers signposts, A answers forks).

## Question

Missed angles came from B (slots/signposts-b.md) and C (slots/signposts-c.md). Changes from A's draft: new S1 on which failures trigger a consult, one consult per root cause (B Q7, Q9; C 1); draft Q1/Q2 rebuilt as S2 separating what the consultant may do from what the watch may do, with a fixer option that reaches a red base (B, C); S3 adds host and destructive changes (C); new S4 on waiting while ticks queue (B Q8, C 3); draft Q3/Q4 merged into S5 on caps and cleanup, closing consultants on stop (C); draft Q5 dropped: "skill only" breaks the lock because `globalSchema` is strict (C); S6 proof widened to the hc round trip (C). Recipe-missing behavior (B), audit record (C 5) and config scope (C 4) are fork questions for the map.

1. Which failures start a consult? (a) every case the watch now only notifies on: failed leaf on a human prerequisite or unknown record, recovery cap hit, base red blocking several leaves; one consult per root cause, (b) also busy seats the watch cannot steer (codex, failed steer). Rec a. Steers: Judge routing, launch count.
2. What may the consultant and the watch do with the answer? (a) consultant only advises (may run read-only checks); watch uses its existing verbs plus hands work on (seed, message an open chart door, resume a leaf with `akrogon phase` once a fix is merged), (b) consultant may also fix: edit and commit in a worktree, push a fix to main when the base is red; watch may move leaves out of failed, (c) b plus the watch charts fix leaves itself. Rec b: matches "do everything you can to fix them without asking me". Steers: Never list, blast radius, proofs.
3. What still stops for the operator? (a) credentials or logins, money past a recorded grant, changing an operator decision or lock, host tooling installs or downgrades, force pushes or history rewrites, (b) a plus any change outside the failing leaf's own scope. Rec a. Steers: notice rule.
4. How does the watch wait for an answer? (a) in the tick's own turn with a bounded `hc wait`; later ticks queue and each runs its check after, (b) end the turn; the answer arrives as its own prompt while ticks keep running. Rec a: the timer already queues due ticks. Steers: tick handling, liveness.
5. How are consultants capped and cleaned up? (a) at most one consultant alive per watch, at most 5 consults per watch, each closed once its answer is acted on and all closed on `watch-issues stop`; past the cap the watch notifies, (b) no fixed numbers, the watch decides. Rec a; the numbers are yours to change. Steers: spend, Never list exception for killing consultants.
6. How much live proof? (a) real paid run: a staged hard failure in a throwaway repo, a real consultant answers over `hc send`, the watch acts, (b) free stand-in programs only. Rec a. Steers: needs row N1.

## Taken

Operator, 2026-11-21T17:29:41Z, door t126, verbatim: "1a | 2b | 3a - plus if the patch or fix completely changes what was decided before. | 4 - waits without the time limit. Everything goes through <hc> send mechanism. | 5 - at most one at a time, both the watcher and the helper are equal. No limit on how many total. The goal is to finish as many problems as possible without my babysitting | 6a | n1 yes, n2 yes - by default, set it to agy neon high effort"

Read as (A's reading, the operator may correct it):
- S1 1a: a consult starts for every case the watch now only notifies on (failed on a human prerequisite or unknown record, recovery cap hit, base red blocking several leaves), one consult per root cause.
- S2 2b: the consultant may fix (edit and commit in a worktree, push a fix to main when the base is red); the watch may move leaves out of failed.
- S3 3a plus: the operator stops are credentials or logins, money past a recorded grant, changing an operator decision or lock, host tooling installs or downgrades, force pushes or history rewrites, and a patch or fix that completely changes what was decided before (a leaf's decided brief or design, a chart decision).
- S4: the watch waits for the consultant with no give-up time; every question and answer between watch and consultant travels over `hc send`. A wait may still check in on the consultant's state; it never abandons the consult on time alone.
- S5: at most one consultant alive per watch; no total cap; watch and consultant are peers, neither outranks the other in judging the fix. Goal: finish as many problems as possible without the operator.
- S6 6a: a real paid run in a throwaway repo proves the round trip and the watch acting on the answer.

Account: the session prioritizes autonomy: the watch consults on every hard failure, one consultant at a time with no total cap, and the consultant may fix code and push a base fix to main; it gives up the operator's sight of each fix, keeping only credentials, spend, decision changes, host tooling and history rewrites as stops. Chart order: one chart, nothing dropped.

## Needs

- N1 (supplied 2026-11-21T17:29:41Z, operator: "n1 yes"): grant for paid model launches: real watch and consultant sessions in a throwaway hc session and repo, at charting (prove a consultant round trip from a watching conversation) and for the leaf's live done-criterion; bound proposed: at most 6 sessions at charting and 6 for the leaf, each ending within 15 minutes, existing logged-in accounts, no writes outside the throwaway repo.
- N2 (supplied 2026-11-21T17:29:41Z, operator: "n2 yes - by default, set it to agy neon high effort"): after the leaf lands, the door adds the consultant recipe entry to the real `~/.akrogon/config.yaml` (a live change to the machine config), recipe proposed: codex gpt-6.2-astra high; operator set it to agy neon high.

## Needs finding (2026-11-21T17:57:20Z, slot B leaf review F4)

N1's recorded bound says "no writes outside the throwaway repo". Every real harness launch also writes outside it: the harness's own session record in the operator's home, a folder-trust entry for the run root (codex ~/.codex/config.toml, agy settings.json trustedWorkspaces, claude ~/.claude.json), and the hc core state under ~/.local/state/herdr-core/akr-e2e-watch. The leaf grant cannot cover those under N1 as worded, and A cannot widen a grant. Pending: N1a, the operator's amendment allowing those writes (the trust entries and core state removed after the run, session records kept like any session), or a narrower live criterion.

N1a supplied 2026-11-21T18:06:26Z, operator in door t126, verbatim: "o1 - allow those writes, but then clean it up after the tests are done." Read as (A's reading): the live runs may write harness session records, folder-trust entries and hc core state outside the throwaway repo; after the tests every one of those the runs created is removed, the session records included.

N1b supplied 2026-11-21T21:01:47Z, operator in door t126, verbatim: "q2 o1". O1 as presented: 4 more prompted sessions for watch-consults after the skill closes the consultant before akrogon next, the e2e cell uses the tier stand-in for slots a/b, and the leftover session records of the first 11 sessions are removed. Recorded as grants[1] in the leaf readiness.yaml. The first grant's bound of 6 was crossed at 11 by the leaf (implementation/report.md).
Operator then, verbatim: "you choose the number. You can also change the model slot a to claude code opus 5.5 high for implementation". A chose 4. Slot a set in issues/open/watch-consultants/ISSUE.md; old pi seat A t2zr closed (idle, done).
N1c supplied 2026-11-21T23:17:14Z, operator in door t126, verbatim: "approved all sessions". Read as Q3: 2 more prompted sessions, one try; recorded as grants[2]. Earlier overrun (at least 15 under grants[0]) acknowledged.
