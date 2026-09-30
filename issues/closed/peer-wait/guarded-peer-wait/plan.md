# Plan: guarded-peer-wait

Direct synthesis (`debate: no`). Brief and locked design agree; no conflict note needed. No credentials named in design, so no env presence check applies.

## Decisions

- D1: Replace only the sentence starting `For each named peer, use the supported herdr interface` on line 44 of `skills/chart-issues/assets/questions.md` with the design taken wording verbatim, not a paraphrase.
- D2: Keep every other byte of the Blind peer exchange paragraph unchanged, including the readiness sentence verbatim.
- D3: Add no test file. Per standing no-vanity-tests rule, a wording-asserting test costs upkeep without catching a realistic failure beyond grep and reading.
- D4: Touch no other file. herdr, `src/next.ts`, `skills/watch-issues/SKILL.md`, and anything under `issues/` are excluded per design.
- D5: Reuse the charting live-run evidence (herdr 0.9.1, 2026-09-30, recorded in `forks/wait-mechanism.md`); run no new live herdr turn in this leaf.

## Read-first

- `skills/chart-issues/assets/questions.md:42-44` (target paragraph)
- `skills/chart-issues/assets/standing-design.md` (vanity-test and cheapest-proof rules)
- `src/next.ts:471-488` (guarded prompt shape this prose mirrors)
- `skills/AREA.md` (skill area commands and patterns)
- `docs/reference-index.md` (area map)
- `learnings/LESSONS.md` (2026-09-11 stale-rule-in-docs and lock-vs-criterion lessons)

## Needed interfaces (literal, no wrapper)

- `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`
- `herdr agent wait <pane> --timeout <T>` with T below the harness command timeout of that call, re-run on exit code `timeout`
- herdr failure codes: prompt `agent_prompt_stalled`, `agent_blocked`, `timeout` (any non-zero exit means not confirmed started); wait `timeout` (stderr JSON `{"error":{"code":"timeout",...}}`, exit 1, re-run) and `blocked` (to operator)

## Acceptance criteria (from brief, implementation derives no extra tests)

- C1: Paragraph states the taken wording or equivalent: wait until peer pane idle; guarded prompt as above; any non-zero prompt exit reported with herdr error, never auto re-prompted; every peer wait before and after the prompt bounded with T below harness timeout, re-run on `timeout`; `blocked` to operator; after turn read return file, missing file reported as peer failure.
- C2: Sentence `Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.` unchanged.
- C3: `grep -rn "without a timeout" skills docs README.md` prints no line about peer waits.
- C4: `bun run format`, `bun run typecheck`, `bun test` pass.

## Ordered checklist

1. `skills/chart-issues/assets/questions.md:44` — replace the one sentence with taken wording verbatim. Satisfies C1, C2, C3.
2. Run C1-C3 proof greps. Proves wording, readiness sentence, and old-phrase removal.
3. Sweep `docs/`, `README.md`, `src/` for stale peer-wait prose (`herdr agent wait`, `Blind peer`, `supported herdr interface`). Confirms no second copy (stale-rule lesson); expect only the target line plus the unrelated `watch-issues` steer rule.
4. Run blocking checks. Proves C4.

## Doc impact

- `skills/chart-issues/assets/questions.md` (agent resource): the one changed sentence is the leaf output.
- No human doc under `docs/` or `README.md` carries peer-wait prose, so no other doc changes.

## Verification per criterion

- C1: `sed -n '44p' skills/chart-issues/assets/questions.md` read against the design taken wording, plus `grep -F 'herdr agent prompt <pane>' skills/chart-issues/assets/questions.md` and `grep -F 'herdr agent wait <pane> --timeout <T>' skills/chart-issues/assets/questions.md`. Catches wrong or partial replacement. Size: seconds. Rerun when `questions.md` is edited.
- C2: `grep -F 'Pane text, file existence and chart fields cannot establish readiness or stand in for a peer answer.' skills/chart-issues/assets/questions.md`. Catches accidental edit of the locked next sentence. Size: seconds. Rerun when `questions.md` is edited.
- C3: `grep -rn "without a timeout" skills docs README.md`. Catches leftover old sentence. Expect empty output. Taken wording verified to not contain the forbidden phrase, so no lock-vs-criterion collision. Size: seconds. Rerun when `questions.md` is edited.
- C4: `bun run format`, `bun run typecheck`, `bun test`. Catches formatting, type, and regression breaks. Size: minutes. Rerun before commit and after any worktree edit.

## Open limitation

Unobserved branches (`agent_prompt_stalled`, prompt `timeout`, `agent_blocked`, pre/post `blocked`) are routed to the operator per design but were not exercised live in the reused run; this leaf verifies prose only, not those paths end to end. The bounded wait value T is caller-chosen (below harness timeout), so no fixed value is asserted.

## Dependencies

None. Single-file prose edit with no ordering requirement.
