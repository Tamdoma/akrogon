# Report: docs-reference-commands

Base `0680fda60062a72354f09c08a6c8f5ebe3fd00bd` (AKROGON_BASE, equal to origin/main at both refreshes, so the branch never moved). Committed head `94fe74fb3a7b4f59600e12fc1fb057fc0de48b38`. Log paths below are relative to this `implementation/` folder.

Mode: delegated (`implement: subagents`). Wave 1 ran U1, U2 and U3 together, and wave 2 ran U4. Briefs are in `brief-1.md` to `brief-4.md`. Every worker worktree was removed after its commit was cherry-picked.

## Changed files and reasons

| Commit | Path | Reason |
| --- | --- | --- |
| d7dbe076 | tests/command-reference.test.ts, tests/docs-links.test.ts, tests/run-permit.test.ts | Planned test changes T1 to T4, from plan.synthesis, with `Test-Change` trailers. |
| a9bb2913 | tests/AREA.md | Plan D12. The file matches the `tests` segment in `src/test-files.ts`, so A made this edit in its own commit with a trailer (plan Implementation notes). |
| 3d849967 (U1) | docs/reference/commands.md | Criterion 1. One row per dispatched verb (27), grouped by job. Effects were checked against handlers. README's "unowned" claim for `close` was dropped because `src/pull.ts:203` has no owner check. |
| a715c11e (U2) | docs/reference/skills.md | Criterion 2. One section per skill (10), plus the lesson rule. Chart consultants are named apart from seats A and B. |
| 769769f2 (U3) | docs/reference/config.md | Criterion 2. Machine, repo and `slots:` layers, nearest wins per seat with each seat taken whole (`src/config.ts` seat lookup). Embeds config-layers.svg. |
| 6ffe5ced (A) | docs/reference/commands.md, skills.md | A's review correction. `akrogon next` launches the command-owned land run (`src/next.ts:1060`). merge-issue runs only when an attempt is handed to seat B or for a solo rebase. |
| fa2af9bd (U4) | docs/reference/checks.md | Criterion 2. Leaf versus merge checks, run-check, verify receipts, known red, test-change refusals, guard, logs, and a table of refusals with remedies. Proof rules are linked to the skills. Embeds verification.svg. |
| 94fe74fb (A) | docs/reference/checks.md | A's review correction. A recovery from `failed` straight into `check.review` or `merge` still runs the citation checks (`src/phase.ts:290`). |

## Criteria and proof (all on head 94fe74fb unless noted)

1. Command table: `akrogon run-check --name c1-commands-final -- bun test --timeout=30000 tests/command-reference.test.ts` gives `check c1-commands-final: 0 check-c1-commands-final-1792766692255-1010822.log`. Deliberate break on 6ffe5ced: deleting the `akrogon sync` row gives `check c1-break-sync-row: 1 check-c1-break-sync-row-1792766520795-798868.log`. The failure names the missing `"sync"` in the verb list. The row was restored, then `check c1-commands: 0 check-c1-commands-1792766520897-799056.log`. The red before the page existed is in plan.md.
2. Page coverage: each page covers its listed subjects (see the table above). A cross-checked the claims it judged riskiest against `src/` and made the two corrections above. Full line-by-line accuracy is seat B's review. Links and images are proven by C3.
3. Link check: `check c3-links-final: 0 check-c3-links-final-1792766692349-1010936.log`. Breaks in a nested page made it fail (plan.md, `check c3-break: 1`, `check t2-img-break: 1`).
4. Retired-word scans: `check c4-retired-final: 0 check-c4-retired-final-1792766692475-1011034.log`. Breaks in a nested page made it fail (plan.md, `check c4-break-run-permit: 1`, `check c4-break-hold: 1`). The source, skill and AREA scans and the runtime retirement tests are unchanged.
5. Guide wording checks removed: `check c5-no-guide-final: 0 check-c5-no-guide-final-1792766692569-1011122.log`. Reason: those checks pinned wording in `docs/guide/files.md` and `next.md`, pages that docs-start deletes. The command table check already proves every verb and argument form is documented (design fact-ownership Q2, plan D7).
6. No dates and no guide links: `check c6-dates: 0 check-c6-dates-1792766692660-1011178.log`, `check c6-guide-links: 0 check-c6-guide-links-1792766692761-1011232.log`. Retired names are covered by C4. Whether every statement matches current code is B's per-page review.

## akrogon verify

`akrogon verify` on 94fe74fb took 2m47s wall time and ended `verify leaf 94fe74fb3a7b4f59600e12fc1fb057fc0de48b38: green`. Logs: setup `check-setup-1792766696807-1011558.log`, format `check-format-1792766698861-1011558.log`, test `check-test-1792766860960-1011558.log` (1114 pass, 0 fail across 66 files), typecheck `check-typecheck-1792766863396-1011558.log`.

## Worker returns

- U1: 27 rows under six groups. Section 7 tests green (`check u1-commands: 0`, `check u1-docs: 0`).
- U2: 10 sections. `check u2-docs: 0`.
- U3: `check u3-docs: 0`. It flagged that `grounding.docs`, `surfaces` and `indexed_scopes`, and the repo `fix_rounds`, are not read by `src/`. A confirmed `fix_rounds` with grep. The page describes `fix_rounds` from the skills (direct-route repair rounds).
- U4: `check u4-docs: 0`. Every literal refusal message on the page was grepped and found in `src/`.
- Each wave-1 cherry-pick was followed by green targeted tests (`check lane-pick-*: 0`).

## Known limitations

- checks.md leaves out the "main red" notification that verify can send after a known-red base run (raised by U4, not in the brief).
- config.md calls `grounding.docs`, `surfaces` and `indexed_scopes` optional lists without saying what they do, because no `src/` code reads them.
- README keeps its own command table until docs-start removes it. Nothing checks it now.

## Unverified criteria

- Criteria 2 and 6 statement-by-statement accuracy is left to seat B's review by design (no prose classifier).

## check.fix: review-B F1 (timing arguments)

- Prior reviewed base `0680fda60062a72354f09c08a6c8f5ebe3fd00bd`, prior reviewed head `94fe74fb3a7b4f59600e12fc1fb057fc0de48b38`.
- Refresh: the branch was rebased onto origin/main. Base moved `0680fda6` → `6bb7a45803eaabc52ddcf4649bb4db8a53488082` (docs-reference-records pages, with no conflict). Head moved `94fe74fb` → `a6ca9ecbb26e5068399e3dbbb2442a6aa1813eba`.
- Handed-off base `6bb7a45803eaabc52ddcf4649bb4db8a53488082`, handed-off head `40902d8399dc88612da71a678f43038db90e1286`.
- The repair started at `a6ca9ecb` and ended at `40902d83`.
- Source: `src/akrogon.ts:176-184` rejects a bare `akrogon timing` with its usage error. B reproduced this (`check b-timing-local: 1`).
- Commit 1, `test(docs): require one timing form in the command contract`. A's test expectation correction: `contracts.timing` is now `<slug>|--cohort --since <iso>|--flow --since <YYYY-MM-DD>`, a required group. The commit carries a `Test-Change` trailer citing the dispatcher and F1. Against the old page it fails: `check f1-red: 1 implementation/check-f1-red-1792767225106-1504718.log`.
- Commit 2, `docs(reference): show timing takes exactly one form`. commands.md:41 now shows `akrogon timing <slug> \| --cohort --since <iso> \| --flow --since <YYYY-MM-DD>`. Then `check f1-green: 0 implementation/check-f1-green-1792767225209-1504787.log`.
- Criterion proofs on 40902d83, all exit 0. They were rerun because the rebase brought new docs pages into the scanned tree:
  - `check fix-c1: 0 implementation/check-fix-c1-1792767232389-1505275.log`
  - `check fix-c3: 0 implementation/check-fix-c3-1792767232498-1505338.log`
  - `check fix-c4: 0 implementation/check-fix-c4-1792767232629-1505402.log`
  - `check fix-c5: 0 implementation/check-fix-c5-1792767232720-1505487.log`
  - `check fix-c6-dates: 0 implementation/check-fix-c6-dates-1792767232819-1505559.log`
- `akrogon verify` on 40902d83: `verify leaf 40902d8399dc88612da71a678f43038db90e1286: green` (wall time 2m48s; test run 1114 pass, 0 fail; setup, format and typecheck all 0). Logs:
  - setup `implementation/check-setup-1792767237157-1505779.log`
  - format `implementation/check-format-1792767239317-1505779.log`
  - test `implementation/check-test-1792767402547-1505779.log`
  - typecheck `implementation/check-typecheck-1792767404750-1505779.log`
- Out of scope: README's own command table has the same bracketed timing form. docs-start owns README and removes that table.
