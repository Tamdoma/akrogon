# Review B: docs-pictures-operations

Date: 2026-10-23. Phase: check.review. Verdict: fix.

Base: 7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8.
Reviewed head: 48ca1da9d3b6570e1df8b79eef09f6494b54d444.

Read the brief, design, plan, implementation report, door page map and SVG fork. Debate is off, so no positions-B.md or rebuttal-B.md is expected. Reviewed independently without reading the peer's review. The complete diff adds exactly the ten owned SVGs. No source, test, AREA.md or lesson changes.

## Fixes

### F1. Failure recovery puts lifecycle records on the code branch

Location: docs/pictures/failure-recovery.svg:25-26.

The node says “work kept on the leaf branch” followed by “(plan, reviews, code)”. A reader recovering a failed leaf is directed to the branch for plans and reviews, but those records live in the registered checkout's issues/ folder. The branch does not contain them. This also contradicts records-vs-code.svg in this same change.

Real source and consequence: the actual recovery workflow described in docs/guide/problems.md requires reading the failure and referenced artifact before selecting a phase. A reader following this picture and inspecting the retained branch cannot find its plan or reviews there. This is a wrong storage claim in an operational picture, not a hypothetical input.

Trace: src/next.ts:242 excludes issues/ from leaf worktrees, src/phase.ts:409-418 refuses issue-record changes on leaf branches, and src/sync.ts:171-204 stages records from the registered root. A live listing on this reviewed head finds no tracked leaf plan/review paths and does find the authoritative plan under the registered checkout.

Evidence, read back with akrogon log:

`check review-B-record-locations: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-review-B-record-locations-1792765522684-3780496.log`

Hits brief criterion 1 and the design's source-checked picture rule. Correct the node so code is kept on the branch and plans/reviews remain in issues/. Keep the recovery flow. Refresh this picture's planned screenshots after the correction. No new test is requested, per plan D7.

## Source and picture review

The other nine pictures match their named sources and the plan's nodes, edges and roles:

- change-flow: routing.ts sends B's complete repair to merge and A's repair to B re-check. The command owns landing in land.ts. The extra repair-to-land edge is justified.
- working-day: chart-issues owns attended direct work and lifecycle handoff. Autopilot starts nothing. pull.ts imports GitHub intake. Watch is beside execution and broadcast follows completion.
- dispatch-order: next.ts orders merged leaves first, then dependent counts from turn.ts, and checks prerequisites before starting work.
- control-states: pause.ts, park.ts, stop.ts and stop-run.ts support the separate controls. leftovers.ts reports rather than deletes. The planned correction is justified.
- watch-loop: watch-issues specifies a 20-minute cron, paused checks, bounded actions and operator reporting.
- releases: self-update.ts fetches and resolves the remote default branch, release.ts builds and retains releases, and rollback.ts flips to previous and holds the rolled-away commit. The planned source correction is justified.
- lessons-flow: learn-issues and lesson-rule support the four outcomes and operator-approved transfer.
- verification: verify.ts selects leaf versus merge commands, uses a fresh checkout, records receipts and compares known-red results with the base. phase.ts enforces Test-Change citations, as the plan correctly notes.
- records-vs-code: next.ts, phase.ts and sync.ts support the two separate record/code paths.

Opened docs/reference-index.md and the affected operational descriptions in docs/guide/next.md, problems.md and gacp.md. No runtime behavior changed. F1 is the new documented claim requiring correction.

## Verification evidence

Reused the completed receipt for this exact head and tree a3a68e9787a65b4c10c88a809fbac0dfc7fe371e, run b9a1836f-cef5-4437-806d-d8ad9892b3cc in issues/verify-runs.jsonl. Setup, format, test and typecheck all exited 0. Read the logs using akrogon log:

- implementation/check-format-1792765229201-2921828.log: Prettier passed.
- implementation/check-test-1792765413272-2921828.log: 1115 pass, 0 fail.
- implementation/check-typecheck-1792765415728-2921828.log: tsc --noEmit passed.

No planned check was skipped, filtered or disabled by this diff. No reason to rerun the full check set on an unchanged head.

C1 well-formedness: read implementation/check-svg-wellformed-1792765198704-2917111.log with akrogon log. The report records `check svg-wellformed: 0` on the reviewed head. Its planned pre-change red is also recorded and its log was read.

C2: read all ten final reduced-motion logs, both motion logs and the four final embed logs named in implementation/report.md with akrogon log. The working-day and verification proofs were rerun after their latest edits. Reviewed the report's screenshots, including the complete light/dark narrow embeds, native crops, reduced-motion moving pictures and both moving marker pairs. Labels fit and remain readable. The full card remains visible on both backgrounds. Reduced-motion states are complete, and normal-motion markers visibly change position.

An independent comparison of the recorded captures confirms all ten reduced 0s/4s pairs are identical and both normal 1s/3s pairs differ. Evidence, read back with akrogon log:

`check review-B-screenshot-pairs: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-review-B-screenshot-pairs-1792765541421-3783185.log`

Screenshot root: /var/tmp/akr-1000/5d20/51e60392/claude-1000/-home-ivan--akrogon-worktrees-akrogon-docs-pictures-operations/54f2e040-a4f2-47e9-810f-fab24c2243be/scratchpad/picture-check/shots/. Final embeds are embed-{light,dark}-{800,360}.png. Reduced captures are <name>-reduced-{0,4}s.png. Motion captures are {change-flow,working-day}-motion-{1,3}s.png. Older crop images predate the final label edits and are supplementary only. The final full embeds and updated direct captures carry those edits.

The design's existing limit remains: this proves direct Chromium and local img rendering, not GitHub reduced-motion propagation.

## Test-Change trailers

None in 7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8..HEAD. Checked the four commit messages and src/test-files.ts. No changed path matches that rule, so none is required. No test expectations changed and no proof-command correction was recorded or needed.

## Nits and operator actions

None.

## Disposition

Fix F1 before merge. Requested next phase: check.repair. No code or commits changed during review.

## 2026-10-23 check.repair (slot B)

Repaired F1 from both initial reviews in commit a5d6c942b15eeef04c6e76c7e6b8a391ad9b291b. Only docs/pictures/failure-recovery.svg changed, with two label lines replaced.

Before: “work kept on the leaf branch” / “(plan, reviews, code)”.
After: “work kept: code on the leaf branch” / “plan and reviews in issues/”.

This agrees with src/next.ts:242, src/phase.ts:409-418, src/sync.ts and records-vs-code.svg. The existing flow, geometry and other nine pictures are unchanged. No test was added, per D7. No test expectation, locked decision, live action or proof command needed correction. No items are handed to A and no operator action remains. A's N1 and N2 are outside the specified picture content and do not require changes. B holds no reusable Nit.

### Planned proof on repaired head

C1: the plan's unchanged svg-wellformed command passed. C2: repeated the plan's reduced-motion capture at load and four seconds for the changed picture, then repeated all four full-page embed captures. The latter include all ten pictures. Earlier reduced-motion and normal-motion evidence for the other nine unchanged files remains valid.

The first reduced-motion capture used the browser's 800x513 viewport after navigation and clipped the bottom. Discarded that visual result and reapplied the already-planned 600x1500 viewport immediately after navigation. Repeated the same capture scenario, producing complete 600x1500 captures at load and four seconds. This restores the planned setup rather than changing its outcome, scope or proof tool. Both final captures show the complete still picture and are byte-identical. Read the corrected label at native 360px and 800px embed widths on light and dark backgrounds. It fits without clipping.

Screenshot root: /var/tmp/akr-1000/5d20/51e60392/picture-repair-ogoks0vm/shots/.

- failure-recovery-reduced-0s.png and failure-recovery-reduced-4s.png.
- embed-light-800.png, embed-light-360.png, embed-dark-800.png and embed-dark-360.png.
- Native crops: failure-recovery-{light,dark}-{800,360}.png.

Proof receipts, all read back with akrogon log (paths are absolute):

- `check svg-wellformed: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-svg-wellformed-1792765627812-3791267.log`
- `check rm-failure-recovery: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-rm-failure-recovery-1792765704848-4028901.log`
- `check embed-light-800: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-light-800-1792765657880-3848329.log`
- `check embed-light-360: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-light-360-1792765658806-3849725.log`
- `check embed-dark-800: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-dark-800-1792765659781-3851998.log`
- `check embed-dark-360: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-dark-360-1792765660840-3854026.log`
- `check repair-screenshot-pair: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-repair-screenshot-pair-1792765724748-4131742.log`
- `check repair-close-tab: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-repair-close-tab-1792765751505-4188314.log`

Cleanup: stopped loopback server PID 3791746 and confirmed /proc/3791746 absent. Removed the scratch HTML pages and pictures symlink. Stopped this tab's daemon, closed only tab D2B01B17F332F33515727A058A67A607, and confirmed its absence through the dedicated browser inventory. The shared browser and other tabs remain available. Screenshots are retained as evidence.

Browser setup initially returned browser_already_running (check-repair-browser-start-1792765635594-3791814.log, exit 1). Opened a new tab in that existing browser instead (check-repair-browser-tab-1792765642912-3815033.log, exit 0). This was a setup refusal, not a failed picture criterion or configured check. A window.close request returned without closing the tab, so cleanup used that tab's dedicated-browser close endpoint and verified absence.

### Final verification

`akrogon verify` on a5d6c942b15eeef04c6e76c7e6b8a391ad9b291b: green. Receipt 2db7fca5-4b01-4be7-ac48-7d0f186e4afb, scope leaf, setup 0. Tests: 1115 pass, 0 fail.

- `format: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-format-1792765637711-3791889.log`
- `test: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-test-1792765800332-3791889.log`
- `typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-typecheck-1792765802663-3791889.log`

F1 is resolved. All doable fixes are committed and proven by the original planned checks. No handoff or operator action remains. Ready for merge.
