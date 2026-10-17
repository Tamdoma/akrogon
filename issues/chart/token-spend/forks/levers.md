# Which token levers this chart builds

## Question
- Q1 Which levers become leaves? K-reads, K-calls, K-output, K-restore, K-rebuttal, K-floor, K-compact, K-gauge (slots/map-merged.md).
- Q2 Rebuttal session: keep warm rebuttals, or run them in a fresh session reading own notes and merged?
- Q3 How far may transport run inside one script call without A?
- Q4 Who selects a consultant's evidence?
- Q5 Proof standard for every leaf.

### Carries
- Locks L1-L3 (slots/map-brief-common.md), operator words in INTAKE.md.
- door-reset (issues/open/door-handover/door-reset) owns A's drain between handed autopilot charts; attended A resets stay out (door-handover operator scope).

## Findings
- Blind notes: the opening maps answered these questions blind with the same intake and locks (map-A.md, map-B.md Q1-Q4 and V1-V4, map-C.md FK1-FK6); merged in slots/map-merged.md.
- Rebuttals: slots/levers-rebuttal-B.md (F1-F6), slots/levers-rebuttal-C.md (D1-D5).
- Today's A cost per exchange step is not fixed at 1+k: peer-ask already prompts every peer in one call (peer-ask.ts:114-129, questions.md:46); what sits outside is the pre-prompt `herdr agent wait` per peer, which A may chain or split (C D2). peer-ask seeds its exchange before the prompt, so a fresh codex session prints null (peer-ask.ts:115, SKILL.md Open) (B F3).
- Proof 2026-10-17, herdr 0.9.1, identity: operator's herdr socket from door pane w8:pNP: `herdr agent wait w8:pSB --timeout 10000 && herdr agent wait w8:pS4 --timeout 10000 && echo idle` printed `idle` (both peers idle, one A call); `herdr agent wait w8:pNP --timeout 1500 && echo SHOULD-NOT-RUN` printed `{"error":{"code":"timeout",...}}`, exit 1, the chained command did not run. Read-only, no cleanup. Limits: does not prove behavior when a pane is missing or herdr is down beyond a non-zero exit.

## Taken
- Q1 (A's, autopilot): 1a. One issue, two parallel leaves. reads (skill text): consultant reading rule by named section over retained content, so unread sections, changed content and content lost to compaction may be read (B F1); after compaction re-read only what the restored context lacks, comparing content and re-reading in full when it changed (B F1, C D3); every pre-prompt idle wait chained before peer-ask in the same shell call, so no prompt is sent unless all waits passed and a timeout reruns the whole chain (C D2, B F2). receipts (scripts): peer-ask's outcome line and peer-restart's state line carry each seat's session as `herdr agent list` shows it after the exchange or start, so seat records need no separate roster read (B F3, K-output). Reason: removes A calls and roster dumps without changing any operator-facing step; text and small code, no new process. Rejected: 1b, fresh rebuttals (L2 unproven, base rate 78/81 rebuttals carry a disagreement), harness trims (operator machine settings, L1), compaction window (no estimate), fork-close usage (adds A calls). Dissent: C keeps fork-close chart-usage as the only in-chart drift detector (C D5); so leaf reads claims only that the rule held during its proof. B leaves the warm-vs-fresh rebuttal trial to fund separately (map-B.md Q2a).
- Q2 (A's, autopilot): 2a. Done-criteria name the absorbed work (pre-prompt wait calls, roster reads), measure distinct model requests and context across every seat on a same-shape chart, and a thinking reviewer checks parity of independent findings, dissent, late corrections and complete records, including a changed-file post-compaction case (B F4, B F5, C D2). Rejected: 2b, a single number hides a dropped rule.
- Q3 (A's): answered by Q1: all idle waits precede any prompt in one chained call; peer-ask unchanged in prompting and collection.
- Q4 (A's): each consultant selects its own evidence under the reading rule; A does not pre-slice (map-B.md Q4a).
- Q5: answered by Q2.
- Q1 amended 2026-10-17 (A's, autopilot, at leaf drafting): reads and receipts become one leaf, lean-exchange. Reason: one live run proves both, and two leaves would double the implementation seats and live-run spend; the skill-text rule for seat records and the script receipts change one contract together. Rejected: two parallel leaves (more implementation spend for no earlier check).
- Proof 2026-10-17, herdr 0.9.1: `herdr agent list` printed the codex w8:pSB session after its first exchange and the pi w8:pS4 session path, matching seats.yaml. Read-only. Limits: no codex session before its first exchange.
- Q1 amended 2026-10-17 at leaf review (A's, autopilot): the post-compaction partial re-read leaves the leaf and goes off route; it saves about 1.45% of A and needs a compaction proof and a content comparison against a restored copy held only in A's context (slots/leaf-review-B.md LR2, slots/leaf-review-C.md D5). Leaf review corrections LR1, LR3, LR4, D1-D4 applied to the leaf draft.
