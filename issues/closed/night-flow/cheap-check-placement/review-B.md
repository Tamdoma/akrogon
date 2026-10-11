# Review B: cheap-check-placement

Date: 2026-10-11. Phase: check.review. Verdict: ready.
Base: `c53f6196533289555518577f08907ec9c713721c`.
Reviewed head: `cbd5640ddd8080a06aa140a2722b06873ff8fdf8`.

## Scope and findings

Reviewed the complete three-file diff against brief criteria 1–4, plan D1–D7, design exclusions and implementation report. No Fixes, Nits or operator actions. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No code, configuration, tests, lesson removals or AREA files changed.

Documented behavior changes only by adding the cheap-check placement rule. Read the setup and merge guides, reference index, skills area and both affected skills. The rule remains agent guidance and adds no mechanical enforcement.

## Criterion evidence

1. `grep -n "merge command runs" skills/init-akrogon/SKILL.md` succeeds at line 20. Setup inspects each proposed merge command's scripts, puts cheap children in `checks`, uses an existing cheap group when available and permits reruns at merge.
2. `grep -n "never runs only at merge" docs/guide/setup.md` succeeds at line 54. The bullet explicitly requires cheap checks in leaf checks even when the merge command also runs them.
3. `grep -n "reachable only at merge" skills/check-issue/SKILL.md` succeeds at line 43. A script change leaving a cheap check merge-only routes to a Fix when an existing leaf check can run it through a script edit, otherwise to an operator config action that gates no criterion. This follows the locked design.
4. Independently reviewed every `rg -n 'merge_checks|merge check|only at merge' skills/ docs/` hit by meaning. The three edited hits establish placement. Remaining hits classify as follows:
   - `docs/guide/setup.md:55,70`: merge coverage and setup execution.
   - `docs/guide/phases.md:13,80,94`: phase ownership, planned proof and merge-command timing.
   - `docs/guide/merge.md:3`: integrated checks order.
   - `skills/init-akrogon/SKILL.md:30,31`: proposal keys and coverage.
   - `skills/implement-issue/SKILL.md:49,63,80,84`: grants, implementation proof and repair replay.
   - `skills/check-issue/SKILL.md:33,89`: grants and repair check execution.
   - `skills/chart-issues/assets/shapes.md:168,286`: criterion proof restrictions.
   - `skills/chart-issues/SKILL.md:108`: command ordering.
   - `skills/plan-issue/SKILL.md:35,63`: grants and planned proof.
   - `skills/AREA.md:24,27`: phase timing and red-check comparison.
   - `skills/merge-issue/SKILL.md:29,31,41,51,71`: environment, grants, integrated checks and retries.
   - `skills/learn-issues/SKILL.md:14`: blocking-check identification.
   None permits a cheap check to run exclusively at merge. Statements about merge-command timing remain consistent with cheap children also running through leaf checks. No additional affected document requires editing.

Concrete scenario: a proposed slow verification script includes typecheck and lint. Setup now puts its existing cheap group in leaf checks. If a later leaf changes the merge script and strands a cheap child, review either requests the permitted script repair or names the operator's config addition. This covers the brief's framework failure mechanism without running slow verification in every leaf.

## Verification and test changes

Reused unchanged implementation evidence, inspecting the final check logs under `implementation/`:

- `check-format-1791713393588-1829208.log`: setup completed, formatting lists unchanged files.
- `check-test-1791713502159-1831587.log`: setup completed, 792 pass / 0 fail across 41 files, terminal result at 105.16 seconds.
- `check-typecheck-1791713508852-2314814.log`: setup completed, `tsc --noEmit`; report records successful completion.
- `check-test_changed-1791713506239-2314835.log`: setup completed, three changed files with no affected test files, 0 fail. An earlier log has a quoted-base invocation error, superseded by this successful final run at the planned base.

The report records all four configured checks. Their logs include the printed setup and expected underlying commands. No runner configuration or tests changed, and no planned test was skipped, filtered or disabled. Plan D6 deliberately adds no prose tests. No code change or unresolved verification concern warrants repeating these checks.

Independent `git diff --check <base>...HEAD` passed. The worktree is clean and remains at the reviewed head.

`Test-Change:` trailers in `<target>..HEAD`: none. The range contains one implementation commit changing only the three owned Markdown files. None matches the path rule in `src/test-files.ts`, so no trailer is required.

## Merge attempt, 2026-10-11

Attempt: `5bdd3c9d-5113-428e-896d-73c0aea17769`.
Integrated base: `ba6b8a1d677661aa4aa08d8beb058594485d861f`.
Tested top: `f9b4229e1c4f7d931a29a5142fbc5eaf8ba9ecab`.
Prior reviewed head: `cbd5640ddd8080a06aa140a2722b06873ff8fdf8`.

The command applied the holder onto current main, with no carried members. HEAD matches the recorded top, the worktree is clean and the base-to-top diff still contains only the three reviewed prose edits. No commit, fetch or manual rebase performed.

Ran every printed `checks` command, with `AKROGON_BASE=ba6b8a1d677661aa4aa08d8beb058594485d861f`. `merge_covers`, `merge_checks` and `advisory` are empty. Each invocation uses `akrogon run-check --name <name> -- sh -c` with this printed body, substituting the command listed below:

```sh
akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && akrogon guard own-modules && sh -c '<command>'
```

- `format`: `bun run format`, exit 0, all formatted files unchanged. Log: `implementation/check-format-1791713626319-2851769.log`.
- `test`: `bun test --timeout=30000`, exit 0, 813 pass / 0 fail, 42 files, 89.54 seconds. Log: `implementation/check-test-1791713725109-2901778.log`.
- `typecheck`: `bun run typecheck`, exit 0, `tsc --noEmit` clean. Log: `implementation/check-typecheck-1791713656608-3014147.log`.
- `test_changed`: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, exit 0, three changed files with no affected test files. Log: `implementation/check-test_changed-1791713655229-3019688.log`.

All setups completed. No red checks or advisory Nits. Read night-flow's issue index and current sibling phases: several other leaves remain unmerged, so this holder-only attempt cannot close the issue and needs no completion broadcast.

Merge guard returned `ok`. Final phase command exited 0 and returned:

```text
moved merged
deployed ba6b8a1d6776..f9b4229e1c4f
```

The command pushed the tested top and moved the leaf to merged. No issue/epic completion line was printed, so no broadcast was triggered.
