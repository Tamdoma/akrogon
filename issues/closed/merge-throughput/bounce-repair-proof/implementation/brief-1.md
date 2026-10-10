# Brief 1: merge-issue red-ending records the rejected command

## 1. Goal

Plan decision D1 of leaf `bounce-repair-proof`: when the merge ending goes red, `skills/merge-issue/SKILL.md` requires recording the exact failing command and its arguments so a later `check.fix` pass can replay it verbatim. One unit: this file only.

## 2. Numbered acceptance criteria

1. The red-ending paragraph in `skills/merge-issue/SKILL.md` (currently at line 65, the paragraph starting "On red checks, append the failing output") requires each red command to be recorded with: the exact command, its arguments, its failing output, the rebase target commit and the tested head, in `review-B.md` under the `leaf=` folder.
2. Two or more red commands each get their own record, so the repair seat reruns every rejected command, not just one.
3. The paragraph's ending order, the `akrogon phase <slug> check.fix --slot B --attempt <id>` call, the batch-split sentence and the repair footer are unchanged. The `Shared endings` heading and the filtered-set paragraph (:61-63) are unchanged.
4. No wording anywhere in the diff reorders or restructures the red ending; only the recording requirement is extended.

Proof is read/grep over the diff; no test asserts skill text.

## 3. Read-first list

- `skills/merge-issue/SKILL.md` (whole file; :61-68 is the edit site, :51-53 show the solo-rebase evidence vocabulary to reuse)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owns: `skills/merge-issue/SKILL.md` only.

Extend the "On red checks" sentence so the recorded evidence names the exact command and its arguments per failing command. Suggested shape (judge, do not copy blindly): "On red checks, append each failing command exactly as invoked (command and arguments), its failing output, the rebase target commit and the tested head to `review-B.md` under the `leaf=` folder, call ..." — keep the rest of the paragraph verbatim.

Lands first: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not touch the red-ending order or add `--red-on-base`/`--culprit` mechanics: sibling leaves red-main-hold and red-batch-culprit own that order; this leaf edits only the recording sentence.
- Do not change `attempt top`, `attempt solo`, the non-fast-forward handling or the footer: out of scope.
- Do not edit any other file, including `implementation/` artifacts or `review-B.md` examples.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

Restated: only the recording clause inside the red-ending paragraph of `skills/merge-issue/SKILL.md` changes; everything else stays byte-identical, and any needed extra change is returned as a mismatch, not made.

## 6. Ordered steps

1. Read `skills/merge-issue/SKILL.md` fully (criterion 3, 4).
2. Edit the red-ending paragraph per section 4 (criteria 1, 2).
3. `git --no-pager diff` the file and confirm only the recording sentence changed (criteria 3, 4).
4. Run the changed-test command in section 7.

Advisory size: 1 file, under 6 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/bounce-repair-proof-u1
bun install
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

If `bun test --changed` reports no changed tests to run, that is a valid green result for a doc-only diff; record it as such.

## 8. Done-when, evidence and report

Done when the red ending records the exact command and arguments per red command, the rest of the paragraph and file are unchanged, the file is committed in this worktree, and the changed-test command has run green or vacuous.

Commit the edit with a short message like `merge-issue: record exact command and arguments at red ending`. No `Test-Change:` trailer is needed (no file matched by `src/test-files.ts` is touched).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
