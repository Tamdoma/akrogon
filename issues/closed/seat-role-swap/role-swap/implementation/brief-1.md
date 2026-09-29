# Brief U1: core swap plus tests

## 1. Goal

Swap the lifecycle seats in code and prove it with tests. Refines plan D1, D2, D3, D6. After this unit, A owns synthesis, implement and check.fix, B owns merge and post-repair review, the merged tab closes on pane B, config holds the new seat values, and the suite proves delivery plus refusals.

## 2. Numbered acceptance criteria

1. `src/routing.ts` lists `plan.synthesis`, `implement`, `check.fix` as `['A']`, `merge` as `['B']`, `plan.positions`, `plan.rebuttal` as `['A','B']`, and `requiredSlots('check.review', n)` returns `['B']` for `n > 0` else `['A','B']`. Verified by reading the file plus `bun test tests/phase.test.ts`.
2. `src/next.ts` closes a merged tab when the hook pane equals `state.pane.B`, not `pane.A`. Pane allocation order unchanged: first tab pane is A, split-right is B. Verified by `bun test tests/next.test.ts`.
3. `config.yaml` has `slots.a` pi / meta/muse-spark-1.3-contributor / max and `slots.b` codex / gpt-6.1-sol / high, with `git diff 3704d86a92d6369be36bf600ca413be79cf81c22 -- config.yaml` showing six value lines only.
4. New or updated fake-herdr tests prove a fresh `debate: no` leaf at `plan.synthesis` gets one prompt `plan-issue <slug> slot=A phase=plan.synthesis leaf=<folder>` on the tab-first pane (`prompts[0].pane == panes[0].pane_id == state.pane.A`, start args contain `strong-a`), merge prompts go to B with `slot=B`, and post-repair `check.review` prompts B only.
5. Negative tests prove `phase` refuses `--slot B` for plan.synthesis, implement, check.fix, refuses `--slot A` for merge and for check.review when `fix_rounds > 0`, and a merged tab stays open when only `pane.A` idles. Each refusal leaves state and log unchanged.

## 3. Read-first list

- `src/routing.ts`, `src/next.ts` (allocate plus merged-tab hook gate near `rediscovered.state.pane.A`), `src/phase.ts` (`transition` slot guard), `src/config.ts` (`seats`)
- `tests/helpers.ts` (fixture slots `strong-a`/`strong-b`), `tests/fake-herdr.ts` (tab-create root pane is `panes[0]`, `prompts`, `starts`), `tests/next.test.ts`, `tests/phase.test.ts`
- `config.yaml`
- `skills/implement-issue/ponytail.md`
- Open the index only for a gap in this list.

Pattern to copy: existing `tests/next.test.ts` fake-herdr dispatch tests that assert `database(f).prompts[0].text`, prompt pane, and `starts` model flags.

## 4. Change list and needed interfaces

Owned paths, nothing else: `src/routing.ts`, `src/next.ts`, `config.yaml`, `tests/next.test.ts`, `tests/phase.test.ts`, plus any other file under `tests/` that asserts jobs (find with `rg -n "slot=[AB]|strong-[ab]|pane\.[AB]|review-[AB]\.md" tests/`). No chunk must land first. No shared test resource. No consumed output from another worker. Waves judge this unit independent because no other unit touches these paths.

Interfaces:

- `routing: Record<Phase, { skill, slots, next }>`; change `slots` only, keep `next` arrays and `Slot` enum.
- `requiredSlots(phase, rounds)`: single branch for `check.review` with `rounds > 0`.
- `transition()` rule: `explicitSlot ?? single-required`; refuse missing, wrong, or `done` repeat with `A required --slot is missing or invalid`.
- Next prompt: `` `${routing[phase].skill} ${slug} slot=${slot} phase=${phase} leaf=${path}` ``.
- `allocate()`: first pane A, split-right B, stored in `state.pane`.
- Fake-herdr `Database { panes, tabs, prompts: {pane, text}[], starts: string[][] }`.

## 5. Do-not, reasons and exceptions

- Do not touch skills, docs, or README. Reason: owned by other units; overlapping edits cause pick conflicts. Exception: none.
- Do not change pane allocation, recovery placement, herdr/gh call shapes, `Slot` enum, state schema, or `next` arrays. Reason: design locks them unchanged. Exception: none, return a mismatch with evidence instead.
- Do not rewrite slot-identity tests (config, init, state, status fixtures) that assert seat plumbing rather than jobs. Reason: design excludes them. Exception: a failing identity test that blocks the suite gets a mismatch with output pasted, not a silent rewrite.
- Do not invent a new test harness or helper. Reason: fake-herdr plus `tests/helpers.ts` already covers dispatch. Exception: none.
- Do not change scope or an interface on conflict. Reason: the plan is the contract. Exception: return a mismatch naming the conflict, actual code, and smallest brief correction; a revised brief from B authorizes the change.

Reasons restated: disjoint ownership prevents conflicts, locked surfaces stay stable, and mismatches keep scope honest. Exceptions restated: only a revised brief from B authorizes a scope or interface change.

## 6. Ordered steps

1. In `tests/next.test.ts` and `tests/phase.test.ts`, update job assertions to the new seats for criterion 4 and 5 first to get red evidence (one failing run pasted).
2. In `src/routing.ts`, swap the five slot entries per criterion 1.
3. In `src/next.ts`, change the one merged-tab comparison from `pane.A` to `pane.B` for criterion 2.
4. In `config.yaml`, swap the six seat values per criterion 3; check the diff shows six lines.
5. In `tests/next.test.ts`, add first-pane delivery proof (prompt text, `panes[0]` id, `state.pane.A`, `strong-a` start), B merge prompt, B post-repair review prompt, and pane.A-idle non-close for criteria 4 and 5.
6. In `tests/phase.test.ts`, add the five wrong-slot refusal cases for criterion 5, asserting state and log unchanged.
7. Grep remaining `tests/` for job assertions, update only job-mapped ones, rerun the changed-test command to green.

Advisory size: about 6 files and under 24 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this, after `bun install` in this worktree:

```sh
AKROGON_BASE=3704d86a92d6369be36bf600ca413be79cf81c22 bun test --changed="3704d86a92d6369be36bf600ca413be79cf81c22"
```

B runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1 to 5 hold with red then green pasted for the test-first step, the config six-line diff pasted, and the changed-test command green. No e2e artifact from this unit. Limitations and unverified criteria stay explicit. Akrogon command tests use temp repos with herdr/gh faked at one boundary, no real panes or sockets; assert observable contracts (prompt text, pane id, exit code, state), not prose wording.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
