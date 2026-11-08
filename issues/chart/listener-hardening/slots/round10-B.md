## Q1 — The tasks handle is shell-output state, not conversation identity

Verified t3k's live PID `1114954` runs Claude `2.1.317`. Its native `/home/ivan/.claude/sessions/1114954.json` says `sessionId=9f0e4ce4-70a8-49b9-b571-c70c588c5cfa`, matching the existing transcript and all 814 records carrying a sessionId. The labelled `d577da64-91b0-478d-a9ff-09e97da0f445.jsonl` does not exist.

The directory birth is `12:21:04.057Z`. The transcript records its first Bash tool call at `12:21:03.436Z` and its result at `12:21:04.088Z` (lines 50–51). No TaskCreate call occurs there. The running executable's embedded implementation constructs and memoizes the shell output directory as `join(projectTempRoot, sessionScopeId, "tasks")`; its output state includes `bashTaskSnapshots`, and output files use `<task>.output`. This is separate from the persistent TaskCreate checklist under the Claude config directory. Claude's [interactive-mode documentation](https://code.claude.com/docs/en/interactive-mode#task-list) also distinguishes the checklist from background shells/subagents.

Therefore Bash output initialization explains the directory's creation time. Its cached/session-scoped scratch key is not a reliable transcript key. I cannot reconstruct from the retained records exactly when d577da64 was allocated or which async scope supplied it. Attributing it to TaskCreate or a subagent is unsupported.

### Live-seat audit

Queried `hc ls --json`, then each terminal's foreground record, native PID metadata, open fd targets and labels through read-only `hc exec` commands. IDs below are abbreviated to eight characters. “File” means a unique matching `<sessionId>.jsonl` exists under `~/.claude/projects/*/`.

| HC seat | Foreground PID | Open tasks ID | Native conversation ID | File | Cached label |
|---|---:|---|---|---|---|
| infra/t3 | 2197928 | none | 1319cca9 | yes | absent |
| infra/t6 | 3437925 | 480f6019 | 51af12b2 | yes | absent |
| infra/t15 | 2197513 | 4a3df037 | 4a3df037 | yes | absent |
| infra/t32 | 3514724 | none | 48c0f67b | no | absent |
| infra/t3f | 504051 | none | e88bf023 | yes | absent |
| infra/t3g | 1016553 | c191fd0a | 2aef8302 | yes | absent |
| infra/t3k | 1114954 | d577da64 | 9f0e4ce4 | yes | d577da64, missing |
| infra/t6d | 2617605 | f91fd55b | f91fd55b | yes | absent |
| personal/t11 | 552725 | b89a6ca5 | 00fe88c3 | yes | absent |

Four of six available handles disagree. Three seats have no such handle. All eight infra PID records' `procStart` values matched their live process start ticks. A background Claude also inherits t3's terminal environment, so matching solely by `HC_TERMINAL_ID` would be wrong: use hc's actual foreground PID. One additional live Claude PID record is outside hc.

## Q2 — Use Claude's PID record; stop treating the live label as authority

**Owner: akrogon, `src/transcript.ts:63-70,85-89,131-137`.** Read `<CLAUDE_CONFIG_DIR or HOME/.claude>/sessions/<foreground-pid>.json` for the current sessionId. The installed harness writes that record itself and updates its sessionId on session switches. Resolve that ID to its unique transcript under `projects`; return unknown if the transcript has not materialized, as with t32. This requires no settings or hook installation.

Recompute live identity instead of the unconditional cached-label return at `:131-132`. The label may remain a last-observed path for history/watch confirmation, updated when the authoritative identity changes. Removing the cache alone retains the broken tasks heuristic. Checking existence or an internally matching sessionId alone is also insufficient: t6 and t3g's *old tasks-derived transcripts still exist*. Mtime cannot establish current ownership while an agent is idle.

Consumers: chart transcript lookup (`skills/chart-issues/scripts/transcript.ts:12`), watcher observe (`skills/watch-issues/scripts/observe.ts:74-76`, currently hides missing paths as `-`), door reset (`door-reset.ts:76,81,91,119,125`), prompt timing (`src/next.ts:430`), and phase evidence (`src/log.ts:43`). Chart usage subsequently trusts recorded `seats.yaml` transcript paths (`skills/chart-issues/scripts/chart-usage.ts:6-20`). `src/listen.ts` has no direct label/transcript dependency; listener-triggered next passes reach the timing lookup. Preserve the reset's existing code-based proof of a new conversation.

## Q3 — Capture failures at the launch boundary

`door-reset.ts:81` can throw before `step()` first runs at `:82`; imports, config lookup and later awaits can fail outside the explicit `stop()` paths too. The launch recipe at `skills/chart-issues/SKILL.md:159` removes the helper's terminal, losing its stderr.

Smallest comprehensive correction: redirect the helper's stdout/stderr to the supplied log **before Bun starts**, in the launcher. For example, pass arguments separately to:

```sh
sh -c 'log=$1; shift; exec bun "$@" >>"$log" 2>&1' sh "$log" "$script" "$a" "$log" "$start"
```

This captures loader, validation and uncaught runtime failures even with `--rm`, without a broad catch or success-shaped recovery. Existing JSON stage lines remain; fatal stderr supplies the failure evidence between them. An initial queued stage alone would still leave later uncaught failures unexplained.

No resolver was invoked and no labels, settings, processes or terminals were changed during this audit.
