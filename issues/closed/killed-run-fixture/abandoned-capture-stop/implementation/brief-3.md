# Sub-brief 3: capture liveness + abandoned-pair gate in docs and AREA files

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/abandoned-capture-stop-u3`

## 1. Goal

Implement plan decision D8 for leaf abandoned-capture-stop: document the capture-out shared flock,
the `akrogon phase` refusal for abandoned capture pairs, and `cleared-<run>.md` in the five files
the plan names.

## 2. Numbered acceptance criteria

1. `docs/reference/checks.md`: the capture section says the pair is live while the run-check
   wrapper or a descendant holding capture-out's stdout fd lives (one shared flock on the opened
   capture-out), and that `akrogon phase` refuses a leaf's non-failed move while an abandoned pair
   sits in the leaf folder without a non-blank `cleared-<run>.md`, naming the pairs and the clear
   step; a move to `failed` and operator recovery stay open. Its error table gains a row for the
   abandoned-pair refusal in the existing style.
2. `docs/reference/commands.md`: the `akrogon phase` row/entry (or the run-check row where the
   existing text fits best) notes the refusal in one line, matching table style.
3. `docs/reference/files.md`: a row for `cleared-<run>.md` in the leaf-folder file list, matching
   existing style (what it is, who writes it — the seat or operator after cleanup — and that a
   non-blank file releases the refusal); the capture row's "a killed run leaves them" text may gain
   the refusal note if one line suffices.
4. `src/AREA.md` and `tests/AREA.md`: one line each in the existing sentence/line style —
   `src/AREA.md` for the capture lock + `moveGuards` gate in the run-check/phase description,
   `tests/AREA.md` updating the `durable-capture.test.ts` line and naming
   `tests/abandoned-capture.test.ts`.
5. `bun test tests/docs-links.test.ts` stays green (all links and anchors valid).

## 3. Read-first list

- `docs/reference/checks.md` (capture section + error table), `docs/reference/commands.md`,
  `docs/reference/files.md`.
- `src/AREA.md`, `tests/AREA.md` — keep AREA files ≤40 lines, exactly the existing second-level
  sections.
- `skills/implement-issue/ponytail.md`.
- Leaf `brief.md`/`design.md`/`plan.md` in
  `/home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/` for the
  mechanism being documented.

## 4. Change list and needed interfaces

- The five files above only. Prose additions matching existing style; no new files, no code.
- The refusal message shape to document: names each pair's out/err path and the `cleared-<run>.md`
  to write.

## 5. Do-not, reasons and exceptions

- Do not edit skills/, src/, tests/ code or tests/abandoned-capture.test.ts — other units own them.
- Do not rewrite or reorder existing doc lines beyond the additions — minimal diff.
- Do not document `flock` internals in human docs beyond what helps a seat recover — the docs name
  the behavior and the clear step.
- Reason: plan D8; exception: a revised brief from A.

## 6. Ordered steps

1. Read the five files.
2. Add the lines/rows.
3. `bun test tests/docs-links.test.ts --timeout=30000`.
4. One commit: `docs: abandoned capture pair gate and cleared-<run>.md`.

Advisory size: 5 files, under 15 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` (only if the worktree lacks node_modules)
- `bun test tests/docs-links.test.ts --timeout=30000`

## 8. Done-when, evidence and report

The five files updated; docs-links green; commit id reported.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
