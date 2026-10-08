# Brief U3: next dispatch through leaf-aware seats

## 1. Goal

Plan D5 and criteria 1+2 (`next` side) of `index-seats`: `akrogon next` launches seats from the leaf's index front matter and refuses malformed indexes before any tab or worktree allocation.

## 2. Numbered acceptance criteria

1. `launch(global, repo, slot, leafPath)` in `src/next.ts` resolves through `seats(global, repo, leafPath)`; both call sites pass the leaf's folder path: `src/next.ts` ~line 528 (`launch` call inside `dispatchSlot`, argument `leaf.path`) and ~line 655 (the pre-allocation `seats(global, repo)` validation, becomes `seats(global, repo, leaf.path)` before `checkBase`).
2. A depth-3 leaf (`issues/open/<epic>/<issue>/<leaf>`) at phase `plan.positions` whose `EPIC.md` carries `---\nslots:\n  a:\n    harness: fake\n    model: epic-a\n    effort: low\n---` starts seat A with the epic values and seat B from repo `issues/config.yaml` `slots.b` or machine `config.yaml`, observable in recorded `herdr agent start` argv (`db.starts` in the fake-herdr DB).
3. The same block in the child `ISSUE.md` wins over the epic's for that issue's leaves; a depth-2 standalone issue's `ISSUE.md` block applies to its leaves.
4. Each malformed index — front matter that does not parse, a key other than `slots`, a seat other than `a`/`b`, a missing field, a value blank after trim, a decoded value containing `'` or `"`, or a harness with no machine template — makes `akrogon next <slug>` exit non-zero, names the index path and the parse/schema reason (and the seat when the failure belongs to one) in stderr, and leaves `db.tabs`, `db.panes`, `db.starts` empty and creates nothing under `issues/worktrees`.

## 3. Read-first list

- `src/next.ts` — `launch()` line 252, `dispatchSlot` ~440, the call sites at 528 and 655.
- `src/config.ts` — landed `seats(global, repo, leafPath?)` returning `{a, b, source}` and `SeatIndexError`; read the merged file in your worktree.
- `tests/helpers.ts` — `dispatchFixture`-style helpers, `leaf(f, slug, phase, extra, container)` where `container: 'epic/issue'` creates a depth-3 leaf.
- `tests/next.test.ts` — lines 39-60 (`dispatchFixture`, `database`, `next`, `skips`), lines 143-160 (`db.starts[0]` contains model string pattern).
- `tests/fake-herdr.ts` lines 139-155 — `db.starts` records full argv.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `src/next.ts` and `tests/next.test.ts`. Prerequisite: U1's `seats`/`SeatIndexError` commit, already on HEAD. Shared unchanged resources: `tests/helpers.ts`, `tests/fake-herdr.ts`.

Interface consumed (already merged):

```ts
seats(global: GlobalConfig, repo: Repo, leafPath?: string): { a: SlotConfig; b: SlotConfig; source: { a: string; b: string } }
```

Code diff is tiny: add `leafPath` param to `launch`, pass `leaf.path` at both sites.

Tests to write first in `tests/next.test.ts`:

- Criterion 1: one test with a `dispatchFixture`; write `EPIC.md` front matter (`slots.a` = `fake`/`epic-a`/`low`), leaf at `'plan.positions'` in container `'epic/issue'`; `next(f, [slug])` code 0; `database(f).starts` has 2 entries where `starts[0]` contains `'epic-a'` and `'low'`, `starts[1]` contains the repo/machine B model (`'strong-b'` unless a repo `slots.b` is set). Then in the same or a second leaf: add `slots.b` to `issues/config.yaml` plus the block in `ISSUE.md` (beating the epic) — assert B gets `ISSUE.md` values. Then a standalone depth-2 leaf (`container 'issue'`) with `ISSUE.md` `slots.a` — assert A gets it.
- Criterion 2: a parametrized loop over the malformed cases (write each into `ISSUE.md` of a fresh `leaf(f, slug, 'plan.synthesis')`), asserting non-zero exit, stderr contains the `ISSUE.md` path and reason fragments (e.g. `slots`, `a`, `b`, `harness`, `quote`/the quote char as the error text actually produces — assert only what the error guarantees: path + a non-empty reason; plus seat letter for seat-scoped failures), and empty `tabs/panes/starts` plus absent `issues/worktrees` dir. The missing-harness case uses `harness: ghost` (schema-valid, resolution-invalid).
- Deliberate-break proof: before landing the `leafPath` arguments, the criterion-1 test fails (index ignored → `strong-a`); state that red result in the report.

## 5. Do-not, reasons and exceptions

- Do not edit `src/config.ts`, `src/status.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts` or other test files — owned by U1/U4/A; a real gap there is a mismatch return with evidence.
- Do not weaken the malformed-case matrix or assert error text the code does not guarantee (paths and reasons are required; exact wording is not).
- No new files, no mocking beyond the existing fake-herdr boundary.
- Mismatch return, not scope drift; exception is a revised brief from A.

## 6. Ordered steps

1. Read the read-first files; write the new tests and run the criterion-1 test red to show it catches the missing `leafPath` plumbing.
2. Apply the two-line `src/next.ts` change (signature + both call sites).
3. `bun install`, then the commands below.
4. Commit with a `feat:` message and `Test-Change:` trailer for `tests/next.test.ts` (new cases added, no existing expectation changed).

Advisory size: 2 files, under 40 turns.

## 7. Commands

```sh
export AKROGON_BASE=2645d97ed1682185eea4788844f882a541885d24
bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/next.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Criteria 1-4 green; the criterion-1 test demonstrably failed before the `src/next.ts` change; typecheck passes; commit id returned. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
