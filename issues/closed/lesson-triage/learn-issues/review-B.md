# Review B: learn-issues

Date: 2026-10-05. Phase: check.review (initial, blind). Verdict: fix.
Base: `76ec78494a77dca27a7b25a2128cf1d3bcda1045`.
Reviewed head: `a1abf5a885eb57e511bcdcdb4a00f88484e94ab2`.

## Fixes

### F1. Criterion 5's dry walk certifies coverage using false and missing evidence

Source: the required read-only dry walk in `implementation/report.md:39-72`, especially the uncommitted-handoff history `learnings/history/2026-09-11-uncommitted-handoff.md:3-5`. The criterion explicitly requires current file:line evidence for each classification and a whole-mechanism invocation trace before an already-guarded verdict.

The report at line 45 says worktree removal is no longer forced and that no `worktree remove` call exists in `src/`. Live inspection contradicts both claims: `src/next.ts:652-659` implements cleanup of a closed merged leaf with `git worktree remove --force`, without checking cleanliness there. The real command path is `nextCommand` (`src/next.ts:787`, `794-797`, `812`) -> `cleanupRepos` (`736-740`) -> `cleanupMerged` (`652-659`). `requireClean` on an earlier phase transition does not prove the worktree is clean at this later cleanup. The report also overstates `requireNonEmpty`: `src/phase.ts:229` invokes it only when requesting check.review, not on every review verdict or merge request.

Consequence today: the report certifies removal of the uncommitted-handoff lesson without establishing coverage of its destructive cleanup mechanism. The named criterion-5 scenario has not been proved. This finding requires correction of the report, not a runtime cleanup change or lesson removal in this leaf.

The same dry walk lists eight stays entries at lines 63-70 with history filenames and broad judgment descriptions, but no current file:line evidence. The stale-docs and ambiguous-prose entries at lines 52-57 also provide no current file:line evidence or concrete reachable case supporting their checkable classifications. A missing mechanical hook alone does not establish that semantic ambiguity is a fixed detectable pattern. This leaves the required per-entry evidence incomplete.

Repair: redo the report's evidence trace against the actual code and linked histories. Correct the cleanup and nonempty-check claims, substantiate or revise the uncommitted-handoff classification, and supply the missing current evidence for the remaining classifications. Use stays where coverage or a deterministic reachable pattern cannot be proved. Update totals and the criterion status accordingly. Keep lessons/history and runtime code unchanged.

## Nits

### N1. Cheat table says checkable lessons are seeded

Concern: `docs/guide/cheat.md:127` says “checkable ones seeded,” while `skills/learn-issues/SKILL.md:27` offers a seed invocation and files nothing. Reading the table alone can suggest intake is created by this pass.

Deferred because the skill itself and `docs/guide/learn.md:18` state the offer correctly, and “seeded” can be read as shorthand for the offered seed. Evidence that the table causes an operator to rely on nonexistent intake would promote this to a Fix. Prefer “seed lines offered” when this row is next edited.

## Verification

- Read brief, design, plan, implementation report, readiness record, relevant linked histories, check-issue/ponytail guidance, affected docs and the full base-to-head diff. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read or contacted.
- Criterion 1: the new skill has the required frontmatter, registered-root resolution and repo:none stop, evidence step, three outcomes, scope boundaries, offered seed format and uncommitted removal/history-dating workflow.
- Criteria 2-4: chart open drops only the prune offer and keeps the resource read. The lesson diff changes only its header. Ten skill folders match the index count. README's new link target exists. Cheat/learn docs and AREA list the new skill.
- Criterion 5: blocked by F1. Read the actual phase, dispatch and cleanup paths and the cited histories rather than treating the report's summary as proof.
- Criterion 6: reuse the report's checks at this unchanged head: format exit 0, typecheck exit 0, bun test --timeout=30000 = 415 pass/0 fail (including docs-links), test_changed = no affected tests/exit 0. No code changed, missing check evidence or concern about these check results warrants a rerun. The missing dry-walk evidence was investigated directly, not by rerunning unrelated tests.
- `git diff --check <base>...HEAD` passed. Worktree is clean. No implementation files, assertions, fixtures or recorded test output changed.
- The affected behavior documentation was opened: docs/guide/learn.md, docs/guide/cheat.md, README.md, docs/reference-index.md, skills/AREA.md, and the chart/seed/implement skills. N1 is the only additional wording concern.

## AREA path listing

One repository-root shell command listed every path named in the changed skills/AREA.md, including paths in its command examples. Present: src/akrogon.ts, tests/install.test.ts, tests/phase.test.ts, skills/init-akrogon/SKILL.md, skills/implement-issue/SKILL.md, skills/implement-issue/worker-protocol.md, skills/check-issue/SKILL.md, skills/learn-issues/SKILL.md, skills/watch-issues/SKILL.md, skills/implement-issue/brief-template.md, src/routing.ts, docs/reference-index.md.

Missing from the repository root: scripts/observe.ts and scripts/log-tail.ts. Both names are unchanged in this diff and are contextual to the watch-issues skill. Their actual files exist at skills/watch-issues/scripts/observe.ts and skills/watch-issues/scripts/log-tail.ts. The new learn-issues pointer exists. No new dead-pointer consequence was established.

## Test-Change trailers

Range: `76ec78494a77dca27a7b25a2128cf1d3bcda1045..a1abf5a885eb57e511bcdcdb4a00f88484e94ab2`.

None in commits 93f7bba, 036b367 or a1abf5a. Checked the changed-file rule in src/test-files.ts: none of the eight changed paths is an old test file, so no trailer or cited changed-test source is required.

## Operator actions

None. No live mutations, external fixtures or credentials were needed.


## 2026-10-05 check.repair

F1 repaired in the authoritative leaf's implementation/report.md. No source file or test changed, so there is no code repair commit; HEAD remains a1abf5a885eb57e511bcdcdb4a00f88484e94ab2. This is a lifecycle report correction stored outside the worktree, not an issue-file commit on the leaf branch. Plan and design are unchanged. Review A has no Fixes. N1 remains deferred.

Before: the report said “worktree removal is no longer forced (no worktree remove call exists in src/)” and certified the uncommitted-handoff lesson as already guarded. It also claimed every classification had been traced without recording current evidence for eight stays entries.

After: the report traces nextCommand -> cleanupRepos -> cleanupMerged -> src/next.ts:657's forced removal, distinguishes a clean phase transition from later cleanup, and limits requireNonEmpty to check.review entry. Uncommitted handoff is checkable with a seed describing the reachable cleanup case. Every one of the 15 entries now has its linked history and current file:line evidence with the reason for its classification. Stale semantic documentation and ambiguous prose stay because no deterministic current case was proved. The plugin cwd lesson is guarded by the current startup --all wiring, all-repo loop and blocking regression tests. Totals are 2 already guarded, 5 checkable, 8 stays. No seed was filed and no active lesson/history was edited.

Criterion proof:
- C1: reread skills/learn-issues/SKILL.md; frontmatter/operator invocation, registered root and repo:none, evidence, three outcomes, whole-mechanism coverage, seed offers, history dating and scope limits are present.
- C2: lesson-prune search has no match; the chart open resource read remains at line 29.
- C3: base-to-head lesson diff changes only header line 5.
- C4: ten folders match the index; README row targets the existing new skill, cheat row has the table's form and operator-invoked sentence includes triage, learn.md explains prune/offer, AREA names the new skill.
- C5: corrected dry walk read back; all 15 entries covered with current evidence. The named :10 case traces the current phase and destructive cleanup paths; :17 traces both the fixed reason boundary and still-reachable config schema. Each guarded verdict records actual command invocation and coverage. No lesson/history edits.
- C6: all four configured checks rerun and passed; README/guide link test passed within the suite. No merge_checks run.

Check evidence (logs under the exported leaf TMPDIR):
- bun run format: exit 0, files unchanged. Log: /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-B-format-q731zui2.log.
- bun run typecheck: exit 0. Log: /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-B-check-dzf7l6xm.log.
- bun test --timeout=30000: exit 0, 415 pass, 0 fail, 4566 assertions, 20 files, 12.78s. Log: /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-B-check-1ynm9en_.log.
- Configured test_changed command with AKROGON_BASE=76ec78494a77dca27a7b25a2128cf1d3bcda1045: exit 0, 8 changed files, no affected test files, 0 fail. Log: /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-B-check-kwks7t75.log.

Handed to A: none. Operator actions: none. Repair outcome: F1 resolved, N1 deferred, ready for merge with nits.

## 2026-10-05 merge

Fetched origin and rebased onto origin/main at 76ec78494a77dca27a7b25a2128cf1d3bcda1045. Already up to date, with no conflicts or changed integration. Prior reviewed head and resolved head are both a1abf5a885eb57e511bcdcdb4a00f88484e94ab2. Refreshed AKROGON_BASE through akrogon config: 76ec78494a77dca27a7b25a2128cf1d3bcda1045. Worktree is clean; no outstanding scoped code changes to commit.

All configured checks rerun in the leaf worktree:
- format exit 0, unchanged files; /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-merge-format-e5x8oulx.log.
- typecheck exit 0; /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-merge-check-qz6v1_in.log.
- bun test --timeout=30000 exit 0, 415 pass, 0 fail, 20 files, 12.86s; /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-merge-check-sev6_x4w.log.
- configured test_changed with refreshed base exit 0, 8 changed files/no affected tests; /tmp/akrogon-1000/learn-issues-071825303c3b/learn-issues-merge-check-btm60uos.log.

No merge_checks or advisory commands configured. No external proof fixtures or operator actions. N1 is retained as a narrow wording nit, not a distinct reusable lesson mechanism, so no lesson is added. Completion-owner context gathered from the only leaf brief under issues/open/lesson-triage before the command may move it. Broadcast skill dependencies installed with its frozen lockfile in preparation for command-confirmed completion.

Pre-push phase validation: akrogon phase learn-issues merged --slot B --check returned ok. Fast-forward push succeeded: origin main advanced from 76ec784 to a1abf5a via git push origin HEAD:main (exit 0). Completion command follows this recorded push evidence.
