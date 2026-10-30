# Sub-brief 2: recovery rule in check-issue and implement-issue SKILL.md

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/abandoned-capture-stop-u2`

## 1. Goal

Implement plan decision D6 for leaf abandoned-capture-stop: the capture-pair recovery rule appears
in `skills/check-issue/SKILL.md` under `## check.review` and `## check.repair`, and in
`skills/implement-issue/SKILL.md` under `## implement` and `## check.fix`.

## 2. Numbered acceptance criteria

1. All four named sections carry the rule, in the seat's own instruction voice and matching each
   file's prose style (no new headings): after a run-check printed no `check <label>:` line, the
   seat recovers before any rerun or move — it reads the pair, runs the leaf grant's own discovery,
   cleanup and authenticated absence read for that run (not only the IDs the pair printed), writes
   a non-blank `cleared-<run>.md` beside the pair stating what it found, cleaned and read, and
   moves the leaf to `failed` with that reason when it cannot. A later green run clears nothing.
2. In check-issue the rule sits near the stop-run/keep-output material of each of the two sections;
   in implement-issue the same, inside `## implement` and `## check.fix`. One sentence or short
   paragraph per site; same content in all four, wording adjusted only for the section's artifact
   (`review-<slot>.md` vs `implementation/report.md`) if the site needs it.
3. Existing tests that grep these files (`bun test tests/run-units.test.ts -t 'skills'`,
   `bun test tests/docs-links.test.ts`) stay green — the added text must not remove or reword any
   existing required strings (`akrogon run-check`, `akrogon log`, `akrogon verify`, `merged`,
   `fetch`, `push`, `akrogon stop-run`, `pkill -f`, `<chart>/direct`, `standalone ... outside`,
   `--holder <chart>/direct`).

## 3. Read-first list

- `skills/check-issue/SKILL.md` — `## check.review`, `## check.repair`, the stop-run paragraph in
  `## Shared context` (the model for voice).
- `skills/implement-issue/SKILL.md` — `## implement`, `## check.fix`, its stop-run paragraph.
- `skills/implement-issue/ponytail.md`.
- Leaf `brief.md` criterion 6 and `design.md` Q3·3a for the exact recovery content (in
  `/home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/`).

## 4. Change list and needed interfaces

- `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md` only.
- No interface produced; no code.

## 5. Do-not, reasons and exceptions

- Do not edit any other file (no code, no tests, no docs/ pages — docs are another unit's).
- Do not restructure or renumber sections — these skills are prompts read by seats; minimal diff.
- Do not invent a `cleared` command — the file is the mechanism.
- Reason: locked design Q3·3a / plan D6; exception: a revised brief from A.

## 6. Ordered steps

1. Read both files; find the stop-run paragraph and each section's run-check/red-retry text.
2. Insert the recovery rule in all four sections.
3. Run the commands in section 7.
4. One commit: `skills: capture-pair recovery before rerun after a killed run-check`.

Advisory size: 2 files, under 10 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` (only if the worktree lacks node_modules)
- `bun test tests/run-units.test.ts -t 'skills' --timeout=30000`
- `bun test tests/docs-links.test.ts --timeout=30000`

## 8. Done-when, evidence and report

Both skill files carry the rule in the four named sections; listed tests green; commit id reported.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
