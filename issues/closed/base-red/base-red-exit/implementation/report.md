# Implementation report: base-red-exit

Base: `88f252f02eb36aacee6dadf6668c303374b692d5`. Committed head: `6c29639` ("base-red-exit u1: base-red stop rule prose", cherry-picked from worker commit `5c6054c`). One delegated unit, one wave, worker worktree created at HEAD and removed after the pick.

## Changed files and reasons

Worker unit (brief `implementation/brief-1.md`, plan D1-D8):

- `skills/implement-issue/SKILL.md`: full base-run rule in Shared context beside the red-criterion paragraph (trigger, once, same scope, corresponding base cwd, `AKROGON_BASE`, `mktemp -d` detached worktree, leaf dep install, logs outside, capture before cleanup, `--force` remove, red `failed --slot A` plus report fields, green repair, never automatic); one-line reference at implement end and one at check.fix, each before the generic repair sentence. Red-criterion sentence verbatim, `merge_checks` sentence untouched. Criterion 1.
- `skills/check-issue/SKILL.md`: same rule in check.review as the existing specific-concern rerun case, reviewing slot, `review-<slot>.md` record. Blocking and rerun paragraphs intact. Criterion 2.
- `skills/plan-issue/SKILL.md`: chart rule paragraph in plan.synthesis; brief-named whole run kept. Criterion 3.
- `skills/AREA.md`: one bullet under Non-obvious patterns (31 lines, four sections verified). Criteria 1-3.
- `docs/guide/phases.md`: planning limit with `merge_checks`, brief-named whole-run qualification, one base-exit sentence each in implement and check sections. Criteria 1-3.

Commit stat: 5 files changed, 14 insertions, 3 deletions. `git diff base...HEAD --name-only` lists exactly the five owned paths; no `src/`, `tests/`, or other guide file touched.

## Commands run with pasted results

Worker (worktree `base-red-exit-u1`, since removed):

- `bun install`: 9 packages, no errors.
- Changed tests `: "${AKROGON_BASE:?...}" && AKROGON_BASE=88f252f... bun test --changed="88f252f..."`: `--changed: 5 changed files, but no test files are affected. 0 pass, 0 fail, exit 0.` Expected for prose-only. Full diff and test log were captured at worker paths and removed with the worktree; the commit was inspected by A before the pick.

A on lane after cherry-pick (`6c29639`):

- `bun install`: 9 packages installed, seconds.
- Lane changed tests (same resolved command): 5 changed files, no test files affected, 0 pass, 0 fail, seconds.
- `bun test tests/docs-links.test.ts tests/command-reference.test.ts`: 7 pass, 0 fail, 1111 expects, seconds.
- `bun run format`: clean, all files unchanged, 0.85 s.
- `bun run typecheck` (`tsc --noEmit`): clean, 1.26 s.
- `bun test`: 342 pass, 0 fail, 3971 expects across 15 files, 78.88 s (wall 1m19s).
- `git status --porcelain`: clean. `tests/docs-links.test.ts` and `tests/command-reference.test.ts`: no diff, pass unchanged.
- `wc -l skills/AREA.md`: 31; `grep -c '^## '`: 4.

Criterion 1 proof: read of the implement-issue diff against D2/D3 confirms trigger, once, same scope, corresponding base cwd, `AKROGON_BASE`, `mktemp -d`, dep install, logs outside, `--force` remove, red `failed` reason plus all artifact fields, green repair, never automatic, verbatim red-criterion sentence, both pass endings referenced before repair. Minutes.
Criterion 2 proof: read of the check-issue diff against D4 confirms same rule, reviewing slot, `review-<slot>.md`, no red handoff or ready/nits path, blocking/rerun paragraphs intact. Minutes.
Criterion 3 proof: read of the plan-issue diff against D5 and shapes `:132,170` confirms leaf-tests-plus-`checks` proof, no brief-unnamed `merge_checks`/suite requirement, brief-named whole run kept. Minutes.

## Criterion 4 sweeps (full output, judged by meaning)

Sweep 1: `grep -rn "base" skills/implement-issue skills/check-issue skills/plan-issue skills/AREA.md docs/guide`

New-rule hits (consistent by construction): `skills/implement-issue/SKILL.md:36` (full rule), `:50`, `:62` (one-line refs); `skills/check-issue/SKILL.md:53` (full rule); `skills/AREA.md:25` (bullet); `docs/guide/phases.md:91`, `:99` (guide sentences). Preserved-sentence hits: `skills/implement-issue/SKILL.md:34` (never-handed-off lock, required intact), `:52` (`merge_checks` sentence, required untouched). Unrelated `base`/`based`/`rebase`/`codebase` hits, no contradiction: `skills/implement-issue/ponytail.md:8,30` (codebase), `skills/implement-issue/worker-protocol.md:25` (supplied base for changed tests), `skills/implement-issue/SKILL.md:66` (rebased head at merge repair), `skills/check-issue/SKILL.md:41` (base and reviewed head record), `:55` (rebased head at re-check), `docs/guide/files.md:54,77`, `docs/guide/gacp.md:27,32,34,35,37,61,76,83,101,103`, `docs/guide/idea.md:88`, `docs/guide/limits.md:34`, `docs/guide/merge.md:3,7,9,67`, `docs/guide/problems.md:43`, `docs/guide/setup.md:54`, `docs/guide/state.md:105`, `docs/guide/phases.md:13` (all Git rebase/rebased or "based on"). No hit in `skills/plan-issue` (chart rule has no "base" wording).

Sweep 2: `grep -rn "whole\|full suite\|merge_checks" skills/plan-issue docs/guide`

New-rule hits: `skills/plan-issue/SKILL.md:59` (chart rule), `docs/guide/phases.md:77` (planning limit), `:91` (brief-named qualification plus base exit). Consistent existing hits: `docs/guide/merge.md:3` (`merge_checks` run at merge), `docs/guide/setup.md:54` (`merge_checks` definition). Unrelated "whole X" hits, no contradiction: `docs/guide/cheat.md:88` (whole issue), `docs/guide/files.md:40` (whole epic), `docs/guide/gacp.md:70` (whole index), `docs/guide/idea.md:23,76` (whole workflow), `docs/guide/merge.md:31,42,75` (whole epic), `docs/guide/next.md:44` (whole issue), `docs/guide/phases.md:50` (whole phase), `:103` (whole feature).

Judgment: no hit in either sweep contradicts the rule. Seconds to run, minutes to assess.

## Known limitations

- One triggered base run still costs one full command when the original failure came from a whole-folder run, and outside inputs can differ between runs. The rule bounds investigation with a stop; it is not a cached or hermetic causality proof (plan Known limitations, worker-confirmed).
- `bun run format` covers only `src` and `tests`, so prose correctness rests on the reads and sweeps above.

## Repair check.fix (F4, bare `AKROGON_BASE` in trigger command)

- Before: `6c29639`. After: `2e340cb` (cherry-picked from worker commit `2178bcc`, brief `implementation/brief-2.md`, one wave, worktree removed). Two one-line replacements: `git diff AKROGON_BASE...HEAD` to `git diff "$AKROGON_BASE"...HEAD` in `skills/implement-issue/SKILL.md:36` and `skills/check-issue/SKILL.md:53`, verified by `grep -o` showing the exact quoted form in both and no bare form left in `skills/` or `docs/`.
- Same command corrected in plan notes: `plan.md` D3 plus verification rows 1-3, `implementation/brief-1.md` section 4. `brief-2.md` keeps the broken form intentionally as defect evidence. No criteria weakened.
- Proof at `2e340cb`: lane changed tests 0 pass 0 fail (prose, seconds); shipped trigger command `git diff "$AKROGON_BASE"...HEAD --stat` exits 0 listing the five files; targeted docs-links plus command-reference 7 pass (seconds); `bun run format` clean (0.61 s); `bun run typecheck` clean (1.05 s); full `bun test` 342 pass, 0 fail, 3971 expects, 74.66 s (wall 1m15s); sweep hit counts unchanged (37 and 16); tree clean. Nits from review A got no separate work.

## Unverified criteria

None. All five done-criteria carry passing proof above, valid at `2e340cb`.
