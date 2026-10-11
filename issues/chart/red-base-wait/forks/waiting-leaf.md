# Waiting leaf

## Question
Q1. When a leaf in implement, check.review or check.fix proves main red on a command (both runs complete, per skills/implement-issue/SKILL.md:38, skills/check-issue/SKILL.md:63), what does that leaf become, and what shared record is written?
Q2. While that record stands, what does another leaf do when its own run of the same command goes red on the same base?
Q3. How are two different red commands on main at once recorded and announced?

### Carries
- Merge-only hold exists: `--red-on-base` writes `held.yaml` {sha, command, holder, attempt, at, evidence, fix?}, one notice, merge turn skips while main content equals the held sha (src/phase.ts:844-877, src/hold.ts:10-17, src/next.ts:1044-1072).
- Lesson: learnings/history/2026-10-10-red-main-hold-stale-clear.md (revalidate under the lock before clearing).
- Locks: no clocks/polls/watchdogs (seat-stall-detection); repo-pause is not a health hold; no general check cache (check-reruns).

## Findings
- (A,B) Mechanism confirmed, see slots/map-merged.md M1-M2, M9.
- Practitioner (Mozilla sheriffs, https://wiki.mozilla.org/Sheriffing/Deciding_To_Close_A_Tree, read 2026-10-10): a broken main closes the tree once for everyone, communicated once; reopening needs the problem shown resolved. Chromium sheriff doc (https://chromium.googlesource.com/chromium/src/+/refs/tags/112.0.5598.1/docs/sheriff.md, read 2026-10-10): "when the tree is closed nobody can make progress", so closure is kept narrow (non-closing builders for infra noise). Closure blocks landing, not local work.

- Merged notes: slots/waiting-leaf-merged.md (A: waiting-leaf-A.md, B: waiting-leaf-B.md, rebuttal: waiting-leaf-rebuttal-B.md). Q1 differs: A failed+cause `held`, B phase-preserving typed wait. Q2, Q3 agreed (A,B).

### Operator reply 2026-10-10 (verbatim)
"1 - I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main? What is the systemic angle that we can take that completely negates this type of an error, if any? | 2a | 3a | Question: What actually happened today? What broke on the main, that all the others are screaming about."
- Q1: 1a (failed + cause held) rejected: state must show exactly what is. Q1 otherwise open; operator asks why a leaf must wait at all.
- Q2 2a and Q3 3a chosen, held as partial answers: both assume leaves wait, so they are re-confirmed if Q1 removes waiting.

### What broke on framework main 5cb74c3c6 (better-than-training, consumer reports read 2026-10-10)
- C8 (`hooks:selftest`, video-intake-optimizer.test.ts) was not a defect in main's code. The test hides `node_modules/ffmpeg-static`, but leaf and base worktrees sit inside the main checkout (`issues/worktrees/<slug>`), so Bun's module lookup walks up into the main checkout's `node_modules` and still finds it. Green at the same SHA outside the checkout tree (cheap-checks report.md:44, spawn-deadlines report.md:17-20). Two leaves fixed it independently (spawn-deadlines ac0349c33, page-measure-full-id B repair ffaa233f4).
- motion-probe was a real test defect: headless Chrome hides the tab, IntersectionObserver stops, the probe reads stale state (page-measure-full-id report.md:11,49). Fixed in that leaf (4584cf7cb).
- Akrogon cause behind C8: `worktree_root: issues/worktrees` places every leaf worktree inside the registered checkout, so tools that search parent folders (Node/Bun module lookup, config files) read the main checkout's files.

### Systemic angle (A, pending B)
- Practitioner: Chromium CQ (https://chromium.googlesource.com/chromium/src/+/master/docs/infra/cq.md, read 2026-10-10): failing suites are rerun without the patch; "If the retry fails, then the fail is ignored, as it's assumed that the test is broken/flaky on tip of tree"; the build fails only for tests that "passed in '(without patch)'". A change is judged by what it breaks, not by whether main is green.
- Applied here: a check red on base and not caused by the diff is recorded on the leaf as known-red-on-base and the leaf continues (review, merge). Nothing waits, so no wait state, no recovery and no stale base-red evidence to reuse (#77 class gone). The red itself gets one notice and one owner (3a).

### Operator reply 2026-10-10 (verbatim, to the reshaped round)
"1a | 2a |"
- 1a: a leaf is blocked only by failures it introduces (tests that pass without its change); a check already red on base and not caused by the diff is recorded on the leaf and the leaf continues. Compared per failing test, not per command exit.
- 2a: add a fork for moving leaf worktrees outside the registered checkout.
- B focused final-shape check: slots/waiting-leaf-final-check-B.md (F1-F6 accepted into Taken and the reshaped forks).
- Correction (B F3): the Systemic angle line "#77 class gone" is wrong. Reused base evidence now decides acceptance, so freshness matters more; carried to base-evidence-reuse.

## Taken
Operator, 2026-10-10: "1 - I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main? ..." then "1a | 2a |" on the reshaped round, earlier "2a | 3a" on Q2/Q3.

Decision: a pre-merge leaf never stops, waits or fails because main is red. A red check with no cause in the diff gets one without-change run; failures present on both sides are recorded on the leaf as known-red-on-base and the leaf continues. Attribution is per failing test, not per command exit.
Reason: the wait/stop rule itself produced #76 (each leaf stops) and #77 (recovery reuses stale evidence); judging a change by what it breaks removes the wait state entirely (Chromium CQ practice, used as this system's own policy, not a copy of Chromium's full policy).
Binding boundaries (B final check):
- This rule only attributes completed check failures. Done-criteria proof, review Fixes, missing credentials and incomplete verification still block (F1).
- Unexecuted, renamed, absent or unparseable base tests are never treated as passing or known-red; crashes, build errors, setup failures and interrupted runs need explicit outcomes; unresolved attribution defaults to unverified (F2).
- "Without change" names the exact counterpart revision and equivalent conditions; leaf base, fetched main and merge stack parent are different proofs (F4).
- Removing the #67 merge hold is a separate operator decision in merge-gate (F5).
Partial answers carried: Q2 2a becomes a proposed reuse of a recorded red base result, with freshness unsettled (base-evidence-reuse). Q3 3a (one record, one notice per newly red check, joins silent) carries into red-record with per-test granularity.
Foreclosed: failed + cause held (operator: state must show exactly what is); typed wait state; new held phase; repo-wide freeze.

Note 2026-10-10: carried partial Q2 2a (reuse of a recorded base result) is foreclosed by base-evidence-reuse Taken (no reuse).

