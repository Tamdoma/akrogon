# Review A: base-red-exit

Base: `88f252f02eb36aacee6dadf6668c303374b692d5`. Reviewed head: `6c29639` (one commit ahead of base, `git status --porcelain` empty). Blind initial review; peer review not read.

## Diff

Exactly five files, matching plan D1: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/AREA.md`, `docs/guide/phases.md`. All three skills and AREA are pure addition (zero deleted lines), so every must-stay sentence is intact by construction; `phases.md` has three modified sentences. No `src/`, `tests/`, `issues/`, chart-shape, `merge-issue`, or other guide paths. No new tests, per standing design.

## Criterion checks

- C1: implement-issue Shared context (`:36`) states the full rule with every D3 element: no-diff-cause trigger via failing output plus `git diff AKROGON_BASE...HEAD`, judgment gate, never automatic, same command once with same args and scope in the corresponding base-checkout cwd, `AKROGON_BASE`, `mktemp -d` detached worktree with TMPDIR behavior, leaf dep install, logs outside, capture before cleanup, `--force` remove, red `failed --slot A` with the exact design reason plus base SHA, both paths, names and tails in `implementation/report.md`, stop-never-handoff with no path to check.review or merge, green repair. One-line refs at `:50` (before the implement-end validation paragraph) and `:62` (first paragraph of check.fix). Red-criterion lock and `merge_checks` sentences untouched.
- C2: check-issue (`:53`) states the same rule after the rerun paragraph as the existing specific-concern case, reviewing slot `--slot <A|B>`, `review-<slot>.md` record, no path to check.fix or merge. Blocking and rerun paragraphs untouched.
- C3: plan-issue (`:59`, plan.synthesis) states the chart rule and keeps a brief-named whole run. Read against `skills/chart-issues/assets/shapes.md` done-criteria and audit rules (blocking `checks`, never `merge_checks`, repo-wide run only when the chart names the property): the plan-level rule mirrors the chart-level rule with no contradiction. Shapes file unchanged and still correct.
- C4: reran both exact sweeps. Sweep 1 returns 34 hits at the same file:line locations the report enumerates; sweep 2 returns 16 hits, likewise identical. Meanings agree with the report's judgments: new-rule and preserved-sentence hits plus unrelated rebase/codebase/based-on and whole-issue/epic/workflow/phase/feature/index senses. No hit contradicts the rule.
- C5: report evidence accepted without rerun per the rerun rule (no code change, no missing evidence, no specific concern): `bun install` clean, targeted docs-links plus command-reference 7 pass, `bun run format` clean, `bun run typecheck` clean, full `bun test` 342 pass across 15 files in 78.88 s at the reviewed head, target test files diff-free.

## AREA check

One command listed all twelve root-relative paths `skills/AREA.md` names: eleven exist; `` `scripts/observe.ts` `` (watch-issue inventory line, pre-existing, untouched by this diff) does not exist at root. The file lives at `skills/watch-issues/scripts/observe.ts` and no `scripts/` directory exists. AREA shape holds: 31 lines, four second-level sections. The new bullet names no paths.

## Findings

- N1 (nit): pre-existing dead root-relative pointer `` `scripts/observe.ts` `` in the untouched watch-issues line of `skills/AREA.md`; real file is `skills/watch-issues/scripts/observe.ts`. Reproduction: the AREA existence listing above. Deferred: pre-existing on base, outside this leaf's owned lines, hits no criterion, check, or gap of this leaf, so it fails the Fix bar. Promote to Fix if a leaf owning that AREA line touches it or a criterion depends on the path.

No documented behavior changed beyond the five owned files; the one-line statement for unchanged pages holds.

## Verdict

`nits` (N1 only, pre-existing and out of scope). Requesting merge.
