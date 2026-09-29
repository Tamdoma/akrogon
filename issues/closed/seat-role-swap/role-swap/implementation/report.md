# Implementation report: role-swap

Base: `3704d86a92d6369be36bf600ca413be79cf81c22`. Head: `7e3e30585d8cf8a9a135166f9340fd87de299116` (3 wave commits, no fixups). Mode: delegated, one wave of three disjoint units.

## Changed files and reasons

Worker commits: U1 `386ca97`, U2 `be098c1`, U3 `3fcc325`. Lane picks: `bde1032`, `cd1f075`, `7e3e305`.

- `src/routing.ts` (C1): synthesis, implement, check.fix to `['A']`; merge to `['B']`; re-review to `['B']`.
- `src/next.ts` (C2): merged-tab gate `pane.A` to `pane.B`, one line; allocation untouched.
- `config.yaml` (C5): seats swapped to a pi/muse-spark/max, b codex/gpt-6.1-sol/high.
- `tests/next.test.ts` (C2,C3,C4): seat expectations swapped; first-pane delivery proof plus B merge, B re-review, and pane.A-idle non-close cases added.
- `tests/phase.test.ts` (C4): slot fixtures swapped; five wrong-slot refusal cases added with state/log unchanged asserts.
- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `brief-template.md`, `worker-protocol.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `skills/AREA.md` (C6): job prose swapped to the new seats; AREA stays 30 lines with the four H2 sections.
- `docs/guide/idea.md`, `phases.md`, `merge.md`, `cheat.md` (C7): seat jobs, pass table, and example `--slot` commands swapped.
- `docs/guide/install.md` (C7): dropped the stale both-use-pi/devin line; states seats are roles and points at `config.yaml` (the roles-only option, drift-proof).

Verified unchanged: `docs/guide/parts.md`, `README.md` (generic seat mentions only), `src/AREA.md` (plumbing only). Untouched per design: `skills/broadcast-issue/`, `skills/chart-issues/`, `watch-issues/scripts/observe.ts`, `docs/guide/chart.md` door section, slot-identity tests.

## Commands run with pasted results and artifact paths

- `bun install` in lane: 9 packages installed.
- Lane changed tests after each pick (`AKROGON_BASE=3704d86... bun test --changed="3704d86..."`): 226 pass 0 fail each time (75s, 76s, 76s wall).
- `bun run format`: pass, no files changed (0.7s).
- `bun run typecheck`: pass (1.3s).
- `bun test`: 339 pass, 0 fail, 3926 expects, 15 files (1m39s wall).
- Worker red/green: U1 red 58 fail then green 226 pass; U2/U3 changed-tests selected 0 tests as expected for prose-only. Evidence: `implementation/evidence-u1/{red.log,green.log,config.diff}`, `implementation/evidence-u2/{sweep.txt,test-output.txt,area-lines.txt}`, `implementation/evidence-u3/{criterion8-sweep.txt,verify-only-greps.txt,test-run.txt,sweep.sh}`.
- E2E: `implementation/e2e-transcript.md` (rerun via `implementation/e2e-script.sh`). Sequence synthesis A, implement A, review A-ready plus B-fix to check.fix, refused `check.review --slot B` from check.fix (state UNCHANGED), check.fix A, re-review B ready, merge B, merged with `issue complete e2e`.
- Config diff pasted:
  `git diff 3704d86 -- config.yaml` shows the two seat value blocks swapped (six values); the `b:` key line appears as a removed/added pair from diff alignment while keys, order, and all other lines are unchanged.
- `git diff origin/main...HEAD --name-only -- issues`: empty (0 files).

## Sweep output with one-line reasons

Command from criterion 8. Every hit below is either the new mapping or an allowed exclusion; no hit assigns the old jobs.

New-mapping hits (reason: correct post-swap statement): `docs/guide/phases.md:11,47,55,63,81`, `docs/guide/merge.md:3,14`, `docs/guide/idea.md:29,36`, `docs/guide/cheat.md:71,77,83`, `skills/implement-issue/SKILL.md:10,31,44,52,58,60`, `skills/plan-issue/SKILL.md:3,55,61,63`, `skills/check-issue/SKILL.md:3,33,53`, `skills/merge-issue/SKILL.md:10,25,33,37,39,47,60`. Excluded hits (reason: criterion 8 exclusions): `docs/guide/chart.md:176` (chart-door section), `skills/chart-issues/assets/questions.md:40`, `skills/chart-issues/SKILL.md:37,61`. Full output also in `implementation/evidence-u2/sweep.txt` and `implementation/evidence-u3/criterion8-sweep.txt`.

Broader prose check for statements the regex misses (`rg -i "seat|slot"` over remaining guide pages, README, `src/AREA.md`): all generic (two seats, per-seat attempts, merge seat as role). No stragglers.

## Changed pages

Changed: `docs/guide/idea.md`, `docs/guide/phases.md`, `docs/guide/merge.md`, `docs/guide/cheat.md`, `docs/guide/install.md`. Verified unchanged with grep evidence: `docs/guide/parts.md`, `README.md`, `src/AREA.md`.

## Known limitations

- No conversion for in-flight leaves; an operator restart at the fitting phase recovers them after this lands (design cutover, open limitation carried from plan).
- Config diff alignment shows the `b:` key as a -/+ pair; only the six seat values semantically changed.

## Unverified criteria

None. C1-C10 all verified above.
