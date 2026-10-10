# Review A: bounce-repair-proof

Base: 2e78945849eed87c42abd56f224909f4d2050b36. Reviewed head: 12da5ceeaec55583346ce372c11ac6d9e3d2767c (4 commits, `git status` clean, ahead of base).

## Verification evidence

- `git diff 2e78945..HEAD`: 7 files, 11 insertions, 11 deletions, skill/doc text only. No file matches `src/test-files.ts`, so no `Test-Change:` trailer is owed — verified per file.
- `akrogon status` earlier pass: no `Missing:` entries blocking this leaf; no credentials named in the design.
- Blocking `checks` green per `implementation/report.md`: format, typecheck, `bun test` 603/603, test_changed vacuous. Not rerun: the diff is doc text only (no code change, no specific concern).
- AREA.md path listing: all paths named by the edited `skills/AREA.md` bullet exist in the worktree (verified by listing). No doc behavior claim changed beyond the leaf's own rule.

## Criterion check

1. merge-issue:65 — the red ending now appends "each failing command exactly as invoked (command and arguments), its failing output, the rebase target commit and the tested head". Per-command wording covers multiple red commands. Ending order and `--attempt` call byte-identical; red-main-hold/red-batch-culprit exclusion held. Met.
2. implement-issue — :78 expanded: after repair commits and normal proof, fetch, rebase the repaired head onto current `<remote>/<default_branch>` (conflicts: both true sides, resolved head is the rerun's recorded head), replay every recorded command verbatim, record command + arguments + rejected base/head + rerun base/head + result in `report.md`; a red rerun re-enters repair inside the pass and never reaches `check.review` ("which only a green replay reaches"). :80 names the recorded command as the replay's target. Met.
3. The four named sites (plan-issue:63, implement-issue:63/:84, check-issue:85) each carry the single exception with no contradictory wording. Sweep of remaining `merge_checks` prose (chart-issues, shapes.md, init-akrogon, learn-issues, merge.md): each names a different rule (criterion-proof eligibility, key purpose, lesson gating) — none contradicts the exception. AREA.md:23, phases.md:94, setup.md:54 carry the same clause; setup.md keeps its defining role. phases.md:80 describes plan-proof content ("adds no `merge_checks` requirement"), not run-time — no contradiction. Met.
4. check-issue:63 — re-check after a merge bounce confirms `report.md` carries the replay (command, arguments, both rejected and rerun base/head, result) and treats missing evidence as a Fix. Met.
5. Blocking `checks` pass per report. Met.

## Design/exclusion check

Q1 1a holds: only the repair seat replays, in its own pass, before re-review, keeping command/arguments/base/head as evidence; the "merge_checks only at merge" rule is reopened for this case only. No red-ending order change, no counting, no attempt records, no code edits. Test-runs base-red rules (implement-issue:38, check-issue:61) byte-identical.

## Findings

None. `src/status.ts` prettier drift was correctly identified as pre-existing, reverted, and noted in the report.

Verdict: ready
