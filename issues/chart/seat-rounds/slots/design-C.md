# Design C: seat-rounds

## 1. Audit of X1 (A's first-round review)

Scanned `issues/log.jsonl` + `review-{A,B}.md` across both repos (**1,449** initial 2-seat `check.review` pairs):
- **Verdict changes (`A=fix, B!=fix`):** `akrogon` **10/288 (3.5%)** — 4 code/skill defects, 6 stale doc/fixture nits; `framework` **38/1,161 (3.3%)** — in the last 10, 3 code defects and 7 doc/report/wrap findings. Combined: **48/1,449 (3.3%)**, only **~1%** real product defects B missed.
- **A-only Fixes inside `A=fix, B=fix`** (`57` `akrogon`, `260` `framework`): in the last 15 `framework` `fix/fix` leaves, 7 duplicated B, 2 had no A-fix in repair, 3 were A-only doc/prompt fixes, and **3 (20% of `fix/fix`, ~4.5% of all leaves)** were real A-only code bugs (`first-paint-reuse`, `shown-rule-one-definition`, `walk-gates-carry-phase`); `akrogon` showed the same ~20% of `fix/fix` rate.
- **Does X1 pay? Yes.** Paying **1 full pricier-slot (A) turn on 100% of leaves** (1,449 turns) to catch ~1% verdict-changing code bugs (plus ~4.5% inside leaves B is already repairing) does not pay under signpost 4a (merge speed). Dropping A's initial review saves **1.00 A-turn/leaf** immediately (~11–18% of all seat turns).

## 2. P3 (`skills/check-issue/SKILL.md:79`) & mechanical check

- **Data (last 50 merged `framework` leaves):** 37/50 leaves had `Handed to A` items (**67 items** driving 76 `check.fix` passes): **25 test-expectation** + **7 proof-command** = **32/67 (48%)** — plus 13 missing-case, 8 locked-brief/design, 14 other. Each `check.fix` handback costs +2 turns (`check.fix` A + re-review B).
- **Exact replacement for `skills/check-issue/SKILL.md:79` (first sentence):**
  > B repairs every Fix except a change to a locked brief or design decision, a new or widened live action, and a recorded model choice. B repairs a test-expectation or proof-command correction itself under the same guards as A: every changed test file carries a `Test-Change: <exact path> <cited brief outcome or real source>` trailer (never weakening an expectation to make a broken product pass), a proof-command correction records the old command, new command, reason and equivalence-guard evidence (same tests/cases run, deliberate break still fails) in `review-B.md` per `plan-issue`'s proof-command rule, and no correction widens a live or paid action.
- **Anti-weakening guard:** mechanical `requireFrozenCitations` (`src/phase.ts:671-707`) already blocks merge on any changed/added test file lacking a `Test-Change:` trailer; B's cited brief/source + deliberate-break evidence in `review-B.md` preserves auditability (and locked brief/design or model-choice changes stay excluded). There is no second reviewer after `check.repair -> merge` — that is the explicit trade-off locked in signpost 5a.
- **Mechanical implement-exit proof-command check: drop it.** Once B fixes proof commands in place (0 extra turns, only 7/67 items), a heuristic command parser on `implement -> check.review` adds false-positive risk for zero saved turns.

## 3. Frozen-citation / locked-mechanism scope (`check16-reads-imports`)

In `check16-reads-imports/review-B.md` (F2/F3), `brief.md`/`design.md` named `require.resolve('typescript', ...)` which was broken under Bun 1.4.5; B blocked merge for 117.7 min as an `Operator action` even though the ancestor-walk replacement preserved every locked outcome.
- **Smallest rule change (1 sentence in `skills/check-issue/SKILL.md:79` and `skills/implement-issue/SKILL.md:79`):** *"When a brief or design names a specific call or mechanism proven broken on the target runtime, replacing it with an equivalent mechanism that preserves every done-criterion outcome and exclusion is a normal repair, not a locked-decision change or operator action; record the broken-call reproduction and replacement in the report/review."*

## 4. P8 and X2

- **P8:** Add 1 clause in `skills/chart-issues/assets/shapes.md:289` (*"name the observable outcome/order, not an exact call, unless that call is the external contract"*) beside the frozen-citation rule above; no broad rewrite.
- **X2:** **Drop.** `skills/lifecycle-rules.md` already centralizes the 4 shared rules across all 5 skills via symlinks, and the proof-command rule already lives once at `skills/plan-issue/SKILL.md:43`. Deduplicate only lines touched by X1/P3.

## 5. Fewest-parts shape, baseline figure & open forks

- **Baseline (last 50 merged leaves, 2-seat initial review = 2 turns):** `akrogon` **5.56 avg / 5 p50** (22/50 had `check.fix`); `framework` **9.32 avg / 7 p50** (41/50 had `check.fix`). Target: drop by ~1.5–2.0 turns/leaf.
- **Shape:** (1) **X1:** `src/routing.ts:37,49-51` (`'check.review'` `slots: ['B']`), update `skills/check-issue/SKILL.md:10,35` (B-only review); (2) **P3:** update `skills/check-issue/SKILL.md:79`, `skills/plan-issue/SKILL.md:43`, `skills/implement-issue/SKILL.md:79` so B repairs test expectations & proof commands directly; (3) **Frozen-citation + P8:** 1 sentence in `check-issue:79`/`implement-issue:79` + 1 clause in `shapes.md:289`.
- **Open forks:**
  - **F1 — `missing case` items (`13/67` in `framework`, `check-issue:79`):** (a) keep handed to A (5a names one-line test/proof mistakes, not writing new coverage) vs (b) let B add small cases too. **Pick: (a)**, re-measure after X1+P3.
  - **F2 — `src/phase.ts:522-534` two-seat wait:** (a) keep `phase.ts` generic (`required.length === 1` skips wait, preserves historical `log.jsonl` tests) vs (b) delete multi-slot code in `phase.ts`. **Pick: (a)** (smallest diff).
