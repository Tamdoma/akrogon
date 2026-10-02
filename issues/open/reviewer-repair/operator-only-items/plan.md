# Plan: operator-only-items

Debate: no. Synthesized directly from `brief.md` and `design.md`. Base `22c4470`. `HEAD..origin/main` is empty, so line citations are current.

## Decisions

- D1. One definition. The operator-only rule lives in `skills/check-issue/SKILL.md` Shared context, as a new paragraph right after the own-step stop paragraph (line 27). It covers everything the brief lists: the operator-only item, the `Operator actions` heading in `review-<slot>.md`, the exact operator command or action, what the seat tried, which credential or identity it used, the observed error, never a Fix for the repair seat, merge waits when the item gates a done-criterion, and one `failed` stop after the doable Fixes with every open operator action named and the action first in `--reason`.
- D2. Blind review does not stop on its own. In initial review a seat cannot see the peer's Fixes, and `akrogon phase ... failed` from one review seat fails the whole leaf at once (`src/phase.ts:206`). A review-seat stop could therefore drop a peer's doable Fixes, which is the "immediate stop in a mixed batch" the design forecloses. The rule says instead: an operator action that gates a done-criterion makes the seat's verdict `fix` (so merge waits). The repair seat at `check.fix` repairs every doable Fix first, then makes the one stop. When no doable Fix remains, it stops right away. Note for review: the brief says "When no doable Fix remains, the seat stops". This plan reads "the seat" as the repair seat. That keeps the design lock and costs one extra turn when the only finding is an operator item.
- D3. An operator action that gates no done-criterion is recorded under the heading only. It does not change the verdict, and it is named in the `--reason` of any stop that happens anyway. It never stops a leaf that is otherwise ready, because the brief makes only gating items hold merge.
- D4. Pointers do not restate the rule. `skills/check-issue/SKILL.md:27`, `skills/implement-issue/SKILL.md:33` and `skills/merge-issue/SKILL.md:27` keep their text byte for byte and each gets one appended sentence: findings that need operator access follow the operator-only rule in check-issue Shared context. The implement-issue check.fix closing paragraph (line 75) gets one sentence: when open operator actions remain after the doable Fixes, end with the one `failed` stop from that rule instead of `check.review`.
- D5. `skills/AREA.md:23` describes stop rules, so it gets one clause pointing to the `Operator actions` heading in check-issue. That keeps the file at 31 lines.
- D6. No docs/guide change. `docs/guide/problems.md:18,78,80` say a human-only blocker gets its action recorded and the pass ends. That stays true under D2.
- D7. Exclusions stay as the design locks them. `skills/plan-issue/SKILL.md:29`, `skills/watch-issues/SKILL.md:38`, the Fix-bar severity and all code are unchanged. The Fix-bar paragraph (check-issue line 45) is not edited. The design's "Fix-bar pointer" is covered by D1, which sits in Shared context above the Fix bar, plus D2's verdict sentence.

## Read first

- `brief.md`, `design.md` in this leaf folder.
- `skills/check-issue/SKILL.md` (lines 25-29 Shared context, 43-45 verdict and Fix bar).
- `skills/implement-issue/SKILL.md` (lines 33-36 stops, 67-75 check.fix).
- `skills/merge-issue/SKILL.md:27`.
- `skills/AREA.md`.
- `src/phase.ts:185-215`, which shows that `failed` moves the leaf immediately from any required slot.
- `docs/guide/problems.md:70-80`.
- Lesson `learnings/history/2026-09-11-stale-rule-in-docs.md`: grep `docs/` for a changed rule.
- Lesson `learnings/history/2026-10-01-failed-stop-guard-wording.md`: no wording tests.

## Interfaces

- Heading `Operator actions` in `review-<slot>.md`. It is fixed text because later passes and `b-repair-phase` look for it.
- `akrogon phase <slug> failed --reason "<operator action first; see review-<slot>.md>" --slot <A|B>`. The command is unchanged.
- Consumer: `b-repair-phase` points to this rule from `check.repair`. That leaf is blocked by this one.

## Checklist

### Wave 1 (three disjoint units, no shared test resource, no dependencies)

- U1 check-issue rule. Owns `skills/check-issue/SKILL.md`. Adds the D1+D2+D3 paragraph after line 27 and appends the D4 pointer sentence to line 27. Criterion 1.
- U2 implement-issue pointers. Owns `skills/implement-issue/SKILL.md`. Appends the D4 sentence to line 33 and adds the check.fix end sentence near line 75. Criterion 2.
- U3 merge pointer and area line. Owns `skills/merge-issue/SKILL.md` and `skills/AREA.md`. Appends the D4 sentence to line 27 and adds the D5 clause. Criterion 2.

The pointers in U2 and U3 depend only on the fixed heading name and the location "check-issue Shared context", which D1 locks. They do not wait on U1's text.

### Docs

- `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/AREA.md`: changed as above.
- `docs/guide/*`: unaffected (D6).
- `README.md`, `docs/reference-index.md`: unaffected because no file or area is added.

## Verification

| Criterion | Proof command | Failure it catches | Size | Rerun when |
|---|---|---|---|---|
| 1 | `sed -n '25,32p' skills/check-issue/SKILL.md`, judged against the D1 list item by item in the report | A missing rule element: heading, action, tried, credential, error, not-a-Fix, merge waits, one stop with action first | seconds | check-issue edited |
| 2 | `rg -n "Operator actions" skills`, pasted in the report with each match judged by meaning: one definition (check-issue), the rest pointers | A second definition, or a pointer that restates the rule | seconds | any skill edited |
| 2 | `git --no-pager diff --word-diff "$AKROGON_BASE" -- skills/check-issue/SKILL.md skills/implement-issue/SKILL.md skills/merge-issue/SKILL.md` | Own-step stop text changed rather than appended to | seconds | any of these files edited |
| 2 | `rg -n "operator-only rule" skills/implement-issue/SKILL.md skills/merge-issue/SKILL.md` shows the line 33, check.fix end and merge line 27 pointers | A missing pointer | seconds | those files edited |
| checks | `bun run format`, `bun run typecheck`, `bun test` | Regression in the repo checks. Prose-only, so these are expected to pass unchanged. | minutes | any commit |
| docs sweep | `rg -n -i "human-only blocker\|operator action" docs` | A guide line that is now stale (lesson 2026-09-11) | seconds | rule text changed |

No new test, because the lesson and check-issue line 47 reject prose-wording tests. The changed-tests command finds no changed test. There is no slow run, so the plan has no restart boundaries.

Credentials: none named by the design, so no env check is needed.

## Open limitation

- D2 adds one `check.fix` turn when an operator action is the only finding. Removing that turn would need the command to see both blind verdicts, which is out of scope (no code).
