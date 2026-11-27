# The lifecycle: how work runs

Once a Lifecycle chart hands off its task contracts under `issues/open/`, Akrogon runs the work in isolated branches and agent terminals without making you copy prompts between panes.

Continuing from [Hand-off](08-hand-off.md), `client-portal` now has `issues/open/weekly-client-report/` with two leaves: `csv-export` and `scheduled-email` (which lists `blocked-by: [csv-export]` and needs `POSTMARK_API_KEY` in `client-portal/.env`).

## Starting handed-off work from `t-client-portal`

Charting never starts builders or reviewers on its own. When you are ready to run the work, switch to your terminal tab (`t-client-portal`) inside the registered `client-portal` repository and run `akrogon next`:

```sh
akrogon next                        # start every ready leaf in client-portal
akrogon next csv-export             # start one leaf by slug
akrogon next weekly-client-report   # start every leaf of an issue or epic by name
akrogon next --all                  # inside a repo: this repo; outside a repo: every registered repo
```

You can also pass a folder path, such as `akrogon next issues/open/weekly-client-report/csv-export`. These forms cannot be combined (`--all`, `--resume`, `--wake`, and positional targets are mutually exclusive).

Two target lookup rules keep picks unambiguous:

- A target that exists as a folder from where you stand is always read as a path.
- A bare name must resolve to one set of leaves. If a name matches more than one target (for example, an issue and a leaf that share the same name and resolve to different leaf sets), nothing starts; Akrogon lists each match by kind and path so you can pass the folder path instead.

Outside a registered repository, plain `akrogon next` fails; use `akrogon next --all` to sweep every registered repository at once.

Each `akrogon next` call is a single pass. It checks every picked leaf, starts or prompts the seats needed for the leaf's current phase, runs the merge pass, cleans up finished worktrees, and exits. It does not stay running.

## Why a ready task may wait

When you run `akrogon next`, ready leaves start right away and any picked leaf that cannot start prints one line explaining why:

- **Waiting on `blocked-by` dependencies**: A leaf starts only when every slug in its `blocked-by` list is `merged`. While `csv-export` is still in progress, `scheduled-email` waits. A typed `akrogon next` prints a normal status line (on standard output) and does not exit with an error:

  ```text
  waiting: scheduled-email on csv-export (implement)
  ```

  If a dependency is `failed`, `parked`, `missing`, or `unreadable`, `akrogon next` reports `Leaf dependencies are not merged` on standard error (`stderr`) and exits 1.
- **Missing `readiness.yaml` inputs**: Every required `env` variable or local `file` in `readiness.yaml` must be present and non-empty where the file specifies (for example, `POSTMARK_API_KEY` in `client-portal/.env`). When an input is absent, `akrogon status` prints a `Missing:` line naming its kind, variable name, holder, and setup steps (never its value), and `akrogon next` refuses to start the leaf with `Leaf inputs are missing` (exit 1). Dependencies are reported before missing inputs.
- **Twin owner folder clash**: If `issues/open/weekly-client-report` shares a name with a folder under `issues/closed/` or `issues/parked/`, every leaf under it is skipped with an error until the clash is removed.
- **Capacity limit (`max_active`)**: `max_active` in `~/.akrogon/config.yaml` (default `3`) caps how many leaves can hold live seats at once across all registered repositories. Because each leaf has two seats, this counts leaves rather than agent processes. Leaves that already have a live seat keep moving, and leaves waiting in `merge` do not count toward the machine limit. A repository can also set a lower `max_active` in `issues/config.yaml` (printed as `repo_max_active` by `akrogon config`); for a leaf that has never started, the repo's leaves waiting in `merge` behind the landing leaf count toward the repo cap too. A new leaf starts only when both limits have room.
- **Paused repository**: `akrogon pause` stops automatic passes for that repository, while a typed `akrogon next` still runs in full.
- **Stopped or failed leaf**: Automatic passes skip stopped and failed leaves quietly. A typed `akrogon next <slug>` on a stopped leaf exits 1 and tells you to run `akrogon start <slug>`; on a failed leaf it exits 1 with `Leaf is failed and needs phase recovery`. See [When work stops](12-when-work-stops.md).

## Start order and capacity refill

Akrogon has no priority field. Within a sweep, it orders leaves by two rules:

1. **Merged leaves first**, so finishing an owner and waking dependent leaves happens before new work takes slots.
2. **Most unmerged dependents next** (transitive count across `blocked-by` chains), up to `max_active`. In `weekly-client-report`, `csv-export` unblocks `scheduled-email` (1 unmerged dependent), so it starts ahead of unrelated leaves with no dependents.

If a `next` pass refuses a leaf because `max_active` (machine or repo) is full, that leaf is recorded as waiting on `capacity`. On every automatic pass (`akrogon next --wake` or `akrogon next --resume`), after seated and merged leaves are checked, Akrogon refills free slots from capacity waiters **longest-waiting first** across all unpaused repositories. If the oldest waiter's own repository is still at its repo `max_active`, it stays waiting and the next waiter is tried. A leaf that was never refused for capacity is not started by refill.

## What starts agent sessions and keeps them moving

When `akrogon next` starts `csv-export` for the first time, it prepares the workspace and launches the leaf's seats automatically:

1. **Creates an isolated git worktree** at `~/.akrogon/worktrees/client-portal/csv-export` (the default `worktree_store`, overridable outside the checkout via `worktree_root` in `issues/config.yaml`) on branch `csv-export` branched from `<remote>/<default_branch>`. Sparse checkout excludes `issues/` so issue records stay only in the registered `client-portal` checkout.
2. **Writes declared `.env` keys**: Copies only the variable names listed under `env` in `issues/config.yaml` from `client-portal/.env` into the worktree's git-ignored `.env` (refusing if `.env` is tracked or not git-ignored).
3. **Runs `setup` if configured**: Executes `issues/config.yaml`'s `setup` command under `flock` (a file lock on the repository install lock so parallel worktrees do not collide), checks `akrogon guard own-modules`, and writes an `akrogon-setup` marker so setup runs once per checkout state.
4. **Opens the leaf tab and starts seats**: Allocates the leaf's herdr tab (`csv-export`) in the `client-portal` space and launches **slot A** (and later **slot B** when review begins) as hc terminals inside the leaf's own systemd user slice (`akrogon-l<hash>.slice`, an isolated Linux resource group), with `TMPDIR` pointing to the leaf's private temp folder and `AKROGON_BASE` set to the branch merge-base.

After you start work with `akrogon next`, you do not copy prompts between panes. The background systemd user service **`akrogon-listener.service`** (running `akrogon listen`) subscribes to hc events for every live session's labelled `akrogon=1` terminals:

- On startup, it runs `akrogon pull --all` and `akrogon next --resume` (which resumes leaves that already have a tab or worktree, refills capacity waiters, and skips paused repositories); on each session subscription or resubscription, it runs `akrogon next --resume` to catch up.
- Whenever a seat ends a turn, becomes `blocked`, finishes, or is lost, it triggers `akrogon next --wake` (the same automatic sweep without self-update).
- Each committed `akrogon phase` transition also wakes the leaf and its repository's merge pass.

Because progress lives in plain-text files under `issues/open/weekly-client-report/csv-export/` (`state.yaml`, `plan.md`, `implementation/report.md`, `review-A.md`, `review-B.md`) rather than in an agent's chat memory, a closed terminal or full context window never loses progress. The next pass reads the files and picks up where the leaf left off.

## Lifecycle phases at a glance

Every Lifecycle leaf moves through the same sequence of phases:

| Phase | Active seat(s) | Skill | Main artifact | Next phase(s) |
| --- | --- | --- | --- | --- |
| `plan.synthesis` | Slot A | `plan-issue` | `plan.md` + red-first tests | `implement`, `failed` |
| `implement` | Slot A | `implement-issue` | code + `implementation/report.md` | `check.review`, `failed` |
| `check.review` | Slot A and Slot B (Slot B only when `fix_rounds > 0`) | `check-issue` | `review-A.md`, `review-B.md` | `merge`, `check.repair`, `failed` |
| `check.repair` | Slot B | `check-issue` | repair commits + `review-B.md` | `merge`, `check.fix`, `failed` |
| `check.fix` | Slot A | `implement-issue` | repair commits + `implementation/report.md` | `check.review`, `failed` |
| `merge` | None (command-owned) | None (see [Merging](10-merging.md)) | land batch + push | `merged`, `check.repair`, `failed` |
| `merged` | None | None | closed owner when last leaf lands | Terminal |

Any active phase can also stop in `failed` when a seat hits a blocker only a person can resolve.

## Slot A (the builder)

**Slot A** is the fresh builder seat that plans `csv-export`, writes the code, proves every done-criterion, and handles any repair exceptions sent back from review. (Slot A is separate from the charting agent you talked to in `c-client-portal`.)

### Planning (`plan.synthesis`)

Akrogon starts slot A with [plan-issue](../../skills/plan-issue/SKILL.md). Working from `brief.md`, `design.md`, and the repository's grounding docs, slot A:

1. Writes `plan.md` in the leaf folder with numbered decisions (`D1..Dn`), read-first paths, needed interfaces, a unit and wave breakdown, and the exact verification command for every done-criterion.
2. Writes red-first criterion tests in the `csv-export` worktree for any done-criterion not already covered by existing tests or `checks`, runs each through `akrogon run-check` to confirm it fails before product code exists, records the failing output in `plan.md`, and commits those tests on branch `csv-export`.
3. Moves the leaf to `implement` with `akrogon phase csv-export implement --slot A`.

At the `plan.synthesis` to `implement` transition, Akrogon snapshots every file changed on the branch into `state.yaml`'s `frozen` map. After that point, editing an existing test file, altering a planned test file, or adding a new test file requires a `Test-Change: <path> <source and reason>` commit trailer, so tests cannot be quietly weakened during building.

### Building (`implement`)

Next, Akrogon prompts slot A with [implement-issue](../../skills/implement-issue/SKILL.md). Slot A refreshes branch `csv-export` onto `<remote>/<default_branch>`, then builds the plan in one of three execution modes:

- **Inline**: When `implement: inline` is set in `issues/config.yaml`, slot A implements every unit itself in wave order.
- **Serial-solo**: When `implement: subagents` (the default) is set, but every wave in `plan.md` holds only one unit, slot A implements the plan itself with no worker sub-briefs or worker worktrees.
- **Worker waves**: When `implement: subagents` is set and a wave holds multiple independent units (disjoint owned paths and no shared test resources), slot A writes an eight-section sub-brief per unit under `implementation/` and runs up to **3 workers** in parallel per wave, each in its own `<slug>-u<N>` worktree, landing and removing worker worktrees between waves.

After the last unit lands, slot A refreshes the branch again, reruns affected done-criterion proofs through `akrogon run-check`, and runs **`akrogon verify`** in the leaf worktree on the latest committed tip (`HEAD`). `akrogon verify` checks out that commit fresh, runs `setup` and every configured `checks` command, and writes the leaf green receipt that entering review requires. Seats never run `merge_checks` (those belong to the command's merge run).

Finally, slot A writes `implementation/report.md` (changed files, commands and pasted results, proof commits, base and HEAD commits, known limitations) and moves the leaf forward with `akrogon phase csv-export check.review --slot A`.

Slot A never stops to ask chat questions; if it hits a human-only blocker (such as a missing credential or a conflict with a locked design decision), it writes the blocker and exact operator action into its pass artifact and stops the leaf in `failed`.

## Slot B (the reviewer)

**Slot B** is the independent reviewer seat (fresh for each Lifecycle leaf, separate from any charting consultants). Because slot A wrote the code, slot A is never the sole judge of it.

### Blind initial review (`check.review`)

When `csv-export` enters `check.review` for the first time (`fix_rounds` is `0`), Akrogon dispatches [check-issue](../../skills/check-issue/SKILL.md) to **both slot A and slot B** simultaneously. Both seats review the full diff **blind**, without talking to each other or reading each other's current review file.

Each seat checks the diff against `brief.md`, `design.md`, `plan.md`, `implementation/report.md`, affected docs, and live contracts (slot B also checks every `Test-Change:` trailer). Each writes its findings to `review-A.md` or `review-B.md` and reports a verdict with `akrogon phase`:

- `ready`: no blocking defects.
- `nits`: only minor non-blocking notes (reusable Nits are recorded as lessons before moving on).
- `fix`: at least one concrete defect backed by a realistic source, a consequence today, and the criterion, check, or gap it breaks.

The first seat to report gets `recorded` and waits. Once both required seats have reported, Akrogon aggregates the verdicts: if **either** verdict is `fix`, the leaf moves to `check.repair`; if both are `ready` or `nits`, the leaf moves straight to `merge`.

### Repair (`check.repair`) and exceptions (`check.fix`)

In `check.repair`, **slot B** reads every Fix from both initial reviews (or its latest re-check entry) and **repairs most Fixes itself** directly in the `csv-export` worktree, making one commit per Fix (with a red-first reproduction test for proven bugs), rerunning affected proofs and `akrogon verify`, and recording its commits and evidence in `review-B.md`. If B repaired every Fix and no operator action is open, B moves the leaf straight to `merge` (`akrogon phase csv-export merge --slot B`).

Slot B hands a Fix back to slot A under a `Handed to A` heading in `review-B.md` only for named exceptions:

- A Fix that needs a locked `brief.md` or `design.md` decision changed, or a new or widened live action.
- A recorded model choice that needs to be redone with the named harm as evidence.
- A Fix that requires changing both product code and the proof that accepts it (so slot B never grades its own code repair using a test slot B itself wrote or changed).

When any `Handed to A` item remains, slot B moves the leaf to `check.fix`, which increments `fix_rounds`. In `check.fix`, slot A repairs only the `Handed to A` list (using delegated worker waves when `implement: subagents` is configured), refreshes, verifies, appends to `implementation/report.md`, and moves back to `check.review`.

On every re-check after a repair round (**`fix_rounds > 0`**), **only slot B** runs `check.review`, inspecting only the repair diff since the prior reviewed head. Once slot B reports `ready` or `nits`, `csv-export` moves to `merge`.

## Watching progress from `t-client-portal`

Check the whole repository board at any time from `t-client-portal`:

```sh
akrogon status
```

This prints whether `akrogon-listener.service` is `live` or `down`, any `Failed:` or `Missing:` lines, any waiting `full` check run line, and a table showing every open and parked leaf's `PHASE`, elapsed `TIME`, `BLOCKED BY`, `NOTE` (active busy timers, verdicts, fix rounds, `land`, `broadcast pending`), and merge `TURN`. Outside a repository, `akrogon status` covers every registered repository.

To inspect one leaf in detail:

```sh
akrogon status csv-export
```

This prints `csv-export`'s full `state.yaml`, pause/stop/land/broadcast flags, any `Missing:` lines, the last 10 `History:` phase transitions, the path to `plan.md`, and which `harness`, `model`, and `effort` will start next for seats A and B (along with which config file supplied each seat).

Every `akrogon run-check` and `akrogon verify` run prints a saved log path. Print any recorded log from any directory with:

```sh
akrogon log <path>
```

For every state field, check rule, and command flag, see [State and phases](../reference/state-and-phases.md), [Checks](../reference/checks.md), [Settings](../reference/config.md), and [Commands](../reference/commands.md).

Previous: [Hand-off](08-hand-off.md) · Next: [Merging](10-merging.md)
