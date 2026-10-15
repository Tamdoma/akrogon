# Brief: folder-pack

## What
Add `akrogon pack <folder>...`, which packs a chart's `direct/` logs or a closed owner's logs with the shared pack, checks tracked logs before packing a closed owner, and reports per folder. Plain `akrogon status` lists folders that still hold plain logs or a stranded `.closing`. The chart-issues skill runs `akrogon pack <chart>` before appending an end marker.

This leaf consumes from [close-pack](../close-pack/brief.md) the shared pack function (recursive `*.log` set, retry union, read-back through the resolver, delete after verification) and its archive format; it adds the `.closing` handling for the command and the entry checks.

## Why
Chart direct logs never reach completeOwner, and 743 tracked logs in akrogon plus 4,462 in framework were committed before close-pack existed. The door's one-time migration and every chart end need a command that packs these losslessly and refuses when git and disk disagree.

## Done-criteria
1. `akrogon pack <chart>` packs every `*.log` under `<chart>/direct` into `<chart>/direct/evidence.tar.zst` with members relative to `direct/`, merging with an existing archive; it removes `.closing` on success. A pack that fails leaves `.closing`, exits non-zero naming it, and a rerun finishes and removes it.
2. `akrogon pack issues/closed/<owner>` packs a closed owner and prints, per folder, how many logs were packed, how many were tracked, how many untracked, and how many deleted.
3. Before packing a closed owner, a tracked log modified on disk refuses that owner naming the path; a tracked log missing on disk is accepted only when the existing archive holds that member with the indexed bytes, else the owner is refused naming the path. This holds for logs ending in a newline and for bytes that are not UTF-8 (B,C).
4. Any other folder (an open or parked owner, a path outside the registered root, a worktree's `issues/` copy) is refused naming the accepted forms. With several folders, each is packed or refused on its own, and the call exits non-zero naming every folder not packed.
5. Plain `akrogon status` lists each closed owner and each chart whose last marker is `Closed`, `Held` or `Handed off` that holds a plain `*.log`, and each such folder holding `.closing`, naming `akrogon pack <folder>` (for a chart, the chart folder); an open owner holding `.closing` is listed naming `akrogon next <slug>` for a merged leaf under it (B,C). After packing or retrying them, it lists none.
6. skills/chart-issues/SKILL.md tells the door to run `akrogon pack <chart>` before appending `Closed`, `Held` or `Handed off` when `<chart>/direct` holds a log.
