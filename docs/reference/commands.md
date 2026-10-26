# Commands

Every `akrogon` command, one line each. Run commands from the registered repository unless a row says otherwise. Angle brackets mark values you supply. Square brackets mark optional parts. `|` separates alternatives.

## Set up

| Invocation | Effect |
| --- | --- |
| `akrogon install` | Link the `akrogon` command, the skills, the Herdr integration and `akrogon.slice`, then reload the systemd user manager. Runs from any directory. |
| `akrogon init [--from <proposal.yaml>] [--toolkit <lang>=<runner>]` | Register the current repository and write its `issues/config.yaml`, `learnings/LESSONS.md` and ignore rules. The [init-akrogon](../../skills/init-akrogon/SKILL.md) skill writes the proposal for you. |
| `akrogon config` | Print the effective configuration for the current repository. |
| `akrogon preflight` | Check that the configured base branch exists on the remote and print its commit. |

## Run work

| Invocation | Effect |
| --- | --- |
| `akrogon next [<slug>\|<path>\|--all\|--resume]` | Start every leaf that is ready to move and clean up finished worktrees. With `--all` outside a repository, it covers every registered repository. |
| `akrogon phase <slug> <phase> --slot <A\|B> [--verdict <verdict>] [--reason <text>] [--check] [--attempt <id>]` | Record a seat's finished turn and move the leaf to its next phase, or mark it failed with a reason. With `--check`, it only runs the move's checks and prints `ok`. |
| `akrogon land <slug> --attempt <id>` | Verify one merge attempt, run the merge checks, push and move the leaf to `merged`. `akrogon next` starts it for you when a merge attempt is ready. A red check, a refused gate or push, or a needed rebase hands the attempt to seat B and the [merge-issue](../../skills/merge-issue/SKILL.md) skill. |
| `akrogon pull [--all]` | Copy open GitHub issues into `issues/seeds/`. With `--all`, it pulls every registered repository from any directory. |
| `akrogon close <owner/repo#n> --by <text>` | Close one GitHub issue with a "delivered by" note. |

## Control work

| Invocation | Effect |
| --- | --- |
| `akrogon pause` | Stop automatic dispatch for the current repository. |
| `akrogon unpause` | Turn automatic dispatch back on and run one pass. |
| `akrogon stop <slug> \| --all` | Mark a leaf stopped and end every process in its panes. With `--all`, it stops every leaf in the repository that has work in progress. |
| `akrogon start <slug>` | Clear a leaf's stopped mark and run `next` for that leaf. |
| `akrogon park <issue>... \| --all` | Move whole issues out of the open queue into `issues/parked/`. Running work is refused. |
| `akrogon unpark <issue>... \| --all` | Move parked issues back into the open queue. |

## Inspect

| Invocation | Effect |
| --- | --- |
| `akrogon status [<slug>\|--charts]` | Show the board, one leaf's state and history, or the charts. Outside a repository, the board covers every registered repository. While a `full` run waits, it also shows the run line table: each repo's holder first, then its waiters in queue order. |
| `akrogon leftovers` | List kept paths and units that need a person, grouped by reason. Outside a repository, it covers every registered repository. |
| `akrogon timing <slug> \| --cohort --since <iso> \| --flow --since <YYYY-MM-DD>` | Report time spent per leaf, the cohort since a moment, or issue flow since a date. |
| `akrogon flaky` | List checks and tests that went red then green on the same tree, newest first. |

## Checks and logs

| Invocation | Effect |
| --- | --- |
| `akrogon run-check [--name <n>] [--leaf <path>] [--holder <dir>] -- <argv>...` | Run one command under the check environment, save its output as a log and print a `check <name>: <exit> <path>` line. Refuses a configured `merge_checks` command: only the merge turn's `akrogon verify --attempt <id>` runs it. |
| `akrogon verify [--sha <rev>] [--attempt <id>] [--holder <dir>] [--known-red]` | Run the configured checks on a fresh checkout of a commit — `merge_checks` members all at once after the `checks` stage — reusing a command's green result on the same tree and recording a receipt in `issues/verify-runs.jsonl`. With `--known-red`, it also runs the base commit under the same reuse to show the same tests already fail there. |
| `akrogon log <path>` | Print a saved check or verify log, even after it was packed. Runs from any directory. |
| `akrogon stop-run [<run-id>]` | Stop a run started from your pane. With no id, it stops the only live run or lists them. A waiting `full` run is cancelled: it leaves the queue and exits non-zero without running its command, a suspended one when it resumes. |
| `akrogon guard <ancestors\|own-modules>` | Fail when a folder above the checkout holds `node_modules` or `package.json`, or when the checkout lacks its own `node_modules`. |

## Records and releases

| Invocation | Effect |
| --- | --- |
| `akrogon sync` | Commit changed issue records on the default branch, rebase and push. |
| `akrogon pack <folder>...` | Pack the `*.log` files of a closed issue or a chart's `direct/` folder into `evidence.tar.zst`. |
| `akrogon rollback` | Point the installed release back at the previous one and keep the rolled-away commit from redeploying. Runs from any directory. |
