# Signposts: autopilot-needs-and-test-isolation

Original for the door session opened 2026-11-09T09:05:16Z in door t15 (chart autopilot-needs-and-test-isolation). Full autopilot: A answers. Angles merged from slots/signposts-A.md, slots/signposts-B.md, slots/signposts-C.md. Proposed answers from the latest earlier record (issues/chart/herdr-app/forks/signposts.md, 2026-11-06) are carried where they match.

Settled by the operator's words, not asked: full autopilot, lifecycle route, consultants B (codex) and C (pi), the door makes no product change, the three reports are consolidated in this chart. #129's expected behavior is the operator's 2026-11-05 direction: ask every need before charting, at the signposts round at the latest.

## Question

1. Order: which part of the chart is taken first?
   - 1a (recommended, A,B,C) Test reliability (#130, #131) first, then early needs (#129). #131 may reduce to a close, and #130 makes `akrogon verify` reliable for every later leaf, #129's included.
   - 1b Early needs first (largest reported pain).
   - Steers: fork order, which outcome survives a blocker.

2. Cause or limit: when a fix can remove what makes a test slow or wrong, or widen a limit, which wins?
   - 2a (recommended, A,B,C) Remove the cause in the test or its fixture. No raised per-test timeout (233d01ca added 90 s, 75f61f00 reverted it), no product delivery wait changed to satisfy a test.
   - 2b Accept a raised timeout or a narrow product change if smaller.
   - Steers: #130's options, the files a leaf may touch.

3. Reach of a fix: the two reported tests, or the whole class?
   - 3a (recommended, C; B similar) The two reported tests plus the shared boundary they directly imply; other host-dependent tests recorded only. A full sweep is not handed.
   - 3b Sweep the suite for host and load dependence.
   - Steers: leaf count, done-criteria breadth.

4. A report the code already fixed: what finishes it?
   - 4a (recommended, A,B,C) Prove current behavior on main, record the proof, close the identity naming the delivering commit. No regression leaf when the existing test already proves the report.
   - 4b Add a dedicated regression leaf anyway.
   - Steers: whether #131 becomes a leaf.

5. Rule or code for #129: written skill rule or a command check?
   - 5a (recommended, A; prior signpost 1a) Skill text in chart-issues (SKILL.md and its assets), no new command, unless a fork finds a check only code can make.
   - 5b A command that refuses a map while needs are unasked.
   - Steers: #129's leaf shape and proofs.

6. Proof spending this session.
   - 6a (recommended, A,B) No paid calls and no live mutations: every handed report is local tests or skill text. A bounded local load demonstration for #130 at charting is free and allowed (B Q5).
   - 6b Approve a paid budget.
   - Steers: proofs, grants (none expected), needs sheet.

Reply key: `1a 2a 3a 4a 5a 6a`, or numbered free text.

Challenge check: B would accept a narrow product change where it keeps proof strength (B Q2 O2 rejected by B itself); C proposed pushing late asks to the operator by message (C angle 3), which belongs to #129's forks, not the session's limits. No other disagreement.

## Taken

A's picks under full autopilot (2026-11-09T09:20Z, door t15), not operator words: `1a 2a 3a 4a 5a 6a`.

Reasons: 1a by evidence (#131 likely delivered, #130 blocks every verify); 2a by the operator values removing over adding and simplicity, and the prior revert; 3a by the handed list; 4a by evidence and simplicity; 5a by prior signpost 1a (written rules over code); 6a by evidence (nothing handed needs a paid or live call).

Needs sheet for this session (asked here, the last point per the operator's 2026-11-05 words): none. No key, login, file, grant or paid approval is foreseen. Closing a delivered identity is the door's own step under SKILL.md Open.

What the session prioritizes and gives up (A): reliable `test` results and early, visible needs, by removing causes in tests and rules in skill text. It gives up a suite-wide host-dependence sweep and any timeout raise.
