# Brief: observe-paused

## What

`skills/watch-issues/scripts/observe.ts` prints the repo's paused state as line 2 (`paused=true` or `paused=false`) and prints no inventory while paused. The watch-issues skill's start check and every check read only that script and never run `akrogon status`. The watch tests, stand-in watchers, the live watch e2e cells and the watch docs follow the single read.

## Why

Tamdoma/akrogon#160: each check read `akrogon status` only for the paused bit while observe.ts already printed every leaf line. A pi watcher filtered the noisy status output, dropped the leaf rows and reported "quiet board" for six ticks while four leaves waited. `akrogon next <slug>` and `next --all` ignore pause, so the watch's own paused check is the only guard and must stay. One minimal artifact removes the second source.

## Done-criteria

1. With the repo not paused, observe prints `session=<name>` on line 1, `paused=false` on line 2, then the leaf and unreadable lines in their current formats. With no readable leaves and no failures, or no `issues/open`, it prints exactly those two lines.
2. With the repo paused by `akrogon pause`, observe exits 0 and prints exactly `session=<name>` then `paused=true`, with open leaves, a working seat and an unreadable entry present, and makes no hc call beyond the session discovery an empty-inventory run makes (A,C). After `akrogon unpause` it prints `paused=false` and the leaf lines again.
3. With a malformed `paused.yaml` (invalid YAML, or a value other than `true`), observe exits non-zero, prints nothing on stdout, and names the pause file on stderr.
4. `skills/watch-issues/SKILL.md` makes the start check and every check, including each re-observation in `## Judge` and `## Consult`, the observe run alone. A check acts only when observe exits 0 with line 2 exactly `paused=false`. On `paused=true` it reports paused and acts on nothing. On a non-zero exit or a missing or different line 2 it reports the error and acts on nothing. The skill text contains no `akrogon status` command.
5. On a real hc core, a scripted watcher following the new skill runs exactly one observe read per accepted start and due, after the due's receipt, makes no `akrogon status` call, runs no `next` at a paused due or after a failed observe, and runs `next` at the first due after a leaf is staged following an empty check. The watcher reads the fixture's pause file, not the operator's.
6. A real pi watcher reading the new skill in the throwaway watch tier runs one observe read per accepted due with no `akrogon status` call, runs no `next` at a due while the repo is paused and a dispatchable leaf is on disk, and runs a `next` attributed to its own turn for a leaf staged after an empty check. At the paused due, the turn's recorded transcript shows observe exiting 0 with `paused=true` and the watcher reporting paused, read by the reviewing seat, not matched on wording (A,C). Live because only a real model shows it follows the new check text instead of calling `akrogon status`. Paid launches run under the standing grant.
7. `docs/use/watch-while-away.md` (What each check does), `docs/pictures/watch-loop.svg` and the observe line in `skills/AREA.md` describe the single observe read, with no `akrogon status` step.
