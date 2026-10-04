# Implementation report: learn-issues

Base: `76ec78494a77dca27a7b25a2128cf1d3bcda1045`
Committed head: `a1abf5a` on `learn-issues`

## Changed files and reasons

- `skills/learn-issues/SKILL.md` (new) — operator-invoked lesson triage skill (U1, worker commit `810b4c9`, cherry-picked `93f7bba`).
- `skills/chart-issues/SKILL.md` — removed the open-time lesson-prune offer, kept the LESSONS.md resource read (U2, `1526588` → `036b367`).
- `learnings/LESSONS.md` — header line 5 names `/learn-issues` as the prune path; no lesson lines touched (U3).
- `docs/reference-index.md` — nine → ten agent workflows (U3).
- `README.md` — linked `learn-issues` row in the skill table (U3).
- `docs/guide/cheat.md` — `learn-issues` row in table form; operator-invoked sentence includes lesson triage (U3).
- `docs/guide/learn.md` — prune-or-seed sentence names `/learn-issues` (U3).
- `skills/AREA.md` — Key files bullet; file is 32 lines with the four required sections (U3).

Docs commit `3490d49` → `a1abf5a`. No test files changed; no `Test-Change:` trailers required.

## Criterion proofs

1. `skills/learn-issues/SKILL.md` exists with `name: learn-issues`, operator-invoked description, three outcomes with tests and actions, evidence step, scope limit, `akrogon config` registered-root resolution, `repo: none` stop, no chart/map/pull/handoff. Verified by `grep -n` (lines 2, 10, 14, 16, 26-28) and reread of the file.
2. `grep -cn 'lesson prune' skills/chart-issues/SKILL.md` → 0; `learnings/LESSONS.md` still matched at line 29 in the open paragraph.
3. `git show a1abf5a -- learnings/LESSONS.md` shows header line 5 only (2 changed lines); `grep -n 'learn-issues' learnings/LESSONS.md` → line 5.
4. `grep -n 'ten agent workflows' docs/reference-index.md` → line 5; `grep -n 'learn-issues'` hits in `README.md:191`, `docs/guide/cheat.md:127,129`, `docs/guide/learn.md:18`, `skills/AREA.md:15`; `ls -d skills/*/` → 10 folders.
5. Dry walk below.
6. Checks below; `tests/docs-links.test.ts` passed inside `bun test` (415 pass, 0 fail), covering the new README link.

## Checks run

| Command | Result | Wall time |
|---|---|---|
| `bun run format` | exit 0, all files unchanged | 1.0s |
| `bun run typecheck` | exit 0 | 2.4s |
| `bun test --timeout=30000` | 415 pass, 0 fail | 12.4s |
| `bun test --changed=76ec78494a77dca27a7b25a2128cf1d3bcda1045 --timeout=30000` | 8 changed files, no test files affected, 0 ran | 10ms (seconds) |

All sized seconds; no slow runs.

## Dry walk of the new skill against current active lessons

Read-only walk at `a1abf5a885eb57e511bcdcdb4a00f88484e94ab2`, corrected by B on 2026-10-05. The 15 active entries identified in the original report are accounted for below. Each linked history was read for the observed failure, then compared with current code or the relevant instruction and the configured blocking checks. No lesson or history file was edited. References to LESSONS.md line numbers identify the entries, not proof of current coverage.

Blocking surface: `akrogon config` supplies format (`bun run format`), typecheck (`bun run typecheck`), test (`bun test --timeout=30000`) and test_changed (`bun test --changed="$AKROGON_BASE" --timeout=30000`, with the base required first). There are no merge_checks. `package.json:6-8` defines the scripts, and `bunfig.toml:1-3` selects tests/. No inference of protection is made merely because a check or instruction exists.

### Already guarded (would be removed)

- **LESSONS.md:9 stderr JSON parse**, history `learnings/history/2026-09-10-stderr-json-parse.md`. The observed mechanism is plain-text Herdr stderr reaching unguarded JSON.parse during failed agent start/prompt. Current `src/next.ts:521-523,556-565` routes those results through `herdrError` and `retryable`; `src/phase.ts:35,55` uses the same helpers on phase-side failures. `src/shell.ts:107-119` catches a parse miss and supplies an unstructured error instead of throwing SyntaxError. Calls through `command` throw CommandError with argv/cwd/status/stdout/stderr (`src/shell.ts:7-14,49-53`). Successful Herdr stdout parsing is a separate path (`src/shell.ts:121-130`), not a consumer of herdrError. Guard invocation is on the actual failed-command paths, covering the historical stderr-parse mechanism. The unstructured helper message is truncated to 500 characters, so this finding does not claim preservation of the full body on every reporting path.
- **LESSONS.md:19 plugin cwd pull**, history `learnings/history/2026-09-28-plugin-cwd-pull.md`. The observed mechanism is startup pull --all narrowing to the plugin's registered repo because of cwd. `plugin/herdr-plugin.toml:7-8` invokes `sh pull.sh --all`; `plugin/pull.sh:3` forwards its arguments. `src/pull.ts:79-88` routes all=true directly to the loop over every registered repo, without currentRepo or cwd selection. `tests/pull.test.ts:239-269` covers root, linked-worktree and unregistered cwd, and `302-319` covers startup wiring and argument forwarding. These tests run in blocking `bun test` through bunfig.toml. Both the command implementation and the reached regression tests cover the observed startup-pull mechanism. This does not certify other cwd-sensitive commands.

### Checkable (would print seed lines)

- **LESSONS.md:10 uncommitted handoff**, history `learnings/history/2026-09-11-uncommitted-handoff.md`. Observed failure: uncommitted work was accepted and then destroyed by forced worktree removal. `src/phase.ts:225-226` calls requireClean before normal worktree-holding transitions; `268-272` rejects dirty status. `src/phase.ts:229` calls requireNonEmpty (`311-314`) only when requesting check.review. This covers normal handoff, not every later verdict/merge invocation. Cleanup remains forced: nextCommand's sweep/startup paths (`src/next.ts:787,794-797,812`) call cleanupRepos (`736-740`), which calls cleanupMerged (`652-659`); a closed merged leaf with an existing worktree reaches `git worktree remove --force` at `657`, without checking its current cleanliness. Work written after the merged transition and before a later sweep is therefore on an unguarded destructive path. A clean earlier transition is not proof of a clean later cleanup. This is partial deterministic coverage, so the lesson is not eligible for removal.
  Seed: `/seed-issue the uncommitted-handoff lesson remains reachable at src/next.ts:657: cleanup of a closed merged leaf force-removes its worktree without checking for work written after the merged transition`
- **LESSONS.md:8 core-skills dangling links**, history `learnings/history/2026-09-10-core-skills.md`. Observed failure: deleting skill resources left links in other skills. Current `skills/chart-issues/SKILL.md:19` contains relative links to assets/questions.md, assets/shapes.md and assets/standing-design.md that operators follow during charting. `tests/docs-links.test.ts:73-86` checks README and docs/guide only. Thus deleting a linked chart asset can leave a live skill link broken without reaching this blocking link check. This is a reachable file-location pattern, not a claim that those current assets are already missing.
  Seed: `/seed-issue the core-skills dangling-link lesson can recur when a chart asset linked from skills/chart-issues/SKILL.md:19 is deleted; tests/docs-links.test.ts:73-86 excludes skill files`
- **LESSONS.md:17 whitespace-only input**, history `learnings/history/2026-09-19-min1-not-nonblank.md`. The original blank --reason source is now guarded by `src/phase.ts:327` and blocking `tests/phase.test.ts:1130-1148`. The schema pattern remains reachable in `src/config.ts:9`: text is z.string().min(1), reused for harness models/efforts and repo checks. Config enters through readGlobal/readRepo (`src/config.ts:82-91`), so whitespace-only configured text still passes this boundary. This is partial coverage of the lesson's validator pattern.
  Seed: `/seed-issue the whitespace-only-input lesson remains reachable through config parsing at src/config.ts:82-91 because text at src/config.ts:9 accepts whitespace-only harness models and check commands`
- **LESSONS.md:21 prose-assertion coupling**, history `learnings/history/2026-10-01-failed-stop-guard-wording.md`. Current `tests/phase.test.ts:41-42` stores a complete recovery explanation in seatRefusal and `1556,1583` requires it in stderr. The source explanation is emitted by `src/phase.ts:197`. A change to the explanatory sentence with refusal behavior preserved still fails blocking bun test. The existing suite exercises the coupled assertion rather than preventing this pattern. The reachable case is this existing assertion, not an abstract need for a prose-audit hook.
  Seed: `/seed-issue the prose-assertion lesson remains reachable in tests/phase.test.ts:1556,1583: seatRefusal at lines 41-42 requires the recovery explanation from src/phase.ts:197 even when refusal behavior is unchanged`
- **LESSONS.md:16 stale door checkout**, history `learnings/history/2026-09-27-stale-door-checkout.md`. The observed failure is charting from local main behind origin/main after pull succeeds. `skills/chart-issues/SKILL.md:27` still requires akrogon pull at open. `src/pull.ts:42-76` reads GitHub issue intake and writes seed mirrors, not the checkout branch; it does not fetch or compare main with origin/main. `src/config.ts:29-30` supplies the configured remote/default_branch. Comparing the checkout to its remote branch is a deterministic state-before-step pattern. Successful intake refresh leaves the historical stale-source case reachable when an operator opens a chart from a behind checkout.
  Seed: `/seed-issue the stale-door-checkout lesson remains reachable when skills/chart-issues/SKILL.md:27 opens from a behind default-branch checkout: src/pull.ts:42-76 refreshes intake rather than the Git branch`

### Stays (default)

- **LESSONS.md:7 review-by-reading**, history `learnings/history/2026-09-10-review-by-reading.md`. Current `skills/check-issue/SKILL.md:39` requires judgment against live contracts and `:59` limits reruns to changed code, missing evidence or a specific concern. Whether a path needs reproduction depends on the defect and evidence. A fixed detectable pattern covering the observed missed-defect mechanism has not been proved, so stays.
- **LESSONS.md:11 lock-vs-criterion**, history `learnings/history/2026-09-11-lock-vs-criterion.md`. `skills/plan-issue/SKILL.md:37` resolves a brief/design conflict in favor of the locked design and records the conflict. Current `skills/chart-issues/assets/standing-design.md:7-12` contains the locked test/evidence rules a derived criterion must respect. Detecting a substantive conflict requires interpretation, and a precedence instruction does not mechanically detect every conflict. Stays.
- **LESSONS.md:12 akrogon-home scratch verify**, history `learnings/history/2026-09-13-akrogon-home-scratch-verify.md`. `src/config.ts:74-83` still reads global config from AKROGON_HOME; `tests/helpers.ts:48-50` passes fixture-specific AKROGON_HOME to CLI children. This supports the historical isolation technique, but deciding when to copy real evidence into a scratch store is not a fixed defect pattern. Stays.
- **LESSONS.md:14 bun -e argv shift**, history `learnings/history/2026-09-14-bun-eval-argv.md`. Current `tests/config.test.ts:84-88,106-110` pairs process.argv[2]/slice(2) with the placeholder positional in Bun -e children. This is local application of the historical technique, not a general guard for every authored child script. With no proved general pattern beyond this runtime-specific technique, stays.
- **LESSONS.md:15 env grep digit**, history `learnings/history/2026-09-14-env-grep-digit.md`. Current `src/config.ts:47` accepts configured webhook environment names as text, and `src/readiness.ts:3` uses parseEnv for the readiness boundary. These do not cover an agent's ad hoc shell listing during charting. No current use of the historical faulty listing was established, and no fixed rule distinguishing suitable listings in all contexts was proved. Stays. No env file was opened, printed or changed.
- **LESSONS.md:13 stale rule in docs**, history `learnings/history/2026-09-11-stale-rule-in-docs.md`. Current blind review is stated by `skills/check-issue/SKILL.md:37`; current recovery documentation at `docs/guide/problems.md:27` matches `src/phase.ts:197`. `skills/implement-issue/SKILL.md:29` requires updating stale docs. These examples show current instructions and their doc surface, but the historical docs/limits.html referent is gone and no current contradictory rule was established. Semantic disagreement is not proved to be a fixed detectable pattern merely because a doc-sweep hook is absent. Stays.
- **LESSONS.md:18 ambiguous prose after rename**, history `learnings/history/2026-09-14-ambiguous-prose-after-rename.md`. Current `docs/guide/problems.md:15-27` directs failure recovery through the recorded cause and an operator phase move, while `skills/implement-issue/SKILL.md:21` distinguishes the current plan/design and worktree surfaces. The historical HTML pointers are gone. Whether a surviving term implies a removed contract is a meaning judgment; no current reachable ambiguous case or deterministic rule was proved. Stays.
- **LESSONS.md:22 bun preload timeout**, history `learnings/history/2026-10-02-bun-preload-default-timeout.md`. Current blocking root test and test_changed commands from akrogon config both use --timeout=30000, and `bunfig.toml:1-3` has no preload. However, `tests/watch-issues-scripts.test.ts:7-8` launches a nested Bun test without that flag. The historical lesson is to prove a runner setting across multiple files, not to infer effectiveness from a green suite or declare a nested run broken without timing evidence. These current surfaces do not prove a universal guard for future test-runner settings. Stays for the verification technique and unproved broader coverage.

Dry-walk totals: 2 already guarded, 5 checkable, 8 stays, of 15 active entries. Classification changes are report evidence only. Already-guarded history dating and printed seed offers were not applied or executed.

## Known limitations

- The dry walk is a trace only; no `/seed-issue` line was filed and no lesson was edited, per the skill's no-filing rule and this leaf's scope.
- `tests/docs-links.test.ts` coverage gap (skill-to-skill links) is recorded as a checkable finding above, not repaired — out of this leaf's owned surfaces.
- SKILL.md content is verified by inspection against the brief's required statements; it is prose and was not executed.

## Unverified criteria

None.

## Worker returns (folded)

- U1 `810b4c9`: SKILL.md written; changed-tests run had no affected test files; no limitations reported.
- U2 `1526588`: prune offer removed; `lesson prune` grep empty, resource read intact.
- U3 `3490d49`: six docs edits in one commit; README link was red in its isolated worktree (sibling file absent) and green after the wave merged, confirmed by `bun test` on the lane.
