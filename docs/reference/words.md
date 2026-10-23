# Words

One line per term. Each term links to the page that explains it.

- **[Autopilot](../use/autopilot.md)**: a chart door mode where seat A answers its own forks for a fixed list of work, then hands off. It starts no execution.
- **[Chart](../use/plan-work.md#open-a-chart)**: a folder under `issues/chart/` where the door and you settle a request, one fork per open question.
- **[Chart door](../use/plan-work.md#open-a-chart)**: the agent pane where you run `/chart-issues`. It is called A, asks you one fork per round and writes the leaves.
- **[Check](checks.md)**: a named command under `checks` in `issues/config.yaml`, such as `test: npm test`. A red check stops a leaf from moving to review and from landing.
- **[Consultant](../use/plan-work.md#open-a-chart)**: a helper pane (B, C, D and so on) that gives the chart door an independent view while it charts. It is not seat A or seat B.
- **[Contract](../start/why-it-works.md#a-contract-comes-before-code)**: a leaf's `brief.md` and `design.md`. They say what to build, why, how to tell it is done, and the settled decisions the build must follow.
- **[Direct route](../use/quick-fix.md)**: the chart door builds one small, settled change itself, B reviews it, and the door lands it. It skips the leaf handoff and `akrogon next`.
- **[Epic](files.md#issue-and-epic-files)**: a folder under `issues/open/` that groups issues. It holds `EPIC.md`.
- **[Failed](../use/when-work-fails.md)**: the phase a leaf stops in when a seat records a reason it cannot go on. The plan, reviews and code stay, and you send the leaf back to an active phase.
- **[Fork](../use/plan-work.md#answer-one-fork-per-round)**: one open question in a chart, sharp enough to answer. It records your answer and the reason.
- **[Grounding](../start/set-up-a-project.md#grounding)**: the index file named by `grounding.index` and the `AREA.md` files it links, which give agents a short route into your code.
- **[Harness](config.md#machine-configyaml)**: an agent CLI and the command that starts it, listed under `harnesses` in the machine `config.yaml`.
- **[Issue](files.md#issue-and-epic-files)**: a folder under `issues/open/` that holds `ISSUE.md` and one or more leaves.
- **[Landing](../use/merge-and-announce.md)**: putting a tested commit on your default branch. `akrogon land` checks the commit, pushes it and moves the leaf to `merged`.
- **[Leaf](files.md#leaf-folder-records)**: one piece of work small enough to plan, build and review as a unit. Its folder name is the slug commands use.
- **[Lesson](../use/learn-from-work.md#what-a-lesson-is)**: one line in `learnings/LESSONS.md` plus a history file, written when a finding matters beyond its leaf.
- **[Merged](state-and-phases.md#phases)**: the last phase of a leaf whose commit is on the default branch. A merged leaf never moves again.
- **[Park](../use/park-pause-stop.md#park-an-issue)**: move a whole issue to `issues/parked/` so passes do not pick it up. `akrogon unpark` brings it back.
- **[Pause](../use/park-pause-stop.md#pause-a-repository)**: stop automatic passes for one repository. Commands you type still run. `akrogon unpause` turns them back on.
- **[Phase](state-and-phases.md)**: the step a leaf is in, such as `implement` or `check.review`, written in its `state.yaml`. Only Akrogon commands change it.
- **[Release](releases-and-updates.md)**: a built copy of Akrogon under `~/.akrogon/releases/<commit>`. The `akrogon` command runs from the release that `current` points at.
- **[Seat A and seat B](../start/why-it-works.md#build-and-review-are-separate-seats)**: the two agent roles that work a leaf. A plans and builds, both review, and B repairs most findings and takes over landing when it needs a seat.
- **[Seed](../use/report-an-observation.md#bring-reports-into-your-checkout)**: an imported GitHub issue in `issues/seeds/`, written by `akrogon pull`. It is unverified and not ready to run.
- **[Slot](config.md)**: the name the settings and commands use for a seat, as in the `slots` key and `akrogon phase --slot A`.
- **[Stop](../use/park-pause-stop.md#stop-a-leaf)**: mark a leaf stopped and end every process its seats started. `akrogon start` clears the mark.
- **[Sync](../use/save-records.md)**: `akrogon sync` commits the records under `issues/`, rebases and pushes them on the default branch.
- **[Verify](checks.md#prove-a-commit-with-akrogon-verify)**: `akrogon verify` runs every check on a fresh checkout of a commit and writes a receipt. Moves into review and landing need a green one.
- **[Worktree](../start/what-it-is.md#the-words)**: a separate checkout where a leaf's code changes happen, so your own checkout stays untouched.
- **[Worktree store](files.md#worktree-store)**: the folder outside your checkout that holds one worktree per leaf, by default `~/.akrogon/worktrees/<repo>`.
