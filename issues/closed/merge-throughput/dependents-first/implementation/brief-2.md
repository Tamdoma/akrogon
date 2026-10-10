# Sub-brief 2: dependents-first docs (unit U2)

## 1. Goal

Update the operator guide for the new dependents-first ordering (plan unit U2, decisions D2-D3). Leaf done-criterion: docs/guide/merge.md and docs/guide/next.md describe the new order (brief C5).

## 2. Numbered acceptance criteria

1. `docs/guide/merge.md` paragraph 2 (currently "Each registered repo has one merge turn, held by the earliest eligible leaf in `merge` (merge stamp, then the last `to: merge` log record, then slug; a leaf with neither sorts last)") describes the new order: a leaf holding a batch record keeps the turn; otherwise the eligible merge leaf with the most unmerged leaves waiting on it through `blocked-by` (directly or transitively) holds it; ties keep merge stamp, then the last `to: merge` record, then slug; a leaf with no record sorts last among equal counts.
2. `docs/guide/next.md` section "How order is decided" states that a dispatch pass attempts leaves with more unmerged waiting dependents (through `blocked-by`, directly or transitively) before leaves with fewer, and that ties keep the previous visit order with merged leaves first.
3. `docs/guide/state.md` line ~50 ("the `merge_stamp` ordering the merge turn") is corrected: `merge_stamp` now tie-breaks the dependent-count ordering rather than ordering the turn alone.
4. `docs/guide/limits.md` is checked and left unchanged: "There is no priority field" stays true — the ordering is automatic, not a field. `skills/merge-issue/SKILL.md` checked and left unchanged — it describes holder/refusal mechanics, not the sort.
5. `bun test tests/docs-links.test.ts --timeout=30000` passes.

## 3. Read-first list

- `docs/guide/merge.md` (paragraph 2)
- `docs/guide/next.md` (~lines 113-140, "How order is decided")
- `docs/guide/state.md` (~line 50)
- `docs/guide/limits.md`, `skills/merge-issue/SKILL.md` (verify only)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Pattern to copy: the existing guide prose — short declarative sentences, no headings added.

## 4. Change list and needed interfaces

Owned paths: `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/state.md`. Needs first: none (wording is fixed by the brief; independent of the code diff). Shared test resource: none.

Minimal edits: rewrite the quoted sentence(s) only; add at most one or two sentences in next.md. Keep the existing doc voice and length.

## 5. Do-not, reasons and exceptions

- Do not edit code, tests, `README.md`, `limits.md`, `skills/` files, AREA files or headings/anchors — docs-links tests verify anchors and the plan excludes other files.
- Do not document an aging rule or priority field — foreclosed.
- Do not claim merged dependents count — they do not.
- If a sentence contradicts the new order in a file not owned by this unit, return a mismatch naming the file, the line, and the smallest correction instead of editing outside the owned paths. The exception is a revised brief from A authorizing that change.

Restated: edit only the three owned files; any out-of-scope contradiction returns a mismatch, not an extra edit.

## 6. Ordered steps

1. Edit `docs/guide/merge.md` paragraph 2 (criterion 1).
2. Edit `docs/guide/next.md` (criterion 2).
3. Edit `docs/guide/state.md` (criterion 3).
4. Verify `limits.md` and `skills/merge-issue/SKILL.md` need no change (criterion 4); run the docs-links test (criterion 5).

Advisory size: 3 files, under 12 turns.

## 7. Commands

```sh
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

with `AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36` (docs-links test runs under it; also run `bun test tests/docs-links.test.ts --timeout=30000` directly if the changed set misses it).

## 8. Done-when, evidence and report

All five criteria hold; docs-links test passes with pasted results. Commit your chunk in one commit on top of the worktree HEAD and return the commit ID. No `Test-Change:` trailer needed — you change no existing test file.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
