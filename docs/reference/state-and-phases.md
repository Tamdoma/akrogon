# State and phases

Each leaf has a `state.yaml` file in its folder. It says which phase the leaf is in and holds the records the commands keep while seats work. This page lists every phase, who moves it, and every field in the file. The exact shapes live in [src/state.ts](../../src/state.ts) and [src/routing.ts](../../src/routing.ts).

The commands write `state.yaml` read-only, so an agent's edit tool fails on it and the agent has to use the command. To edit it by hand on purpose, run `chmod u+w <path>` first.

A leaf starts at `plan.synthesis` and moves through `implement`, `check.review` and `merge` to `merged`. A `fix` verdict loops through `check.repair` and `check.fix` back to `check.review`, and any active phase can stop in `failed`.

## Phases

| Phase          | Skill                                                       | Seats that work                              | Who moves it on                                                                  | Allowed next                   |
| -------------- | ----------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| plan.synthesis | [plan-issue](../../skills/plan-issue/SKILL.md)              | A                                            | A                                                                                | implement, failed              |
| implement      | [implement-issue](../../skills/implement-issue/SKILL.md)    | A                                            | A                                                                                | check.review, failed           |
| check.review   | [check-issue](../../skills/check-issue/SKILL.md)            | A and B, only B once `fix_rounds` is above 0 | the required seats, each with a verdict (`ready`, `nits` or `fix`)               | merge, check.repair, failed    |
| check.repair   | [check-issue](../../skills/check-issue/SKILL.md)            | B                                            | B                                                                                | merge, check.fix, failed       |
| check.fix      | [implement-issue](../../skills/implement-issue/SKILL.md)    | A                                            | A                                                                                | check.review, failed           |
| merge          | none (see [merge-issue](../../skills/merge-issue/SKILL.md)) | none                                         | the command's merge turn and land run, or the operator's slot-less `merged` call | merged, check.repair, failed   |
| merged         | none                                                        | none                                         | terminal                                                                         | none                           |
| failed         | none                                                        | none                                         | the operator, with no `--slot`                                                   | any active phase except merged |

Every leaf starts at plan.synthesis.

## How a phase moves

A seat reports its work with one call:

```sh
akrogon phase <slug> <next-phase> --slot <A|B> [--verdict <ready|nits|fix>] [--reason <text>] [--check] [--attempt <id>]
```

- In a phase with two seats, the first call only records that seat as done. The leaf moves when the last required seat calls. In a one-seat phase `--slot` may be left out.
- check.review needs `--verdict`, and every other phase refuses it. When all required seats are done, any `fix` verdict sends the leaf to check.repair. Otherwise it goes to merge.
- `--check` runs the same gates and moves nothing. It prints `ok` when the move would pass. A merge leaf refuses it, as the merge rule below states.
- The gates refuse a move when the worktree has uncommitted work, the branch changes files under `issues/`, or a changed test file has no `Test-Change:` trailer. A move out of any phase but `failed` or `merge` is also refused while the worktree store holds a registered worker worktree `<slug>-u<N>`, naming each path to remove with `git worktree remove`, so a land's move to `merged` never meets it. The move into check.review also needs a non-empty branch and a green `akrogon verify` receipt for HEAD. The move from check.repair to merge needs the same receipt, skipped only for a leaf returning unedited from a red merge exit as `merge_exit` below states.
- A merge leaf holds no seat: a `phase` call on it carrying `--slot` or `--attempt` is refused, and `merged --check` is refused as the seat protocol. `check.fix` is refused there at all; a leaf-caused red takes check.fix from check.repair. A slot-less `merged` call on the leaf holding the turn lands an applied batch; on a non-holder it is refused naming the holder. See [merge-issue](../../skills/merge-issue/SKILL.md).
- Every completed move clears the pass records: `done`, `verdict`, `prompted`, `prompted_at`, `delivery_error`, `attempts` and `lost`.

Any seat can stop the leaf:

```sh
akrogon phase <slug> failed --slot <A|B> --reason "<what blocks the work>"
```

`--reason` is only allowed with failed, and failed needs it. The command records the reason in `failure`, shows a desktop notice and renames the leaf's tab, when it has one, to `<slug> failed`.

A call with `--slot` cannot move a failed leaf. After the blocker is fixed, the operator recovers it with no `--slot`, picking the active phase that fits the remaining work:

```sh
akrogon phase <slug> implement
akrogon next <slug>
```

Recovery keeps `fix_rounds`, so a review after a repair round stays B only. A merged leaf never moves again.

## State fields

### Fields a person sets

The chart door ([chart-issues](../../skills/chart-issues/SKILL.md)) writes these when it creates a leaf. You write them yourself when you create a leaf by hand.

```yaml
slug: export-csv
phase: plan.synthesis
created: <date>
repo: widgets
blocked-by: []
sources: []
```

| Field        | Meaning                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `slug`       | The leaf's name. It must match the leaf folder name. Lowercase words joined by `-`.                                                              |
| `phase`      | The current phase. You set the start phase. After that only akrogon commands change it: `akrogon phase` and the command's own land run at merge. |
| `created`    | The creation date.                                                                                                                               |
| `repo`       | The registered repo key. A leaf whose key does not match the repo it sits in is reported and skipped.                                            |
| `blocked-by` | Slugs of leaves that must be merged before this leaf gets work.                                                                                  |
| `sources`    | GitHub reports this leaf delivers, as `owner/repo#n`. The command closes them when the leaf's issue or epic completes.                           |

### Fields the command owns

Leave these to the commands. Editing them by hand makes the file disagree with the running seats. "Per seat" means the value holds an `A` and a `B` entry.

| Field              | Meaning                                                                                                                                                                                            | Written by                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `busy_since`       | Per seat, when the seat was first seen busy. Cleared when the seat goes idle.                                                                                                                      | `akrogon next`                                       |
| `busy_notified`    | Per seat, `pending` once the busy-over-an-hour notice file is written, `shown` once it is gone (old timestamps read as shown). The seat going idle or a move to failed or merged removes the file. | `akrogon next`                                       |
| `blocked_notified` | Per seat, `pending` once the blocked-seat notice file is written, `shown` once it is gone. The seat leaving blocked, that seat's replacement or any phase move removes the file.                   | `akrogon next`, `akrogon phase`                      |
| `attempts`         | Per seat, how many prompted turns in a row ended without a report. Counted only at a seen silent turn end; starts and deliveries cost none. Reset on every move.                                   | `akrogon next`, `akrogon phase`                      |
| `lost`             | Per seat, how many recorded seats were replaced because their terminal finished or vanished before ending a turn. Reset on a seen turn end and on every move.                                      | `akrogon next`, `akrogon phase`                      |
| `done`             | Seats that finished the current phase.                                                                                                                                                             | `akrogon phase`                                      |
| `fix_rounds`       | How many times the leaf went to check.fix from check.repair or merge. Kept across recovery.                                                                                                        | `akrogon phase`                                      |
| `verdict`          | Per seat, the review verdict in check.review.                                                                                                                                                      | `akrogon phase`                                      |
| `tab`              | The herdr-app tab that holds the leaf's seat terminals. Each seat carries its id in the `herdr.tab` label.                                                                                         | `akrogon next`                                       |
| `worktree`         | Path of the leaf's git worktree. Removed when the worktree is cleaned up after merge or is gone from disk.                                                                                         | `akrogon next`                                       |
| `env_names`        | Names of the env values written into the worktree's `.env`.                                                                                                                                        | `akrogon next`                                       |
| `env_generation`   | How many times the `.env` of an existing worktree was rewritten.                                                                                                                                   | `akrogon next`                                       |
| `seat`             | Per seat, the hc session and terminal address the seat runs in. A `pane` field is pre-hc state: dispatch refuses it with `state predates hc` unless the leaf is merged, done or closed.            | `akrogon next`                                       |
| `prompted`         | Per seat, the hc terminal address and the turn the current phase prompt went in at.                                                                                                                | `akrogon next`                                       |
| `prompted_at`      | Per seat, when that prompt was delivered.                                                                                                                                                          | `akrogon next`                                       |
| `delivery_error`   | Per seat, the last failed prompt delivery. See below.                                                                                                                                              | `akrogon next`                                       |
| `failure`          | Why the leaf stopped in failed. See below. Cleared when the leaf leaves failed.                                                                                                                    | `akrogon phase`                                      |
| `merge_stamp`      | When the leaf entered merge. Orders leaves waiting for the merge turn. The first return to merge keeps it; a second mints a new one.                                                               | `akrogon phase`                                      |
| `merge_exit`       | Why a command-run merge moved the leaf to check.repair. See below. Written on that move and cleared on any other.                                                                                  | merge turn, land run                                 |
| `batch`            | The record of the current merge attempt. See below.                                                                                                                                                | `akrogon next` merge turn, land run, `akrogon phase` |
| `broadcast`        | The completion update waiting for a broadcast seat after a command-run merge. See below.                                                                                                           | land run, `akrogon next`                             |
| `frozen`           | Every path the branch changed at the plan.synthesis to implement move, with its git blob id. Later changes to them need a `Test-Change:` trailer.                                                  | `akrogon phase`                                      |
| `frozen_cited`     | `Test-Change:` trailers already on empty commits at that move, so they do not count for later changes.                                                                                             | `akrogon phase`                                      |

### Nested records

Exact shapes are in [src/state.ts](../../src/state.ts).

`failure` (`failureSchema`) is written when a seat or the operator moves the leaf to failed:

- `cause` is `blocked`.
- `phase` and `slot` name where the leaf stopped and which seat stopped it.
- `reason` is the `--reason` text.
- `delivery` is `pending` while the failed notice file waits, `shown` once it is gone, or `error` when the write failed. A value written before hc seats stays as written. A pending file is removed when the leaf leaves `failed`.

`delivery_error` (`deliveryErrorSchema`) is one entry per seat, written when a prompt cannot be delivered and cleared when one is:

- `code` is `not_confirmed` when a new seat's first task was not seen to start, or `not_started` when an `hc send` to a running seat started no turn.
- `address` and `turn` are the hc terminal it targeted and its turn at that send. A later pass that sees the turn move counts the prompt as delivered.
- `screen` and `status`, when present, are the seat's screen text and hc status at the failure.
- `at` is when it failed.
- An entry written before hc seats keeps its old shape (`command`, `code`, `message`, `pane`, `session`, `offset`) and still parses.

`merge_exit` (`mergeExitSchema`) is written when the merge turn or land run moves the leaf to check.repair and is cleared on any other move, so it survives only inside check.repair:

- `reason` is `red`, `gate`, `conflict` or `dirty`: the verify run went red, a land gate refused, the rebase or restack conflicted, or the worktree was dirty.
- `top` is the candidate head the exit rejected, present on `red`, `gate` and a land-side `conflict` or `dirty`.
- `run` is the red merge-scope verify run, on `red`.
- `refusal` is the gate's refusal text, on `gate`.
- `base` is the remote base the leaf rebased onto, on `conflict` and `dirty`.
- `base_verdict` is the run land used to prove the base, present on `red` when the base pass ran. Its green verdict means the head red is the leaf's own.

The repair seat's prompt carries `merge-exit=<reason>` plus each present field. A `check.repair → merge` move skips the leaf green-receipt requirement exactly when `reason` is `red` and `top` still equals the worktree HEAD.

`batch` (`batchSchema`) belongs to the leaf holding the merge turn. The merge turn creates it, and the reconcile step in `akrogon next` removes it once the push is settled. A record with no `candidate` is dropped when the leaf leaves `failed`, so the merge turn rebuilds on the current base:

- `attempt` is the id the land unit `akrogon-land-<id>` and `akrogon verify --attempt <id>` run under.
- `started` and `pressure_start` are the start time and a CPU, memory and IO pressure reading.
- `built_on` is the remote base the holder is rebased onto. `holder` is the branch's merge-base and head before the rebase.
- `tools` lists the configured tools with their path and version.
- `applied` is true once the rebase step ran. `top` is the rebased top the command applied.
- `tested_top` and `tested_main` are the head the land gates passed and the remote base under it.
- `candidate` is the head sent to the push.
- `recorded` is true once the attempt's outcome is in the attempts log. `notified` is `pending` while the notice that a failed holder's push landed waits as a file and `shown` once it is gone, absent before it is written or when the write failed. It is dropped, and a pending file removed, when the leaf leaves `failed`.

`broadcast` (`broadcastSchema`) is written when the command's own merge completes an issue or epic:

- `kind` is `issue` or `epic`, and `name` is its folder name.
- `destination` is its new folder under `issues/closed/`.
- `pushed` is the pushed commit.
- `sources` are the GitHub reports it delivered.

`akrogon next` then prompts seat B with [broadcast-issue](../../skills/broadcast-issue/SKILL.md). A set `prompted.B` marks that prompt as sent.
