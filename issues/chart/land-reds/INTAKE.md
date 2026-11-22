# Intake: land-reds

## Source: operator door t126 2026-11-22

Verbatim:

> I just pulled an issue from Framework, which is very important. This needs to be fixed and built out immediately. So, you do the charting with the two consultants you already have active here, and then you do the changes manually right away, okay? When you are done, spawn slot D, which is going to be GPT Sol 6.2 high effort to be the verifier and checker for you. Think of it as a slot B role in the lifecycle for you, and you are slot A. Full autopilot, do the best you can according to the seeded issue file, and also look at the framework, what's happening there, and what your part in Akrogon is.

## Source: Tamdoma/akrogon#147 (mirrored issues/seeds/147-framework-land-runs-went-red-12-of-13.md, pulled 2026-11-22T15:28:47Z)

# Framework land runs went red 12 of 13 times on 2026-11-22; load-flake reds never get a base pass and each one costs a repair round (suspected: 2026-11-21 land and admission changes)

Source: Tamdoma/akrogon#147
URL: https://github.com/Tamdoma/akrogon/issues/147

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-11-22, between 11:30 and 15:13 UTC, `issues/merge-attempts.jsonl` in the framework repo records 13 land attempts: 12 red, 1 merged (`template-files-are-stems`, 12:46). Every land since 13:54 was red, on an unchanged base `79ddb36cf2`.

Two consultants read every kept land log (`issues/open/<group>/<slug>/implementation/check-verify-*.log`) and agree on the failure mix:

- Only 1 of the 12 reds was caused by the leaf's own code (repair-round-bound, run 11:38).
- 10 of 12 contain timeouts with no assertion failure. Bun hook timeouts print as `(fail) (unnamed)`, plus 5 s, 8 s, 15 s, 30 s, 60 s and 300 s watchdog or test limits. Each failing test passes on a targeted rerun.
- 4 of 12 hit a framework test race on `.claude/skills/dev-render-satellite/renderers/1.99.9` (filed separately on the framework side).
- Host pressure during the reds since 13:54 (from `merge-attempts.jsonl` `pressure`) was cpu 40-69 s and io 72-126 s. On the one green run it was cpu 25.3 s and io 67.6 s.
- During the 14:15 land run, 11 leaf `cheap` verifies from 7 active leaves overlapped it (`issues/verify-runs.jsonl`). akrogon raised `merge-slow` (858 s against a normal 556 s).
- `taken8Trigger` never fired a base pass in any of the 12 reds. That includes `runner-names-unbound-route`, which repeated the same two `(unnamed) test:emdash-kit` and `(unnamed) test:emdash-routes` failures on the same head.
- After repeated reds, slot B escalated main-caused failures into `check.fix`. On `runner-names-unbound-route`, slot A then committed two unrelated EmDash timeout edits (`95cfceb3cd`, `c834d36321`) onto that leaf's branch (`review-B.md`). Two leaves, `repair-round-bound` and `review-capture-by-unit`, ended `failed` on main causes after 3 and 1 fix rounds.

## Location

akrogon land and admission path, installed release `fdc5acdd4ea4`:
- `src/verify.ts:367-376` (`uncoveredMainRedUnits`)
- `src/land.ts:178-190` (red exit and `taken8Trigger` gate)
- `src/admission.ts:244-257` (run admission)
- `src/phase.ts:238-251` (`fix_rounds` and `merge_stamp`)
- `skills/check-issue/SKILL.md:107` (second red on the same unit)

Consumer: Tamdoma/tamdoma-framework, `bun run framework:verify` as the land check.

## Reproduction

Observed on 2026-11-22 with 6-12 active framework leaves and `max_active: 12`. Any land run that coincides with several leaf `cheap` verifies and hits one Bun hook timeout reproduces the path: red, then no base pass, then `check.repair`. Frequency: 12 of 13 land attempts that day.

## Expected behavior

A land run fails only for the code under test. A red whose failing units are timeouts or nameless failures outside the leaf's diff is told apart from a leaf defect (rerun or base pass) instead of being charged to the leaf. Not provided beyond that.

## Urgency

High. One merge in about 3.5 hours. Six leaves queued in `merge` at once. Each flaky red costs a 10-14 min land run plus a slot B turn, and repeats escalate to `check.fix` and `fix_rounds`. Leaves end `failed` on causes outside them, and unrelated fixes land on leaf branches. Workaround in progress: the framework is lowering `framework:verify:core` concurrency on main. That reduces load but does not change how akrogon judges reds.

## Suspected cause

Supported hypothesis, agent and both consultants (Claude Fable 5.2, agy Gemini 4 Neon). Two akrogon conditions, both introduced 2026-11-21/22, combine with framework load:

1. **A nameless failure turns off the base pass.** `uncoveredMainRedUnits` returns `undefined` as soon as any failing test is not `named()` (`verify.ts:370`). `land.ts:186` runs `taken8Trigger` only when `uncovered !== undefined`. So any run containing an `(unnamed)` hook timeout or a `(script)` exit never gets a base comparison, even when the same failure repeats on the same head. Since `66f90be9` ("merge holds no seat; the land run lands a green top and exits to check.repair", 11-21 23:53), there is also no in-land rerun. Every red goes to `check.repair`, and `skills/check-issue/SKILL.md:107` sends a second red on the same unit to `check.fix`, which raises `fix_rounds` (`phase.ts:238-241`). Related commits: `fb0874c1`, `fdee90c9`, `b2266a29`.
2. **Leaf checks are not held back while a land verify runs.** `633db0ad` (11-21 21:54, "merge-phase leaves stop counting toward max_active") lets more leaves be active during land. In `admission.ts`, only runs marked `full` queue (`state: holder.full ? 'waiting' : 'live'`). The framework's `issues/config.yaml` has `full: []`, so every leaf `cheap` verify and seat `run-check` goes live at once beside the land verify. Recorded pressure and `merge-slow` are observe-only.

Contributing framework condition, not akrogon's: framework commit `f5337ffb79` (2026-11-22 02:07 +0100) raised `framework:verify:core` from 17 to 19 parallel jobs and exposed the `renderers/1.99.9` race.

Files read: `src/verify.ts`, `src/land.ts`, `src/admission.ts` in `/home/ivan/Work/infra/akrogon` at `fdc5acdd`; consultant reports at `~/.akrogon/watch/framework/consults/repair-round-bound-1/turn-1-fable.md` and `turn-1-agy.md`. `phase.ts` and `SKILL.md:107` claims come from the agy report and were not re-read by the agent.

Not inspected / would disprove: whether host load before 11-21 with the same leaf count was lower (no A/B run). A land run under the same load that gets a base pass and goes green would weaken condition 1.

Related reports: Tamdoma/akrogon#134 (closed; nameless failure placeholders as comparison keys, same `(unnamed)` class), Tamdoma/akrogon#118 (closed; full suites run together with no host bound, framework timeouts), Tamdoma/akrogon#69 (closed; heavy check runs share one host, load flakes bounce leaves at merge). Searched Tamdoma/akrogon, all states: own reports since 2026-11-20 (limit 40), and keywords "base pass unnamed", "land merge red", "admission merge verify", "max_active merge" (limit 8 each).

## Agent findings

- No `## Operator decision` section in the seed; nothing locked.
- Operator words recorded in the merge-lanes chart (door t2z2, 2026-11-21) stand as the operator's values: no leaf adds a new test failure to main; the PC stays inside its limits; token cost does not grow; a failed merge leaves the line at once (5a). merge-lanes red-exit Taken 3, 7, 8 and N3 decided the nameless-red path (B judges, nameless never covers, base pass only on named repeats).
