# Slot A territory map (written before reading B and C)

## #99
- Restart boundary: the seed says "each door open", but the measured growth is across charts inside one pass. Restarting at each chart start also gives B and C one session per chart, so #100's per-chart attribution for consultants becomes exact by construction. Cost: no cross-chart memory, which blind briefs do not rely on (questions.md:48, self-contained briefs).
- Restart mechanism: two forms keep the operator's "no short messages" reason. (a) close pane, split, agent start (operator's words, tested). (b) end the agent process in the same pane (`herdr pane process-info --pane <id>` gives the pid and argv), then `herdr agent start` in the same pane: pane id and layout stay, so the peer-panes lock (never move supplied panes) is untouched. (b) is untested.
- Launch args: `herdr pane process-info` argv gives the args to restart with (tested: codex and pi had none).
- Codex first exchange after a start has no session or boundary (peer-ask.ts:66-75), so a missing return file waits out the budget (peer-wait.ts:188).
- herdr agent names must be lowercase (restart test).
- Lesson LESSONS.md:12: a changed skill rule needs a grep of docs/ (docs/guide/chart.md describes seats and peers).

## #100
- One `opened` per chart cannot separate charts that share a pass; the shared opening map belongs to no single chart.
- pi assistant messages carry `usage {input, output, cacheRead, cacheWrite, totalTokens}` per call; seats.yaml records pi's session as an absolute path.
- The operator's per-call comparison is robust to the window bug: average context per call barely moves when the window is too wide, totals do.
- Calls and average context per call are not printed today for any harness.

## Off route candidate
- A's own context was the largest cost in the 10-17 pass (141 calls at ~146k). Fresh A is operator practice (/clear or new pane) and not in either issue.

## Dependency
Independent. The savings comparison uses this pass's charts, whose consultants were restarted by hand before the pass.
