# Review A: repair-verify-merge

Base: `f7ddb693` (origin/main). Reviewed head: `de57a744`. Diff: 2 commits, 3 files (+8/−3). Worktree clean, HEAD ahead of base.

## Criterion 1 walk (changed paragraph vs the three scenarios)

New text: `only the `merge` move runs `akrogon verify` on the committed head, which runs `checks` only and writes the receipt that move requires, while a `check.fix` move or the `failed` stop runs none`. The sweep clause before it ("After repairs, B reruns each done-criterion proof whose ... changed since its last green run") and the per-Fix evidence paragraphs are byte-identical.

- (a) Pure handoff — `issues/closed/repeat-calls/fewer-repeat-calls/review-B.md` 2026-10-26: second `check.repair` pass made no commits, kept unchanged-input proofs, ran a verify (reused receipt `2bfbd57b`) and moved `check.fix`. Under the new text B runs no verify on that exit — correct, nothing gates the check.fix move on a receipt and A verifies its own head before check.review.
- (b) Mixed repairs — `issues/closed/killed-run-fixture/abandoned-capture-stop/review-B.md` 2026-10-28: B repaired A-F1/B-F1, ran changed-input proofs (C1/C3/C4/C5 rerun, C6/C7 kept), ran a full verify (`8489e4e4`, green), then moved `check.fix` for the F2 handoff. Under the new text the sweep still runs every exit and the verify is skipped on this exit — exactly the saving the brief measures.
- (c) Merge exit — `issues/closed/bad-state-isolation/shared-inventory/review-B.md` 2026-10-19 `check.repair`: repairs done, `akrogon verify` green on the committed head (`99a302a1`), `phase merge` printed `moved merge`. Under the new text B still runs the verify and the receipt-gated merge move succeeds — unchanged behavior where the receipt has a reader.
- `failed` exits leave the paragraph unreachable today (machinery and operator-only stops return before it); naming the failed stop matches the brief's wording and adds no behavior.

## Criterion 2

`tests/receipt-gates.test.ts` now proves both halves through the real `akrogon phase` CLI: `handed` leaf in `check.repair` moves to `check.fix` with `--slot B`, exit 0, `readState` lands in `check.fix`, no receipt seeded; the pre-existing merge assertions keep `No green leaf verify receipt for <head>` refusal and the green-receipt success. Placement matches plan D2; shown red at planning (plan.md records the temporary-gate break, discarded before commit `ff308510`).

## AREA check

`tests/AREA.md` (one added word `check.repair`): every path it names exists — verified by one listing from the repo root; `issues/config.yaml` is absent only from the sparse leaf worktree and exists in the registered checkout and on `HEAD`. The added gate name is accurate: the file covers both check.repair moves.

## Docs

`docs/reference/checks.md` gate table and `docs/reference/state-and-phases.md` already scope the leaf receipt to `check.repair → merge`; `docs/examples/autopilot-story.md` narrates no repair verify. No documented behavior changed — the skill text is the only place the unconditional rule lived, and no doc page needs an edit.

## Evidence and checks

- `check criterion-2-rerun: 0` — `implementation/check-criterion-2-rerun-1793539030758-3050610.log` (5 pass) on the head tree.
- `check format: 0` `check-typecheck-…363: 0`, `check test: 0` (1262 pass, 68s) — logs under `implementation/`.
- `akrogon verify` green on tree `e87d167d` (receipt `6d6a2d12` reused after the trailer-only amend; tree unchanged). No rerun needed: no code changed since.
- `Test-Change` trailers on both commits cover `tests/receipt-gates.test.ts` and `tests/AREA.md`.

## Findings

No Fixes, no Nits, no operator actions.

## Verdict

`ready`.
