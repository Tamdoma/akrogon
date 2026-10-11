# Brief U3 — docs, README and sweeps

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/known-red-merge-u3` (detached at `d1515ea`). Leaf: `known-red-merge`. Plan decision: D5 (entire hold surface retired), plus the doc-side of D1/D7.

## 1. Goal

Rewrite the hold/red-on-base surface out of the skills and docs, document the merge-turn comparison contract, and satisfy the test sweeps. No src edits.

## 2. Numbered acceptance criteria

1. `skills/merge-issue/SKILL.md` drops `mergeHolder`, the `--red-on-base`/`--command` ending, the "repo is held" sentence and all hold mentions; it documents: `merged --check --compare <file>` (repeatable) accepted on the merge turn bound to the prompt's attempt, leaf revision and `built_on`; the `compared: N unit(s) pass under the same leaf code on batch base <sha>` print; `Repo red entry opened:`/`resolved:`/`Existing repo red entry confirmed:` notices; the base-run rule text `Run ` + "`akrogon base-run --base \"$AKROGON_BASE\"`" + ` --attempt <id> -- <command>` verbatim (backtick before Run's command, see `tests/red-docs.test.ts`); the `reuse`/`rerun` comparison gate (`--check` may carry comparison records, `rerun` clears them); the check.fix red-run endings reworded to the `check.fix` move without `--red-on-base`/`--culprit` hold semantics (keep `--culprit`, keep batch split semantics); `green` records resolving at landing; the batch record fields `built_on`, `prompted_at`, `members` listed in `docs/merge.md`.
2. `docs/merge.md`: `--compare` contract on `merged --check`; `compared:` print; notices; restack comparison gate; batch `comparisons` field; hold surface removed (`held.yaml`, `repo is held`, `--red-on-base` ending, `unhold`, `hold-fix`, `mergeHolder`).
3. `docs/next.md`: hold mentions removed; green-resolve-at-landing sentence.
4. `docs/red-journal.md`: `'held'` marked historical-only (still parseable, no longer written).
5. `docs/files.md`: `held.yaml` row removed.
6. `docs/cheat.md`: `unhold`/`hold-fix` rows removed.
7. `README.md`: `unhold`/`hold-fix` table rows removed; `--red-on-base`/`--command` removed from the `check.fix` row (must match `COMMANDS` in `src/akrogon.ts` per `tests/command-reference.test.ts` — read that test and `src/akrogon.ts` first); `held.yaml` removed from the file map; `mergeHolder` sentence removed.
8. `src/AREA.md`: replace hold bullet(s) with the comparison bullets (merge `--compare` + `comparisons`; green resolve at landing; restack rerun gate) in Non-obvious patterns; stay within the 40-line/4-section limit (head -40).
9. `tests/AREA.md`: update the deleted `hold.test.ts` line; add `merge-compare.test.ts` and `hold-retired.test.ts` lines; update `pause-status.test.ts`, `merge-attempts.test.ts`, `command-reference.test.ts`, `red-docs.test.ts` lines for their new coverage; stay within format.
10. Sweeps green: `grep -nE 'hold-fix|unhold|--red-on-base|repo is held|mergeHolder|holdRepo' skills/ docs/ README.md src/ tests/helpers.ts` → no match; `grep -nE 'held\.yaml|mergeHolder|writeHeld' src/` → none; no src file reads/writes `held.yaml` (the sweep test greps `src/` directly — run it to confirm).
11. The retired-surface tests pass: `tests/hold-retired.test.ts` `sweep:` case and `tests/red-docs.test.ts` `the merge skill carries...` case go green once U1+U2 land (the sweep parts you own turn green with your diff alone; cases needing code — unhold exit, status prints — stay red until U2's pick).

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `tests/hold-retired.test.ts` lines 84-115 — the doc sweep greps; your text must not trip them.
- `tests/red-docs.test.ts` — exact asserted substrings for `skills/merge-issue/SKILL.md` (lines ~53-80).
- `tests/command-reference.test.ts` + `src/akrogon.ts` `COMMANDS` — README table contract.
- `skills/merge-issue/SKILL.md` — full rewrite surface (the hold paragraphs are in `## merge` → `### Shared endings` and the prompt intro).
- `docs/merge.md`, `docs/next.md`, `docs/red-journal.md`, `docs/files.md`, `docs/cheat.md` — hold sections.
- `README.md` — the dispatch table rows and file map.
- `src/AREA.md`, `tests/AREA.md` — current line format.
- `design.md` (leaf folder) — the wording source for the new contract.

## 4. Change list and needed interfaces

- `skills/merge-issue/SKILL.md`, `docs/merge.md`, `docs/next.md`, `docs/red-journal.md`, `docs/files.md`, `docs/cheat.md`, `README.md`, `src/AREA.md`, `tests/AREA.md` — edits and deletions per criteria.
- Owned paths: the nine files above only. No src, no tests, no `src/akrogon.ts`.
- Chunks that must land first: none for the doc text (U2's README contract is already visible in `src/akrogon.ts` at HEAD for the retired rows; the `check.fix` row drops `--red-on-base`/`--command` which U2 removes in parallel — write the README as the post-U2 contract: row `phase <slug> check.fix --slot <A|B> [--attempt <id>] [--culprit <slug>]`; if `COMMANDS` still shows the flags, still write the post-contract text — the command-reference test is red until both picks land).
- Shared test resources: none.

## 5. Do-not, reasons and exceptions

- No src or test edits. Reason: U1/U2 own them. Exception: none.
- Keep every asserted substring byte-exact (tests use `toContain`). Reason: the sweeps are literal. Exception: none.
- Do not add new doc files. Reason: YAGNI. Exception: none.
- Return a mismatch with evidence rather than changing scope; exception is a revised brief from A.
- Reasons restated: literal assertions bind wording; file ownership prevents pick conflicts.

## 6. Ordered steps

1. `skills/merge-issue/SKILL.md` — rewrite merge/shared-endings sections (criterion 1).
2. `docs/merge.md` — compare contract + hold removal (criterion 2).
3. `docs/next.md`, `docs/red-journal.md`, `docs/files.md`, `docs/cheat.md` (criteria 3-6).
4. `README.md` (criterion 7).
5. `src/AREA.md`, `tests/AREA.md` (criteria 8-9).
6. Run the sweep greps (criterion 10) and `bun test tests/hold-retired.test.ts -t sweep` + `bun test tests/red-docs.test.ts` — report results.
7. Section-7 command.

Advisory size: 9 files, ~36 turns.

## 7. Commands

```
AKROGON_BASE=2756bd07d31730f90ee539e1261299e2c481b66a akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '"'"'bun install --frozen-lockfile'"'"' && akrogon guard own-modules && sh -c '"'"': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'"'"''
```

## 8. Done-when, evidence and report

All criteria met, sweeps clean, changed-test command run, commit on detached HEAD (`docs: merge comparison contract and hold retirement`); no `Test-Change:` trailer (no existing test file changed — `tests/AREA.md` is not matched by `src/test-files.ts`; verify by reading it).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
