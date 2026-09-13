# Status View

Chart skill version: 4

Status: resolved
Type: grilling

## Question

One place that shows where everything is: reads issues folders across repos, prints, exits, no state of its own. Command, herdr tab, or both, and what it must show for the operator to know intervention is needed. 

Coverage pass 2026-09-08 adds: what check-issue writes at merge-ready so the operator can read it and the command ignores it (intake 287).

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: the view reads `state.yaml` fields only, phase, done, attempts, fix_rounds, failed, and the pane hint; tabs are named by slug so the view can point at a tab; it is the operator's only command.

From # Quality Layers 2026-09-08: a leaf failed after the fix-round cap must be visible with its round count.

From # Parallel Merge 2026-09-08: failed leaves carry the diagnosis paragraph; a broadcast failure is recorded in the leaf folder and should be visible here.

From # Model Tiering 2026-09-09: `issues/log.jsonl` holds one line per phase move (ts, slug, phase, slot, attempts, fix_round, ...); `akrogon status` may compute time-in-phase and stuck leaves from it instead of a second store.

From # Multi Chart Layout 2026-09-09: finished issues and epics live in issues/closed, so status reads issues/open only; `hand_built` leaves are shown as such.

Slot A (Claude, blind) 2026-09-09: command prints and exits, no tab; every open leaf across registered repos; a flag column with `--attention`; verdict word from state; `akrogon status <slug>` for one leaf; hook fires `herdr notification show` on `failed`.

Slot B (Codex, blind) 2026-09-09: command first, tab optional; failures printed first then the full tree; per-row phase, slot completion, attempts, fix rounds, tab hint, blocked-by; elapsed time shown without a stuck verdict; review file is the merge-ready record; unreadable repo named, non-zero exit; found the conflict between the Parallel Merge carry (broadcast failure visible) and the Repeat Safety lock (nothing recorded). Rebuttal: `--attention` must not include hand_built or dependency waiting; show A/B completion not one slot; 30 minutes is not evidence of a stall.

Operator answers 2026-09-09: 1-A (command plus hook notification on failed). 2-A (failures first, then tree). 3-A with "remove hand_built, that's useless" on the row, overriding the Multi Chart Layout carry. 4-A (minutes in phase, no stuck verdict). 5 asked "I shouldn't do anything?", explained (the review file is the record, the verdict word is already in state, one option), then 5-A. 6-A. 7-A.

## Taken

`akrogon status` is the operator's command: it reads `state.yaml` under `issues/open` of every repo in the global `repos` list plus `issues/log.jsonl`, prints, exits. No state, no loop, no tab, no prose read. Output: failed leaves and unreadable repos first, then the full tree repo → epic → issue → leaf. One row per leaf: phase, which slots are done in this phase, attempts, fix round, verdict word when present, tab hint, blocked-by, minutes since the leaf's last log line for this phase or "unavailable". No `hand_built` marker, no stuck verdict. An unreadable repo is named at the top and the command exits non-zero; it never prints "nothing needs attention" over a partial scan. `akrogon status <slug>` prints one leaf's state, its last log lines and the path to its diagnosis. The hook runs `herdr notification show` when a leaf moves to `failed`; that is the only push, and it reaches the operator only at the screen. Merge-ready: check-issue's review file is the operator's record and the verdict word comes from `akrogon phase --verdict`; status shows the word and never reads the review. Broadcast outcomes are not shown because Repeat Safety records none; the Parallel Merge carry is retired.

Why: the operator wanted one glance across repos and a nudge on failure without a watcher process. The hook already runs on every pane event, so a notification costs one line and no loop. Everything shown is a recorded fact; anything the log cannot establish is printed as unavailable rather than guessed.

Forecloses: a refresh loop or dedicated tab, a stuck verdict, file modification time as phase age, status reading review or diagnosis prose, a broadcast delivery record, a hand_built column.
