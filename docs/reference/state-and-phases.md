# State and phases

Each leaf has a `state.yaml` file in its folder. It says which phase the leaf is in and holds the records the commands keep while seats work. This page lists every phase, who moves it, and every field in the file. The exact shapes live in [src/state.ts](../../src/state.ts) and [src/routing.ts](../../src/routing.ts).

![Leaf phases from plan.positions through merged. With rebuttal on, plan.positions goes to plan.rebuttal, with rebuttal off it goes straight to plan.synthesis, where a leaf without debate starts. A fix verdict in check.review loops through check.repair and check.fix back to check.review. Any boxed phase can stop in failed.](../pictures/phases.svg)

## Phases

| Phase          | Skill                                                    | Seats that work                                                                  | Who moves it on                                                                                                                            | Allowed next                          |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| plan.positions | [plan-issue](../../skills/plan-issue/SKILL.md)           | A and B                                                                          | each seat with `--slot`, the leaf moves after both are done                                                                                | plan.rebuttal, plan.synthesis, failed |
| plan.rebuttal  | [plan-issue](../../skills/plan-issue/SKILL.md)           | A and B                                                                          | each seat, the leaf moves after both are done                                                                                              | plan.synthesis, failed                |
| plan.synthesis | [plan-issue](../../skills/plan-issue/SKILL.md)           | A                                                                                | A                                                                                                                                          | implement, failed                     |
| implement      | [implement-issue](../../skills/implement-issue/SKILL.md) | A                                                                                | A                                                                                                                                          | check.review, failed                  |
| check.review   | [check-issue](../../skills/check-issue/SKILL.md)         | A and B, only B once `fix_rounds` is above 0                                     | the required seats, each with a verdict (`ready`, `nits` or `fix`)                                                                         | merge, check.repair, failed           |
| check.repair   | [check-issue](../../skills/check-issue/SKILL.md)         | B                                                                                | B                                                                                                                                          | merge, check.fix, failed              |
| check.fix      | [implement-issue](../../skills/implement-issue/SKILL.md) | A                                                                                | A                                                                                                                                          | check.review, failed                  |
| merge          | [merge-issue](../../skills/merge-issue/SKILL.md)         | B, only when the command's land run hands the attempt over, or for a solo rebase | normally the command's land run moves it to merged with no seat, otherwise B's `merged` call (the command pushes) or B's move to check.fix | merged, check.fix, failed             |
| merged         | none                                                     | none                                                                             | terminal                                                                                                                                   | none                                  |
| failed         | none                                                     | none                                                                             | the operator, with no `--slot`                                                                                                             | any active phase except merged        |

Where a leaf starts:

- `debate: 'no'` starts the leaf at plan.synthesis. `debate: 'yes'` starts it at plan.positions.
- The repo setting `rebuttal` (on by default) picks the move out of plan.positions. On, the leaf must go to plan.rebuttal. Off, it must go to plan.synthesis.
- `akrogon next` refuses a debate leaf that sits in plan.synthesis without `positions-A.md` and `positions-B.md` in its folder.

## How a phase moves

A seat reports its work with one call:

```sh
akrogon phase <slug> <next-phase> --slot <A|B> [--verdict <ready|nits|fix>] [--reason <text>] [--check] [--attempt <id>]
```

- In a phase with two seats, the first call only records that seat as done. The leaf moves when the last required seat calls. In a one-seat phase `--slot` may be left out.
- check.review needs `--verdict`, and every other phase refuses it. When all required seats are done, any `fix` verdict sends the leaf to check.repair. Otherwise it goes to merge.
- `--check` runs the same gates and moves nothing. It prints `ok` when the move would pass.
- The gates refuse a move when the worktree has uncommitted work, the branch changes files under `issues/`, or a changed test file has no `Test-Change:` trailer. The move into check.review also needs a non-empty branch and a green `akrogon verify` receipt for HEAD. The move from check.repair to merge needs the same receipt.
- In merge, `merged` and `check.fix` calls need `--attempt` with the current batch attempt, and only the leaf holding the repo's merge turn may make them. See [merge-issue](../../skills/merge-issue/SKILL.md).
- Every completed move clears the pass records: `done`, `verdict`, `prompted`, `prompted_at`, `delivery_error` and `attempts`.

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
debate: 'no'
blocked-by: []
sources: []
```

| Field        | Meaning                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `slug`       | The leaf's name. It must match the leaf folder name. Lowercase words joined by `-`.                                                              |
| `phase`      | The current phase. You set the start phase. After that only akrogon commands change it: `akrogon phase` and the command's own land run at merge. |
| `created`    | The creation date.                                                                                                                               |
| `repo`       | The registered repo key. A leaf whose key does not match the repo it sits in is reported and skipped.                                            |
| `debate`     | `'yes'` or `'no'`. Says whether planning starts with both seats writing positions.                                                               |
| `blocked-by` | Slugs of leaves that must be merged before this leaf gets work.                                                                                  |
| `sources`    | GitHub reports this leaf delivers, as `owner/repo#n`. The command closes them when the leaf's issue or epic completes.                           |

### Fields the command owns

Leave these to the commands. Editing them by hand makes the file disagree with the running seats. "Per seat" means the value holds an `A` and a `B` entry.

| Field            | Meaning                                                                                                                                           | Written by                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `busy_since`     | Per seat, when the seat was first seen busy. Cleared when the seat goes idle.                                                                     | `akrogon next`                                       |
| `busy_notified`  | Per seat, when the command sent a notice that the seat has been busy for over an hour.                                                            | `akrogon next`                                       |
| `attempts`       | Per seat, how many prompt deliveries in a row failed. Reset on a delivered prompt and on every move.                                              | `akrogon next`, `akrogon phase`                      |
| `done`           | Seats that finished the current phase.                                                                                                            | `akrogon phase`                                      |
| `fix_rounds`     | How many times the leaf went to check.fix from check.repair or merge. Kept across recovery.                                                       | `akrogon phase`                                      |
| `verdict`        | Per seat, the review verdict in check.review.                                                                                                     | `akrogon phase`                                      |
| `tab`            | The herdr tab that holds the leaf's panes.                                                                                                        | `akrogon next`                                       |
| `worktree`       | Path of the leaf's git worktree. Removed when the worktree is cleaned up after merge or is gone from disk.                                        | `akrogon next`                                       |
| `env_names`      | Names of the env values written into the worktree's `.env`.                                                                                       | `akrogon next`                                       |
| `env_generation` | How many times the `.env` of an existing worktree was rewritten.                                                                                  | `akrogon next`                                       |
| `pane`           | Per seat, the herdr pane the seat works in.                                                                                                       | `akrogon next`                                       |
| `prompted`       | Per seat, the agent session that got the current phase prompt.                                                                                    | `akrogon next`                                       |
| `prompted_at`    | Per seat, when that prompt was delivered.                                                                                                         | `akrogon next`                                       |
| `delivery_error` | Per seat, the last failed prompt delivery. See below.                                                                                             | `akrogon next`                                       |
| `failure`        | Why the leaf stopped in failed. See below. Cleared when the leaf leaves failed.                                                                   | `akrogon phase`                                      |
| `merge_stamp`    | When the leaf entered merge. Orders leaves waiting for the merge turn.                                                                            | `akrogon phase`                                      |
| `batch`          | The record of the current merge attempt. See below.                                                                                               | `akrogon next` merge turn, land run, `akrogon phase` |
| `broadcast`      | The completion update waiting for a broadcast seat after a command-run merge. See below.                                                          | land run, `akrogon next`                             |
| `frozen`         | Every path the branch changed at the plan.synthesis to implement move, with its git blob id. Later changes to them need a `Test-Change:` trailer. | `akrogon phase`                                      |
| `frozen_cited`   | `Test-Change:` trailers already on empty commits at that move, so they do not count for later changes.                                            | `akrogon phase`                                      |

### Nested records

Exact shapes are in [src/state.ts](../../src/state.ts).

`failure` (`failureSchema`) is written when a seat or the operator moves the leaf to failed:

- `cause` is `blocked`.
- `phase` and `slot` name where the leaf stopped and which seat stopped it.
- `reason` is the `--reason` text.
- `delivery` is how the failed notice went, as herdr reported it, or `error`.

`delivery_error` (`deliveryErrorSchema`) is one entry per seat, written when a prompt cannot be delivered and cleared when one is:

- `command`, `code` and `message` are the herdr call and its error.
- `pane` and `session` are the pane and agent session it targeted.
- `at` is when it failed.
- `offset` is where the agent's session file ended before a timed-out paste. The next pass uses it to see whether the prompt arrived late.

`batch` (`batchSchema`) belongs to the leaf holding the merge turn. The merge turn creates it, and the reconcile step in `akrogon next` removes it once the push is settled:

- `attempt` is the id every `merged` and `check.fix` call must repeat with `--attempt`.
- `started` and `pressure_start` are the start time and a CPU, memory and IO pressure reading.
- `built_on` is the remote base the holder is rebased onto. `holder` is the branch's merge-base and head before the rebase.
- `tools` lists the configured tools with their path and version.
- `applied` is true once the rebase step ran. `top` is the rebased top when the command rebased the branch, and absent when B rebases by hand.
- `owner` is `command` while the land run owns the attempt and `seat` after it hands over. Absent means seat.
- `wake`, `red` and `refusal` say where the land run stopped: `red` with the red verify run, `gate` or `push` with the refusal text.
- `tested_top` and `tested_main` are the head the merge check passed and the remote base under it.
- `candidate` is the head sent to the push. `decision` is `rerun` after a refused push forced a new rebase.
- `recorded` is true once the attempt's outcome is in the attempts log. `notified` is true once the operator got the notice that a failed holder's push landed.

`broadcast` (`broadcastSchema`) is written when the command's own merge completes an issue or epic:

- `kind` is `issue` or `epic`, and `name` is its folder name.
- `destination` is its new folder under `issues/closed/`.
- `pushed` is the pushed commit.
- `sources` are the GitHub reports it delivered.

`akrogon next` then prompts seat B with [broadcast-issue](../../skills/broadcast-issue/SKILL.md). A set `prompted.B` marks that prompt as sent.
