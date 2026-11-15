# Plan: failure-names

Serial-solo run: every wave holds one unit (U2's doc literals pin the names U1's reader returns; the wave split is organizational, the test commit is already landed).

## Decisions

- **D1. Reader shape.** Split `failedTests` into `names(text: string): string[]` (pure) plus the existing log read. `names` returns titles, `(script)`/`(unnamed)` names and `(no test name)`; `failedTests` keeps the `(log gone)` branch. Pure split makes each Q1 rule unit-checkable without a fixture repo.
- **D2. Stream model.** A `<chain>` splits on `|` into trimmed tokens, so a chain is a token tuple and strict prefix is tuple prefix (`test:a` is not a prefix of `test:ab`). The stream's `(fail)` set records the full trimmed chain of every `(fail)` line (`[]` for an unprefixed one).
- **D3. Script names.** Collect every `Exited with code <n>` line (n ≠ 0) chain. Drop any that is a strict tuple prefix of another collected chain (wrappers), then drop any whose full chain equals a `(fail)` stream. Each survivor yields `(script) <innermost token>`. `Signaled:` lines are ignored.
- **D4. Unnamed and dedup.** A `(fail) (unnamed)` line yields `(unnamed) <innermost token>` when its stream chain is non-empty, `(unnamed)` when it is empty. A `(fail)` line at line start is unprefixed even if the title contains ` | (fail) `. Names dedup; `(no test name)` only when nothing else. No free-text names.
- **D5. Lookup miss.** On `LogError` `nomatch` only: `resolve(repo.root, recorded)` regular file → read it and run `names` over it; otherwise `(log gone)`. Verified: `verify --holder` logs are recorded as absolute paths (`target: resolve(cwd, holder)` in `leafTarget`); `locate` only matches paths inside a worktree root's `issues/(open|closed|parked|chart)/`, so a holder outside the repo throws `nomatch` and the fallback reads it. `readLog`/`readLogAcross`/`locate`/`akrogon log` untouched.
- **D6. Open for the plan, answered.** No other reader matches `(no test name)` or assumes one name per nameless log: grep for `failedTests|no test name|log gone` shows callers are `flips`, `knownRedReceipt`, `newRedUnits` — all treat names as an opaque set. `flips` emits one flip per name (more precise lines, unchanged code). `knownRedReceipt` requires every head name among the base names — the new `(script)` names make script-X head vs script-Y base refuse with no compare change. `newRedUnits` keys by check+command+name — a different script is a different unit, so it notices.
- **D7. Seat texts.** `skills/lifecycle-rules.md` `## Red check...` branch becomes "any red name on the head is not a real test title (`(script) ...`, `(unnamed)`, `(unnamed) ...` or `(no test name)`)"; only all-real-title heads take the named branch; plus the sentence: tests or hooks that timed out inside a run that ended with the runner's own summary are the command's own verdict. `skills/chart-issues/assets/direct-route.md` step 3 gets the same two changes in door terms. The four `skills/*/lifecycle-rules.md` stay gitlinks (120000).
- **D8. Docs.** `docs/reference/checks.md` `## Known red` names where names come from (`(fail)` titles, `(unnamed)`, `(script)` from Bun's `Exited with code` line, `(no test name)`, `(log gone)`); the `akrogon flaky` paragraph and the `verify known-red <sha>: fail` row updated; `docs/reference/files.md` flaky paragraph names the sources; `src/AREA.md` verify paragraph states the name set and the `(log gone)`/`outside-grammar` reads.
- **D9. Test commit first.** The six new cases (criteria 1,2,4,5,6,7+8) landed in commit `bbfb0213` before product code, shown red at planning. Criterion 3 needs no new test: the `plain.log` (`boom`, free text) linked-pair refusal in `verify.test.ts` plus the unchanged regex ignore of `Signaled:`/`[FAIL]` already proves it; noted in plan.

## Read-first paths

- `src/flaky.ts` — `failedTests`, `flips`, `flakyLines`.
- `src/verify.ts` — `knownRedReceipt`, `newRedUnits`, `requireGreenReceipt`, `verifyRunSchema`, `runOnce`.
- `src/evidence.ts` — `locate`, `readLog`, `readLogAcross` (unchanged).
- `src/run-check.ts` — `leafTarget` `--holder` path recording.
- `tests/flaky.test.ts`, `tests/verify.test.ts`, `tests/docs-links.test.ts` — owned test files; `tests/helpers.ts` (`fixture`, `seedRun`, `greenReceipt`, `callerWorktree`, `cli`); `tests/hc-fixture.ts` (`hcCore`, `noticeFolder`, `noticeFiles`).
- `skills/lifecycle-rules.md` `## Red check with no cause in the leaf's diff`; `skills/chart-issues/assets/direct-route.md` step 3.
- `docs/reference/checks.md` (`## Known red`, flaky paragraph, fail row); `docs/reference/files.md` (flaky paragraph); `src/AREA.md` verify bullet.
- `issues/chart/failure-identity/forks/identity-rule.md` — binding Q1/Q2/Q4 shape and P1/P2/P4 log shapes; `forks/signposts.md` 1a 2a 3a 4a 5a 6a.
- `issues/chart/known-red-nameless/forks/coverage-rule.md` `## Taken` — the lock (nameless head covered only by nameless base; gone log never covers).

## Needed interfaces (unchanged)

- `failedTests(repo, recorded): Promise<string[]>` — callers unchanged.
- `readLog(repo, recorded, cwd)` / `LogError kind 'nomatch'`.
- `verifyRunSchema`, `readVerifyRuns`, `verifyCommands`, `requireGreenReceipt`.
- `seedRun`, `greenReceipt`, `callerWorktree`, `commitIn`, `cli`, `hcCore`/`noticeFolder`/`noticeFiles`, `directHolder` — existing test helpers.
- `akrogon run-check --name <label> -- <cmd>` for kept output.

## Checklist / waves

Affected docs: `skills/lifecycle-rules.md`, `skills/chart-issues/assets/direct-route.md`, `docs/reference/checks.md`, `docs/reference/files.md`, `src/AREA.md`. Agent SKILL.md files untouched (the shared file they link is edited in place; the four `lifecycle-rules.md` stay symlinks).

### Wave 1 — U1 (A, solo): the name reader

Owns `src/flaky.ts`. Steps: split `names(text)` per D1–D4; add the D5 plain-file fallback in `failedTests`'s `nomatch` branch; keep `(log gone)`/`(no test name)` semantics and the `(fail)` title extraction order. Commit after all new and existing flaky/verify cases pass.

### Wave 2 — U2 (A, solo): seat texts and docs

Owns `skills/lifecycle-rules.md`, `skills/chart-issues/assets/direct-route.md`, `docs/reference/checks.md`, `docs/reference/files.md`, `src/AREA.md`. Depends on U1 for the exact emitted names the docs must pin. Steps: apply D7/D8 edits; keep `akrogon verify --known-red`, `verify --holder <chart>/direct --known-red` literals; commit.

## Done-criteria → proof

| # | Criterion | Proof command / boundary | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|---|
| 1 | Script name for a Bun fan-out red; same name under another wrapper; no wrapper entry; real title beside it | `akrogon run-check --name <n> -- bun test --timeout=30000 tests/flaky.test.ts -t 'a failed script names its innermost'` (new test, committed bbfb0213; red at planning: `check plan-red-flaky1b: 1`) | Missing script name, wrapper not dropped, stream-(fail) suppression missed, wrong dedup | seconds | Any change to the name rules |
| 2 | `(unnamed) <script>` / bare `(unnamed)`; title with ` | (fail)` kept; no `(script)` for that script or wrapper | `... -t 'an unnamed failure takes its stream script'` (red at planning: `check plan-red-flaky2: 1`) | `(unnamed)` not qualified; `(script)` emitted for a stream that printed `(fail)`; title truncated at pipe | seconds | Same |
| 3 | Free text/`Signaled:` give no name; nothing added beside a real name | Existing: `verify.test.ts` linked-pair refusal where `plain.log` is free text (`boom`) and the nameless-cover test — already green on base; plus `flaky.test.ts` fan-out test asserts `t:sig`'s `Signaled` adds no `(script)` entry (in case 1's toEqual) | Free-text scraping; `Signaled:` becoming a name | seconds | Same |
| 4 | `verify --known-red` judges `fail` for head script X vs base script Y; same script still `pass`; nameless-vs-nameless still covered | `akrogon run-check --name <n> -- bun test --timeout=60000 tests/verify.test.ts -t 'a head red in one script is not covered'` (red at planning: `check plan-red-verify: 1`, wrong `pass`); plus existing `nameless` cover test stays green | Compare not identity-aware; identity read regressions | minutes | Same |
| 5 | Main red in script Y notices new while script X stays noticed; repeat of X not re-reported | `... -t 'a red main in one script reports new'` (red at planning: `check plan-red-verify2: 1`) | Names collapsing so a different script folds into an existing incident | minutes | Same |
| 6 | Existing regular file outside `issues/` grammar is read; missing path still `(log gone)`; known-red pair judged from both logs | `... -t 'outside the issues grammar'` in flaky.test.ts (red: `check plan-red-flaky4: 1`, `alpha` expected, `(log gone)` received) and `... -t 'outside the issues grammar is read'` in verify.test.ts (red: `check plan-red-verify3: 1`, expected pass received fail) | Fallback missing, wrong file test, `(log gone)` swallowing the read | seconds | Same |
| 7 | Seat texts state the non-title branch, the four names, the verdict clause; symlinks stay | `... -t 'non-title red name'` in docs-links.test.ts (red: `check plan-red-docs: 1`); `git ls-files -s skills/*/lifecycle-rules.md` shows 120000 | Old "names no test" wording left; timeout treated as crash; link replaced by copy | seconds | Wording edits |
| 8 | checks.md/files.md/AREA.md state the name sources | same docs-links test (`(script)` literal in each file); judgment review of the three paragraphs | Docs still claiming names only from `(fail)` lines | seconds | Doc edits |

## Condition checks (planning)

Each decision traced against what its criterion says must stay or not happen between creation and last use:

- D3 wrapper drop and D4 stream-(fail) suppression, per criterion 1's "no entry for a wrapper script" and "both the title and the script": case T1's fixture holds `grp-a | Exited with code 3` (prefix), `grp-a | t:named | Exited with code 1` (stream printed `(fail)`) and `grp-a | t:sig | Signaled` (ignored). Red at planning: temporary edit emitting `(script)` from every non-zero `Exited` chain (no wrapper drop, no suppression, `Signaled` mishandled by chain split) — `check plan-cond-flaky: 1`, expected names absent and `s`/`(unnamed)` mismatches shown; edit discarded.
- D3 tuple-prefix rule, per criterion 1's "same name whether the script ran under one wrapper or another" (a string-prefix drop would wrongly collapse `test:a` under `test:ab`): the `test:a`/`test:ab` pair in T1 asserts both `(script)` entries stand; a string-prefix violation drops `test:a` → red under the same command.
- D4 unprefixed `(fail)`, per criterion 2's "as `(unnamed)` when it carries none": bare `(fail) bare title` in T1 and `(fail) (unnamed)` in T2 assert the empty stream qualifies nothing and suppresses nothing → a chain-equality bug on `[]` would either suppress all script names or qualify wrongly, caught by T1/T2.
- D5 nomatch-only fallback, per criterion 6's "inside the grammar still resolves through its owner and archive first": the fallback sits inside the `nomatch` catch only, so `archive`/`member` errors still propagate (existing broken-archive tests) and a grammar path with no owner still hits `(log gone)`; the outside-grammar case (holder absolute path) is `nomatch` by `locate` construction — verified from `leafTarget`/`locate` code. Red at planning: the same temp edit's `(no test name)`-on-nomatch variant showed the `alpha` expectation fail (`check plan-cond-flaky: 1`).
- D6 known-red identity, per criterion 4's "fails on the base, where this pair passes": a name-collapse temp edit (all names → `(no test name)`) makes the X/Y pair wrongly pass → red at `check plan-red-verify: 1` (expected 1, received 0). The same script on both sides staying `pass` is the first half of the same test and was green.
- D7/D8 literals: the docs-links test asserts each literal; no executable boundary exists beyond presence, so the criterion proof is the phrase test plus review.
- Grant lines: no `grants[]`, no covered operations, no env (`env_names: []`, `akrogon status` showed no `Missing:` lines). No producer save, no `.env` handling.

## Notes

- Design wins over brief: none observed — the brief's "same name whether the script ran under one wrapper or another" and the design's wrapper-drop/innermost-token rules agree.
- Known limitation kept: the same real title failing in two scripts compares equal; two bare hook timeouts in one script share `(unnamed)`; a `Signaled:` death adds no name.
- Excluded by design: `failures` record field, `verifyRunSchema`, `runOnce` (`stored-failure-names`); framework logs (read only); `akrogon log` outside-grammar reads.
