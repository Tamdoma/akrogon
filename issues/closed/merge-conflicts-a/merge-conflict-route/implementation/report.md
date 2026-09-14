# Report: merge-conflict-route

## Changed files and reasons

- `src/phase.ts` — `commitMove` fix_rounds increment now requires `recorded.phase === 'check.review'`; the capped destination also requires `state.phase === 'check.review'`. Merge → check.fix no longer counts and can never produce `moved failed` (D3, D4).
- `tests/phase.test.ts` — `conflict` case asserts `fix_rounds` stays 0 after merge → check.fix; new `capped` leaf in merge with `fix_rounds: 1` (the configured cap in that test) asserts stdout `moved check.fix` and phase `check.fix` (criterion 1).
- `skills/merge-issue/SKILL.md` — line 33 split into the conflict-resolution line (records rebase target, prior reviewed head, resolved head, `git range-diff` in review-A.md before checks) and a separate red-checks line routing to check.fix; line 35 same-line index rule kept without "during repair" (D1, D2, D6, D7).
- `skills/implement-issue/SKILL.md` — line 49: a repair requested from merge starts at the rebased head recorded in review-A.md and treats the failing output as the finding.
- `skills/check-issue/SKILL.md` — line 43: re-check baseline is the prior reviewed head or the rebased head A recorded at merge.
- `docs/guide/phases.html` — line 63 counts review → fix loops; line 64 says A resolves a rebase conflict and records it in review-A.md, a red check → check.fix.
- `docs/guide/problems.html` — merge-conflict row: A resolves it in the merge, records the resolution in review-A.md and reruns the checks.
- `docs/guide/in-practice.html` — "Two leaves touched the same lines": A resolves, records, reruns checks; only a red check sends the leaf to check.fix and the repair is re-reviewed.
- `docs/guide/merge.html` — last sentence of the rebase paragraph: same content.

`src/state.ts`, `src/status.ts`, `src/log.ts`, `src/routing.ts` unchanged; no `merge_rounds` anywhere.

## Commands run

- `bun test tests/phase.test.ts` — red first: `fix_rounds` expected 0, received 1 (17 pass, 1 fail); capped case manually confirmed `moved failed` on unmodified code. Green after the fix: 18 pass, 0 fail.
- `AKROGON_BASE=ef698c2d6ad50a9466f125419dbe0e4adaf2ae14 bun test --changed="$AKROGON_BASE"` — 9 changed files, ran phase.test.ts: 18 pass, 0 fail.
- `bun run format` — clean (all files unchanged after write).
- `bun run typecheck` — clean.
- `bun test` — 223 pass, 0 fail, 2915 expect() calls.
- `bash -o pipefail -c 'bun test tests/phase.test.ts 2>&1 | tee /tmp/akrogon-merge-conflict-route-phase.log'` — exit 0, 18 pass. Artifact: `/tmp/akrogon-merge-conflict-route-phase.log`.
- Criterion greps: `grep -rn merge_rounds src/ tests/` empty; `grep -n "check.fix" skills/merge-issue/SKILL.md` returns only the red-check line (35) and the repair-move footer line (58); `grep -n -i conflict skills/merge-issue/SKILL.md` returns only the A-resolves line (33) and the same-line index rule (37); guide conflict greps return only A-resolving lines plus excluded problems.html:68; "merge-conflict findings" and "rebase/conflict baseline" absent from skills/.

Base: `ef698c2d6ad50a9466f125419dbe0e4adaf2ae14`. Committed head: `edda614ea1d03697bee7b6437b10d8a29d7b3465` on branch `merge-conflict-route`.

## Known limitations

A's conflict resolution is gated only by green checks; no reviewer reads the range-diff unless a check fails (accepted by locked 13a; the range-diff in review-A.md is the audit trail). Merge → check.fix trips are unbounded by design. The `moved failed` sentence at merge-issue:37 is now dead text, kept for L4.

## Unverified criteria

None.
