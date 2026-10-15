# Slot B: log-coverage notes

Blind Q1/Q2 notes, 2026-10-15, against akrogon `f3557d8`. Read the requested intake, Questions/Carries and evidence-location Taken only. Framework is `/home/ivan/Work/infra/tamdoma/framework`, the registered path established by `akrogon config`. Read-only inspection. No logs deleted or changed.

The location decision is binding: plain open/parked logs remain local, every owner log is packed losslessly at closure, and `akrogon log` reads the retained bytes. These notes do not reopen that decision or decide historical migration.

## Q1. Chart-direct logs

### Pick, reason and cost

D1. Pack the direct folder's `*.log` files when the chart ends with `Closed`, `Held` or `Handed off`, using the same verified, retry-safe archive mechanism. Put the archive at `<chart>/direct/evidence.tar.zst`, with members relative to `direct/`. Keep plans, reports and reviews as ordinary readable Markdown. While the direct attempt is active, keep its new plain logs local, matching the accepted lifecycle policy, then commit the archive at the terminal transition.

Reason: a direct attempt has the same evidence readers as a leaf but never reaches `completeOwner`. Leaving it out makes the storage policy depend on which route produced the proof. `Held` can contain failed evidence and `Handed off` can contain the attempted direct work that a lifecycle implementer must understand. They are not deletion events.

Cost: the chart door needs an explicit archive operation on all three endings, the shared reader needs a chart/direct locator case, and init/ignore rules need to cover new direct logs. A Markdown marker is not executable code. Packing must be an explicit step in the chart skill's ending protocol, not an assumption that `completeOwner` or status will notice it. Existing tracked direct logs belong to existing-backlog's migration decision.

### What a direct folder actually holds

F1. Live inventory across the two allowed repos:

| Repo/chart | Log files | Log bytes | Other files present | Recorded ending |
|---|---:|---:|---|---|
| akrogon/handoff-gaps | 8 | 159,073 | none in direct | Closed, CHART.md:19 |
| akrogon/merge-green-rate | 7 | 81,953 | plan.md, report.md | Closed, CHART.md:43 |
| akrogon/overnight-recs | 12 | 239,401 | none in direct | Handed off, CHART.md:20 |
| akrogon/system-flow | 18 | 2,160,706 | none in direct | Handed off, CHART.md:31 |
| akrogon/system-speed | 9 | 81,565 | review-B-1.md | Closed, CHART.md:37 |
| framework/merge-green-rate | 2 | 1,813,202 | report.md | Closed, CHART.md:43 |

Total: 56 log files and 4,535,900 bytes. These are filesystem measurements, not a compression estimate. No Held example was found in this direct-folder sample.

F2. Direct is not synonymous with `check-*.log`. `akrogon/issues/chart/system-speed/direct/.ask-B1.log:1` is a JSON peer-command completion record naming a pane and its review file, not a check transcript. The same folder's `review-B-1.md:20-22` cites two failed setup runs and later passing proof logs. Other folders hold repeated setup/format/test/typecheck/verify logs. The standard layout puts reviews in chart slots (`skills/chart-issues/SKILL.md:103`), but this live example has its review inside direct. Do not archive the whole folder or discard non-check evidence because it differs from the current standard layout.

F3. The current producers and readers:

| Actor | When and what it needs | Evidence |
|---|---|---|
| Door A implementing and repairing | Reads plan/report and full check output during each direct iteration | `skills/implement-issue/SKILL.md:96-98` |
| Direct reviewer B | Reads the report and proof during initial review and re-check, including earlier red output when relevant | `skills/check-issue/SKILL.md:99-101`; system-speed review cited above |
| Door A landing | Runs verify with the direct holder, reads check outcomes, repeats after a rejected push or repair | `skills/chart-issues/SKILL.md:105-110` |
| Direct receipt guard | Reads structured receipt state, not full log bytes | `skills/chart-issues/scripts/direct-guards.ts:20`, `src/verify.ts:63-82` |
| `akrogon flaky` | Can inspect a prior red direct check after a later green run, including after the chart ends | `src/flaky.ts:20-35` has no exclusion for direct/checkout holders |
| Lifecycle planner/implementer after handoff | Needs the prior direct attempt's report and evidence to decide what work and proof to retain | `skills/chart-issues/SKILL.md:119-120` |
| Operator or later investigation/review seat | Follows a cited log after Closed, Held or Handed off | Evidence-location's readability requirement; direct reports and reviews remain in the chart |

`src/run-check.ts:126-127` resolves an explicit holder without a leaf. `src/verify.ts:95,154-170` writes setup and command evidence through that holder and records its paths. Chart-direct runs are therefore ordinary evidence producers with a different owner boundary, not temporary copies of lifecycle logs.

### Rejected options and costs

O1. Commit direct logs plain permanently. This is the lowest code cost and keeps old file readers working, but bypasses the accepted small-history policy for every direct landing. The current sample is only about 4.5 MB; that is a reason to keep the implementation small, not a reason to create a permanent route exception.

O2. Ignore direct logs permanently and retain them only on this host. This needs little code, but a successful Closed chart's full proof would never enter its repository backup. A handed-off implementer on another machine could not inspect the evidence. The accepted local-only period for an open/failed lifecycle owner does not establish that completed direct proof should remain local forever.

O3. Pack only on Closed. This misses the real Handed off examples above and abandons failure evidence on Held. The lifecycle handoff expressly tells the next planner to assess prior work, so it needs a durable read path.

O4. Pack the entire chart or direct directory indiscriminately. This hides plan/report/review Markdown that seats already read directly and can capture active peer-exchange artifacts outside direct. Archive the selected log bytes and preserve the document structure.

### Evidence tier, source and date

E1. Operator-placed: log-coverage Question/Carries and evidence-location Taken, read 2026-10-15. Readability through `akrogon log` and lossless packing are settled.

E2. Primary local code/skills: the direct-route and explicit-holder paths cited above, inspected 2026-10-15. `skills/chart-issues/SKILL.md:85` defines the three ending markers and states that the latest marker is authoritative. `:114,121` distinguish successful landing and abandon. None calls `completeOwner` for the chart.

E3. Primary host artifacts: six direct-folder listings, their file sizes and their terminal marker lines, inspected 2026-10-15. The 56-file total includes the non-check `.ask-B1.log`, not just generated checks.

### Pitfalls and what removes them

R1. The archive exists but `akrogon log` cannot locate it. The taken lifecycle resolver derives an owner after `open/`, `closed/` or `parked/`. Direct paths instead use `issues/chart/<chart>/direct/…`. Add that case to the same resolver and cover relative references from direct reports. Do not require moving the chart into issues/closed.

R2. The door records an ending without successfully retaining its logs. Make packing and read-back an explicit prerequisite to the terminal evidence step, with the same preserve-on-error behavior as lifecycle packing. If a push already landed and archiving fails, report the evidence failure without pretending the push was undone.

R3. A later resume or an interrupted end overwrites earlier archived bytes. Preserve the accepted archive-plus-plain retry union. A reopened direct attempt needs an explicit writable state and unique new log identities, not a permanent `.closing` marker that makes its allowed `--holder` writes fail. A terminal marker alone does not prove no process is still publishing.

R4. Handed off is mistaken for “the evidence is now in the leaf.” The chart stays in place and the leaf may adopt the direct branch (`skills/chart-issues/SKILL.md:120`). Retain the chart archive and its original locators. Do not duplicate it into a new leaf merely to make completeOwner see it.

### Additional question

Q1a. Can a chart with a prior terminal marker be reopened for another direct attempt? If yes, the contract must define reopening the direct holder and preserving its previous archive before new writes. This is separate from deciding when the original attempt ends.

## Q2. Hand-saved logs

### Pick, reason and cost

D2. Keep hand-saved supplemental evidence allowed. Use the existing verify/run-check path for ordinary check execution and cite its retained log instead of saving an identical second console copy. Do not require every evidence artifact to originate in run-check, and do not delete or deduplicate historical files under this decision. Close-time packing already includes all owner `*.log` files regardless of their producer.

Reason: the sample contains three different things: ordinary test output that run-check can capture, a proven byte-identical duplicate of an existing run-check log, and other evidence such as rebase range-diffs, push failures and timed HTTP observations. One filename rule cannot distinguish those purposes. The latter artifacts can be relevant without being the stdout/stderr of a required check.

Cost: filenames and supplementary evidence remain less uniform, and readers still need the report's command, revision, outcome and context. Skills should make the distinction explicit: use the existing check log for that run; separately retain other evidence when a proof/review step requires it. Never claim an arbitrary hand-written file is a verification receipt.

### Sample: what the files contain

Paths in this table are relative to framework. A non-`check-` name is a candidate for manual saving, not proof of its exact creating shell command. The table uses actual contents and report citations rather than attributing every such file to a seat by its name alone.

| Sample | Contents and evidence | What it adds beyond a run-check log |
|---|---|---|
| `issues/closed/analytics-setup/lookup-tools-webfetch/merge-evidence-295532cc/contracts.log` | 4,117 bytes, 26 lines. Line 1 is the invoked contracts script; lines 2–25 contain warnings; line 26 is the success result. review-B.md:160 records its exit 0 | No special capability. run-check could capture these same command bytes. The command banner comes from the invoked runner, not guaranteed run-check metadata |
| Same folder `parity.log`, `selftest.log` | 1,411 and 344,219 bytes. Test names, timings, counts and terminal results. Selftest ends at lines 3862–3865 with 2,225 pass, 0 fail. review-B.md:161-162 names the logs | Ordinary raw test output, fully representable by run-check |
| Same folder `test.log`, `test_changed.log` | 5,528 and 5,526 bytes, each 52 lines, combining parity output with contracts warnings/results. review-B.md:163-164 | Combined command output rather than a different artifact type. A wrapper running that exact command can capture it |
| Same folder `verify.log` | 1,501,189 bytes, 10,301 lines. Line 1 names the guarded sequential fast/core verify command. Later lines contain prefixed nested lanes and their final results. review-B.md:165 | Full aggregate command output. run-check can capture it. A short review excerpt cannot replace it |
| `issues/closed/flaky-tests/flaky-test-fixes/implementation/repair-B-cheap-console.log` | review-B.md:374 explicitly calls this a captured console beside `check-cheap-1791925421683-4114819.log`. Both are 46,351 bytes and 543 lines | **Nothing: byte-for-byte equality was measured in this pass.** This is concrete evidence for citing the existing log instead of keeping a second console copy |
| `issues/closed/audit-dispatch-contracts/backlink-run-identity/implementation/f5-direct-proof.log` | 4,924 bytes, 72 lines. Targeted tests end with 54 pass, 0 fail, 198 assertions | A criterion-specific targeted run, not necessarily included in a broad verify receipt. run-check can capture it when used for that command |
| `issues/closed/emdash-cms/emdash-operations/emdash-upgrade-route/implementation/review-B-evidence/merge-range-diff.log` | 21,429 bytes, 23 lines. Maps old/new commits and shows conflict-resolution changes. review-B.md:129 explicitly points to the full range-diff | Rebase-review evidence absent from the normal test/verify output. run-check could technically execute git range-diff, but calling it a required check does not make its purpose clearer |
| Same owner `implementation/review-B-evidence/rollback-cli.log` | review-B.md:38 uses the recorded CLI output to show rollback instructions were absent from stdout even though the JSON record contained them | Observed product behavior for a defect. Its value is the exact command outcome, not the file naming rule |
| `issues/closed/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/evidence/v4/attempt4-poll.log` | 1,637 bytes, 10 lines. Timed HTTP observations go from 404 to 200 MISS then HIT at lines 8–10. implementation/report.md:28 identifies the failed drill attempt evidence group | Time-series observations from a live proof. A verify log does not automatically contain these. run-check could capture an explicit poll command if the proof uses one, but cannot recreate observations omitted from that command's output |
| `issues/closed/skill-rewrite-tooling/spec-mutation-anchors/merge-evidence/rebased-1e53697b4/push.log` | Lines 1–5 record a rejected non-fast-forward push; a second attempt folder has another push log | Git transport/recovery evidence, not test output. It must not be confused with a failing check or a green receipt |

F4. There is no intrinsic “hand-saved format” that run-check cannot emit. `src/run-check.ts:67-77` captures stdout/stderr of an arbitrary argv, and `:207-217` copies that capture and records its path. The substantive difference is which command or artifact was retained. It does not automatically capture a child tool's separately written files, a prior run, a git range-diff it never executed, or the report's explanation of what a result means.

### Which skill steps cause the saving

F5. The current skill contracts require evidence, but do not prescribe the sampled filenames or a second copy:

- S1. `skills/implement-issue/SKILL.md:65` requires commands, pasted results, artifact paths, tested commits and proof outcomes in the implementation report. `:80` requires the rejected command and reproducing run evidence during repair. This explains targeted proof and live-drill attachments, but not a mandatory `selftest.log` filename.
- S2. `skills/check-issue/SKILL.md:18` says evidence needed later goes in the leaf folder; `:67` requires both inconsistent-run logs; `:83` requires failing and passing proof output for repairs. These are the applicable current steps for the cheap-console/reproduction evidence. The named duplicate is a seat's extra capture, not a second log explicitly required by the skill.
- S3. `skills/merge-issue/SKILL.md:18,41,53,73-75` requires retained verification output and commands/results for failed or inconsistent runs. The sampled lookup-tools review calls its section “merge” at review-B.md:147 and lists all six saved check logs at :160-165. This directly ties them to the merge evidence step.
- S4. `skills/merge-issue/SKILL.md:55` explicitly requires recording the rebase range-diff before checks. The upgrade-route review at :129 cites exactly that output. It is a distinct evidence requirement from running verify.
- S5. `skills/chart-issues/SKILL.md:107-110` similarly records rebase evidence, runs direct verification and handles rejected pushes. The earlier direct-folder sample shows a peer-command transcript too, whose contents come from coordination rather than checks.

The exact historic shell invocation or skill revision that created every old file was not recovered. Current evidence requirements plus report attribution establish the role of the files; they do not prove a current skill literally instructed `tee contracts.log` in an old session. Nothing found requires that duplicate byte-identical console copy.

### Rejected options and costs

O5. Require every retained evidence file to be a run-check log. This confuses check output with other proof artifacts and requires wrapping unrelated git/HTTP/reporting operations as checks. It also cannot make child-generated files appear in stdout automatically. One writer would need an additional artifact-import/attachment contract, which the current question does not define. Do not add that machinery merely to standardize names.

O6. Let seats keep redirecting every check's console to an extra file without clarification. The cheap-console sample proves this can duplicate exactly the evidence already retained. Clarify that the existing log path plus excerpt satisfies the reporting step. Do not repeat full logs inside Markdown, where the `*.log` pack would not reduce them.

O7. Archive run-check names only. This is already foreclosed by evidence-location's “every `*.log` on disk” decision and would omit the range-diff, poll and push examples. Keep producer-neutral archival separate from guidance about future check execution.

O8. Remove files deemed duplicates by name or apparently similar results. The same check may have distinct red/green runs, different commits or different timing evidence. Historical removal is not part of this Q2. Even the measured duplicate is left untouched in this audit.

### Evidence tier, source and date

E4. Operator-placed: Q2 and the taken producer-neutral close-time packing rule, read 2026-10-15. The question asks about future skill behavior, not permission to discard the existing sample.

E5. Primary local evidence: the sampled files and report line citations above, current run-check code, and current skill evidence steps, inspected 2026-10-15. The cheap-console duplicate was compared as raw bytes in memory. Other samples were inspected by their beginning/end and relevant report citations, not rerun. No claim that all manual-looking logs are redundant.

### Pitfalls and what removes them

R5. A naming cleanup discards unique proof. Decide by purpose, preserve every selected original byte through the existing archive, and leave source attribution in the report. Compression is not evidence selection.

R6. A report's “record output” instruction produces two full copies. Point it to the retained run-check/verify locator, with only relevant excerpts in the report. Require a reason for a supplemental capture when the same output is already retained.

R7. Hand-saving a wrapper/pipeline changes the reported exit. Preserve the actual checked command's exit separately from tee, grep, echo or other reporting steps. `checkedRun` returns the captured process's code (`src/run-check.ts:217`), but wrapping a pipeline does not magically recover an inner command's lost exit. The report must identify the command that produced the proof.

R8. Child-written artifact files are mistaken for captured stdout. A screenshot, trace, JSON result or product session log can be essential alongside a check log. They keep their existing artifact contract. This fork should not silently widen `*.log` packing to every artifact type or ban supplemental evidence.

### Additional question

Q2a. Does “single writer” mean only avoiding second copies of check stdout, or forbidding all supplemental evidence files? The sample supports avoiding duplicate stdout. It does not support forbidding range-diff, live observations or child-produced artifacts. Name that boundary in the skill instruction so implementers do not invent an artifact-import system.
