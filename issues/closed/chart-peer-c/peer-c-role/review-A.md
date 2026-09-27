# Review A: peer-c-role

Phase: check.review, slot A. Blind review; peer review not read.
Debate: `no`, so no positions-A or rebuttal-A exist; expected.

## Base and head

- Base: `9aaadd379d9c46c49fd0b6a6460c6c39f898fc53`
- Reviewed head: `ffd7be074571782b21c69dc5329fbf79db11e316` (`peer-c-role: generalize charting peer role to optional C`)
- Branch `peer-c-role`, tree clean.

## Verification evidence

- A1: SKILL.md:23 names B pane, then C when given, or single slot; `C is named only with B`. Pass.
- A2: SKILL.md:35, 47, 57 state each rule once with "each named peer" phrasing; no duplicated C block. Pass.
- A3: questions.md "Blind peer exchange" gives per-peer paths (`map-C.md`, `fork-name-C.md`, `-rebuttal-C.md`, `-final-check-C.md`), idle wait plus `herdr agent wait` per peer, peer blind to A's draft and other peer's work, rebuttals read only A's merged file. Pass, except F1 below.
- A4: `grep -rn "(both)" skills/chart-issues docs/guide/chart.md` printed nothing (exit 1). Pass.
- A5: docs/guide/chart.md:160-164, diagram, and contract-review line cover optional C, same role, blind to A and B, named only with B. Pass.
- A6: `git --no-pager diff --name-only 9aaadd3...HEAD` lists exactly `docs/guide/chart.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`. Pass.
- A7: `bun run format` exit 0, `bun run typecheck` exit 0, `bun test` 291 pass / 0 fail. Pass.
- No `AREA.md` in the reviewed diff; `skills/AREA.md` unchanged and its pointers (`docs/reference-index.md`, named skill files) all exist. No deleted area file.
- Stale-term sweep over the three files and `docs/reference-index.md`: clean except F1 (SKILL.md:69 "named blocker" is a false positive of the `named b` pattern, not a slot reference).
- Doc pages describing the changed behavior (chart.md section, questions.md exchange) opened; claims verified against SKILL.md wording.

## Findings

### Fix

F1 — `skills/chart-issues/assets/questions.md:24`: the challenge-check template still reads `including B's remaining disagreements`. The new exchange (questions.md:49, "A includes the peer rebuttals under the challenge check") and locked interface ("challenge check carries every peer's rebuttal") cover each named peer, but the template names slot B literally. An agent following it with a named C would attribute or carry only B's disagreements. Violates criterion A3 / decision D4 peer-generic wording; concrete wrong claim on the page describing changed behavior. Fix: peer-generic phrasing such as "each named peer's remaining disagreements".

### Nit

None.

## Lesson

F1 is a recurrence of active lesson 2026-09-14-ambiguous-prose-after-rename (sweep prose for the old term, not only the old path): the rename swept the section heading and body but missed the template line outside the renamed section. Existing lesson already covers the mechanism; no new history file written.

## Verdict

fix

---

## Re-check after check.fix (round 1)

- Prior reviewed head: `ffd7be074571782b21c69dc5329fbf79db11e316`
- Repair head: `1a21e22` (`peer-c-role: peer-generic challenge-check template (F1)`)
- Repair diff scope: `skills/chart-issues/assets/questions.md` line 24 only.

### Results

- F1 confirmed fixed: line 24 now reads `including each named peer's remaining disagreements`, matching the exchange rule that the challenge check carries every peer's rebuttal.
- No new defect introduced by the repair: single-line template edit, no other behavior touched. shapes.md:74 `A/B attribution` predates this diff and remains excluded per design.
- Spot re-verify at new head: `(both)` grep still empty, base...HEAD still the same three owned files, `bun run format` exit 0. Prose-only change; typecheck/test unaffected by the repair.

### Verdict

ready

---

## Merge evidence (slot A)

- Rebase target: `origin/main` = `9aaadd379d9c46c49fd0b6a6460c6c39f898fc53`; rebase was a no-op (target equals base). No conflict, no range-diff needed.
- Rebased head: `1a21e22` (`peer-c-role: peer-generic challenge-check template (F1)`)
- `bun run format` exit 0; `bun run typecheck` exit 0; `bun test` 291 pass / 0 fail / 3468 expect(); `bun test --changed` 0 affected (prose-only).
- No Nits held from review; no learnings line to add.
