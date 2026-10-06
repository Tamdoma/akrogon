# Brief: merge-turn-order

## What
Give each registered repo one merge turn. The holder is the earliest eligible leaf in `merge` by its merge stamp. The stamp is written on every move into `merge` (from review, repair or operator recovery), ties go by slug, and leaves already in `merge` when this ships are ordered by their last `to: merge` record in `issues/log.jsonl`. Only eligible leaves count: not hand-built, dependencies merged, inputs present. Only the holder's B is prompted for the merge pass. A waiting leaf stays in `merge`, unprompted, and keeps its tab, panes and `max_active` slot. `akrogon status` names the holder and each waiting leaf's place. For a leaf in `merge` that is not the holder, the command refuses `merged` (with or without `--check`) and `check.fix`, naming the holder, and never refuses `failed` (A,C). The merge pass starts with `akrogon phase <slug> merged --slot B --check`, so a waiting seat prompted by hand stops before any check runs (A,C).

Every `akrogon next` pass ends by running the existing `sweep` (`src/next.ts:674-679`) over that repo's leaves in `merge`, so the holder-only rule prompts the holder. `akrogon phase` makes the same call after every committed move, outside the lock, even when logging or completion work after the save throws (A,B), from the command entry `src/akrogon.ts`, because `next.ts` imports `phase.ts` (`src/next.ts:55`). When a pass commits a capped prompt failure, the same pass reconsiders the next holder.

The holder's merge pass itself stays as today (rebase, checks, push by the seat). Batching and command-owned push belong to leaf merge-batch.

## Why
Today every leaf in `merge` rebases and runs the full checks at the same time. Whenever one lands, the others' runs become stale and they rerun. On framework one leaf sat 3 hours in `merge` with no code change (Tamdoma/akrogon#57). With one holder per repo, no leaf's run is invalidated by another leaf landing during it.

## Done-criteria
1. With two eligible leaves in `merge` in one repo, a pass prompts only the earlier-stamped leaf's B, and the other keeps its tab and panes unprompted.
2. `akrogon status` names the holder and each waiting leaf's place in line.
3. A hand-built leaf, a leaf with an unmerged dependency, or a leaf with a missing input is never the holder.
4. For a leaf in `merge` that is not the holder, `akrogon phase <slug> merged` (with or without `--check`) and `akrogon phase <slug> check.fix` are refused and name the holder. A move to `failed` is never refused. (A,C)
5. `skills/merge-issue/SKILL.md` makes `akrogon phase <slug> merged --slot B --check` the first step of a merge pass, and on a waiting leaf that call is refused before any check runs. (A,C)
6. Moving the holder out of `merge` by each path (seat `merged`, seat `check.fix`, seat `failed`, the command's capped prompt failure, an operator `akrogon phase` from a plain shell) prompts the next leaf's B with no manual `akrogon next`, and a second pass prompts nobody.
7. A holder move that is saved but whose log append then fails still prompts the next leaf's B. (A,B)
8. A leaf returning to `merge` while two others wait is listed third.
9. Two leaves in `merge` with no merge stamp are listed by `akrogon status` in the order of their last `to: merge` records in `issues/log.jsonl`, and the earlier one is prompted. A leaf with neither is listed after them, by slug, marked `no merge record`. (A,C; B held: operator-supplied order)
