# Brief 4 (unit U4): document `batch_limit` and per-attempt exclusion

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/batch-limit-repo-u4

## 1. Goal

Plan decision D7: update the operator docs and the merge-issue skill prose for the new merge behavior being implemented in parallel (repo `batch_limit`, per-attempt member exclusion replacing the persistent leaf `solo` mark). Plan: /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/plan.md

## 2. Numbered acceptance criteria

1. `docs/guide/setup.md` gains one `batch_limit` bullet in the config-keys list (~lines 50–63): integer ≥ 1, default 4, counts the whole merge batch including the holder.
2. `docs/guide/merge.md` batching paragraph (~line 7) states the cap (at most `batch_limit - 1` followers, default 3) and that a member conflicting during the stack build is excluded from that attempt only — its slug stays on the attempt record and it is eligible for the next attempt — instead of "marked `solo` ... merges alone".
3. `docs/guide/merge.md` restack paragraph (~line 27): the member-conflict clause no longer says "dropped to merge solo"; it says the member is restored and excluded from that attempt record. The holder `rerun rebase` solo behavior is unchanged text.
4. `docs/guide/state.md`: the batch record field list (~line 52) gains `excluded` (slugs excluded from the attempt by stack-build conflicts); the paragraph (~line 54) describing a leaf-level `solo: true` flag is removed; the `batch_limit` leaf-flag sentence stays.
5. `skills/merge-issue/SKILL.md` (~line 47): "restored to its saved head and dropped to merge solo" becomes per-attempt exclusion wording consistent with merge.md. All other `solo` references there are batch-record solo (`attempt=<id> solo`) and stay.
6. `bun test tests/docs-links.test.ts` passes (run it explicitly — `--changed` may not select it).

## 3. Read-first list

- /home/ivan/Work/infra/akrogon/issues/open/merge-throughput/batch-limit-repo/brief.md and design.md (binding wording: "the whole merge stack including the holder", "excluded only from that attempt")
- `docs/guide/setup.md` lines 44–70 (bullet list style: one terse sentence per key)
- `docs/guide/merge.md` lines 5–9, 25–29, 51–53
- `docs/guide/state.md` lines 48–56
- `skills/merge-issue/SKILL.md` lines 37–50
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md

## 4. Change list and needed interfaces

Owned paths: `docs/guide/setup.md`, `docs/guide/merge.md`, `docs/guide/state.md`, `skills/merge-issue/SKILL.md`. No shared resource, no prerequisites (wave 1, parallel with code work). Keep each file's existing terse style; sentences must name `batch_limit`, default 4, whole-stack counting, per-attempt exclusion and record `excluded` as specified above — nothing more.

## 5. Do-not, reasons and exceptions

- Do not edit `src/`, `tests/`, `issues/`, `README.md` or other guide files — out of scope. Exception: if a grep for `solo` or batch-size prose finds another stale reference inside `docs/` or `skills/`, fix it in place and report the extra file; do not chase outside those trees.
- Do not describe growth/halving rules that don't exist — `batch_limit` is a static repo key; only the pre-existing per-leaf split (`batch_limit` leaf state key) halves. Exception: none.
- Do not rename anchors or headings — `docs-links.test.ts` checks them.
- Return a mismatch with evidence rather than inventing behavior. Exception: a revised brief from A.

## 6. Ordered steps

1. Edit `docs/guide/setup.md` (criterion 1).
2. Edit `docs/guide/merge.md` (criteria 2, 3).
3. Edit `docs/guide/state.md` (criterion 4).
4. Edit `skills/merge-issue/SKILL.md` (criterion 5).
5. `grep -rn "solo" docs/ skills/ README.md` — resolve any remaining stale per-leaf-solo prose within docs/skills; report hits you leave.
6. `bun install`, run criterion-6 command, commit (message e.g. `docs: batch_limit key and per-attempt member exclusion`).

Advisory size: 4 files, under ~18 turns.

## 7. Commands

```sh
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/docs-links.test.ts
```

## 8. Done-when, evidence and report

All six criteria hold, docs-links test green, one commit (return its SHA). Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
