# Brief: charting-guide

## What

Write chapter 2, Charting, of the new human guide. It is five pages in docs/guide/:
- `04-a-charting-session.md`: one session start to end, in the c- tab.
- `05-signposts.md`: signposts and the needs sheet.
- `06-charting-mode.md`: No autopilot, Semi-autopilot, Full autopilot.
- `07-build-route.md`: Direct and Lifecycle.
- `08-hand-off.md`: decisions, the hand-off review, and what the charting agent hands off.

docs/README.md gets a Charting section that links them. The pages are written for the reader in the signposts: a somewhat technical agency owner or mid-market operator who runs AI workflows, new to git and to Akrogon. They read as a plain how-to guide with examples. They use only the approved words, and one made-up running example job is carried across all five pages. The old pages stay until guide-chapters retires them.

## Why

The operator charts first and wants this chapter to be the deepest and clearest (signposts 3a). The current docs are too technical and blur the two categories the operator asked to separate. The operator reads this chapter, and its pictures from charting-pictures, before the other chapters are written (signposts 7a).

## Done-criteria

1. docs/guide/04 to 08 exist with the file names above. Each explains its topic in plain words for the stated reader, uses the approved words (Charting mode: No autopilot, Semi-autopilot, Full autopilot; Build route: Direct, Lifecycle; slot A, the builder; slot B, the reviewer; charting agent; consultants; signposts), and carries the same made-up running example job.
2. `06-charting-mode.md` defines Charting mode as who answers the questions while the work is charted, gives each of the three values with one or more example jobs that fit it, and says how the operator turns each on in their own words. `07-build-route.md` defines Build route as who builds the work once every question is answered. Direct is the charting agent building one small, settled change itself (a fast feature as well as a fix), reviewed by the charting agent's first consultant acting as slot B. Lifecycle is written task contracts built by a fresh slot A and slot B. Each comes with example jobs. Both pages state that Direct is offered only under No autopilot.
3. `05-signposts.md` explains what signposts are (ranked priorities, hard limits, the order of the session's charts), when they are asked (once per session, before any map), who answers them in each Charting mode, and the needs sheet (keys, approvals and actions only the operator can give), with an example.
4. Slot B gives a fresh subagent inside its review session only docs/guide/04 to 08 and asks the questions in the design's `## Cold-reader questions`. Every answer matches the expected answer and quotes the line it came from, recorded in slot B's review. A wrong or unsupported answer is a Fix.
5. Every claim about how charting behaves matches skills/chart-issues/ and src/. The report lists each behavior claim with the path that supports it.
6. docs/README.md links all five pages in order, and every link resolves. The destination's `checks` pass, including tests/docs-links.test.ts.
7. Tone is slot B's reading under standing-design's model-choice line: no marketing jargon, no developer jargon left unexplained, at most a sentence of soft selling in a page opener. Slot B records its reading and reason in its review.
