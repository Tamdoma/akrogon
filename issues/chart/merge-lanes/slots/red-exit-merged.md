# red-exit merged notes

Sources: red-exit-A.md, red-exit-B.md, red-exit-C.md (2026-11-21).

## Q1 where the red leaf goes

- `merge -> check.repair`, batch cleared, red attempt recorded (A,B,C). Reason: existing B phase with exits `merge`, `check.fix`, `failed` (`src/routing.ts` `routing`); the leaf leaves `mergeQueue`, so queue, holder guard, dispatch and status need no new state (A,B,C); in `check.repair` `akrogon verify` is leaf scope and `--attempt` refuses (`src/verify.ts` `verify`, `verifyCaller`), so no merge suite can start from the seat's own paths (A,B,C).
- A small exit record on the leaf (why it left: red with run id, gate with refusal, conflict with base) replaces `batch.wake`, `batch.red`, `batch.refusal` and `owner: 'seat'`, carried in `promptFor`, cleared on leaving `check.repair` (B,C).
- Rejected: a mark inside `merge` (every merge consumer branches on it) (A,B,C); straight to `check.fix` (A wakes on 43 flakes a week, token cost grows) (A,B,C).
- Removes D1 (seat-run push racing a wake) and D2 (line stalled on a lost seat) by construction, since no seat-owned batch remains (A,B,C).

## Q2 which hand-offs leave

- Every hand-off that needs a seat leaves to `check.repair`: red verify, gate refusal, rebase conflict, dirty worktree (A,B,C). No seat is prompted for a leaf in `merge` (B).
- Push: differs. A: a push error also goes to `check.repair`. B: push errors and refused pushes stay with the command; the next wake relaunches land, the receipt is reused, a notice goes out. C: a non-fast-forward refusal is restacked by the command as today and a second one re-queues the leaf (batch cleared, stays in `merge`); any other push error (auth, network, hook) moves to `failed` with git's stderr.
- Solo rebase text moves from merge-issue to the check.repair text (A,B,C).

## Q3 off-line retest

- No full suite off the line; B judges from the kept log and the leaf's diff and may run the narrowest failing command through `akrogon run-check` (refuses `merge_checks`, `src/run-check.ts`) (A,B,C). Flake vs cause is B's judgment (A,B,C).
- Rejected: seatless requeue for `akrogon flaky` tests: catches 11 of 43 flakes and would have requeued 3 real reds (B,C).
- `akrogon flaky` goes blind under 5a: `flips` needs red then green on the same tree, and the retest runs on a rebased tree (B).
- Repos whose full suite sits in `checks` (akrogon, lingua-relay, clinique-la-roya, others): `check.repair -> merge` needs a green leaf receipt, which runs that full suite off the line; skip the receipt when HEAD equals the evicted top (no edits in `check.repair`) (C).
- `akrogon verify --holder` from the repo checkout still runs merge scope beside the line; one framework `full: [verify]` line would close it with existing code (B).

## Q4 return place

- Differs. A: keep the stamp on a `check.repair` return, new stamp after `check.fix`; bound by "second red in one merge entry goes `check.fix`". B: keep the first stamp on the first return to merge whatever the path, new stamp from the second return on; counted from `log.jsonl`, no new state; first-run green is 54% on first entry, 60% on second, 43% on third or later. C: keep the stamp only on a `check.repair` return, up to 2 kept returns, a `merge_returns` counter reset on `check.fix`.
- All: the 2026-10-05 reason for a new stamp (never insert into a recorded batch) lapsed with 6e7a33ff; back of the queue costs depth times 22 min; an unbounded kept place lets a repeat failer alternate at the head (A,B,C).

## Q5 main-red

- The land run accepts a red from the ledger in the first turn, no rerun, no base run, no seat, when every failing unit is a named test title (never `(script)`, `(unnamed)`, `(no test name)`, `(log gone)`) that is an unresolved red on main at or before the head's merge-base (A,B,C). Bar unchanged from base-red forks/red-base-policy.md (A,B,C).
- Resolution: B: no fully green run landed on main since. C: per unit, any later landed-main run that passes the command or fails it without that unit; also exclude `flakyLines` titles; whole-command green rarely happens on main, so B's rule would leave flaky covers open for days.
- First observation of a new main red: A: B returns the leaf with a known-red request and its next turn runs the base suite in the line. B: when a returning leaf fails a named unit that its previous exit run also failed, the land run runs the base pass in that turn (existing known-red branch of `verify`), no new state. C: either two distinct leaves fail the same uncovered title, or B marks suspected base red.
- Accepted cost: a new break inside an already-red test can land (A,B,C). A nameless main red has no automatic cover and waits for main's repair (B).
- C: show active covers in `akrogon status`.

## Other

- Gates that need no receipt could run before verify (B); out of this fork.
- `failed-merge-resume` touches the same batch code; build on it after it lands (A,B,C).
