# Words

One line per term. Each term links to the page that explains it.

## Guide words to shelf words

The numbered guide chapters use plain everyday names, while these reference shelf pages and Akrogon commands use the underlying record and CLI terms:

| Guide word | Shelf word |
| --- | --- |
| `task` | `leaf` |
| `slot A (the builder)` | `seat A` |
| `slot B (the reviewer)` | `seat B` |
| `charting agent` | `chart door` |
| `Direct` | `direct route` |
| `Lifecycle` | `lifecycle route` |
| `Charting mode` | `No autopilot` / `Semi-autopilot` / `Full autopilot` (`## Mode record`) |
| `Build route` | `Route: direct\|lifecycle` |
| `watcher` | `watch-issues` / timer terminal |

## Terms

- **[Build route](../guide/07-build-route.md)**: who builds settled work after charting: [Direct](../guide/07-build-route.md#direct) (offered only under No autopilot) or [Lifecycle](../guide/07-build-route.md#lifecycle). Recorded on the `Route:` line of `CHART.md`.
- **[Chart](../guide/04-a-charting-session.md#opening-a-session)**: a folder under `issues/chart/` where the charting agent (chart door) and you settle a request, one fork per open question.
- **[Charting mode](../guide/06-charting-mode.md)**: who answers questions while work is charted: under No autopilot you answer the signposts and every fork; under Semi-autopilot you answer the signposts once and the charting agent answers every fork; under Full autopilot the charting agent answers both. It charts and hands off only; it never starts building.
- **[Check](checks.md)**: a named command under `checks` in `issues/config.yaml`, such as `test: npm test`. A red check stops a leaf from moving to review and from landing.
- **[Consultant](../guide/04-a-charting-session.md#what-consultants-do-during-charting)**: a helper terminal (`B`, `C`, `D`, and so on) that gives the charting agent an independent view during charting; on the Direct route, consultant `B` also acts as slot B.
- **[Contract](../guide/08-hand-off.md)**: a leaf's `brief.md` and `design.md`. They state what to build, why, how to tell it is done, and the settled decisions the build must follow.
- **[Direct](../guide/07-build-route.md#direct)**: the build route (offered only under No autopilot) where the charting agent builds one small, settled change itself in a worktree as slot A, consultant `B` reviews it as slot B, and the merge queue lands it like any leaf.
- **[Epic](files.md#issue-and-epic-files)**: a folder under `issues/open/` that groups related issues. It holds `EPIC.md`.
- **[Failed](../guide/12-when-work-stops.md#failed-work)**: the phase a leaf stops in when a seat or command records a reason it cannot go on. The plan, reviews, and code stay, and you move the leaf back to an active phase once the blocker is fixed.
- **[Fork](../guide/04-a-charting-session.md#4-one-fork-per-round)**: one open question in a chart, sharp enough to answer, recording the decision and its reason. [Who answers depends on the Charting mode](../guide/06-charting-mode.md).
- **[Grounding](../guide/02-set-up-a-repo.md#grounding)**: the index file named by `grounding.index` and the `AREA.md` files it links, giving agents a short route into your code.
- **[Harness](config.md#machine-configyaml)**: an agent CLI and the command template that starts it, listed under `harnesses` in the machine `config.yaml`.
- **[Issue](files.md#issue-and-epic-files)**: a folder under `issues/open/` that holds `ISSUE.md` and one or more leaves.
- **[Landing](../guide/10-merging.md)**: putting a verified commit on your default branch. `akrogon land` verifies the commit, runs the merge gates, pushes it, and moves the leaf to `merged`.
- **[Leaf](files.md#leaf-folder-records)**: one task small enough to plan, build, and review as a unit. Its folder name is the slug commands use.
- **[Lesson](skills.md#learn-issues)**: one line in `learnings/LESSONS.md` plus a history file, written when a finding matters beyond its leaf.
- **[Lifecycle](../guide/07-build-route.md#lifecycle)**: the build route where the charting agent writes leaf contracts under `issues/open/` for a fresh slot A and slot B to plan, build, review, and land in their own tab. Always available, and the only route under Semi-autopilot and Full autopilot.
- **[Merged](state-and-phases.md#phases)**: the final phase of a leaf whose commit is on the default branch. A merged leaf never moves again.
- **[Park](../guide/12-when-work-stops.md#park-an-issue)**: move a whole issue to `issues/parked/` so automatic passes skip it. `akrogon unpark` brings it back.
- **[Pause](../guide/12-when-work-stops.md#pause-a-repository)**: stop automatic passes for one repository while keeping commands you type working. `akrogon unpause` turns them back on.
- **[Phase](state-and-phases.md)**: the step a leaf is in, such as `implement` or `check.review`, written in its `state.yaml`. Only Akrogon commands change it.
- **[Release](releases-and-updates.md)**: a built copy of Akrogon under `~/.akrogon/releases/<commit>`. The installed `akrogon` command runs from the release that `current` points at.
- **[Seed](skills.md#seed-issue)**: an imported GitHub issue in `issues/seeds/`, written by `akrogon pull`. It is unverified intake and not ready to run.
- **[Signposts](../guide/05-signposts.md)**: the opening round of a charting session that sets direction (ranked priorities, hard limits, and the order or drop of the session's charts). Answered by you under No autopilot and Semi-autopilot, and by the charting agent under Full autopilot.
- **[Slot A and slot B](../guide/09-lifecycle.md)**: the two execution roles (called seat A and seat B in shelf pages; configured under `slots` in [Settings](config.md) and passed as `--slot A` or `--slot B`). [Slot A](../guide/09-lifecycle.md#slot-a-the-builder) plans and builds, both review initially, and [slot B](../guide/09-lifecycle.md#slot-b-the-reviewer) repairs most findings and handles follow-up reviews.
- **[Stop](../guide/12-when-work-stops.md#stop-a-leaf-or-a-check-run)**: mark a leaf stopped and end every process its seats, check runs, and verify passes started (`akrogon start` clears the mark), or stop a single check run with `akrogon stop-run`.
- **[Sync](files.md#saving-records-with-akrogon-sync)**: `akrogon sync` commits eligible issue records under `issues/`, rebases, and pushes them on the default branch.
- **[Verify](checks.md#prove-a-commit-with-akrogon-verify)**: `akrogon verify` runs every configured check on a fresh checkout of a commit and writes a receipt. Moves into review and landing require a green one.
- **[Worktree](files.md)**: a separate git checkout where a leaf's code changes happen on its own branch, leaving your main checkout untouched.
- **[Worktree store](files.md#worktree-store)**: the folder outside your checkout that holds one worktree per leaf, by default `~/.akrogon/worktrees/<repo>`.
