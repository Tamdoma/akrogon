# How one consult runs

## Question

Q1 Trigger and grouping: which failures start a consult, and how do failures that share one cause become one consult?
Q2 Exchange: what does the consultant receive and return, over what path, and where do the files live given the Never rule "Edit `state.yaml`, worktrees or `issues/`"?
Q3 Wait and liveness: with no give-up time (S4), how does the watch wait, learn that an answer or question arrived, and handle a consultant that stops silently, blocks, errors or exits?
Q4 Loop end and disagreement: with no total cap (S5) and the peers equal, what ends consulting on a failure that does not get fixed, and what happens when watch and consultant disagree?
Q5 Queued ticks: while the watch waits in its turn, the timer queues each 20-minute due; drain each after the consult, or change the timer to coalesce?
Q6 Record: where does the operator later read what each consult decided and did?

### Carries

- Locks: forks/seed-decision.md `## Taken`; forks/signposts.md `## Taken` (S1 1a, S2 2b, S3 3a plus, S4 no give-up time and everything over `hc send`, S5 one alive per watch, no total cap, peers equal, S6 6a).
- Related forks: forks/fix-and-resume.md, forks/config-and-naming.md (open).
- Map: slots/map-merged.md section 1.

## Findings

- Notes: slots/consult-loop-A.md, -b.md, -c.md; merged slots/consult-loop-merged.md; rebuttals -rebuttal-b.md, -rebuttal-c.md; proposed shape slots/consult-loop-final-shape.md; checks -final-check-b/c.md and -final-check-2-b/c.md.
- better-than-training, framework issues/log.jsonl lines 7550-7551 (read 2026-11-21): domain-ready-command went `merge -> check.fix` 11:34:26Z then `check.fix -> failed` 11:35:29Z; the base red reached `failed` through the existing path.
- better-than-training, `hc --skill` Talk, wait, and collect results (read 2026-11-21): a `reason: message` wake's text "arrives as your next input, possibly late; it is not output to fetch".
- observed 2026-11-21 in this door (t126): `hc wait --children any --json` wake JSON carries the sender as `from` (`{"from":"t2z0","reason":"message",...}`).
- better-than-training, src/seat.ts `startConsultant`: without a task it returns the address before `firstTask`/`agyTask`; `agyTask` answers agy's startup trust prompt and delivers the task over `hc send` (B, C final check 2).
- better-than-training, src/log.ts `readLog`: every line of issues/log.jsonl is parsed with `logSchema`, so foreign rows break it (C).
- better-than-training, src/phase.ts `commitMove`: a move out of `failed` clears the failure record (B).
- better-than-training, src/config.ts `repoSchema`: `merge_checks` are separate from `checks` (B, C).

## Taken

A's pick under autopilot, 2026-11-21T17:41:05Z. Decided by signposts S1, S3, S4 and S5 and the seed decision; where they are silent, by removing over adding.

1. Trigger: a consult starts only for a leaf in `phase=failed` that the Judge today only notifies on (human prerequisite or defect class, `failed=unknown`, recovery cap). No trigger on `merge -> check.fix` bounces (S1; log evidence above). Rejected: check.fix bounce trigger (needs a threshold with no source). Standing dissent B, C: a base red may churn check.fix passes before `failed`.
2. Grouping: one case per root cause. The watch picks an anchor leaf (an unblocked leaf first, never one whose `blocked=` prerequisite is failed); the case attaches other failed leaves when the peers explain how the same defect caused each; grouping and reason are recorded in the case (model choice, no text match). After a fix the watch re-observes; a leaf still red stays in the same case unless the peers find a different cause, which opens a new case. Rejected: watch-side string matching; one case holding every failed leaf.
3. Case folder outside the watched repo: `<globalHome>/watch/<repo>/consults/<case-id>/`. `brief.md` holds the literal watcher address, case ID, anchor and attached leaves with observe lines and paths (state.yaml, brief, design, review-B.md, worktree, verify log), the S3 stop list and the locks; never `.env` values. Open for the plan: whether `globalHome` can resolve inside a git checkout (toolRoot fallback); the folder must sit outside the watched repo.
4. Exchange: the consultant is started through the existing start path with its first task pointing at `brief.md` (keeps the 60 s start proof and agy's trust-prompt handling in `agyTask`); every later message either way is `hc send`. A's reading of two locks: the seed decision says "the way chart-issues talks to its consultants", and chart-issues starts a consultant with its first ask as the start task; S4's "everything goes through hc send" covers the exchange after start. Standing dissent B (final check 1 F1): S4 wants the first ask over `hc send` too. Files are fixed in advance: the consultant writes `turn-<n>-consultant.md`, the watch writes `turn-<n>-watch.md`, n from 1, each written before its `hc send`; the sender comes from the wake JSON `from` field.
5. Wait: in-turn `hc wait --children any --timeout 180 --json` loop with no give-up time; child state read only from the wait JSON, never `hc get` on the consultant between waits. A wake from the consultant reads the next expected turn file. A wake carrying operator words (no consultant sender) is the operator's: it is handled first and wins, an explicit stop included. Any other wake is recorded and ignored. A standalone `<hc from=...>` turn arriving after the turn ended, for a turn already read or a closed case, is recorded and ignored with no check and no new case (`## Invocations`).
6. Liveness: a silent stop gets one nudge naming the missing file. A second silent stop, an error, an exit or `blocked` (its dialog is never answered, no `--force`) closes that consultant (`hc kill` + `hc rm`, screen saved to the case). Before a replacement, the watch reconciles the worktree, the remote tip and the leaf states and records what was already done; the replacement's brief carries it. One replacement per case per tick; a failing replacement leaves the case open, the next tick starts a fresh consultant on it, and one non-attention `akrogon notice` per case says so. `--attention` only when the evidence shows an S3 need.
7. Stop mid-case: the timer's exit in the wait JSON or the operator's stop words end the case work: the consultant is closed first, then the remote tip and leaf states are read and recorded; no successor starts. A replacement starts only while the timer child is live in the wait JSON; `stop.ts` ends the timer before the consultant (sweep owned by config-and-naming).
8. Loop end: a case ends on a verified fix, an S3 stop, or no permitted check left. A disagreement is settled by the smallest permitted check that tells the two predictions apart; with none left, both views are recorded, the leaf stays `failed`, and a non-attention notice names the case. A closed case stores its signature (anchor `failure.cause@phase` or `unknown`, failing command, base SHA, each leaf HEAD); no new case opens while the signature is unchanged (mechanical); after a change the watch judges whether it bears on the recorded blocker and records the reason. A leaf that leaves `failed` by the operator's action closes its case as resumed.
9. A fix stands when the failing command itself, the repo's `checks` and its `merge_checks` pass on the fix tree, the push is fast-forward, and no S3 stop is crossed.
10. Queued ticks: `timer.ts` `poll` keeps any sent due and at most one unsent due, updated to the latest number, while the watcher works; `tick.ts` unchanged since it accepts a higher due. Rejected (A's first note): drain every due (a long consult would release a burst of redundant paid check turns, B, C).
11. Record: the case folder is the record (`case.md` for people, signature and status machine-readable beside it), opened before any work is authorized and reconciled on restart; its path is in the watch reply; a non-attention `akrogon notice` on each push to main or leaf move, attention only for S3 stops; never rows in `issues/log.jsonl`; case folders are kept.

Pitfalls avoided, binding: name of the record outside `issues/` (item 3); late message text (items 4, 5); `hc get` swallowing news (item 5); outage burning launches (item 6: one replacement per tick); a repeated push after a replacement (item 6 reconcile); an infinite consult loop (item 8 signature gate); a fix proven only by `checks` (item 9); tick bursts (item 10).
