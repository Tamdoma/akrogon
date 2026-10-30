# Brief U2: slow-merge-notice docs

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/slow-merge-notice-u2`
Leaf plan: `/home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/plan.md` (authoritative; this brief copies its binding facts).

## 1. Goal

Update the docs the leaf plan names for the merge-slow contract: a completed merge-scope `akrogon verify` run compares its wall time (`end − start`) against the median of the last 20 eligible merge runs (completed, setup 0, no `compares`, no `reused`/`blocked` entries; needs ≥5 or nothing is checked); a run more than 1.5× that normal and at least 2 minutes more is flagged, prints `verify slow: <ms>m measured vs <normal>m normal; first seen at <leaf> <run>` (`; accepted as new normal` when the last 20 eligible runs all lie inside the episode), stores a `slow` record on its `verify-runs.jsonl` receipt, and sends one herdr `<repo> merge slow` notification per episode, retried by the next in-episode run on failure; the episode pins its pre-jump normal and closes `recovered` (eligible run back under threshold) or `accepted` (last 20 eligible all inside); `akrogon status` prints `Slow merge: <repo> first seen at <leaf> <run>, last <ms>m vs normal <normal>m` while open. Leaf scope runs are never checked; `compares` runs are neither checked nor counted.

## 2. Numbered acceptance criteria

1. `src/AREA.md` `src/verify.ts` sentence gains the slow comparison, `slow` receipt field, `merge slow` notice and `Slow merge:` status line in the same terse style; file stays within its existing structure and ~40 lines.
2. `docs/reference/checks.md` gains the comparison/eligibility/threshold/episode/notice behavior in the `akrogon verify` section.
3. `docs/reference/files.md` `verify-runs.jsonl` row mentions the `slow` record.
4. `docs/reference/commands.md` `akrogon status` row mentions the `Slow merge:` line.
5. `tests/AREA.md` gains one line: `tests/slow-merge.test.ts` checks the merge-slow comparison, episode lifecycle, notice retry and status line.
6. `bun test --timeout=30000 tests/docs-links.test.ts tests/command-reference.test.ts` green; `bunx prettier --check` passes on the edited files.

## 3. Read-first list

- `src/AREA.md` — the `src/verify.ts` bullet in Key files; match its compression.
- `docs/reference/checks.md` — "Prove a commit with akrogon verify" section and the receipt paragraph.
- `docs/reference/commands.md` — `akrogon status` row.
- `docs/reference/files.md` — `verify-runs.jsonl` row.
- `tests/AREA.md` — the `tests/verify.test.ts`/`tests/status.test.ts` lines for style.
- `/home/ivan/Work/infra/akrogon/issues/open/merge-slow-alarm/slow-merge-notice/design.md` — binding decisions 1a/2a/3a/4a verbatim (wording for the docs).
- `src/verify.ts`, `src/status.ts` — the real surfaces (read-only; a sibling worker edits them — write docs from this brief and the plan, not from any in-flight diff).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns (no other unit touches these): `src/AREA.md`, `docs/reference/checks.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `tests/AREA.md`. Must land first: nothing — the contract strings (`verify slow:`, `Slow merge:`, `repo merge slow`, `slow` field, `recovered`/`accepted`, eligibility predicates) are fixed by the plan. Shared test resource: none.

Keep every edit additive and inside existing sentences/rows where possible; do not restructure. The docs must say "first seen at", never "caused by" (binding Q3).

## 5. Do-not, reasons and exceptions

- Do not touch `src/verify.ts`, `src/status.ts`, `tests/slow-merge.test.ts` or any code/test — owned by U1 or locked by plan. Exception: none; a wrong brief returns a mismatch.
- Do not document behaviors outside this leaf (per-command timing, Discord broadcast) — both are chart-Excluded. Exception: none.
- Do not add a new docs file or duplicate the contract in two places — each doc gets the one fact its page owns. Exception: revised brief from A.
- Do not weaken the exact strings above (`verify slow:`, `Slow merge:`, `repo merge slow`) — they are the literal user-facing contract the tests assert. Exception: revised brief.
- Reasons restated: docs describe the pinned contract, exclusions stay excluded, one fact per page; the only exception route is a revised brief from A.

## 6. Ordered steps

1. `src/AREA.md` — extend the `src/verify.ts` sentence (AC 1).
2. `docs/reference/checks.md` — one short paragraph in the verify section (AC 2).
3. `docs/reference/files.md` + `docs/reference/commands.md` — row edits (AC 3, 4).
4. `tests/AREA.md` — one line (AC 5).
5. Run the commands in §7 until green.

Advisory size: 5 files, ~20 turns.

## 7. Commands

- `bun test --timeout=30000 tests/docs-links.test.ts tests/command-reference.test.ts`
- `bunx prettier --check src/AREA.md docs/reference/checks.md docs/reference/files.md docs/reference/commands.md tests/AREA.md`

Install first if needed: `bun install --frozen-lockfile --backend=copyfile`. Keep output through `akrogon run-check --name <label> -- <cmd>` run from this worktree and cite the printed `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All §2 criteria green; `git diff --stat` covers only the five owned files; commit on detached HEAD, return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
