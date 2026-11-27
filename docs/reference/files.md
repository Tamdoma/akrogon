# Files

Akrogon keeps two kinds of things apart. Issue records live in the registered checkout under `issues/`. Code changes live in leaf worktrees, in a store outside the checkout.

The registered checkout's `issues/` folder holds the record folders and logs laid out below. Leaf worktrees live in a separate store, by default `~/.akrogon/worktrees/<repo>`.

## Layout of issues/

```text
<repo>/issues/
  config.yaml            repo settings
  seeds/                 imported seeds, not committed
  chart/                 charts of open forks
  open/                  issues and leaves the lifecycle works on
  parked/                issues set aside
  closed/                completed issues
  log.jsonl              lifecycle moves
  timings.jsonl          when each stage happens
  timings-kill.jsonl     tool-scope kill events
  merge-attempts.jsonl   each merge attempt
  verify-runs.jsonl      each verify run's receipt
```

| Path             | What it holds                                                                                                                                                                                                                               | Source                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `config.yaml`    | The repo's settings. Its presence marks a registered checkout.                                                                                                                                                                              | [config.ts](../../src/config.ts)                                                                   |
| `seeds/`         | One file per imported seed. `akrogon pull` rewrites it. `akrogon sync` never commits it.                                                                                                                                                    | [pull.ts](../../src/pull.ts), [sync.ts](../../src/sync.ts)                                         |
| `chart/<chart>/` | One folder per chart, with `CHART.md`, `INTAKE.md`, `seats.yaml`, `USAGE.md`, `forks/` (the door session's signposts record `signposts.md` plus one file per fork), `slots/` and `direct/` (charting-probe capture logs and, after a direct drop, the dropped leaf's owner folder). `signposts.md` is the original in the chart where the round ran and a verbatim copy naming it in the session's other charts. A handover entry in `CHART.md`'s Mode record carries the path of the session's signposts record; the [skill's handover step file](../../skills/chart-issues/assets/handover.md) has the procedure. | [chart-issues](../../skills/chart-issues/SKILL.md), [shapes.md](../../skills/chart-issues/assets/shapes.md) |
| `open/`          | Work the lifecycle can pick up. A leaf sits two or three folders deep: `open/<issue>/<leaf>/` or `open/<epic>/<issue>/<leaf>/`.                                                                                                             | [state.ts](../../src/state.ts)                                                                     |
| `parked/`        | Issues moved aside by `akrogon park`. `akrogon unpark` moves them back.                                                                                                                                                                     | [park.ts](../../src/park.ts)                                                                       |
| `closed/`        | Completed issues. When every leaf of the owner (the issue, or its epic when it has one) is done, its `*.log` files are deleted and the owner folder moves here. Each run's failing test names stay in `verify-runs.jsonl`. `akrogon log <path>` still reads a log from an older `evidence.tar.zst` by its plain path. | [phase.ts](../../src/phase.ts), [pack.ts](../../src/pack.ts), [evidence.ts](../../src/evidence.ts) |

`akrogon sync` commits eligible files under `issues/` (see [Saving records with akrogon sync](#saving-records-with-akrogon-sync)). It skips `seeds/`, `.lock`, `.closing`, `*.tar.zst.tmp`, and the worktree store if it sits inside the checkout, and never commits leaf code. See [sync.ts](../../src/sync.ts) `eligibleRecord`.

## Issue and epic files

| File       | Where                                   | What it is                                                                                     |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ISSUE.md` | Issue folder                            | The issue's goal and its leaves. May open with a `slots:` front matter block that sets a seat. |
| `EPIC.md`  | Epic folder, one level above its issues | The epic's goal. May also carry `slots:`. The nearer `ISSUE.md` wins over `EPIC.md`.           |

Seat lookup reads these files in [config.ts](../../src/config.ts). [chart-issues](../../skills/chart-issues/SKILL.md) writes them at handoff.

## Leaf folder records

The files below sit in the leaf folder in the registered checkout; the owner-level `.lock` sits in the owner folder. A leaf branch never holds files under `issues/`.

| File                                         | Written by                                               | What it is                                                                                                                                                           |
| -------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brief.md`                                   | [chart-issues](../../skills/chart-issues/SKILL.md)       | The leaf contract: scope, limits and done-criteria.                                                                                                                  |
| `design.md`                                  | [chart-issues](../../skills/chart-issues/SKILL.md)       | Decisions the implementer needs. Present when charting made them.                                                                                                    |
| `readiness.yaml`                             | [chart-issues](../../skills/chart-issues/SKILL.md)       | Needs, grants and proofs. `akrogon status` prints a missing need and `akrogon next` refuses to start the leaf. Read by [readiness.ts](../../src/readiness.ts).       |
| `state.yaml`                                 | [state.ts](../../src/state.ts)                           | The leaf's lifecycle state. Fields are in [state-and-phases.md](state-and-phases.md).                                                                                |
| `plan.md`                                    | [plan-issue](../../skills/plan-issue/SKILL.md)           | The final plan: decisions, units, waves and the proof for each done-criterion.                                                                                       |
| `implementation/report.md`                   | [implement-issue](../../skills/implement-issue/SKILL.md) | What was built, commands run with results, base and head, limits and unverified criteria.                                                                            |
| `implementation/brief-<n>.md`                | [implement-issue](../../skills/implement-issue/SKILL.md) | One sub-brief per unit when A delegates to workers.                                                                                                                  |
| `implementation/check-<name>-<ms>-<pid>.log` | [run-check.ts](../../src/run-check.ts)                   | Output kept by `akrogon run-check`. Its last line names it as `check <name>: <exit> <path>`.                                                                         |
| `implementation/capture-<name>-<run>-out.log` and `-err.log` | [run-check.ts](../../src/run-check.ts) | The command's live stdout and stderr, one file each, written before it starts. They fold into the check log on exit and are removed; a killed run leaves them, read through `akrogon log`, and the abandoned pair blocks the leaf's non-failed phase moves until `cleared-<run>.md` releases it. |
| `implementation/cleared-<run>.md`                | The seat or operator after cleanup             | A note written beside an abandoned capture pair saying what was found, cleaned and read. A non-blank file releases the phase-move refusal that pair causes. |
| `<owner>/.lock`                                  | [run-check.ts](../../src/run-check.ts), [pack.ts](../../src/pack.ts) | The owner folder's capture lock, shared by every live capture's writers and publication and taken by `akrogon pack` and owner completion so they wait for captures to finish. Never committed, never packed. |
| `review-A.md`, `review-B.md`                 | [check-issue](../../skills/check-issue/SKILL.md)         | Each seat's findings and verdict. At merge, B also records rebase, verify and failure results in `review-B.md` per [merge-issue](../../skills/merge-issue/SKILL.md). |

## Repo records

Each record file is one JSON object per line. `akrogon sync` commits them with the other issue records.

| File                   | Written by                           | One line per                                                                                                                                                         |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log.jsonl`            | [log.ts](../../src/log.ts)           | Lifecycle move of a leaf.                                                                                                                                            |
| `timings.jsonl`        | [timing.ts](../../src/timing.ts)     | Timing event: `visit_start`, `prompt`, `seat_done`, `seat_lost`, `check_start`, `check_end`, `check_refused`, `batch`, `wait`, `repo_pause`. Reading skips a bad or unknown-kind line with a warning instead of failing the file, so the rows a reader understands always survive foreign lines.                                                       |
| `timings-kill.jsonl`   | [timing.ts](../../src/timing.ts)     | Tool kill event: `tool_kill` (one per enumerated seat scope of a committed move, with `unit` the scope unit, `seen` the count of `t-` dirs, `populated` and `deferred` the `t-` names that read populated and that deferred to a helper, and `errors` the failure count) and `tool_kill_deferred` (one per helper exit, with `unit` the scope unit, `t` the `t-` name, `outcome` `written`/`killed-already`/`error` and `error` the failure text when present). Kept out of `timings.jsonl` so an older akrogon's strict schema can never fail the shared ledger on these kinds. |
| `merge-attempts.jsonl` | [attempts.ts](../../src/attempts.ts) | Ended merge attempt, with holder, base, tested head and outcome.                                                                                                     |
| `verify-runs.jsonl`    | [verify.ts](../../src/verify.ts)     | `akrogon verify` run: tree, each command's exit and log path (`reused` names the source run), `rerun`, `failures`, `patch_base` and `patch_id`, start and end, and `slow` when a merge run's wall-time comparison ran. On an entry whose red first run was rerun, `rerun` holds the first run's `exit`, `log` and `failures`, while the entry's own `exit` and `log` are the rerun's and its `failures` are the first-run names the rerun failed again, or all of them when it named none. On an entry whose own command ran red, `failures` holds the deduplicated failure names of its captured output, the same bytes as its log, never on a green, `blocked`, reused or setup-failed entry and never `(log gone)`; `akrogon flaky`, the main-red unit matcher and the merge-scope main-red cover and the linked-base known-red receipt read `failures` before the log, and the known-red receipt reads a log only for a legacy entry without the field, refusing such a head entry whose log is gone; a ledger holding the field does not parse under an akrogon older than this change. On the run, `patch_base` and `patch_id` record the merge base of the verified commit and an identifier for its own changes. A completed merge run inherits the leaf's previous merge run's identifier when replaying the change in both directions reproduces both recorded trees. Runs with no merge base or an empty diff omit both fields. An older akrogon cannot parse a ledger holding them. An entry whose own command ran red can carry `timeouts` in any scope. It lists the names in that leg's `failures` whose stream prints `  ^ this test timed out after <n>ms.` as the next line after its `(fail)` line. On merge-scope entries, including base comparisons (`compares`), `durations` holds the 20 slowest Bun-timed tests of that leg's own output plus every failure name with a timed line. Each name appears once as `{name, ms}` with its largest time rounded to an integer. Entries with no timed lines and leaf-scope, `blocked`, reused and setup-failed entries omit `durations`. For an entry with a rerun, each leg's facts sit beside its own log. The first run's facts are inside `rerun` and the rerun's are at top level. The run's `attempt` identifies the land attempt that launched the pass and is copied from the pass record's caller when present. Older akrogon releases reject ledgers containing any of these three fields. |

## Timing report

`akrogon timing <slug>` reads `timings.jsonl` and `log.jsonl` and prints one block per phase visit of that leaf. Use it to see where a leaf's time went.

Each closed visit shows its total time, then splits it into:

- `wait <reason>`: time spent waiting on `repo_pause`, `parked`, `prerequisite`, `merge_turn` or `capacity`.
- `prompted`: time from the first delivered prompt to the phase exit, with each check run listed inside it.
- `wait none`: time no record explains.
- `incomplete <name>`: a record the visit should have but does not, such as a check with no end.

An open visit prints `open`. Two more forms read the same records:

- `akrogon timing --cohort --since <iso>` checks a group of leaves against fixed speed bounds and prints `pass`, `fail` or `insufficient` with one line per leaf. The bounds live in [timing-report.ts](../../src/timing-report.ts).
- `akrogon timing --flow --since <YYYY-MM-DD>` also reads GitHub issues. It prints how long each issue waited before a leaf picked it up and when it merged, plus the open issues no leaf carries.

All three are read-only. Code: [timing-report.ts](../../src/timing-report.ts), [akrogon.ts](../../src/akrogon.ts).

## Flaky report

`akrogon flaky` reads `verify-runs.jsonl`. It finds a verify command that went red and then green, either on the same tree or on merge-scope runs (`scope: 'merge'`, never a `compares` base run) across different trees when a red merge run's recorded `patch_id` matches that leaf's next merge run's and no completed run that failed the same named unit ended between while a `compares` base run or a run whose sha is an ancestor of the tracked default branch. For each name the red entry records, it prints one line: count, last time, check name and that name. Names come from stored `failures` first, and from the log's Bun lines otherwise: a `(fail)` title, `(unnamed) <script>` for a `(fail) (unnamed)` line on a script's stream, `(script) <script>` from a failed script's `Exited with code` line with wrappers dropped, `(no test name)` or `(log gone)`. The `(script)`, `(unnamed)`, `(no test name)` and `(log gone)` names count only same-tree.

An entry with `rerun` also counts one flip for each name in `rerun.failures` that its final `failures` lacks (each of them when its exit is 0).

It skips runs that never finished, runs whose setup failed and entries marked `reused`. A reused entry adds no observation. A same-tree flip records an inconsistent result on the same tree. A cross-tree flip records one with matching leaf patch IDs. It does not say whether the test, the code or an outside input caused it. Treat each line as a lead to chart, not a verdict. Code: [flaky.ts](../../src/flaky.ts).

## Worktree store

Leaf code lives outside the checkout. The default store is `~/.akrogon/worktrees/<repo>`, with one folder per leaf. `akrogon config` prints the resolved path as `worktree_store`.

The repo key `worktree_root` in `issues/config.yaml` moves the store. It must point outside the checkout, or Akrogon refuses with an error. See [config.ts](../../src/config.ts) `worktreeStore`.

## Writing issues by hand

When work is already settled, you can skip charting and write the leaf files yourself under `issues/open/` in your registered checkout. A leaf sits two or three folders deep:

```text
issues/open/<issue>/<slug>/
issues/open/<epic>/<issue>/<slug>/
```

Put these starter files in place:

```text
issues/open/<issue>/
  ISSUE.md
  <slug>/
    brief.md
    design.md
    state.yaml
```

- `ISSUE.md` states the issue's overall goal. An epic folder holds `EPIC.md` for the epic's goal.
- `brief.md` is the leaf contract: owned files, limits, and concrete done-criteria.
- `design.md` holds decisions the seats need. Leave it out if you have none.
- `state.yaml` holds the leaf's lifecycle state.

Seats read `brief.md` and `design.md` at every phase (see [plan-issue](../../skills/plan-issue/SKILL.md)). Start `state.yaml` with only the fields a person sets:

```yaml
slug: <slug>
phase: plan.synthesis
created: <date>
repo: <repo>
blocked-by: []
sources: []
```

- `slug` must match the leaf folder name, using lowercase letters and digits joined by `-`. Each slug must be unique in the repository; duplicate slugs are reported unreadable ([state.ts](../../src/state.ts)).
- `repo` is the repository's key from `repos` in your machine `config.yaml`. A leaf with another key is reported and skipped.
- A leaf starts at `plan.synthesis`, where seat A writes `plan.md`.
- Optional `sources` lists GitHub reports this leaf delivers as `owner/repo#n`, closed when the leaf's issue or epic completes.
- Leave every other field to Akrogon commands (see [state-and-phases.md](state-and-phases.md)).

A new folder does not start on its own; run `akrogon next <slug>` to dispatch it.

### Ordering leaves with `blocked-by`

Add another leaf's slug to `blocked-by` when this leaf needs that leaf's merged code:

- Entries are leaf slugs, not issue folder names.
- The leaf starts only when every listed leaf is `merged`. Until then `akrogon next` prints `waiting: <slug> on <other-slug> (<phase>)` ([next.ts](../../src/next.ts)).
- A listed leaf that is `failed`, `parked`, `missing`, or `unreadable` keeps the leaf from starting ([turn.ts](../../src/turn.ts) `unmergedDeps`).
- When a leaf merges, Akrogon starts leaves in the same repository that list it.
- Akrogon does not check for cycles. Two leaves that list each other never start.
- `blocked-by` is not a priority list. Leave it empty when leaves do not depend on each other so they can run in any order.

`akrogon status` shows each leaf's `blocked-by` list on the board. See [commands.md](commands.md).

## Saving records with akrogon sync

Akrogon keeps leaf code and lifecycle records apart. A leaf branch carries code only, while plans, reviews, state, and logs under `issues/` live on the default branch in the registered checkout. A phase move refuses any leaf branch that changes files under `issues/`, failing with `Issue files on leaf branch belong in <leaf folder>` ([phase.ts](../../src/phase.ts) `requireNoIssueFiles`).

To save records from the registered checkout on its default branch, run `akrogon sync`. It runs these steps in order ([sync.ts](../../src/sync.ts)):

1. Checks that HEAD is on the configured `default_branch`. Any other branch or a detached HEAD stops it with `Cannot sync from <branch>; required branch: <default_branch>`.
2. Checks staged files. If anything staged is outside eligible issue records, it stops and lists those paths with `Cannot sync with staged paths outside eligible issue records`.
3. Checks that active coordination lock paths inside the repo are not tracked in git.
4. Fetches the configured remote's default branch, and verifies that no active coordination lock paths arrive or replay and no git-ignored local paths collide with incoming or replayed files.
5. Stages every changed, deleted, or new eligible record under `issues/` and commits with the message `sync issues`. Nothing staged means no commit.
6. Rebases onto the fetched tip with `--autostash`, setting aside your other unstaged edits and putting them back. If restoring those edits conflicts, sync stops before pushing and lists the conflicting paths.
7. Pushes to the configured remote's default branch.

### Eligible and skipped files

An eligible record is a file under `issues/` that is not (`eligibleRecord` in [sync.ts](../../src/sync.ts)):

- in `issues/seeds/`, which `akrogon pull` rewrites
- a `.lock` or `.closing` file
- a `*.tar.zst.tmp` file left by an in-progress pack
- inside the worktree store, when that store sits inside the checkout

Files outside `issues/` are never eligible records. That includes `learnings/LESSONS.md` and `learnings/history/`, which skills leave for you to commit yourself.

### Sync refusals

Fix the reported condition and run `akrogon sync` again:

- **Wrong branch:** switch the registered checkout to its configured `default_branch`.
- **Staged files outside records:** run `git diff --cached --name-only`, then commit them yourself or unstage them with `git restore --staged <path>`.
- **Ignored files in the way (`Cannot sync over ignored operator paths`):** a git-ignored local file would collide with the fetched tip or replayed commits; move or remove it.
- **Lock paths tracked, incoming, or replayed:** an active coordination lock path is tracked in git, arrives from the remote, or is touched by a local commit; remove the listed paths from git, then sync.
- **Autostash restoration conflicts:** resolve the listed unmerged paths, then run `akrogon sync` again.
