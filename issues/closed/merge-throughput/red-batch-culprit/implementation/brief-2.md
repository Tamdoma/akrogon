# Sub-brief 2: `--culprit` skill, README and guide docs

## 1. Goal

Implement plan.md D5-D6 (docs half): document the `--culprit` red-batch ending everywhere brief criterion 6 names, plus the two stale-rule fixes it creates.

## 2. Numbered acceptance criteria

1. `skills/merge-issue/SKILL.md` (the "Shared endings" red paragraph, currently :65) states the red-ending order base → culprit → split: base-red `--red-on-base` first (existing sentences stay verbatim), then when B can attribute the red run's cause to the holder or one carried member from evidence, B first writes the finding into that culprit's own `review-B.md` — exact command and arguments, tested base and top, logs, attributed diff, and the restored head (the culprit's saved member/holder head) — then calls `akrogon phase <slug> check.fix --slot B --attempt <id> --culprit <slug>`; an unattributed leaf-red run keeps the existing split ending unchanged. Keep the paragraph's existing sentences describing hold behavior (`red-main-hold`) and the repair replay path (`bounce-repair-proof`) intact.
2. `README.md` command table `phase` row (currently :136) gains `[--culprit <slug>]` and its effect text names the ejected ending in one clause; `tests/command-reference.test.ts:16` `contracts.phase` gains `[--culprit <slug>]` so the contract test passes.
3. `docs/guide/merge.md:29` documents the same base/culprit/split order for the red ending in guide prose matching the surrounding voice.
4. `docs/guide/files.md:72` adds `ejected` to the written outcomes: "The command writes `merged`, `red`, `split`, `held`, `reuse` and `ejected` now." (drop the "other leaves" tail for `ejected`; `held` already ships.)
5. `docs/guide/state.md:54` gains one clause: the red ending that ejects a culprit clears the record without setting `batch_limit`, since today's sentence claims every red holder keeps `batch_limit`.

## 3. Read-first list

- `skills/merge-issue/SKILL.md:58-72` (the paragraph to edit and its neighbors), `docs/guide/merge.md` (whole file for voice), `README.md:130-140`, `tests/command-reference.test.ts:10-20`, `docs/guide/files.md:55-73`, `docs/guide/state.md:50-56`.
- The behavior being documented, for accuracy: `src/phase.ts:811-883` (the `--red-on-base` and split endings the culprit branch sits between) and the leaf's `plan.md` decisions D1-D5 at `/home/ivan/Work/infra/akrogon/issues/open/merge-throughput/red-batch-culprit/plan.md`.
- `ponytail.md` in the implement-issue skill folder.

## 4. Change list and needed interfaces

Exact new CLI contract being documented: `akrogon phase <holder> check.fix --slot B --attempt <id> --culprit <slug>` where `<slug>` is the holder slug or a carried member slug still in `merge`. Refused with `--check`, with `--red-on-base`, without `--slot B`, on other phases, with a stale/missing attempt, on a slug outside the batch, or when the culprit's own transition guards would fail (e.g. dirty culprit worktree) — every refusal before any write. On success every member (culprit included) and the holder restore to saved heads (solo-holder exception kept), the batch record clears, one attempt line `ejected` names the culprit, and only the culprit moves merge → check.fix, keeping `merge_stamp` and counting `fix_rounds`; a culprit at the cap gets the shared `failed` outcome. No `batch_limit` is set. The next merge turn rebuilds from the queue.

## 5. Do-not, reasons and exceptions

- Do not restructure or rewrite surrounding paragraphs: minimal in-place edits; the reference test and the review diff both judge scope.
- Do not document flags that do not exist (`--culprit` on `merged`, a `--culprit --check` mode): only the contract above.
- Do not touch `src/`, `tests/culprit.test.ts`, or any other test file: owned by unit 1.
- Do not change `src/AREA.md` or `docs/guide/phases.md`: neither documents red endings today; plan keeps them untouched.
- Return a mismatch with evidence to the plan author instead of changing scope; the exception is a revised brief from A authorizing that change.

Reasons and exceptions restated: doc edits stay inside the named files and lines so the diff proves criterion 6 and nothing more; conflicts come back as a mismatch, not local scope creep.

## 6. Ordered steps

1. `skills/merge-issue/SKILL.md`: insert the culprit step between the base-red sentences and the leaf-red/split sentence of the red paragraph; keep the split sentence intact as the fallback.
2. `README.md:136`: add `[--culprit <slug>]` to the invocation and one clause to the effect; update `tests/command-reference.test.ts:16` contract to match.
3. `docs/guide/merge.md:29`: same order in guide prose.
4. `docs/guide/files.md:72` and `docs/guide/state.md:54`: the two small clauses.
5. Run the checks below.

Advisory size: 6 files, under 30 turns.

## 7. Commands

Changed-test gate (run in this worktree): `: "2595d71097880793bb369c26248b657663a45aa0" && bun test --changed="2595d71097880793bb369c26248b657663a45aa0" --timeout=30000`

Direct checks before finishing: `bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000`, and `bun run format` (prettier; if it rewrites unrelated files, revert those).

## 8. Done-when, evidence and report

Both test files green; `bun run format` leaves no unrelated drift. One commit is fine. The commit changes the existing test file `tests/command-reference.test.ts`, so its message must end with a `Test-Change:` trailer in the final trailer block: `Test-Change: tests/command-reference.test.ts added --culprit <slug> to the phase contract for the new flag; no existing expectation changed`. If prettier reflows README or guide files, keep it in the same commit.

Return with:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
Plus: commit IDs.
