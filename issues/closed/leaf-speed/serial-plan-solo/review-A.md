# Review A: serial-plan-solo

Base: `9bc0346619815947983df36c13329f695c371c6b`. Reviewed head: `df88689`.
`git status --porcelain`: clean; head is one commit ahead of base.

## What was checked

Diff `9bc0346..df88689` against `plan.md` (D1–D4, checklist U1), `brief.md` done-criteria, `design.md` exclusions, `implementation/report.md`, and the live text of all five files. Report logs under `implementation/` inspected (`check-*-17918437*.log` runs at implement end: format exit 0, test 843 pass / 0 fail, typecheck exit 0, test_changed 0 affected files).

## Findings

No Fixes.

### Nits

1. `skills/AREA.md` line 17 names `scripts/observe.ts` and `scripts/log-tail.ts`; the files live at `skills/watch-issues/scripts/`. Pre-existing on base (same line in `9bc0346`), untouched by this diff, unambiguous to a reader inside the skills area listing, so deferred: a bare-path listing already flags it today, yet no agent or human has reported a dead pointer from it.
2. `brief-template.md` still opens "A delegated leaf writes `implementation/brief-1.md`…" — by design out of the owned-file list, and a serial-solo leaf is not "a delegated leaf," so textually consistent. Ambiguity possible for a hasty reader. Deferred: the design's owned list excluded it, and SKILL.md/worker-protocol.md now bound delegation before any template is read. Evidence promoting it: a real pass that writes briefs for a serial plan citing the template.

## Judgment

- **Criterion 1** — all four files state the rule: `skills/implement-issue/SKILL.md` (implement section defines serial-solo, overlap excludes it, check.fix keeps delegated repair waves explicitly "including a leaf that implemented serial-solo", description names it), `worker-protocol.md` (delegated implement run exists only when a wave holds ≥2 units, boundary plus the regrouped-plan case), `skills/AREA.md` and `docs/guide/phases.md` (same rule, short form). Grep of `skills/` and `docs/guide/` shows no remaining statement requiring workers for an all-single-unit plan; every delegation statement is conditioned on a ≥2-unit wave or names a repair pass / standalone, which the brief keeps unchanged.
- **Criterion 2** — `git diff` on `skills/plan-issue/SKILL.md` is exactly one appended sentence in the wave-rules paragraph; it records the serial reason (prerequisite, shared path, shared test resource) before pointing to implement-issue, so plans keep stating why each unit is serial. Wave-grouping rules untouched.
- **Design exclusions** — `src/config.ts` `implement` values and plan wave rules untouched; `brief-template.md` untouched per the owned-file list; no test added (inspected `tests/red-docs.test.ts` and `docs-links.test.ts`: no delegation-sentence assertion exists, so the standing design's text-proof rule correctly required none).
- **AREA.md check** — all paths it names exist from repo root (files above verified with a live listing; Nit 1 covers the one relative-path ambiguity).
- **Docs sweep** — changed-rule grep across `docs/` found only `phases.md`, already updated; `broadcast-issue`'s "never delegated" is unrelated.
- **Report** — records base, head, per-command results with the plan's commands; no skipped or filtered runs; no `Test-Change` trailer needed (no `src/test-files.ts`-matched path changed).
- **Self-consistency** — the implement pass ran serial-solo itself (one unit, no sub-briefs, no worktrees), matching D3 and the rule it added.

## Verdict

`ready` — both done-criteria proven in the diff, checks green on the reviewed head, no blocking defect found.
