# Plan: realistic-review-bar

## Goal

Rewrite the review, repair and test rules in akrogon skills and guides so Fixes block only on realistic inputs with a consequence today, leaves write only tests that prove criteria and real fixes, and Nits stay in the review file with repair working Fixes only. Prose only. No command, state or test-code change.

## Decisions

- D1: One fix-bar block in `skills/check-issue/SKILL.md` replaces the old Fix triggers in place. Every Fix names its realistic source, its consequence today, and the criterion, check or gap it hits. Realistic source means a real build, a real user action or content, a real integration, or untrusted input an attacker can send. A code trace or representative real output is enough. No production incident is needed. A handcrafted reproduction alone is a Nit with the missing evidence stated. Failed `checks` commands and scenarios a done-criterion names always block by citing that check or criterion. A maintainability Fix needs a concrete consequence today. Rarity never downgrades a reachable security, data-loss or concurrency defect.
- D2: The same file carries one test-bar block. A missing or bad test blocks only when a done-criterion has no test that would catch its failure, a realistic Fix has no test, or a test mocks the unit under test. Assertion style, wording coupling that does not fail today, extra cases and coverage gaps are Nits.
- D3: Each Nit states the reproduction or concern, why it is deferred, and what evidence would promote it to a Fix.
- D4: The re-check rule applies the same fix-bar to defects introduced by the repair. It confirms earlier findings and adds a blocking finding only for a repair-introduced defect. It does not restart an unrestricted review.
- D5: `skills/implement-issue/SKILL.md` and `brief-template.md` require the smallest test set proving every done-criterion plus one before and after proof per real bug fixed. One test may prove several criteria. Extra negative or edge cases need a named concrete consequence on a realistic path. That means a broken required outcome, a security boundary, data loss or an unsafe mutation. Workers extend existing tests before adding files. The report links each done-criterion and each real bug fix to its test or evidence. The `check.fix` section does required work for Fixes only. Nits get no separate work or test and may only disappear incidentally through Fix repair.
- D6: `skills/implement-issue/ponytail.md` stays unchanged and `skills/check-issue/ponytail.md` stays a symlink to it. Live read shows no Fix or test rule conflict in the ponytail. The symlink is verified, never replaced by a file. `skills/plan-issue/SKILL.md` stays unchanged. Live read shows no Fix or test rule there. The sweep in step 9 confirms both.
- D7: `skills/chart-issues/assets/standing-design.md` drops the blanket mandatory negative and edge-case line and replaces it with criterion and consequence driven cases. End to end evidence with an artifact is required only when browser or runtime behavior or cross-component wiring cannot be shown by a smaller check or when a criterion asks for it. The Playwright rule for browser proof and the chain-trigger rule stay unchanged. The no vanity tests line stays.
- D8: `docs/guide/phases.md` and `docs/guide/learn.md` describe the new rules in their existing voice. The old blocking line in `phases.md` and the old Fix and Nit lines in `learn.md` are replaced in place. Other guide lines that state the old rule by meaning are updated. Lines that use the same words for a different meaning are kept and listed as out of scope in the report.
- D9: This leaf writes no new tests. The changed files are prose. The live check-issue rule forbids akrogon tests of prose wording. Proof is the fresh-agent gate for criterion 7 plus the configured checks for criterion 8.
- D10: Criterion 7 runs as one fresh classification after the new check-issue text lands. A separate agent that wrote none of this leaf receives only the new `skills/check-issue/SKILL.md` text plus an evidence bundle for five cases. It returns a Fix or Nit verdict with reasons per case. The report records its verdicts, reasons and the command or subagent used. Expected outcomes come from the brief. The two Nit cases from framework and the one from akrogon carry only their recorded evidence. No realistic source is added to them. The two Fix cases carry a clear attacker source with consequence and a failed check output.
- D11: Work runs in two waves plus an owner gate. Wave 1 runs the check-issue unit and the implement plus standing unit in parallel. Wave 2 runs the guides plus sweep unit after wave 1 lands. The owner then runs the criterion 7 gate, the full checks, the commit and the report. The only ordering dependencies are wave 2 after wave 1 and the gate after the check-issue edit.

## Read-first list

- `skills/check-issue/SKILL.md` lines 35, 37, 41, 43, 45, 47, 49, 53 change or anchor the new blocks.
- `skills/implement-issue/SKILL.md` line 42 and the `check.fix` section change.
- `skills/implement-issue/brief-template.md` sections 2 and 8 change.
- `skills/chart-issues/assets/standing-design.md` lines 7 through 11 change at lines 8 and 9 and keep lines 7, 10 and 11.
- `docs/guide/phases.md` lines 89 and 99 change.
- `docs/guide/learn.md` lines 3 through 7 change.
- `docs/guide/files.md` line 25 and `docs/guide/idea.md` line 86 are sweep candidates.
- `skills/implement-issue/ponytail.md` and the `skills/check-issue/ponytail.md` symlink are read to confirm no conflict and are not edited.
- `skills/plan-issue/SKILL.md` is read to confirm no conflict and is not edited.
- `skills/AREA.md` and `docs/reference-index.md` orient workers. They are not edited.
- `issues/closed/epic-broadcast/epic-broadcast-once/review-B.md` finding F1 is criterion 7 evidence. It is read from the registered checkout and is not edited.
- Framework `issues/open/landing-multi-offer/offer-join-deploy/review-B.md` findings F12 and F17 are criterion 7 evidence. They are read only. The framework repo is out of scope.

## Needed interfaces

There are no code interfaces. No function, type or schema changes. The contract is wording by content with these literals kept exact.

- File paths named in the checklist.
- Check commands `bun run format`, `bun run typecheck` and `bun test`.
- Changed-test command `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=14e045cf44daf5edf3413ba681fd5b66410b62ba`.
- Verdict names `ready`, `nits` and `fix`.
- Browser proof flags headless Chromium, trace on, video off.
- Review file names `review-A.md` and `review-B.md`.

## Acceptance criteria

These criteria come before any test derivation. Implementation derives no new tests for them under D9.

- C1: Every Fix trigger in the new check-issue text applies the D1 fix-bar. That covers the area-path rule, the doc-behavior rule, the findings record rule, the Fix definition, the test-gap triggers and the re-check rule. A Fix names a realistic source, a consequence today and the criterion, check or gap it hits. Handcrafted reproduction alone is a Nit. Failed checks and named-criterion scenarios always block. Maintainability needs a consequence today. Rarity never downgrades a reachable security, data-loss or concurrency defect.
- C2: The same file applies the D2 test-bar. A missing or bad test blocks only on the three listed cases. Style, non-failing wording coupling, extra cases and coverage gaps are Nits.
- C3: The same file requires each Nit to state the reproduction or concern, why it is deferred and what evidence would promote it.
- C4: The implement skill and brief template require only proving tests plus before and after proof per real bug, gate extra cases on a named concrete consequence, prefer extending existing tests, link each criterion and real fix to its proof in the report, and limit repair work to Fixes with no separate Nit work or test.
- C5: The standing design drops the blanket mandatory line, uses criterion and consequence driven cases, conditions end to end artifacts as in D7, and keeps the Playwright and chain-trigger rules.
- C6: The guides describe the new rules. A sweep by meaning finds no contradicting line in `skills/` or `docs/`. Out of scope hits are listed in the report.
- C7: A fresh agent given only the new check-issue text and each case evidence classifies five cases with the expected outcomes. Framework F12 is a Nit with no realistic source recorded. Framework F17 is a Nit with no realistic source recorded. Akrogon epic-broadcast-once review-B F1 is a Nit with no consequence today. An untrusted form input that bypasses a sanitizer is a Fix with an attacker source. A failed `bun test` is a Fix with a failed check. The report records verdicts, reasons and the command or subagent used.
- C8: `bun run format`, `bun run typecheck` and `bun test` pass.

## Ordered checklist

### Affected agent docs, one line each

- `skills/check-issue/SKILL.md` gains the fix-bar, test-bar, Nit format and re-check blocks in place.
- `skills/implement-issue/SKILL.md` gains the minimal test set, consequence gate, report linkage and Fixes-only repair rules.
- `skills/implement-issue/brief-template.md` gains the same test rules in sections 2 and 8 with conditional end to end evidence.
- `skills/chart-issues/assets/standing-design.md` replaces the blanket test line and conditions end to end artifacts.
- `skills/implement-issue/ponytail.md` is verified conflict free and unchanged.
- `skills/plan-issue/SKILL.md` is verified conflict free and unchanged.

### Affected human docs, one line each

- `docs/guide/phases.md` replaces the blocking-finding and test-evidence lines with the new rules.
- `docs/guide/learn.md` replaces the Fix, Nit and lesson lines with the new rules.
- `docs/guide/files.md`, `docs/guide/idea.md`, remaining `docs/` pages and `README.md` are swept by meaning and edited only where they state the old rule.

### Steps

1. Rewrite `skills/check-issue/SKILL.md` in place. Cover the area-path rule at line 35, the doc-behavior rule at line 37, the findings record at line 41, the Fix definition at line 43, the test comparison at line 45, the test-gap triggers at line 47 and the re-check at line 53. Keep the failed checks block at line 49 as the always-block anchor. Doc-pointer Fixes cite the live listing as the trace, the dead pointer consequence today and the criterion or gap. Criteria C1, C2, C3.
2. Rewrite the test and repair rules in `skills/implement-issue/SKILL.md` at line 42 and in `check.fix`. Add the smallest proving set, the consequence gate, extend-before-add, report linkage and Fixes-only repair with no separate Nit work or test. Criteria C4.
3. Rewrite `skills/implement-issue/brief-template.md` sections 2 and 8 with the same test rules. Condition end to end artifacts on browser, runtime or wiring need or a criterion request. Keep the observable-contract line and the Playwright flags. Criteria C4.
4. Edit `skills/chart-issues/assets/standing-design.md` lines 8 and 9. Delete the blanket mandatory line. Write criterion and consequence driven cases and conditional end to end evidence. Keep the no vanity tests, cheapest sufficient test, Playwright and chain-trigger lines. Criteria C5.
5. Verify `skills/implement-issue/ponytail.md` has no conflicting rule and verify `skills/check-issue/ponytail.md` is still a symlink with `ls -l` and `readlink`. Make no edit here. Criteria C4.
6. Verify `skills/plan-issue/SKILL.md` has no conflicting Fix or test rule. Make no edit here. Criteria C6.
7. Rewrite the test-evidence paragraph and the blocking-finding paragraph in `docs/guide/phases.md`. Use the new fix-bar and test-bar in the existing voice. Criteria C6.
8. Rewrite the Fix, Nit and lesson paragraphs in `docs/guide/learn.md`. State that Nits stay in the review record and repair works Fixes only. Criteria C6.
9. Sweep `skills/`, `docs/` and `README.md` by meaning for the old rule. Read every grep candidate as a reviewer would. Edit contradicting lines. List out of scope hits in the report. Keep verbatim standing lines that the design keeps. Criteria C6.
10. Run the criterion 7 fresh-agent gate after step 1 lands. Build one evidence bundle with the five cases and their recorded evidence only. Give a separate agent only the new check-issue text plus the bundle. Record its five verdicts, its reasons and the command or subagent used. Criteria C7.
11. Run `bun run format`, `bun run typecheck` and `bun test` in the worktree. Repair failures that this leaf caused. Criteria C8.
12. Commit the worktree edits on the leaf branch with no empty commit and no file under `issues/`. Write `implementation/report.md` in the leaf folder with changed files and reasons, commands with pasted results and artifact paths, the base and committed head, known limitations, unverified criteria and the criterion 7 verdicts. Criteria C4, C6, C7, C8.

## Verification

Each done-criterion maps to its proof command, the failure it catches, a size and a rerun trigger.

- C1: Proof is `grep -n "realistic source\|consequence today\|handcrafted\|always block\|rarity" skills/check-issue/SKILL.md` plus a read of the changed block. It catches an old Fix trigger without the bar. Size is seconds. Rerun when the check-issue file changes.
- C2: Proof is `grep -n "mocks the unit under test\|no test that would catch\|coverage gaps are Nits" skills/check-issue/SKILL.md` plus a read of the test-bar block. It catches an old test-block rule. Size is seconds. Rerun when the check-issue file changes.
- C3: Proof is `grep -n "why it is deferred\|would promote it" skills/check-issue/SKILL.md` plus a read of the Nit format lines. It catches a Nit without the three parts. Size is seconds. Rerun when the check-issue file changes.
- C4: Proof is `grep -n "smallest\|concrete consequence\|extend\|Fixes only\|links each" skills/implement-issue/SKILL.md skills/implement-issue/brief-template.md` plus a read of both changed sections. It catches an old blanket-test or repair-all rule. Size is seconds. Rerun when either file changes.
- C5: Proof is `grep -n "Mandatory negative\|consequence\|end.to.end\|Playwright\|chain trigger" skills/chart-issues/assets/standing-design.md` plus a read of the changed lines. The blanket line must be absent and the conditional lines present. It catches a kept blanket rule or a lost kept rule. Size is seconds. Rerun when the standing file changes.
- C6: Proof is `grep -rniE "mandatory negative|concrete defect|broken contract|must carry at least one|preference alone" skills/ docs/ README.md 2>&1 | tee /tmp/akrogon-realistic-review-bar-sweep.log` plus a meaning read of every candidate. It catches a contradicting line the edit missed. Size is seconds for the grep and minutes for the meaning read. Rerun when any skill or doc changes.
- C7: Proof is one fresh subagent run with only the new check-issue text plus the evidence bundle, with verdicts, reasons and the run identity pasted in the report. It catches unclear rule text that a new reader applies wrongly. Size is minutes. Rerun when the check-issue text changes after the gate.
- C8: Proof is `bun run format` in seconds, `bun run typecheck` in seconds and `bun test` in minutes. Format catches unformatted `src` or `tests` edits. Typecheck catches type errors. The suite catches regressions. Rerun format and typecheck when any checked file changes. Rerun the suite when code or test files change and after any rebase.

Changed-test command for workers is `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=14e045cf44daf5edf3413ba681fd5b66410b62ba`. A prose-only diff runs zero tests and exits 0. Workers receive only this command. The owner runs the full suite once after the last worker.

This is not a slow-run leaf. There are no restart boundaries. No stage is reused across commits.

## Dependencies

Wave 2 guides work starts after wave 1 skill work lands because the guides must describe the final skill wording. The criterion 7 gate starts after the check-issue edit lands because it needs the final rule text. The commit and report close the leaf after all edits and checks. No other ordering exists.

## Credentials

None. The design names no variable and no external operation. No `bun --env-file` presence check is needed. No human-only credential blocker exists.

## Open limitations

- L1: The five-case gate samples past cases only. It does not prove that future reviewers apply the bar uniformly on unseen inputs. The design defers the 20-leaf speed and escape measurement to a later chart door.

## Notes

The brief and the locked design agree. Line numbers above are live positions verified today. The design rule that lines may shift from the brief positions holds.

Locked scope stays closed. That means `src/`, command state, the repair cap, routing, the verdict schema, model and effort settings, the peer-wait rule, the framework repo, existing tests and everything under `issues/`.

This leaf is reviewed under the rules in force when its review starts. It must pass without relying on its own new text. Keep each edit minimal and in place, update every doc the diff makes stale, and land green checks.

## Implementation notes (repair 2026-09-30)

Review-B F1 found one C6 gap the sweep missed: `docs/guide/phases.md:101` still directs repair on a contract violation alone through a sourceless CSV example. Repair refines D8: guide examples that show a reviewer requesting repair must themselves satisfy the bar by naming a realistic source, citing an explicitly named criterion scenario, or conditioning repair on the bar. No locked decision changes. Criteria keep full strength.
