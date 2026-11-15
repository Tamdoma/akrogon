# Territory map, slot A (2026-11-10)

Written before reading slots/map-B.md. Numbers marked "reader" come from Haiku readers run 2026-11-10 (scripts under `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/1160556f-c628-4449-8d45-fa8fb6899642/scratchpad/map/{text,repairs,failed,clarify,tokens,checks}/`); "checked" means A ran the command or read the cited lines itself. Cohort: the 35 akrogon leaves whose first `merged` record is on or after 2026-10-25.

## The system in one picture

- Stocks that only grow: skill text 9,327 → 39,540 words in 8 weeks (+6,566 since 10-24, reader), `src` 2,255 → 13,150 lines, `tests` 21,604 → 42,876 lines and 48 → 120 files since 10-10 (reader), charts 125, the flaky list 129 entries with no removal path (checked `akrogon flaky | wc -l`; reader found no delete in src/flaky.ts).
- Reinforcing loop R1: a failure becomes a chart, the chart adds rule text, tests and code, every seat then carries more text and the suite more surface, which produces the next failure. The only outflow is `learn-issues` for lessons. Nothing removes skill text.
- Balancing loops that work: the second-seat review (64% of its Fixes are real defects, below), same-tree merge reuse (3 merge-phase test runs for the leaves since 11-02, checked), parallel suite (test median 189 s in W43 → 60 s in W46, reader).
- Delays: the operator's answer (75% of answers needed a simpler rewrite first), `failed` waits (p90 241 min), framework's merge turn (up to 11h54m, open-grounding G4).

## Candidates, ranked under 1a (fewer parts, operator time, clock time, tokens)

### W1 · Drop slot A's self-review in check.review (big, removes a part)

- Where: check.review round 0 prompts both A and B (src/routing.ts `routing['check.review'].slots = ['A','B']`, checked). A is the implementer reviewing its own change inside the same session; B is the independent second seat.
- Cost today (reader): 35 A review visits, 479 calls, 64.8M context tokens read (6.8% of the cohort's 952.8M), 410k output. A's reviews produced 24 of 69 Fix rows; several are the same defect B also reported (slow-merge-notice, status-json, tasks-sections-board, one-test-run, cleanup-last-in-pass, fixture-repo-identity). Exact A-only count: follow-up reader pending.
- Change: check.review prompts B only. 2c is kept: the second seat still reviews every change.
- Could break later: a defect only A sees is lost (quick-red-skip: B found no Fix, A found one). The fork needs the A-only rate first.
- Earlier decisions: reviewer-repair (2026-10-02), seat-role-swap. Not yet read for a lock on A's review.

### W2 · State the shared seat rules once (small, removes copies)

- Where: plan-issue, implement-issue, check-issue and merge-issue each restate the grant rule (238, 237, 311, 288 words), the `.env` rule (66 to 78 words each), the command-output rule (80 to 227) and the re-read rule (reader, with line refs). The copies already differ in wording.
- Cost today: about 1,200 words in four drifting near-copies; grant-run-count (2026-11-04) had to change "a family across four skills" for one rule.
- Change: one shared file (like skills/lesson-rule.md) holds each shared rule; each skill keeps only its own tail (record target, fixture sentences).
- Could break later: one more file read per seat; a seat that skips the read misses the rule. No token saving per seat, since each seat reads one copy today.

### W3 · Give the flaky list an outflow (small)

- Where: `akrogon flaky` list, shown at every door open as intake candidates.
- Cost today: 129 entries (checked 2026-11-10), nothing removes one. Each door open reads and reports them.
- Change: an entry leaves when its test no longer exists or was fixed by a landed leaf (to settle in the fork; a time-based expiry would touch the "no clock" decisions).
- Could break later: a real flake drops off the list and returns unseen.

### W4 · Write the question round simply the first time (operator time, small text change)

- Where: chart-issues assets/questions.md, the round register and shape.
- Cost today (reader, charts opened since 2026-10-17, 27 door transcripts): 102 operator answers, 77 (75%) directly after a clarify message; 132 exact `eli`/`elid`/`scr`/`foc`/`ref` messages, 123,472 output tokens of rewrites. The rate did not fall after round-drawings and direction-round landed (W45: 46 alias messages for 39 answers). Observed again in this session.
- Change: the first round is written the way the `elid` rewrite is (same parts, plainer words, "pick this unless" line), so the rewrite is not needed.
- Could break later: a plainer round may drop detail a hard fork needs; the parts stay (2c), only the register changes.
- Earlier decisions: door-cost O6 word caps declined (stays declined; this is register, not a cap).

### W5 · Earlier decision whose facts changed: who may edit tests (operator time)

- Where: implement-issue forbids A some test edits; plan leaves proof machinery to implement.
- New number (checked, `jq 'select(.to=="failed" and .ts>="2026-10-25")' issues/log.jsonl`): 4 of the 15 moves into `failed` since 10-25 name this rule (engine-on-hc "porting them is a test edit implement-issue does not allow A", notices-on-hc "implement, which writes no test", chart-door-on-hc "A may not edit them" twice), plus 3 Fix rows that were stale test expectations passed between seats (reader). Each waited for the operator.
- Under 7a this is listed, not charted. The operator reopens it by name or leaves it.

### W6 · Earlier decision whose facts changed: testing the next leaf while one merges (clock)

- Where: the serial merge turn (akrogon code). merge-stacks 4a deferred speculative testing with a revisit trigger.
- New number (checked 2026-11-09, open-grounding G4): in framework 11 of 19 merged leaves spent over 60% of non-build time waiting for a merge turn, longest 11h54m. Akrogon's own wait is about 1 minute.
- Under 7a this is listed for the operator to reopen by name. Under 6a the change would land in akrogon, but its proof data is framework's.

### W7 · Start implement in a fresh session (big, tokens and clock)

- Where: slot A keeps one session from plan.synthesis into implement and check.fix (src/next.ts dispatch reuses a live seat).
- Cost today (reader, table spot-checked by A): in 31 of 33 leaves the first implement call carries the whole plan conversation, 45k to 438k tokens, about 100k at the median. implement is 40.6% of all context tokens read (952.8M over 6,012 calls). A plan's first call is 8k at the median on pi.
- Change: implement starts a new session that reads plan.md, brief.md and design.md.
- Could break later: implement re-reads code the plan already understood, or misses something the plan knew but did not write down, which shows up as more repairs. This is the candidate for the one paid before/after run (N1).
- Earlier decisions: drop-debate (2026-10-25) made the plan one A synthesis; usage-windows left fresh context for the door's A as operator practice. Neither locks lifecycle seat sessions (to confirm in the fork).

### W8 · Record seat tokens (medium, information flow)

- Where: `akrogon timing` prints durations only; nothing in `src` records token use (open-grounding G9).
- Cost today (reader): 32 prompt events have no session (27 in check.review); 31 of 35 merge windows have no prompt because the merge prompt is recorded under `merged`; every token number in this map needed a one-off script.
- Change: every prompt records its session, and `akrogon timing <slug>` prints calls, context and output per phase with the parsers chart-usage.ts already has.
- Could break later: a new report to keep in step with three transcript formats. It is the measuring base W1 and W7 need to prove themselves (3a).

### W9 · Read the door's mode sections only in that mode (small, tokens)

- Where: chart-issues/SKILL.md.
- Cost today (reader): Direct route, Autopilot and Handover are 3,761 of 8,387 words (45%) and are read by every door session, also a manual single-chart one.
- Change: those three sections move to assets read on entry to that mode. Every step stays (2c).
- Could break later: a door that skips the read misses a mode rule; the text is moved, not removed, so by 1a this ranks low.

### Small defects (one line each)

- S1 `akrogon <verb> --help` prints a stack trace and exits 1; `akrogon --help` exits 1 (src/akrogon.ts strict parseArgs; observed by A on `seat --help`).
- S2 `akrogon timing --flow --since 2026-10-25T00:00:00Z` fails with a ZodError while `--cohort --since` accepts the same value (checked).
- S3 `fix_rounds` does not count check.fix entries that follow a `failed` state (watcher-on-hc and chart-door-on-hc: 3 check.fix entries, counter 1) (reader, low confidence, verify first).
- S4 herdr-panels and tasks-panel have been "Unpacked" since 2026-11-03 and carry the same USAGE table, counted twice in door totals. This is a step on main (`akrogon pack`), not a leaf.
- S5 28 `check_start` events have no `check_end`; two duplicate `visit_start` keys (reader).
- S6 the door's transcript path was unknown at open on 2026-11-09, so that session's usage is unmeasured; cause not found.

## Looked at, no new win

- Check time is 23% of a leaf's elapsed time at the median and 45% at p90 (reader), about 3 test runs per leaf. Earlier charts already cut it (suite-time, suite-repeats). No further cut found that keeps clean-checkout checks.
- The fix loop: 20 of 35 leaves went back, 69 Fix rows: 44 defects, 14 missing test or proof, 6 evidence or format, 5 other (reader). B repaired 49 itself. The review earns its place; the 14 missing-proof rows are the part a cheaper earlier step could catch, and coverage-audit (landed) already targets it, so its effect should be measured before more is added.
- `failed`: 15 moves since 10-25; 8 needed a real operator decision, 6 were test reds under host load (host-safe-tests, handed off 2026-11-09, targets these), 1 was a used-up grant bound (checked).
- The cron watcher (watch-issues, 20-minute cycle) beside the event listener: possibly a part to remove, no cost number yet. Listed, not charted (3a).

## Practitioner questions the map leaves open

- What in the skill text does the command already enforce by refusal? Such prose could leave the skills, which would be the missing outflow for R1. Needs an audit before any number exists.
- Does a fresh implement session raise the repair rate? Only the paid run answers it.
- Is the 75% clarify rate a property of the round shape or of the fork content?

## Proposed split

- Chart 1, small wins, one issue with parallel leaves: S1, S2, S3 (if verified), W3, W2. No dependencies.
- Chart 2, question round register: W4. Skill text only.
- Chart 3, seat tokens: W8 first, then W7 measured with it (real dependency: W7's proof needs W8's record and the paid run cap N1).
- Chart 4, review seats: W1, after the A-only number.
- W9 rides with chart 2 or stays listed.
- W5 and W6 wait for the operator to reopen the earlier decision by name.
- S4 is a step on main the door can run when the operator says so.
