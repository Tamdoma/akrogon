# Akrogon docs

Start with the five start pages, in order. After that, open the page for the job in front of you, or look a fact up in the reference pages.

## Start

Read these in order.

1. [What Akrogon is](start/what-it-is.md): how a request becomes merged code, and the first words you need.
2. [Why it works](start/why-it-works.md): progress lives in files, build and review are separate seats, and a contract comes before code.
3. [Install](start/install.md): what the machine needs, the machine config and the install itself.
4. [Set up a project](start/set-up-a-project.md): run init-akrogon, pick the settings you touch and set up grounding.
5. [One change, start to finish](start/one-change.md): one real change followed from the first note to the merged commit.

## Use

One page per job.

- [A working day](use/a-working-day.md): the order of the steps from request to merged, and the two other routes.
- [Plan work](use/plan-work.md): chart a request into leaf contracts with `/chart-issues`.
- [Quick fix](use/quick-fix.md): let the chart door build and land one small, settled change through the direct route.
- [Autopilot](use/autopilot.md): let the chart door chart and hand off a fixed list of work without asking you each question.
- [Write issues by hand](use/write-issues-by-hand.md): write the leaf files yourself and order leaves with `blocked-by`.
- [Run work](use/run-work.md): start ready leaves and move running ones forward with `akrogon next`.
- [Park, pause and stop](use/park-pause-stop.md): hold work back by parking an issue, pausing a repository, stopping a leaf or stopping one check run.
- [When work fails](use/when-work-fails.md): read why a leaf stopped in `failed` and send it back to work.
- [Merge and announce](use/merge-and-announce.md): how a leaf that passed review is landed, and the update sent when an issue or epic completes.
- [Save records](use/save-records.md): save plans, reviews, state and logs under `issues/` with `akrogon sync`.
- [Watch while away](use/watch-while-away.md): keep leaves moving with `/watch-issues` while you step away.
- [Report an observation](use/report-an-observation.md): file something you saw go wrong as an unverified GitHub issue with seed-issue.
- [Learn from work](use/learn-from-work.md): how seats write lessons, and how `/learn-issues` clears the ones that no longer apply.
- [Roll back a release](use/roll-back-a-release.md): go back to the previous release when a deploy breaks the `akrogon` command.

## Reference

Look facts up here.

- [Words](reference/words.md): one line per term, each linked to the page that explains it.
- [Commands](reference/commands.md): every `akrogon` command, one line each.
- [Settings](reference/config.md): the three places Akrogon reads settings from, and which one wins.
- [State and phases](reference/state-and-phases.md): every phase, who moves it, and every field in `state.yaml`.
- [Checks](reference/checks.md): how checks run, what proof a phase move asks for, and what to do when a move is refused.
- [Files](reference/files.md): the layout of `issues/`, the leaf records and the worktree store.
- [Skills](reference/skills.md): what each skill is for, and which ones you start yourself.
- [Releases and updates](reference/releases-and-updates.md): where releases live, how checkouts follow the default branch and how a failed update shows up.
- [Limits](reference/limits.md): what Akrogon does not do, and the work that stays yours.
- [Where things go](reference/where-things-go.md): for maintainers, which folder each page belongs in and the rules for keeping the docs true.

## Examples

Real cases from projects outside Akrogon. They are not steps to follow.

- [Examples](examples/README.md): an overview of the three stories.
- [Quick fix story](examples/quick-fix-story.md): one bug fixed through the direct route.
- [Autopilot story](examples/autopilot-story.md): three speed reports charted by autopilot and landed as three leaves.
- [Recovery story](examples/recovery-story.md): a failed leaf whose code was carried forward and merged.

The code map for agents is the [reference index](reference-index.md).
