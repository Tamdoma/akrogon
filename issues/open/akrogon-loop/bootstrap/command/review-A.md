# Review A: command

Phase: check.review, round 0. Reviewed the full diff of worktree `issues/worktrees/command` (branch `command`, 5 commits `8834a2b..6d904ab`) against `main`, independently of review-B.md.

## Checks run

```text
$ bun test
13 pass, 0 fail, 114 expect() calls, 4 files   exit 0
$ bun run typecheck
tsc --noEmit                                   exit 0
$ git status --short                           clean, before and after the suite
$ ls issues/.scripts                           absent
```

Herdr 0.9.0 flags used by `src/next.ts` and `src/install.ts` checked against installed `--help`: `tab create --cwd --label --env --no-focus`, `pane split --direction right --cwd --env --no-focus`, `agent start <name> --kind --pane --timeout -- args`, `agent prompt <pane> <text> --wait --until working --timeout`, `pane get`, `tab close`, `plugin link <path>`, `integration install <kind>`. All exist. `herdr pane list` live output has the `{"result":{"panes":[...]}}` shape and the `agent_session.value` field the schema reads.

## Done-criteria

| # | Criterion | Result | Evidence |
| --- | --- | --- | --- |
| 1 | atomic `phase`, done guard, legal predecessor, `recorded`/`moved`, stale refused unchanged, failed to implement, merged terminal | met | `src/phase.ts` transition; `tests/phase.test.ts` tests 1 and 2 |
| 2 | same-slot race one recorded one refused; different slots both record, one moves | met | `tests/phase.test.ts` test 1, real processes |
| 3 | merged under issue lock, epic detection, move to closed, `issue complete` once, no tab close, named place | met | `completeOwner` in `src/phase.ts`; test 3; `next` test 4 confirms the tab survives `phase merged` |
| 4 | landed merge detected by ancestry against `<remote>/<default_branch>` | met | `recoverMerge`; `tests/next.test.ts` test 6 with `upstream/trunk` |
| 5 | log line per move, state first, log failure no rerun, fix_rounds cap, `moved failed` | met | `src/log.ts`; tests 2 and 4 in phase |
| 6 | `next` resolution, routing constant, tab close after merge pass, refusals, max_active, worktree, two panes, launch line, idle check, wait flag, peer path, retry policy, prompt line | met | `src/next.ts`; `tests/next.test.ts` tests 1 to 7; captured prompt `plan-issue build slot=B phase=plan.synthesis` |
| 7 | `config` output and `AKROGON_BASE`, `init` file shapes, `install` symlinks and refusal | code met, install unverified | `tests/config.test.ts`, `tests/init.test.ts`; install has no test by design and was not run by hand yet |
| 8 | plugin links and hook fires `akrogon next`, pasted into a review file | not yet done | brief section 8 says so explicitly |
| 9 | `bun test` green, listed as `checks.test`, old config and scripts gone | met | run above; `issues/config.yaml` diff |

## Findings

F1 (Nit, operator gate, cites criteria 7 and 8). The hand verification of `install` and of the plugin hook has not happened. This is not a code defect and a fix round cannot produce it, so it is not a Fix. It must be done and pasted into a review file before `merge`. Note for that run: the command cannot be exercised against this checkout before merge, because the registered path `/home/ivan/Work/infra/akrogon` still holds the old-shaped `issues/config.yaml`, so `bun src/akrogon.ts config` from the worktree exits 1 with a ZodError on `issues_root`. Workaround for the hand check: run with `AKROGON_HOME` pointing at a temp folder whose `config.yaml` registers the worktree path under `repos`, or do the check right after merge. Reason it is a Nit: the brief's bootstrap order has the operator installing after the hand-built leaves merge.

F2 (Nit). `src/next.ts` `retryable` parses herdr stderr as JSON without guarding. A non-JSON stderr from herdr (a panic, a usage error) surfaces as a `SyntaxError` and the real stderr is lost. This contradicts the error-handling rule to propagate the response body. Grounded only in my reading, no reproduction on real herdr, so a Nit.

F3 (Nit). `issues/config.yaml` and every YAML `init` writes come from `Bun.YAML.stringify` and carry trailing spaces after mapping keys, `advisory: \n  []`, and no final newline. Parses fine, cosmetic only.

F4 (Nit, observation). `phaseCommand` and `nextCommand` also take `<AKROGON_HOME>/.lock` and `issues/.lock` beyond the leaf and issue locks the design names. The brief lists this as a known limitation. It serializes every command invocation machine-wide, including the up to 5 s waits on `herdr agent start` and `agent prompt` inside `next`. Harmless at `max_active` 3. Not a defect against any criterion.

F5 (Nit, observation). In `check.review` the requested phase argument is ignored and the destination is derived from the two verdicts. Consistent with plan D2. Worth knowing when typing prompts by hand: `phase command merge --slot B --verdict fix` moves to `check.fix`.

No regressions found. No overreach: the diff stays inside the ownership list (src, tests, plugin, config.yaml, package files, issues/config.yaml, .gitignore, .scripts removal). No status, pull, GitHub close, notification or stubs present. Skills, reference and new-beginning untouched.

## Verdict

nits

## Re-check, fix round 1

Scope: commits `340e70e` and `1041c85` only (`src/next.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, `implementation/brief.md`). Review A had no Fix findings. Review B had three code Fixes (B-F1 to B-F3) and one acceptance gap (B-F4).

```text
$ bun test          16 pass, 0 fail, 135 expect() calls   exit 0
$ bun run typecheck tsc --noEmit                          exit 0
$ git status        clean
```

Fix findings:

- B-F1 resolved. `dispatchLeaf` now returns before `recoverMerge` when the merge seat's pane is `working`. The seat is A, or B once `attempts.A` reached 3, which matches the seat rule in `dispatchSlot` (peer after two same-slot attempts). New test pushes the leaf head, sets the seat pane working for both A and B, runs `next --all`, and the normal `phase merged --slot A` still prints `issue complete`.
- B-F2 resolved. `nextCommand` parses `HERDR_PLUGIN_EVENT_JSON` at the boundary and returns on a `working` status event before any state read. Verified the envelope against local herdr source `src/api/schema/events.rs`: `EventKind` is `snake_case` (`pane_agent_status_changed`, `pane_exited`), `EventData` is tagged `type` with the same names, and `AgentStatus` has exactly the five values the schema accepts. New test shows a delayed working event leaves attempts and prompts unchanged, and an idle event still dispatches.
- B-F3 resolved. Agent name is `akrogon-` plus 24 hex chars of the pane id hash, 32 chars, starts with a letter, unique per pane. The fake herdr now enforces the name grammar and rejects a taken live name. New test runs two repos with the same 58-char numeric-leading slug and gets two distinct valid names, the slug kept in tab label and prompt.
- B-F4 not a code repair, still open. Same as A-F1: the operator's hand install and fixture-hook check before `merge`, pasted into a review file.

Repair-introduced defects: none found.

One Nit noticed while verifying B-F2, pre-existing and not blocking. Herdr sets `HERDR_PANE_ID` for pane events from `plugin_context_for_public_pane_id` and falls back to a workspace context with no pane id when the pane cannot be resolved. The hook lookup still keys only on `HERDR_PANE_ID`. The parsed event now carries `data.pane_id` and would be the natural fallback for `pane_exited` if the hand check in criterion 8 shows the exited pane arriving without `HERDR_PANE_ID`.

## Verdict

nits
