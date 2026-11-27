# Slot B review — taxonomy-rename

Initial `check.review`, 2026-11-27. Verdict: **fix**.

- Reviewed base: `562611bd309252ddcbe7a18a04a88629d0e82c0e` (`origin/main` at review start and merge base at submission).
- Reviewed head: `c757e91a6773a1cebc3ac408aeca00ffb455255d`.

## Fixes

- **F1 — Preserve the recorded mode on legacy handover.** In the registered checkout, `issues/chart/test-temp-leftovers/CHART.md:35–43` records `on full autopilot`, then `continue autopilot`, with `signposts: A`. `issues/chart/direct-visible/CHART.md:30–41` has the same sequence. The format was shared by both autopilot modes. Replaying either record through `skills/chart-issues/SKILL.md:128,132` selects Semi-autopilot from the latest entry and loses the explicitly recorded delegation. The distinction persists after signposts: a later unresolved conflict about signposts goes to the operator under Semi-autopilot, while A resolves it under Full autopilot (`skills/chart-issues/assets/questions.md:41`). This contradicts plan D2 and the report's harmless-after-signposts assumption, as well as brief criteria 2 and 3. The single compatibility line should read legacy `continue autopilot` in the mode it continued.
- **F2 — Specify the switch-on record.** The operator switch-on shown in `docs/use/autopilot.md:13–17` reaches the writer in `skills/chart-issues/assets/autopilot.md:7`. That writer asks for a mode line, and the template at `assets/shapes.md:54` gives only `on` plus unspecified detail. `on semi-autopilot` appears only in SKILL.md's instruction for reading old records. A new switch-on has no template instruction to encode which mode started, even though the latest entry governs resumption. Specify the lower-case switch-on values in the writer's template and quote the result in the report, per brief criterion 2 and plan D3.5.
- **F3 — Complete the report's required inventory and rule comparisons.** The criterion 1 report section groups surviving bare `autopilot` hits into categories. Its final scan gives file counts, while `check-taxonomy-inventory-1795774963649-938155.log` lists unclassified lines from before the last edits. The required hit-by-hit record with reasons is missing. The criterion 3 table also spot-checks rules, leaving out changes such as SKILL.md:41, 69 and 83 and shapes.md:418. The report therefore cannot show which remaining instances were judged to be family uses or whether each changed rule kept its meaning. Record the final per-hit reasons and the missing before/after rule meanings, per brief criteria 1 and 3 and plan D10.
- **F4 — Use the configured timeout for the planned watcher proof.** Criterion 3's `pinned-literals` command runs `bun test --test-name-pattern "watch" tests/watch-timer.test.ts` with Bun's five-second default. It timed out on the same three unchanged cases in both review runs, while those cases passed in the configured suite in roughly 10–16 seconds. The implementation's split targeted runs record 3 chart-shape passes and only 5 watcher passes. Restore the same 11 selected watcher cases with the configured 120-second timeout. The diagnostic below changes only that timeout and all 11 pass. Record the proof-command correction and the deliberate break required by the plan-issue equivalence guard.

## Verification

- Read the full diff and the owning docs, including `docs/use/autopilot.md`, `docs/use/plan-work.md`, `docs/use/quick-fix.md` and `docs/reference/words.md`. The diff contains 6 skill files and 13 Markdown docs pages. Every file path named in `skills/AREA.md` exists from the worktree root. The docs link and anchor check passed. Direct is still refused in both autopilot modes. `Route:`, its lower-case values, `## Mode record`, `## Autopilot`, `signposts:`, `akrogon direct` and file names remain intact. The two sampled unrelated uses, `manual step` and `A manual akrogon next`, remain in place. The deferred SVG wording is within the plan's exclusion.
- Read verification receipt `bec32cd7-517f-473a-82b4-2df9b48cad04` and its kept logs. Setup, format, typecheck and the configured test suite passed on this head, with 1,549 tests and zero failures. The earlier ad hoc `test` log ending `1306837` failed when Bun interpreted `false` as a file filter. `akrogon verify --known-red` reused the green configured receipt. F4 concerns the separate planned targeted command.
- Kept review logs under `implementation/`:
  - `check taxonomy-review-b: 0 check-taxonomy-review-b-1795775640415-2016324.log` — current-head inventory and clean diff check.
  - `check docs-links-final: 0 check-docs-links-final-1795775675369-2017671.log` — 13 passes.
  - `check pinned-literals: 1 check-pinned-literals-1795775681823-2017672.log` and `check pinned-literals: 1 check-pinned-literals-1795775702351-2020474.log` — the receipt-less watcher turn and the busy and idle watcher queue cases timed out.
  - `check pinned-literals-configured-timeout: 0 check-pinned-literals-configured-timeout-1795775729995-2023201.log` — `bun test tests/chart-shapes.test.ts && bun test --timeout=120000 --test-name-pattern "watch" tests/watch-timer.test.ts`. Three chart-shape and eleven watcher tests passed. The watcher selection still filtered out eleven.
- `Test-Change:` trailers in `origin/main..HEAD`: none. No path matches `src/test-files.ts` in the diff. No grants, external fixtures or paid sessions were involved.

## 2026-11-27 check.repair

Slot B repaired F3 and F4 on `c757e91a6773a1cebc3ac408aeca00ffb455255d`. Both repairs are leaf artifacts, so there are no branch commits. The earlier configured verification receipt still covers this head.

### F3 — Report evidence for criteria 1 and 3

`implementation/report.md` now lists 71 relevant occurrences across 37 skill lines and compares all 25 added or replaced skill lines with the base. The comparisons mark F1 and F2 where behavior or evidence is still open. The proof uses the committed Git tree and diff for row coverage and manual reading for each reason and meaning.

- Before, the required per-line records were missing. `check taxonomy-report-before: 1 implementation/check-taxonomy-report-before-1795776095576-2048946.log`
- Suppressing the `skills/AREA.md:11` inventory row in memory made the coverage check report 36 of 37 rows and fail. `check taxonomy-report-deliberate-break: 1 implementation/check-taxonomy-report-deliberate-break-1795776196474-2057512.log`
- The saved report matched the committed head for all 37 inventory rows and 25 rule lines. `check taxonomy-report-current: 0 implementation/check-taxonomy-report-current-1795776196474-2057513.log`

### F4 — Corrected criterion 3 proof command

The configured test command gives the same watcher cases 120 seconds. The planned proof used Bun's five-second default and timed out on three unchanged cases that each take around 10–16 seconds, including on the configured green run. The correction uses the configured timeout and keeps the two files, test selection and assertions intact. Use this command for criterion 3 when A refreshes the proof.

Old command

```sh
akrogon run-check --name pinned-literals -- sh -c 'bun test tests/chart-shapes.test.ts && bun test --test-name-pattern "watch" tests/watch-timer.test.ts'
```

Corrected command

```sh
akrogon run-check --name pinned-literals -- sh -c 'bun test tests/chart-shapes.test.ts && bun test --timeout=120000 --test-name-pattern "watch" tests/watch-timer.test.ts'
```

- The two old runs each had three chart-shape passes, eight watcher passes and three watcher timeouts. Eleven watcher cases were filtered out by the original pattern. `check pinned-literals: 1 implementation/check-pinned-literals-1795775681823-2017672.log` and `check pinned-literals: 1 implementation/check-pinned-literals-1795775702351-2020474.log`
- In a disposable detached worktree at the same head, adding `akrogon status` to the `scripts/observe.ts` description in `skills/AREA.md` made the existing AREA guard fail. The other ten watcher cases and all three chart-shape cases passed. Eleven watcher cases were filtered out. The worktree was removed. `check pinned-literals-deliberate-break: 1 implementation/check-pinned-literals-deliberate-break-1795776073674-2044999.log`
- On the clean leaf head, all three chart-shape and all eleven selected watcher cases passed, with the same eleven filtered out. `check pinned-literals-corrected: 0 implementation/check-pinned-literals-corrected-1795776131215-2049683.log`

### Handed to A

- **F1** Repair the door's legacy continuation rule and show that the cited Full autopilot records keep their mode and signposts conflict handling. Existing checks cover stable literals. This product instruction change and the reading that accepts it belong together.
- **F2** Specify the lower-case mode in the switch-on record and quote the updated template for criterion 2. Existing checks cover the heading and schema example, so the changed writer instruction and its accepting evidence belong together.

Refresh the applicable F3 rows after changing the skill and rerun the affected criterion proofs with the F4 command above.


## 2026-11-27 check.review after check.fix

Verdict: **fix**. Rebased from `562611bd309252ddcbe7a18a04a88629d0e82c0e..c757e91a6773a1cebc3ac408aeca00ffb455255d` to `5d425ea8381036e9ae0fa87ef91d7da9d0254a06..ce19da0d9d11a05f2eeff0211ae9298d06912582`. My range-diff shows all four earlier patches identical and only `e8918566` and `ce19da0d` added. The repair changes one compatibility line in SKILL.md and adds two templates in shapes.md. The owning charting-mode docs still describe the same operator switch-on and mode delegation.

- **F1** The original Full autopilot cases in `test-temp-leftovers` and `direct-visible` now read as Full autopilot, preserving who resolves a later signposts conflict. The recorded `on autopilot` followed by `continue autopilot` in `merge-lanes` still reads as Semi-autopilot. The repair introduces the separate compatibility gap in F5.
- **F2** Verified. Both switch-on templates spell the lower-case mode at the start of the entry. The report quotes both values and the writer still uses the mode-record shape.
- **F3** The prior report was complete on the old head. Its refresh on this head misses the changed evidence in F6.
- **F4** Verified. The corrected pinned-literals command runs the same 11 watcher cases with the configured 120-second timeout. A's rerun passed three chart-shape and eleven watcher cases. B's deliberate break failed the existing AREA guard while the same selected cases ran. The separate docs-links run after the final pick passed all 13 cases.

### New fixes from the repair

- **F5 — Cover legacy continuation after an unqualified switch-on.** The stored `issues/chart/config-walls/CHART.md:30,32` sequence is `on; handed: …` then `continue autopilot`. `orphan-pane/CHART.md:27,29,31` has the same bare `on` followed by two continuations. `killed-run-fixture/CHART.md:33,35` and `pull-gh-path/CHART.md:32,34` use `on handed …` first. These October records predate Full autopilot, introduced by `d6bb6429` on November 4. The older shape at its parent explicitly allowed `on` plus detail and `continue autopilot`. The new rule in `skills/chart-issues/SKILL.md:128` uses the earlier `on` entry's recorded mode and only defaults if there is no earlier `on` entry. These real records have an earlier `on` entry with no mode, so neither arm resolves the latest continuation. The previous flat mapping resolved these records. Preserve the defined legacy continuation when the earlier entry supplies no named mode, while keeping explicitly recorded Full autopilot. This is a criterion 2 compatibility gap.
- **F6 — Refresh both required proof tables against the repaired head.** The report still identifies the vocabulary table as `c757e91a` with 71 hits. The current compatibility line adds two occurrences, and the switch-on examples shift five existing vocabulary row references in shapes.md. The changed-rule table still has 25 rows keyed to the previous line numbers instead of the current 27. Its summary mentions the switch-on examples, but the per-line mapping cannot be followed as written. Refresh occurrences and reasons, and account for the two added switch-on lines with the current locations in the rule comparison. The artifact misses proof required by criteria 1 and 3.

### Evidence

- `check taxonomy-recheck-range: 0 implementation/check-taxonomy-recheck-range-1795777008010-3401653.log` and `check taxonomy-recheck-patch: 0 implementation/check-taxonomy-recheck-patch-1795777020878-3407910.log`.
- `check taxonomy-recheck-records: 0 implementation/check-taxonomy-recheck-records-1795777061086-3416276.log` captured the real legacy switch-on and continuation sequences. The interpretation above is a reading of the door instruction on those records.
- `check taxonomy-recheck-report: 1 implementation/check-taxonomy-recheck-report-1795777061103-3416259.log` found 71 of 73 occurrences and 25 of 27 rule rows in the report, along with the stale shape references.
- Read A's current-head scan, template and scope logs, the pick's docs-links and chart-shapes log (`check-pick-fix2-verify-1795776726730-2494682.log`), and the corrected watcher proof (`check-pinned-literals-1795776778687-2623359.log`).
- Configured receipt `bfe34b54-c9c7-4dd8-b065-70f8bceb1e31` matches `ce19da0d` and its tree. Setup, format, typecheck and test were green. The kept suite log shows 1,550 pass and zero failures. No branch test files changed and there are no `Test-Change:` trailers in `5d425ea8..ce19da0d`. No paid sessions or live operations were needed.


## 2026-11-27 check.repair after re-check

### F6 — Refreshed criteria 1 and 3 evidence

Repaired the report on `ce19da0d9d11a05f2eeff0211ae9298d06912582`. The previous pass updated individual rule summaries and added scan logs, but retained the original table counts and line references. I compared every vocabulary row with the committed skill text and every rule row with the skill diff from `5d425ea8`. That found two extra alias occurrences, five shifted vocabulary references, six shifted rule references and two missing switch-on rows. I also checked nearby proof references, replaced the stale scope range and template capture, and labelled the original verification as historical.

- Before the refresh, the coverage check found 71 of 73 occurrences and 25 of 27 rule lines, with stale vocabulary references. `check taxonomy-report-refresh-before: 1 implementation/check-taxonomy-report-refresh-before-1795777160616-3420718.log`
- Omitting the new Semi-autopilot switch-on row in memory made the same check fail at `skills/chart-issues/assets/shapes.md:55`. `check taxonomy-report-refresh-deliberate-break: 1 implementation/check-taxonomy-report-refresh-deliberate-break-1795777224738-3424501.log`
- The saved tables match all 73 occurrences across 37 lines and all 27 changed skill lines. The coverage check uses Git for locations and counts. The reasons and meaning comparisons come from reading those lines. `check taxonomy-report-refresh-current: 0 implementation/check-taxonomy-report-refresh-current-1795777224740-3424502.log`

The report is a leaf artifact. The branch head and its configured green receipt are the same as at re-check.

### Handed to A

- **F5** Update the door's legacy reader and trace the result against the actual bare-`on` sequences cited above. That behavior and its accepting reading go together. The existing F1 proof covers explicitly named earlier modes, while the scans and literal tests cover the record structure. Refresh the compatibility quote and the corresponding inventory and rule rows against the final head, along with any line references that move.


## 2026-11-27 check.review after second check.fix

Verdict: **fix**. Compared `5d425ea8381036e9ae0fa87ef91d7da9d0254a06..ce19da0d9d11a05f2eeff0211ae9298d06912582` with `4aff0f6881e486a15fd98db8d595644469cd4901..197fdc46feeaa9723db628d8a64477abc4ce7ab6`. The range-diff pairs the six prior patches without changes. The only added patch changes the compatibility line in `skills/chart-issues/SKILL.md:128`. The owning mode docs still describe the same delegation.

- **F5 verified.** Reading the repaired rule on the recorded continuations in `config-walls`, `orphan-pane`, `killed-run-fixture` and `pull-gh-path` selects Semi-autopilot after the bare `on`. `merge-lanes` keeps Semi-autopilot with the explicit older spelling. `test-temp-leftovers` and `direct-visible` keep Full autopilot and its signposts conflict behavior from F1. The compatibility instruction remains one physical line and names all six legacy inputs. No switch-on template changed.
- **F6 reopened by the repair.** The change removes the second bare `on autopilot` reference at SKILL.md:128. The report still shows eight occurrences and claims that phrase is repeated. There are seven on that line and 72 in the current inventory. Both table introductions still name `ce19da0d`, and the rule-table introduction says that F5 remains open even though its updated row and the actual reader agree that bare `on` now works. All 37 vocabulary locations and 27 changed-rule locations are present. Correct the report's affected count, reason and current-head summaries per criteria 1 and 3. Use the current template and scope captures already recorded for this round where their sections still point at the previous snapshot.

### Evidence

- `check taxonomy-recheck2-range: 0 implementation/check-taxonomy-recheck2-range-1795777958559-4125412.log`. The one-line repair diff passed `git diff --check`.
- `check taxonomy-recheck2-records: 0 implementation/check-taxonomy-recheck2-records-1795777998059-4129181.log` records the stored sequences used for the compatibility reading.
- `check taxonomy-recheck2-report: 1 implementation/check-taxonomy-recheck2-report-1795777958564-4125413.log` compares report locations and counts to Git. The mismatch is confined to the count for SKILL.md:128.
- Read the final scan, template and scope captures. The docs-links run passed 13 tests. The corrected F4 command passed all three chart-shape and eleven selected watcher tests with the previous selection and 120-second timeout.
- Configured receipt `2cb6d075-235a-4a5f-a3b2-3b045d894a67` matches the repaired head and tree. Setup, format, typecheck and tests passed, with 1,550 tests and zero failures. No test paths changed and `4aff0f68..197fdc46` contains no `Test-Change:` trailers. No paid sessions or live operations were needed.


## 2026-11-27 check.repair after second re-check

**F6 repaired** on `197fdc46feeaa9723db628d8a64477abc4ce7ab6`. The F5 pass updated the compatibility quote and rule rows but carried forward the previous occurrence count and snapshot references. I compared all inventory locations and counts with the committed skill text and all rule locations with the skill diff from `4aff0f6881e486a15fd98db8d595644469cd4901`. The only count mismatch was SKILL.md:128. I corrected that row to seven occurrences, updated its reason, and consolidated the current snapshot reference above the proof sections. The result and rule summary now reflect the verified bare-`on` behavior. The scan, template and scope references point to the captures from the current snapshot.

- Before, the same coverage check found 73 reported occurrences against 72 in Git. `check taxonomy-report-final-before: 1 implementation/check-taxonomy-report-final-before-1795778069846-4133234.log`
- Restoring the old count of eight for SKILL.md:128 in memory reproduced the mismatch. `check taxonomy-report-final-deliberate-break: 1 implementation/check-taxonomy-report-final-deliberate-break-1795778101130-4133887.log`
- The saved report matches all 37 vocabulary locations, 72 occurrences and 27 changed skill lines. `check taxonomy-report-final-current: 0 implementation/check-taxonomy-report-final-current-1795778101128-4133885.log`

The repair is confined to the leaf report. `akrogon verify` returned zero and reused green receipt `2cb6d075-235a-4a5f-a3b2-3b045d894a67` for the committed tree. The receipt's test log shows 1,550 passes and zero failures. F5 was verified in the preceding re-check, and all review findings are closed.

