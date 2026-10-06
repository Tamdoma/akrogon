# Brief U2 — record-only-reuse skill and guide docs

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/record-only-reuse-u2` (detached at lane HEAD `efee828`, which contains the shipped code). Edit and commit only there. Documentation only — no code or test changes.

## 1. Goal

Implement plan.md D7–D8: update the merge skill and operator guide for the shipped `reuse`/`rerun` printed contract and the record-folder check rule.

Shipped facts (binding, from `src/phase.ts` at `efee828`):
- On a refused non-fast-forward push the command restacks and prints exactly one of:
  - `reuse tested=<T1-sha> pushed=<T2-sha>` — old and new main are equal outside `issues/` (except `issues/config.yaml`) and `learnings/`, tested top and restacked top are equal outside them too, `issues/config.yaml` is unchanged, and the restack had no conflict. The earlier green check run stays valid.
  - `rerun tested=<T1-sha|none> pushed=<T2-sha>` — the restacked worktree already sits at T2; fresh checks required. `none` means no `--check` ran before the refusal.
  - `rerun rebase <slug> onto <M2-sha>` — the holder's branch no longer fits the new base; B rebases by hand first (same meaning as the old `fresh checks required rebase` line).
- On `reuse`, B does NOT rerun checks: it copies the printed line into `review-B.md`, runs `merged --check`, gathers the completion owners' briefs, then runs `merged`, all under the same `--attempt`. `--check` validates HEAD against the recorded (restacked) top and preserves the original tested pair.
- On `rerun`, the flow is unchanged from today's `fresh checks required` handling (rerun checks, `--check`, briefs, `merged`).
- The batch record on the holder's `state.yaml` gains `tested_main` (the remote base the tested stack stood on; a `git merge-base` of tested head and tracking ref) and `decision` (`reuse` or `rerun`); `tested_top` keeps naming the original tested stack SHA and `candidate` the head submitted to `git push`.
- Record folders are fixed: `issues/` except `issues/config.yaml`, plus `learnings/`.

## 2. Acceptance criteria

9. `docs/guide/setup.md` states, next to the `checks` bullet (line ~53), that checks must not read tracked files under `issues/` (except `issues/config.yaml`, the check list itself) or `learnings/`, because a green batch run is reused when only those folders moved on the default branch.
6 (docs half). `skills/merge-issue/SKILL.md` tells B to copy the printed decision line into `review-B.md` and describes the `reuse` path (no check rerun; `--check`, briefs, `merged` under the same attempt).
- `docs/guide/merge.md` refusal section describes `reuse`/`rerun`/`rerun rebase` lines and the reuse rule.
- `docs/guide/state.md` batch key list names `tested_main` and `decision`.
- `grep -rn "fresh checks required" src tests docs skills` returns nothing (the only remaining hits today are `docs/guide/merge.md` lines 22–25 and `tests/`/`skills/` already updated — verify no others exist).

## 3. Read-first list

- `skills/merge-issue/SKILL.md` — refusal paragraph ~line 47 (applied form) and ~line 59 (solo form), plus the surrounding B flow.
- `docs/guide/merge.md` — lines ~19–27 refusal paragraph.
- `docs/guide/state.md` — line ~66 batch keys sentence.
- `docs/guide/setup.md` — bullets ~53–60.
- `src/phase.ts` in the worktree — `restack` print sites for exact wording.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

- `skills/merge-issue/SKILL.md`: replace the `fresh checks required` sentences in both sections with the three lines above and their handling; add the instruction that on `reuse` B copies the printed line into `review-B.md` (and may do the same for `rerun` lines for evidence). Keep the surrounding structure; minimal diff.
- `docs/guide/merge.md`: rewrite the refusal paragraph (~19–27) for the three printed lines and the reuse conditions.
- `docs/guide/state.md`: extend the `batch` keys sentence with `tested_main` and `decision`.
- `docs/guide/setup.md`: add the record-folder rule right after the `checks` bullet (one or two sentences).
- Verify `grep -rn "fresh checks required" .` (excluding `.git`) returns nothing and `docs/guide/next.md`, `docs/guide/phases.md`, `README.md`, `src/AREA.md`, `tests/AREA.md` need no change — touch them only if they carry stale wording.

## 5. Do-not, reasons and exceptions

- Do not invent semantics beyond the shipped facts above; wording must match `src/phase.ts` at `efee828`. Exception: none.
- Do not modify code or tests. Exception: none.
- Do not restructure the skill's prose — minimal edits inside the existing paragraphs. Exception: none.
- A mismatch returns to A with evidence. Exception: a revised brief from A.

Restated: doc-only, exact shipped wording, minimal diff, mismatches return.

## 6. Ordered steps

1. `skills/merge-issue/SKILL.md` two refusal spots.
2. `docs/guide/merge.md` refusal paragraph.
3. `docs/guide/state.md` batch keys.
4. `docs/guide/setup.md` record-folder rule.
5. `grep -rn "fresh checks required" src tests docs skills README.md` → zero hits; confirm no other stale doc.

Advisory size: ~4 files, under 20 turns.

## 7. Commands

```sh
cd /home/ivan/Work/infra/akrogon/issues/worktrees/record-only-reuse-u2
grep -rn "fresh checks required" src tests docs skills README.md   # expect no output
AKROGON_BASE=43729a61d82935f52739ac727bd7bfcfd100e945 bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence and report

Docs updated, the grep is empty, the changed-tests run passes (docs tests may be included), commit lands on the worktree's detached HEAD. Return:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
