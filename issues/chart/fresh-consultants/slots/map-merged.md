# Opening map, merged (#99 and #100)

## #99 fresh-consultants
- Restart boundary: once per door leaves the measured cross-chart growth (A,B,C). Restart at each chart's start and again when a left chart resumes (B,C); chart start also makes consultant sessions one per chart (A). Before every exchange discards useful in-chart context (B,C).
- Ownership: the peer-panes lock lets the door arrange only panes it created and never move supplied panes (A,B,C). Closing a supplied pane needs explicit authority or must be limited to door-created panes (B,C). In-place restart (end the agent process, `herdr agent start` in the same pane) keeps pane id and layout, untested (A).
- Launch settings: keep seat letter, kind and launch args; `herdr pane process-info` argv gives args (A); lowercase agent names (A,C); never revive a consultant autopilot dropped (B,C); never restart a pane while its exchange is open (C).
- Failure: close/split/start is not atomic; choose drop-and-continue or stop (C).
- First codex turn after a start has no session and no boundary, so a missing return file waits the whole budget (A,B); peer-ask need not change if restart happens before the exchange (C).
- Seat record: a restart changes pane and session; codex session appears only after the first turn (B,C).
- Lesson LESSONS.md:12: grep docs/ for changed rules (A).

## #100 usage-windows
- One `opened` per chart cannot separate interleaved charts; active spans per chart, summed by the script (B,C). The shared opening map belongs to no single chart (A,B).
- Historical base-red has only `opened`; the fixed script must still read it, labelled legacy (B,C). Historical corrections under issues/ are door work on main, not a leaf (B).
- pi: read the recorded absolute session path (B,C); assistant `usage {input, output, cacheRead, cacheWrite}` per call (A,B,C); compaction, custom and context_edit records are not calls unless decided (B,C).
- Calls and context per call: not printed today (A,B). Claude dedups by message id; codex `input_tokens` already includes cached input, so codex context = input_tokens, Claude/pi context = input + cache read + cache write (B,C). Codex has duplicate cumulative and zero `last_token_usage` events (B).
- Per-call comparison is robust to the window bug, totals are not (A,C). C's recovered pi baseline: 59 calls, ~80.7k context per call (C).
- Savings report informs only; no price or quality claim (B,C, chart-cost proof-of-saving lock).

## Dependency
Independent; shared skill edits are coordination, not blocked-by (A,B,C).

## Off route candidate
- A's own context is the largest cost; fresh A stays operator practice (A).
