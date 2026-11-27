# Akrogon docs

Read the 12 guide pages in order to learn Akrogon end to end, check [Other tools](#other-tools) for occasional tasks, or look up exact rules and commands on the [Reference](#reference) shelf.

## Guide

### 1. Set up

1. [Install Akrogon](guide/01-install.md): check your machine, write the one-per-machine config, and run the installer.
2. [Set up a repo](guide/02-set-up-a-repo.md): run `/init-akrogon`, pick the settings you touch, add a two-letter prefix, and set up grounding.
3. [Your three tabs](guide/03-your-three-tabs.md): create the repository's Herdr space and your daily `t-`, `c-`, and `w-` tabs.

### 2. Charting

4. [A charting session](guide/04-a-charting-session.md): one session from first note to hand-off in the `c-` tab, and what consultants do.
5. [Signposts and the needs sheet](guide/05-signposts.md): setting priorities, hard limits, chart order, and operator-only needs once per session.
6. [Charting mode](guide/06-charting-mode.md): who answers questions while charting (No autopilot, Semi-autopilot, and Full autopilot).
7. [Build route](guide/07-build-route.md): who builds the work once every question is answered (Direct and Lifecycle).
8. [Decisions, review, and hand-off](guide/08-hand-off.md): locking decisions, real-world checks, the hand-off review, and handing off contracts.

### 3. Lifecycle

9. [The lifecycle: how work runs](guide/09-lifecycle.md): start tasks with `akrogon next`, follow slot A and slot B through planning, building, review, and repair, and watch status.

### 4. Merging

10. [Merging and announcements](guide/10-merging.md): one merge turn per repository, command-owned landing, merge exits, issue completion, and Discord updates.

### 5. While you are away and when work stops

11. [While you are away](guide/11-while-you-are-away.md): start and stop the 20-minute watcher in `w-`, what keeps moving overnight, and what waits for you.
12. [When work stops](guide/12-when-work-stops.md): recover failed tasks, park issues, pause a repository, stop a task or check run, and fix common command refusals.

## Other tools

Occasional tools and maintenance commands live directly on the reference shelf.

| Task | Tool | Where to read |
| --- | --- | --- |
| Write issues by hand | Leaf folder files and `blocked-by` | [Writing issues by hand](reference/files.md#writing-issues-by-hand) and [Fields a person sets](reference/state-and-phases.md#fields-a-person-sets) |
| Save issue records | `akrogon sync` | [Saving records with akrogon sync](reference/files.md#saving-records-with-akrogon-sync) |
| Report an observation | `/seed-issue`, `akrogon pull` | [seed-issue](reference/skills.md#seed-issue) and [Commands (Run work)](reference/commands.md#run-work) |
| Learn from work | `/learn-issues` | [learn-issues](reference/skills.md#learn-issues) |
| Roll back a release | `akrogon rollback` | [Roll back a release](reference/roll-back-a-release.md) |
| Pack logs, timing, flaky tests, leftovers | `akrogon pack`, `timing`, `flaky`, `leftovers` | [Commands (Inspect)](reference/commands.md#inspect), [Commands (Records)](reference/commands.md#records-and-releases), [Timing report](reference/files.md#timing-report), and [Flaky report](reference/files.md#flaky-report) |

## Reference

Look exact facts, commands, and rules up here.

- [Words](reference/words.md): guide words to shelf words, plus one line per term linked to the page that explains it.
- [Commands](reference/commands.md): every `akrogon` command, one line each.
- [Settings](reference/config.md): the three places Akrogon reads settings from, and which one wins.
- [State and phases](reference/state-and-phases.md): every phase, who moves it, and every field in `state.yaml`.
- [Checks](reference/checks.md): how checks run, what proof a phase move asks for, and what to do when a move is refused.
- [Files](reference/files.md): the layout of `issues/`, leaf records, timing and flaky reports, writing issues by hand, and `akrogon sync`.
- [Skills](reference/skills.md): what each skill is for, and which ones you start yourself.
- [Releases and updates](reference/releases-and-updates.md): where releases live, how checkouts follow the default branch, and how a failed update shows up.
- [Roll back a release](reference/roll-back-a-release.md): roll back to the previous release with `akrogon rollback` or by hand.
- [Limits](reference/limits.md): what Akrogon does not do, and the work that stays yours.
- [Where things go](reference/where-things-go.md): for maintainers, which folder each page belongs in and the rules for keeping the docs true.

The code map for agents is the [reference index](reference-index.md).
