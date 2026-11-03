# Sub-brief 2: skill and doc text — blocked-check meaning, no per-command reuse

## 1. Goal

Criterion 6 of leaf quick-red-skip (plan U-b): seat-skill red dispositions say a `blocked` check did not run and its blocker is fixed first; no owned surface promises per-command reuse any more.

## 2. Acceptance criteria

- `skills/implement-issue/SKILL.md` `## Shared context` red-disposition paragraph (the one starting "A red that stays red runs `akrogon verify --known-red`") says a check recorded `blocked` did not run and its blocker is fixed first, and no longer promises per-command reuse on the base tree.
- `skills/check-issue/SKILL.md` `## check.review` red-disposition paragraph: same two changes.
- `skills/merge-issue/SKILL.md` `### Shared endings` red-verify paragraph (the "On a red verify" paragraph): same two changes.
- `skills/chart-issues/SKILL.md` `## Direct route` step 3 known-red sentence: the per-command-reuse clause is replaced (no blocked-check sentence required here).
- `docs/reference/checks.md`: `## What runs where`, `## Prove a commit with akrogon verify`, `## Known red` describe the new order and blocking and make no per-command-reuse promise.
- `docs/reference/commands.md` `akrogon verify` row, `docs/reference/config.md` `full` row, `docs/use/merge-and-announce.md` step 1, `src/AREA.md` verify bullets, `tests/AREA.md` verify.test.ts line: same stale claims removed.
- `bun run typecheck` passes; prettier clean on edited files.

## 3. Read-first list

- Each file above. The semantics to describe (verbatim from the plan):
  - A verify pass runs non-`full` `checks` first in config order, then `full` checks, then `merge_checks` members (merge scope only).
  - When setup or any non-`full` check is red, each `full` check is recorded `blocked` with the blocker's exit and log and does not execute; a red `full` check never blocks another `full` check.
  - A red `checks` entry (non-`full` or `full`) still records every merge member `blocked` without running it.
  - Per-command reuse is deleted: a verify pass always executes its commands; only the whole-receipt fast path remains (`reuse receipt <run> tree=<tree>` when a completed whole-green row exists for the same tree and command set).
  - `verify --known-red` runs no base pass when the merge-base tree already holds a whole-green row; it then returns the same `knownRedReceipt` judgment the receipt gate gives (a whole-green base means `fail`).
  - A `blocked` entry is never known-red cover (recorded limitation, same as a blocked member today).
  - Rows written before this leaf carrying `reused` entries still parse.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned files (do not touch others):

- `skills/implement-issue/SKILL.md`: in `## Shared context`, the red-disposition paragraph currently contains "reusing each command already green on the base tree under the same name and command text and running only what lacks one". Replace that clause with wording that the base pass is skipped when the merge-base tree already holds a whole-green row (the outcome is `fail`), and add the sentence: a check recorded `blocked` in a verify receipt did not run; fix the check named as its blocker first. Keep the rest of the paragraph.
- `skills/check-issue/SKILL.md`: `## check.review` red-disposition paragraph — identical two edits. Do NOT touch `## check.repair` (belongs to another leaf).
- `skills/merge-issue/SKILL.md`: `### Shared endings`, the "On a red verify" paragraph — identical two edits.
- `skills/chart-issues/SKILL.md`: `## Direct route` step 3 — replace the same "reusing each command already green …" clause with the base-skip wording.
- `docs/reference/checks.md`:
  - `## What runs where` paragraph after the table (currently starts "So a leaf runs every `checks` command…" and ends "…a red `checks` entry leaves every member recorded not run"): rewrite to the semantics above — non-`full` first, then `full`, members last; `blocked` means did not run; a red `full` never blocks a `full`. Keep the `full` run-serialization paragraph (`withAdmission`) — it is still true and separate. Update the `Source:` reference if wording changes.
  - `## Prove a commit with akrogon verify` steps 2–3 and the "A receipt is reused." paragraph: drop per-command reuse; keep the whole-receipt `reuse receipt` sentence and the "Changing a check command in config makes old receipts stop counting" fact.
  - `## Known red` step 2 and the cover paragraph: drop the "reusing each command already green…" clause; state the base pass is skipped when the merge-base tree holds a whole-green row; drop "or was reused" and add that a `blocked` entry never covers (beside the existing member rule).
  - The slow-merge paragraph's "no `reused` or `blocked` command entry" stays — old rows still carry them.
- `docs/reference/commands.md` `akrogon verify` row: remove "reusing a command's green result on the same tree" and the `--known-red` "under the same reuse" phrase; state ordering and blocking briefly to match the new behavior.
- `docs/reference/config.md` `full` row: append that in a verify pass `full` checks run after other `checks` and are recorded `blocked` without running when setup or a non-`full` check is red.
- `docs/use/merge-and-announce.md` step 1: drop ", reusing what is already green on the same tree".
- `src/AREA.md`: the two verify bullets (line ~6 "reusing entries already green on the same tree under the same name and command text", and line ~19 "a completed run's green entry is reused per command…", "under the same per-command reuse", "accepting per-command greens gathered across completed runs or a per-command known-red cover" and "a base entry with exit 0 never covers") — update to the new semantics: sequential non-`full` then `full` (blocked, not run, on a red), per-command reuse deleted (whole-receipt `reuse receipt` stays), known-red base skip on a whole-green base, blocked entries never cover. Keep `AREA.md` under 40 lines total with its existing sections.
- `tests/AREA.md` line ~17: replace "per-command reuse through `reused` receipt entries" with the new coverage (full ordering/blocking, old `reused` rows still parsing, per-command known-red cover).

No code changes. Keep edits minimal — replace stale claims, do not restructure.

## 5. Do-not, reasons and exceptions

- Do not edit `skills/check-issue/SKILL.md` `## check.repair` — owned by leaf repair-verify-merge.
- Do not touch `docs/reference/files.md` (`reused` names the source run — still true for old rows) or the slow-merge eligibility sentence in checks.md — same reason.
- Do not describe `verify --known-red` as passing on a whole-green base — a green base never covers a red head; the judgment is `fail`, same as the gate.
- Do not remove the whole-receipt `reuse receipt` fast-path description — only per-command reuse is deleted.
- No test edits (tests are locked and owned by A).
- Return a mismatch with evidence to A instead of guessing semantics; the exception is a revised brief from A authorizing it.

Restated: only the listed files and claims change; old-row `reused` descriptions in schema/file docs stay; the judgment on a whole-green base is `fail`.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree (once, needed only for step 3).
2. Edit the three skill files' red dispositions, then chart-issues step 3, then `docs/reference/checks.md`, then the remaining doc files (criteria 6 + stale-claim sweep).
3. `bun run typecheck` and `bunx prettier --check skills/implement-issue skills/check-issue skills/merge-issue skills/chart-issues docs/reference/checks.md docs/reference/commands.md docs/reference/config.md docs/use/merge-and-announce.md src/AREA.md tests/AREA.md` (prettier `--write` the files you edited if it complains).
4. `grep -rn "reusing each command already green" skills/ docs/ src/AREA.md` — must print nothing.
5. Commit all edited files in one conventional commit.

Advisory size: 10 files, under ~40 turns.

## 7. Commands

```sh
bun run typecheck
bunx prettier --check <edited files>
grep -rn "reusing each command already green" skills/ docs/ src/AREA.md   # expect no output
```

## 8. Done-when, evidence and report

Every section-7 command exits 0 (grep exits 1 with no output — report that as pass); edits committed on branch `quick-red-skip`; report names the commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
