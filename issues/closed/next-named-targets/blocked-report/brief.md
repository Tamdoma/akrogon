# Brief: blocked-report

## What
Every leaf the operator picks with a typed `akrogon next` (a target, a path, bare `next` without a plugin event, or `--all`) that cannot start gets one error line naming the leaf and why: failed and needing phase recovery, every unmerged dependency with its phase (or parked, missing, unreadable), or every missing input. Ready picked leaves still start, and the command exits non-zero when any line was printed. One-leaf and many-leaf picks behave the same. Automatic passes keep waiting silently.

## Why
Tamdoma/akrogon#59: a single targeted leaf fails with `Leaf dependencies are not merged: <slug>` without naming the dependencies, and a folder target skips blocked leaves silently. In client-voice-writing 6 of 10 leaves did not start with no word why.

## Done-criteria
1. A typed `akrogon next <folder-path>` over leaves that are ready, dependency-blocked, input-blocked and failed starts the ready leaf, prints exactly one error line for each of the other three naming the leaf and its reason, and exits non-zero.
2. A dependency-blocked line names every unmerged dependency with its current phase, or `parked`, `missing` or `unreadable`. A merged dependency, open or closed, never appears and never blocks.
3. An input-blocked line names every missing input by kind, name and holder and never prints a value. Dependencies are checked first: a leaf blocked by both reports its dependencies.
4. A failed picked leaf's line says it is failed and needs phase recovery. A merged picked leaf completes as today and prints no line.
5. The same leaf gives the same line whether picked by its slug, a one-leaf folder path, or a multi-leaf folder path.
6. Bare typed `akrogon next` without a plugin event, `akrogon next --all` inside a registered repo, and `akrogon next --all` outside every registered repo report their picked leaves the same way, also when `HERDR_PANE_ID` or an inherited `HERDR_PLUGIN_EVENT_JSON` is set on a target or `--all`.
7. A plugin-event pass, `akrogon next --resume`, and the merge wake after `akrogon phase` print no wait line and keep today's exit status for waits. A dependent started by a completion inside a typed pass is not a picked leaf and prints no wait line. Real errors (unreadable records, foreign repo, delivery failures) still report on every path.
8. Merge turn, capacity and busy seats never produce a line.
9. docs/guide/next.md describes the report, its three reasons, the non-zero exit, and that automatic passes stay quiet.
