# Brief: retire-old

Chart skill version: 4

## What

Move every file under `reference/lessons/` (README.md and the two .json files included) into `learnings/history/` byte-identical, then delete `new-beginning/` and the rest of `reference/` (akrogon-config.yaml, akrogon-scripts). Before deleting, find every Markdown link or path that resolves into those folders from learnings/, skills/, README.md and the open leaves, and repair it; prose mentions in the archived chart under `issues/chart/` and in old history files are record text and stay untouched. Delete any skill folder not among the eight (chart-issues, plan-issue, implement-issue, check-issue, merge-issue, seed-issue, broadcast-issue, init-issues). Keep `learnings/LESSONS.md` (created by `akrogon init` at takeover) with the # Lessons header and whatever active lines earlier leaves wrote. Run the init-issues skill on this repo so `akrogon init --from` sets `grounding.index` to a top index file this leaf writes (one line per area with a link to its folder; no area files, the repo is small). Rewrite README.md to the new shape (install, init, the command, the eight skills).

## Why

Nothing in the handoff or the archived chart may point into the old folders once the tool builds itself (# Bootstrap, # Lessons).

## Done-criteria

1. `reference/`, `new-beginning/` and every skill folder not among the eight are gone; no Markdown link or path under learnings/, skills/, README.md or issues/open resolves into them (the moved files under learnings/history are byte-identical and their contents are exempt as record text).
2. `learnings/history/` holds every former reference/lessons file byte-identical, and `learnings/LESSONS.md` exists with the "what happened, not what is true" header and every active line earlier leaves wrote.
3. `grounding.index` names a top index file that lists each area one line with a link, written through `akrogon init --from`, and `akrogon config` prints it.
4. README.md describes install, init, the command and the eight skills and nothing retired; `bun test` is green.
