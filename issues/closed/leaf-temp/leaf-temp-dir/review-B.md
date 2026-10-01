# Slot B review: leaf-temp-dir

Verdict: **fix**.

Base: `88f252f02eb36aacee6dadf6668c303374b692d5`.
Reviewed head: `5b31956d63d14d17cfbc2785ff210dd674ddf77d`.
The head contains four implementation commits beyond the base. `git status --porcelain` was empty before and after verification.

## F1: Guide claims exclude the implemented closed-tab cleanup

**Fix.** Affected lines: `docs/guide/merge.md:33`, `docs/guide/problems.md:53`, `docs/guide/limits.md:10`.

Each edit attaches temp-folder deletion to the existing exclusive sweep claim. Merge says “Only those sweeps … delete the leaf's temp folder”; problems and limits make the same claim about sweeps/startup. None describes temp deletion by the closed-tab hook.

Actual source and consequence: after a normal merged leaf's tab closes, Herdr delivers `tab_closed`. `src/next.ts:782-784` calls `removeLeafTemp` for its merged owner, and `:598-599` deletes scratch and prunes Git registrations immediately, without a repository sweep. An operator reading any of these cleanup instructions is told the folder survives until a sweep, although ordinary tab closure already removes it. The guide also fails to distinguish scratch cleanup for merged leaves still under `issues/open` from later worktree/branch cleanup.

This fails brief criterion 7 and plan C7, which explicitly require the guides to describe deletion when a merged tab closes and contain no contradicting cleanup line. This is a wrong lifecycle claim, not a preference for wording.

Proof: live review of all three paragraphs against the hook and sweep paths, plus the passing `closed tab scratch deletes merged folder and prunes inner worktree` scenario. The sweep tests separately demonstrate scratch deletion under `issues/open` and retention on the first sweep with live panes.

Repair all three paragraphs to state closed-tab hook deletion with sweep catch-up when the tab already has no live panes. Keep the exclusive sweep restriction attached only to completed worktree/branch removal after records move. Review the resulting paragraphs for consistent behavior. No prose assertions are needed.

## Verification and remaining criteria

- Reviewed the entire base-to-head diff against the locked design, synthesized decisions/checklist, implementation report, and B's position/rebuttal. Followed the reference index and affected guide/skill surfaces. No AREA file changed.
- Specific rerun to verify hook versus sweep behavior, allocation privacy, and complete fixture isolation: `bun test tests/next.test.ts -t 'closed tab scratch|sweep scratch catch-up|fixture temp root|allocation carries TMPDIR|leaf temp path bounds|recreates missing scratch'` — **15 passed, 0 failed, 192 assertions**, 6.70 seconds.
- C1–C6 have behavior tests exercising the actual CLI, real directory modes, fake-Herdr command arguments, bounded production-path calculation, Git worktree pruning, failed-leaf retention, live-pane retention, and recreation with unchanged seats. Recovery retains the existing allocation topology assertions. Both `cli` and `fakeHerdr().env` carry the fixture override, including the direct `nextAt` subprocess. Production-path coverage computes strings only.
- C7's three skill rules are present once each. Its three guide paragraphs fail as described in F1.
- C8 evidence at the reviewed head is supplied by `implementation/report.md`: formatting committed, typecheck passed, full suite 353 passed/0 failed. The preserved `implementation/u2-changed-tests.log` confirms 346 passed/0 failed for the worker changed-test run. No code changed during review, and no concern warrants repeating the full checks.

The accepted prune-after-successful-removal retry gap and existing-pane rollout limitation remain as recorded in the plan/report. No additional blocking code defect or Nit was found. No implementation or documentation files were edited in this review.

## Repair round 1 re-check

Verdict: **ready**. F1 is resolved.

Prior reviewed head: `5b31956d63d14d17cfbc2785ff210dd674ddf77d`.
Repair reviewed head: `9b3e1c99b48a654261246965208e8a10fc757acc`.
Original base remains `88f252f02eb36aacee6dadf6668c303374b692d5`.

Reviewed only the repair diff: three paragraph replacements in `docs/guide/merge.md:33`, `docs/guide/problems.md:53`, and `docs/guide/limits.md:10`. All three now state closed-tab hook deletion and sweep/startup catch-up when no live panes remain. The exclusive sweep restriction applies only to worktree/branch cleanup. Reading the surrounding paragraphs and searching guide cleanup claims found no contradiction. C7 is satisfied, and the repair introduces no blocking finding or Nit.

`git merge-base --is-ancestor` confirmed continuity from the prior reviewed head. `git status --porcelain` remains empty. No code, test, skill or AREA file changed in the repair. Existing C1–C6 runtime evidence therefore remains applicable. The repair report records formatting and typecheck success plus 353 passing full-suite tests. The preserved `implementation/brief4-changed-tests.log` confirms 346 passed, 0 failed. No additional test rerun was warranted for these prose-only corrections.

## Merge verification

Prior reviewed head: `9b3e1c99b48a654261246965208e8a10fc757acc`.
Rebase target and refreshed AKROGON_BASE: `9a627dd3bb99553cbf874582762073aa19678cf0` (`origin/main`).
Rebased head: `d0eceaaa58edba85682f6e53315f5d3935de95fd`.

Fetch and rebase completed without conflicts. `git range-diff 88f252f02eb36aacee6dadf6668c303374b692d5..9b3e1c99b48a654261246965208e8a10fc757acc 9a627dd3bb99553cbf874582762073aa19678cf0..d0eceaaa58edba85682f6e53315f5d3935de95fd` showed all five commits equivalent. No scoped outstanding code changes required a commit.

All configured checks ran successfully on the rebased head, with logs preserved under `implementation/`:

- `bun run format`: exit 0, no tracked changes. Log: `merge-format.log`.
- `bun test`: exit 0, 353 passed, 0 failed, 4124 assertions. Log: `merge-test.log`.
- `bun run typecheck`: exit 0. Log: `merge-typecheck.log`.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`, with the refreshed base: exit 0. Log: `merge-test-changed.log`.

No merge_checks or advisory commands are configured. The worktree remains clean and the rebase target is an ancestor of HEAD. The standalone completion owner's only leaf brief was gathered before recording completion.

`git push origin HEAD:main` exited 0 and confirmed the fast-forward `9a627dd..d0eceaa`. The verified rebased head is now on the configured remote main branch.
