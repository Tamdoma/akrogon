# Merged opening map: #96, #97, #98

Tags name the slots whose own map holds the line.

## Split and order
- Take #98 first, then settle #96 against its outcome. #97 is independent. (A,B)
- Three charts, one per outcome: `base-red` (#98), `loop-counts` (#97), `failed-cause` (#96). (A)
- One chart for the akrogon destination holding three separately checkable outcomes. (B)
- No step on main is established. The clock test repair is already on main in 0dfae20, so no leaf repeats it. (A,B)

## #98 base-red

Evidence
- Incidents: log.jsonl:581,590,591 (10-08), :675,:685 (10-10), :1032,:1033 (10-17). (A,B)
- On 10-17 two lifecycle leaves failed. `checkout` was a direct chart attempt, not a leaf. Three red receipts took 149, 154 and 163 s (verify-runs.jsonl:120-122). (B)
- `verify` reuses any green receipt with the same tree and command list, with no age or environment key (src/verify.ts:63-76, :119). A fresh look at main returns `reuse receipt`. (A,B) This reuse is not shown as the cause of the 10-17 reds, which ran fresh. (B)
- The known-red flow was removed on purpose: dc2e2b0 (10-14) deleted compare, red-record and base-run and added the receipt gates. Restoring it reverses that design and needs an operator choice. (A,B)
- No test-health gate before dispatch. `checkBase` checks Git refs only (src/preflight.ts:62, next.ts:825). (A,B)
- Seed claim that operator direct commits caused decay is not shown. 23bce8b touched only issues/. (A)

Options for Q1, what happens when a leaf meets a red it did not cause
- Keep per-leaf fail and repair. Fewest mechanisms, but keeps the repeated runs and manual resume. (B, listed by A as today)
- Detect once and share: the seat proves the red is on the base with a fresh base verify, one shared incident, affected leaves wait instead of failing on their own, green fresh evidence before they move on. Recommended. (A as a+b, B as O2) Incident identity stays open: same base sha alone is not enough, it also needs the same command set, configuration and failing unit, so different units or environments never clear or exempt each other. (B) Cost: wait and resume rules, and unrelated work can stall while main is red. (B)
- Let proven known-red units through, merge included, with per-unit evidence and one notice. Closest to the earlier operator choice and to Chromium CQ. Lands on a red suite on purpose and needs guards against a new break hiding in an already-red unit. (B)
- Watch-side base check every tick. Rejected for added suite cost per tick and widened watcher scope. (A,B) It reuses an existing tick, so it is not a proven break of the no-new-timers lock. (B)
- Prevention only (clock seam and test rule). Does not cover environment decay, so it pairs with an option above. (A)

Q2, when to spend a base run: only on a persistent red with no plausible cause in the diff, same command set, fresh checkout. Not before every dispatch, not on a timer. (A,B) Coalesce equal in-flight base runs. (B)

Q3, what a receipt proves: base checks always run fresh, gates keep reuse. (A) Separate reused history from a fresh look, drop reuse when newer comparable evidence is red, bind reuse to setup and environment. A time limit alone does not prove present health. (B)

Q4, repair and resume: one repair owner per incident, whose repair is not blocked by the wait it causes. Automatic resume only on fresh passing evidence at existing command events, keeping pause and seat checks. A fix landing or a new main sha alone is not proof. (A,B) Use the existing failed-otherwise recovery path when the shared state is a failure cause. (A)

Q5, clock scope: fix concrete date-rotting assertions. (A,B) Add a rule that expected values do not depend on the run date. (A) Time-relative expectations computed from the observed time are valid, as 0dfae20 does, so clock control versus such expectations stays a choice. (B) A blanket clock freeze would break elapsed-time tests such as sync.test.ts:253. (A,B)

Pitfalls and their removal
- A base run under seat load times out and looks red. Using the configured `akrogon verify` command set and timeout removes a command mismatch (A,B), not a timeout under load, so an incomplete or timed-out run stays unverified and never proves a shared base defect. (B)
- Two seats write or clear one incident at once, or an older pass clears a newer red. Key the record on base sha and generation, compare under its lock. (A,B)
- A leaf's own break hidden as base red. Verify the exact base sha the leaf sits on and require the same failing unit. Same error text is not proof. (A,B)
- Setup failure or interruption read as a test red. Require completed logs and setup exit 0. (B)
- Lifecycle and direct routes must follow the same rule. (B)
- A flaky unit reads as base red. Require a red retry first. (A)

Outside evidence
- Chromium CQ docs, read 2026-10-17: retry in the same configuration, then test without the patch to attribute failures. Bounded build reuse. Its known-red continuation supports landing past known reds. (B)
- Bazel Test Encyclopedia, read 2026-10-17: date and timezone are undeclared inputs. Supports controlling date-dependent expectations. (B)
- Trunk-based practice (Google TAP, Chromium sheriffs) and Fowler on wrapping the clock: model knowledge, not yet searched. (A)

## #96 failed-cause
- Every seat stop becomes `cause: blocked` (src/phase.ts:266-274). No src writer of `attempts` remains, yet next.ts:777-786 reads it. (A) `attempts` still drives dispatch and `blocked` drives dirty-worktree recovery, so keep them distinct. (B)
- Defer until #98 settles, since #98 may remove failures from this path. (A,B) `base` is the one class with a proven payoff (auto resume). (A) A shared wait at the existing phase and a new failure cause are different contracts, still open. (B)
- If built, store facts and an owner reference, not a frozen recoverable verdict, since an unmerged owner may merge later. (B)
- Legacy records need an explicit compatibility decision. Records with reason text recover today under failed-otherwise, so making every record without the new field notify-only changes behavior. Never default an absent class to recoverable. (B)
- A wrongly classed human stop that auto-recovers is bounded by the existing two-cycle limit (watch-issues/SKILL.md:41). (A)

## #97 loop-counts
- The script prints the last 20 calls with command and edit hashes, status and cut excerpts. It has no result equality, so "same command and same result" cannot come from hashes alone. Codex groups inner calls. (A,B)
- Build or defer: no observed missed or false loop call. Value is a shorter skill paragraph and exact counts. (A,B) Not a removal of watch turns. (B)
- Who owns the bar: script owns the whole mechanical bar and prints one `loop:` line with evidence (A), or script gives evidence only and the agent judges (B).
- Define the window, consecutive vs anywhere, and full result comparison before truncation. (B)
- An undo needs the same file and successful inverse edits. Swapped hashes alone can match different files. (B)
- Counts are evidence, not stop authority. Keep brief judgment, idle check and one stop per seat. (A,B)

## Where slots differ
1. One chart vs three charts.
2. #98: whether to offer landing past known reds (B) as a live option.
3. #97: script owns the bar (A) vs evidence only (B).

## Rebuttal corrections applied
B's rebuttal F1-F6 (slots/map-rebuttal-B.md) applied above: incident identity, watch-tick reason, clock rule attribution, timeout evidence, `base` class attribution, legacy compatibility.
