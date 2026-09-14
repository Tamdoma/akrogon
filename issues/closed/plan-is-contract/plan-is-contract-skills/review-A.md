# Review A: plan-is-contract-skills

- Base: `26a7bc2613af4a2c9d579351bc66e87cd1af1427`
- Reviewed head: `76c04115427c351bc280c8cf64a12186f65eb298` (branch `plan-is-contract-skills`)
- Debate: `no` — no positions/rebuttal artifacts, as expected.

## Findings

None.

## Verification evidence

Diff is 7 files, 14 in-place sentence replacements, each matching the plan's Needed interfaces verbatim (checked A–N against `plan.md`/`design.md` literal text).

- C1: `grep -rn "implementation/brief.md" skills/ docs/guide/` returns exactly one line, `skills/implement-issue/SKILL.md:55`, the standalone sentence. Pass.
- C2: `grep -ln "implementation/report.md"` lists all five required files. Pass.
- C3: `grep -c "^## [1-8]\. " brief-template.md` prints 8; the four fill-in lines present at lines 51–54 unchanged. Pass.
- C4: implement section states in order the conditional dated `## Implementation notes` append with the never-change-a-lock rule, one sub-brief per unit with one unit included, no sub-briefs in inline mode (next paragraph), and `report.md` with the five contents after commit, before handoff. Pass.
- C5: check-issue read list names `plan.md` including implementation notes, `design.md`, `implementation/report.md`, ponytail; judgment sentence names the design's exclusions; no whole-leaf brief named in check-issue or the implement-issue description. Pass.
- C6: no sentence asks B to restate plan criteria/read-first/change list/steps in a whole-leaf `implementation/brief.md`; template line 5 states the leaf has no whole-leaf brief. Pass.
- C7: standalone sentence, worker protocol, peer-question rule, footer rules, lesson rules, and the 1,500-word/20-rule limit unchanged (diff confirms only template lines 3 and 5 touched). Pass.
- C8: report pastes evidence — `bun test` 223 pass/0 fail, `tsc --noEmit` clean, format exit 0. Prose-only diff; not rerun.
- C9: grep pipeline exited 0; artifact at `/tmp/akrogon-plan-is-contract-skills-grep.log` exists with output satisfying C1/C2; path recorded in `report.md`. Pass.

AREA.md check: `skills/AREA.md` is in the diff. All named paths exist from repo root: `src/akrogon.ts`, `tests/install.test.ts`, `tests/phase.test.ts`, `skills/init-issues/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `src/routing.ts`, `docs/reference-index.md`.

Report contents (D1): all five present — changed files/reasons, commands with pasted results and artifact path, base and committed head, known limitations, unverified criteria (none). Worker return folded in. `implementation/brief-1.md` exists per D3/D5; no whole-leaf `implementation/brief.md`. No `## Implementation notes` appended to `plan.md`, which is permitted since the append is conditional.

Scope: only the seven owned files touched; exclusions respected (no worker-protocol, ponytail, plan-issue, src/, tests/, or other guide edits).

## Verdict

ready

## Merge evidence (slot A)

- Rebase: `git rebase origin/main` — already up to date; `origin/main` is ancestor of HEAD.
- Lesson commit on branch: `ef698c2` (Nit → `learnings/LESSONS.md` + history file).
- `bun test`: 223 pass, 0 fail, 2913 expect() calls, 12 files.
- `bun run typecheck`: `tsc --noEmit`, clean.
- `bun run format`: all files unchanged, exit 0.
- `bun test --changed=$AKROGON_BASE` (base `26a7bc2`): 0 tests affected, exit 0.
