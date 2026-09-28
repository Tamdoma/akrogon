# Review A: owner-defect-stop

Base: `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`. Reviewed head: `758039c`. `debate: no`, so no positions/rebuttal artifacts exist (expected).

## Scope checked

Diff is one commit, `skills/watch-issues/SKILL.md` only: 3 insertions, 3 deletions across the Waiting bullet, Failed-on-human-prerequisite bullet, and Stop paragraph. `git status` clean; `diff` on `src/` and `skills/watch-issues/scripts/` empty.

## Criteria verification

- C1 (failed bullet): defect-in-merged-owner class, readable-inventory resolution, merged-only counts, never reopened, missing/ambiguous/unreadable all reported unresolved, unmerged attribution falls to failed-otherwise. All present in the edited bullet. Verified `src/phase.ts:186` makes merged terminal, matching "never reopened".
- C2 (waiting bullet): no `next` when `blocked=` names an unmerged leaf; reported waiting; unknown slug reported as a gap; `--all` scoped to unblocked leaves. Verified `src/next.ts:536-539` throws on unmerged prerequisites, so the guard is required.
- C3 (stop): closure over merged + failed-with-shown-evidence + waiting chains leading to such failures; blockers list unreadable inventory, unknown `blocked=` slug, runnable leaf, busy seat. Verified against observer line format in `scripts/observe.ts` (`blocked=`, `A=`/`B=` statuses, `delivery=`).
- C4 (notice): first recognizing fire sends one `herdr notification show` with the required body (failed leaf, `failure.phase`, owner or unresolved candidates, waiting dependents, fix-leaf next step, restart instructions); replaces the generic notice; `delivery=shown` does not satisfy it; no persistent state; credential failures keep the generic notice with no fix-leaf instruction.
- C5 (walkthrough): artifact at `/tmp/owner-defect-stop-4wDXq7/owner-defect-stop-walkthrough.md` exists with fixtures `case-{a,b,c}/` and `stubs/`, six runs covering the D7 matrix with verbatim observer output and per-leaf judgments. Stop/no-stop and notice counts correct per case.
- C6 (exclusions): Never list, `src/`, `scripts/`, observer format untouched.
- C7 (checks): report records full suite at head `758039c` (306 pass, typecheck exit 0). Prose-only change hits no test files; `bun run format` rerun this pass: unchanged, exit 0.

## Doc surface

`docs/guide/in-practice.md:89` is the only "human prerequisite" hit; its prose still accurately describes the extended stop. `skills/AREA.md` names `skills/watch-issues/SKILL.md` and `scripts/observe.ts`; both exist and the description stays accurate. `README.md:189` link resolves.

## Live contract spot-check

The real `update-replay` leaf has `blocked-by: [..., live-replay]` with `live-replay` at `phase: implement` (unmerged), which is exactly the case the Waiting guard prevents from throwing.

## Nits

- N1: walkthrough exercised one unambiguous merged owner; ambiguous/missing-owner and `delivery: error` variants were judged by rule inspection, not observer runs. Acknowledged in the report's known limitations; done-criterion 5 does not require them.

## Verdict: ready

## Merge pass

Rebase onto `origin/main` (`e4d6e4b` after one competing push rejection; prior reviewed head `758039c`, resolved head `7f36f9f`, diff unchanged). Checks at `7f36f9f`: `bun run format` clean, `tsc --noEmit` exit 0, `bun test` 306 pass / 0 fail / 14 files, `test_changed` 0 affected files. Push `HEAD:main` fast-forward `e4d6e4b..7f36f9f` confirmed.
