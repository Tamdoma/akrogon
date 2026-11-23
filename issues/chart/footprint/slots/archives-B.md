# Archives proof B: footprint

Code read on akrogon main. (H) marks what I measured on this host on 2026-11-23. Both passes are mine: pass 1 from git, ledger rows and the markdown in the closed folder, pass 2 with the archive unpacked.

## Short answer

- Archive needed: 0 of 6.
- The failing names are already in the ledger. Every red command row stores `failures` since 2026-11-12 (framework) and 2026-11-16 (akrogon) (H). So the "small extract" half exists.
- The "why" comes from the seat's write-up in `report.md` or `review-B.md`, not from the log. In one leaf the archived logs do not even contain the errors, and the report does.
- What only the archive holds: the assertion text (code frame, Expected and Received values, stack). It did not change the answer in any of the six.
- Pick: stop committing archives. Add no excerpt now.

## The six leaves

| | Leaf | Reds | Answer without the archive | Only in the archive | Needed |
|---|---|---|---|---|---|
| L1 | akrogon `installed-step-transfer` | 2 merge reds, 11-17, same head | Row names both tests. `report.md:61-64`: `tests/hc-identity.test.ts:130` then `tests/next.test.ts:514` on the retry, known-red said `fail` because the base was green, both pass alone and in a full rerun, cause is socket timing in the hc fixture | Code frame of the two assertions | no |
| L2 | akrogon `model-choice-rule` | 1 leaf red, 11-17 | Row names the test. `review-B.md:29`: `tests/hc-identity.test.ts:95`, same-command retry green with 1,224 passes, the leaf changes prose only. `report.md:113` records it as inconsistent | `Expected: 0, Received: 1` | no |
| L3 | akrogon `main-red-cover` (epic `merge-lanes`) | 2 leaf reds, 1 merge red, failed once, 11-21 | Rows name all three tests. `report.md:43` and `review-B.md:51-55, :61-67` give the file, the code path each test reaches, the red retry on a different test, the known-red `fail`, the operator resume and the green receipts. `log.jsonl` holds the failure reason | `Expected: 0, Received: 1` | no |
| L4 | framework `hook-tests-typecheck` | 1 merge red, exit 2, 11-18 | Row says `(script) hooks:typecheck`. `review-B.md:358-366` quotes both compiler errors with file and line, says why (the leaf now compiles tests merged since review) and names the two repair commits. Their `Test-Change` trailers in git repeat it | Nothing new | no |
| L5 | framework `pagespeed-lab-samples` | 6 leaf reds in 4 minutes on one head, 11-21 | Rows say `(script) lint`. `report.md:22`: 3 error-level diagnostics, 2 `noAssignInExpressions` and 1 `useIterableCallbackReturn`, in the leaf's own diff. `git show 765e7f2a` gives the two files and lines | Nothing. The six logs print 20 diagnostics each and none is one of the three errors | no |
| L6 | framework `record-amend-skill` | 9 leaf reds on one head, 4 merge reds, failed twice, 11-22 | Rows name the script and every failing test. `report.md:59`: `TS18047` on `fm`. `review-B.md:46-60` per merge red: the test, `exit null` at 16.016 s against the 16 s limit at `chain-recorded-audit.test.ts:108`, the passing rerun alone in 14.027 s. `log.jsonl` holds both failure reasons | File and line of `TS18047`, which `git show 7e115b3a` also gives | no |

Not answered by either pass: why L5 and L6 ran the same red check 6 and 9 times on one head.

## Wider check

All red command rows of closed leaves, both repos (H):

- F1. Merge-scope reds: 731 of 732 are cited by log name in a report or review that stays.
- F2. Leaf-scope reds: 120 cited, 252 not. Most uncited ones are repeats on one head (L5, L6) or reds on the way to a later commit.
- F3. Since 11-16, uncited reds where the markdown names neither the test nor the head: 4 in akrogon, 3 in framework. All leaf scope.
- F4. Rows before the dates above store no names: 118 red rows in akrogon, 378 in framework. Their archives stay in history, so the fallback read still works for them.
- F5. Size: 116 archives, 14.3 MB in akrogon. 268 archives, 138 MB in framework. The six samples are 0.7 to 22.7 MB raw. L6 holds nine copies of the same 230 KB red log.

## Readers of archived logs

- R1. Code. `failedTests` (src/flaky.ts:54-66) reads a log, from the archive if packed (src/evidence.ts:69-80). Every caller except one uses `failures ?? failedTests(...)` (src/flaky.ts:123, :130, src/verify.ts:338, :365, :376, :460, src/land.ts:169). New rows have `failures`, so they never open a log.
  - The exception is the known-red check (src/verify.ts:259, :271). It reads the head log and the base-run log directly. Both belong to the leaf that is still open.
- R2. `akrogon log <path>` (src/akrogon.ts:311-315). Reports cite logs by path. For a leaf closed after the change, the command answers "no log".
- R3. `learn-issues` reads log paths cited in lesson history files (skills/learn-issues/SKILL.md:18). 10 of 72 history files in akrogon and 28 of 222 in framework cite a check log (H). Old ones keep working. A new lesson must quote the lines it needs.

## Recommendation

- O1. Stop committing (pick). Names are in the row and the reason is in the report.
- O2. Keep a small extract. Names are already stored. A text excerpt needs a parser per tool: Bun, tsc and Biome print errors differently, and L5 shows a capped log may not contain the error at all.
- O3. Keep archives. Costs about 6 MB a day in framework for bytes that changed no answer.

The writer:

- `packFolderLocked` (src/pack.ts:59-104) builds and verifies the archive, then deletes the plain logs (:104).
- It is called when the owner completes (src/phase.ts:401), under the owner's exclusive lock, just before the move to `issues/closed`.
- A second caller is the `akrogon pack` command (src/pack-command.ts:122), used by the direct route and by hand.

Smallest change: at src/phase.ts:401, delete the owner's `**/*.log` files in place of the pack call. Open logs are already ignored by git (`.gitignore:17`, `issues/open/**/*.log`), so nothing new is tracked and nothing is left on disk.

- Leave `akrogon pack`, `readLog` and the archive reader as they are. Old archives stay readable.
- Not traced: which tests assert an archive after completion.
- Chart direct logs go through `akrogon pack <chart>` (skills/chart-issues/assets/direct-route.md:28). Same question, separate call site.

## Risks

- R4. The proof rests on seats writing each red down. A red that no seat turn follows has only names: the land run's own rerun (`rerun` key, 4da466f5, 0 rows so far) and whatever land-own-reds lets the land run handle alone.
  - If that chart removes the seat from a red, the land run must write one line of reason into its own ledger row at that point. That is the place for an excerpt, if one is ever needed.
- R5. Deleting is final. A test that flakes across leaves (two tests appear in both L1/L2 and L3) keeps its name, head and count, but not its error text. The head sha is recorded, so the run can be repeated.
- R6. My sample has no leaf from before names were stored. Those keep their archives, so the change does not touch them.

What would prove it after the change: ask the same question for the next 10 closed leaves with a red. Count answers that need a log. Expected 0.
