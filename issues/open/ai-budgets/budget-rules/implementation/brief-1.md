# Worker brief 1 — lifecycle-rules.md section rewrite (U1, D1 + D2-partial)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/budget-rules-u1

## 1. Goal

Rewrite `skills/lifecycle-rules.md`'s `## Grant reuse and count lines` section as `## Grant
reuse and paid sessions` under the leaf's locked design (plan decision D1). Done-criterion 1.

## 2. Acceptance criteria

1. The heading reads exactly `## Grant reuse and paid sessions`.
2. The section states all of: the standing scope; the `akrogon run-check --sessions <n>`
   reservation with n and its reason recorded in the seat's record file and a reservation
   counting whatever the outcome; the kept red-launch rule; the ceiling-stop rule; and the
   fresh-call trigger with the floor wording, quoted below.
3. Gone verbatim: the count-line requirement, the warn-past-bound sentence, every
   unknown-prior-use clause, and the closing "This changes no count line or repeat-bound rule."
4. The other sections (`## Environment files and producer keys`, `## Kept command output`,
   `## Red check with no cause in the leaf's diff`) are untouched.

## 3. Read-first list

- `skills/lifecycle-rules.md` — the file you edit (in the worktree path above).
- `skills/plan-issue/SKILL.md` line ~31 for how seats describe the shared rules (do not edit it;
  another worker owns it).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Replace only the `## Grant reuse and count lines` section (lines 5-9 of the file). Keep the
existing intro paragraph and the other sections byte-identical. New text, adapted from the
locked design — write it in the file's own prose style, covering each element:

1. Standing scope sentence: paid launches covered by a `by: standing` grant entry run on the
   logged-in `harnesses` accounts, with local writes cleaned after; no other account, provider
   or outside write is covered.
2. Reservation rule: every covered launch runs `akrogon run-check --sessions <n>`; the seat
   writes n and its reason in its record file; a reservation counts whatever the outcome. Keep
   the rest of the grant-reuse first paragraph's standing rules (reuse within bounds, compare
   operation/target/identity/bounds, record grant reference/results/created IDs, never widen,
   outside → operator-blocker stop). Remove only the count-line, warn-past-bound and
   unknown-prior-use mechanics.
3. The red-launch paragraph (currently the second paragraph, "Within one grant entry's
   operation, one paid launch runs before the operation's other paid launches. After a paid
   launch … under the seat's operator-blocker stop.") stays VERBATIM except drop its last
   sentence "This changes no count line or repeat-bound rule."
4. Ceiling stop: a reservation refused for the ceiling ends the pass `failed` with the existing
   one notice per stopped leaf, the reason naming the ceiling; no dedupe state.
5. Fresh-call trigger (moved from standing-design, with the locked floor wording): a fresh paid
   run is needed only when no recorded green on the current model-facing inputs covers the
   property and the change can reach it, or the seat cannot show why it cannot; a red caused by
   product behavior never passes; a run cut short by the ceiling or time limit is judged on the
   evidence already recorded; a wording-only change the seat judges cannot reach the proven
   property needs no fresh run, reason recorded. check-issue asks a fresh run only by naming a
   behavior no recorded run on current inputs shows, as a Fix for repair, never under
   `Operator actions`.

Chunks that must land first: none. Owned paths: `skills/lifecycle-rules.md` only. No shared
test resource. Creation commit: filled by A.

## 5. Do-not, reasons and exceptions

- Do not touch any other file or section — sibling workers own the other surfaces.
- Do not keep any sentence "for safety" that the design removes (count lines, renewals,
  warn-past-bound, unknown-prior-use); keeping them fails the criterion. Exception: none.
- Do not invent rule text beyond the listed elements; a sentence is kept only because a binding
  decision needs it.
- Return a mismatch with evidence if the section's current text no longer matches this brief's
  description; the exception is a revised brief from A.
- Standing exclusions: never `git stash` in any form (shared across worktrees); commit WIP work
  instead, and before returning `git reset --soft <creation commit>` then make the unit's one
  returned commit so A's cherry-pick carries all the work. Restated: the only valid output is
  one commit holding this unit's change, no stash, no test edits.

## 6. Ordered steps

1. Read the file; confirm the section boundaries. (AC4)
2. Rewrite the section per §4. (AC1-3)
3. Run the targeted command in §7; show it green. (AC1-4)
4. Commit once.

Advisory size: 1 file, under 6 turns.

## 7. Commands

Run through `akrogon run-check` from the worktree:

```
akrogon run-check --name u1-links -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile --backend=copyfile'"'"' && bun test ./tests/docs-links.test.ts'
```

Expect: all pass except `seat texts and refs name every non-title red name`, which fails with
`Expected: 5, Received: 4` — that red is the leaf's planned fail-first state for the missing
chart-issues link, not your scope; anything else red is a mismatch to return.

## 8. Done-when, evidence and report

Done when AC1-4 hold and the commit exists. Keep output only via `akrogon run-check` and cite
the `check <label>: <exit> <path>` line. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
