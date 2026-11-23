# Design B: seat-rounds

Skills read on main at 814a2387. (H) marks what I counted on 2026-11-23 from `issues/log.jsonl` and the review files of both repos, leaves since 2026-11-01. I saw two lines of `slots/design-C.md` in a grep (its heading on the frozen citation) and read no more of it.

## Short answer

- X1 does not pay. A's first review finds a real product defect that B missed in 1 leaf of 10. Keep both blind reviews.
- P3 pays most when it also covers a missing test case. The guard is one rule: B never writes both the code and the test that accepts it. No `src` change.

## 1. Audit (H)

- F1. 426 first reviews (framework 372, akrogon 54). A said `fix` in 100. A alone changed the route in 10 (2%).
- F2. I had 99 of the 100 review pairs compared: 142 Fix items by A. 76 (54%) are not in B's first review, 3 more are only a Nit there, 63 are in both.
- F3. The 76 by kind: 51 product (shipped code or skill text an agent runs), 16 docs, 6 proof, 3 test. By outcome: 61 repaired by B, 9 handed to A, 3 rejected or withdrawn, 3 not traced.
- F4. fix/fix (89 reviews): 65 A-only items, 45 accepted product defects. fix/ready or nits (10 reviews): 11 A-only items, 4 accepted product defects in 3 leaves. The other 7 are docs or proof items, or rejected.
- F5. 42 of 426 leaves had an accepted product defect that only A found.
- Method: a Haiku agent matched the items on trimmed files (B's first review cut at 7,000 characters). About 17 A-only rows are marked unsure. I checked 15 A-only rows against the full `review-B.md`. All 15 held.
- X1: dropping A's first review saves 1 seat turn per leaf and ships those 42 defects. No.

## 2. P3

- F6. Cost today (H): 0.6 `check.repair` to `check.fix` hand-offs per merged leaf in both repos. 181 of 371 framework leaves had one. Each costs two turns, A's fix and B's re-check.
- F7. 266 hand-off lists, 428 items, sorted by keyword (rough): 58 lists (22%) hold only expectation or proof-command corrections. 149 (56%) when a missing case, capture or recording is counted too. 78 hold a locked decision, live action or model choice.
- New start of `skills/check-issue/SKILL.md:79`, replacing its first sentence:
  > B repairs every Fix except a change to a locked brief or design decision, a new or widened live action, and a recorded model choice. A test-expectation correction, a proof-command correction, and a criterion proof missing only a case, capture or recording are B's when B has not changed, in this leaf, the product code that the test or command exercises. When both that code and the test that accepts it must change, the pair goes under `Handed to A`. For each correction B cites, in the `Test-Change:` trailer, the brief outcome, design line or real output that the old expectation or command contradicts, and keeps in `review-B.md` the old and new value, the old one red on the head for that reason, and one deliberate break of the product behavior turning the corrected test red, with the same tests and cases still running (the `plan-issue` proof-command rule's equivalence guard). A correction with no such source goes under `Handed to A`. B never deletes a case, skips or filters a test, or widens what an assertion accepts beyond the cited source.
- Same line, the acceptance sentence becomes: "B's code repair is accepted only by a proof B did not write or change in this leaf passing on the repaired head."
- Who re-checks: no seat, no extra turn. The other side is always A's work. B's test change runs against code A wrote. B's code change runs against a test A wrote. The land gate already refuses a changed test file without its trailer (`:95`, `gate` exit). The land run runs the corrected test.
- Lines that state the old split and must change in the same commit: `skills/check-issue/SKILL.md:65` ("becomes a Fix routed to A"), `:79` (the sentence sending a missing case to `Handed to A`), `:83` ("the only test B writes in repair"), `:95` ("a wrong expectation the rebase exposes goes under `Handed to A`").
- Also `skills/plan-issue/SKILL.md:43` ("A replaces it … A records"): the correcting seat does, and B records in `review-B.md`. `skills/implement-issue/SKILL.md:56` stays, A may still correct an expectation.
- Implement-exit mechanical check: not needed now. The move to `check.review` already needs a green leaf receipt on HEAD (`src/phase.ts:501-504`). A proof-command check needs a parseable proof block in `plan.md`, a parser and a new refusal. After P3 a proof mistake costs at most one B turn, and only when it is the only Fix. Rough keyword count: 28 of 221 of B's first `fix` verdicts hold only proof items (H). Measure again after P3.

## 3. Frozen citation

- F8. `check16-reads-imports`: the brief named `require.resolve('typescript', …)` (`brief.md:5`, `design.md:15`). It picked a cached copy under Bun. B handed it to A as a "locked resolver decision". A replaced the call and kept the order. B then stopped the leaf for operator approval of the new call (`review-B.md:42, :59-61`).
- Nothing says what "locked" covers. The stops are `skills/implement-issue/SKILL.md:36, :79` and `skills/check-issue/SKILL.md:79`.
- Smallest change, one new rule in `skills/lifecycle-rules.md`, read by all three seats:
  > A brief or design decision locks the result it states. A call, path, command or library it names as the way to that result is locked only when the decision says the means is itself required. When a named means is shown not to give the stated result (one command red with it, green with the replacement), replacing it is not a change to a locked decision. The seat replaces it, keeps every stated result, and adds one dated line under `## Implementation notes` in `plan.md` naming the old means, the new one and the two runs. It edits no brief or design text and asks no operator.
- `skills/lifecycle-rules.md:3` says "four rules". It becomes five.

## 4. P8 and X2

- P8: drop as its own item. The sentence in section 3 is the mechanism-binding fix.
- X2: drop. I found repeated text (`skills/check-issue/SKILL.md:61` and `:89`, `:63` and `:110`) but no two copies that disagree. The only live risk is the five lines in section 2, and P3 edits them together.

## 5. Final shape

- A1. The `:79` text and the four other lines in section 2. A2. The one rule in `lifecycle-rules.md`.
- Figure (H): seat moves in `issues/log.jsonl` per merged leaf. Framework 6.8 mean, p50 6, p90 11 (371 leaves). Akrogon 5.6 mean (56 leaves). A's first review writes no log row, so the real count is one higher.
- Target: hand-offs per merged leaf from 0.6 to about 0.3, moves from 6.8 to about 6.2 in the framework.
- R1. B's repair turn gets longer. R2. B judges "did I change the code this test exercises" itself. A wrong call there is the one way B accepts its own work.

Forks:
- Q1. Reach of P3. O1 expectation and proof-command only, at most 22% of hand-offs. O2 plus missing case, capture or recording, at most 56% (pick, 5a says only real code problems go back to A).
- Q2. Guard. O1 the one-sided rule, no turn (pick). O2 A re-checks B's test changes in a one-slot review: new routing at `src/routing.ts:49-51` and one turn, which cancels half the saving.
- Q3. X1. O1 keep both blind reviews (pick, F5). O2 A reviews only after B says `fix`: saves 124 of 372 framework A reviews, loses the 10 route-changing leaves, and adds a review's wait on every `fix` leaf, against 4a.
- Q4. 5a read word for word sends code Fixes to A. Today B repairs them (298 framework `check.repair` to `merge` moves with no A turn). O1 B keeps them (pick). O2 the literal reading, which adds turns.
- Q5. Home of the section 3 rule. O1 `lifecycle-rules.md` (pick, one place). O2 a copy in each of the three stop lines.
