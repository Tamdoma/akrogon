# Brief: green-merge

## What

A green merge lands with no agent seat. When the holder's merge turn starts and the command has rebased the holder onto the remote base (the applied `top`), the command itself runs the merge verify on that top, runs the `merged --check` gates, pushes the tested head fast-forward and moves the holder to `merged`. Seat B is started with the merge prompt only when the command cannot finish alone:

- the holder cannot be rebased mechanically (conflict or dirty worktree): the existing `attempt=<id> solo` prompt;
- the merge verify is red: B gets the merge prompt naming the attempt, the top and the red run, and handles it with today's red endings (one rerun, `--known-red`, mechanical repair, `check.fix`);
- a `merged --check` gate refuses (uncited test change, retired lesson line);
- a refused push that needs a manual rebase (`rerun rebase <slug> onto <sha>`), a second refused push in a row, or any other push error. (C)

A non-fast-forward refusal that restacks cleanly (`rerun tested=... pushed=...`) is handled by the command once: it verifies the new top and pushes again, with no seat. (C) A red verify is never pushed. When the push completes an issue or an epic, the command starts one seat whose only job is the completion broadcast for that owner. After a landed push the command runs the same post-merge wake a seat-run `merged` triggers today, so dependents, tab cleanup, self-update and the next holder's turn follow at once. (C)

Consumes from solo-turns (blocked-by): the member-free merge turn, where the batch record describes the holder alone, `buildStack` takes the holder only, and a red on the holder takes the memberless `check.fix` path.

## Why

On the framework repo a green solo merge takes about 12-13 min, of which the merge verify is about 12.1 min. The remaining 1-3 min and one agent session per green merge are spent on a seat that only runs commands the command already owns (verify, `--check`, push). About 3 in 4 merges are green, so about 3 of every 4 merge agent sessions do no judgment, and an agent-session failure (stall, crash, prompt not delivered) can still stop a green merge. Operator 2026-10-19 took 2a on chart issues/chart/merge-stacks. Estimated gain: about 1 of 13 min per green merge (about 9%), about 3 of 4 merge agent sessions removed (estimates, not measured savings).

## Done-criteria

1. A holder whose rebase is clean and whose merge verify is green reaches `merged`, with its head pushed fast-forward to the default branch and one `merged` line in `merge-attempts.jsonl`, no agent seat is started for that leaf's merge turn, and the phase move and timing records name no seat as the mover. (B,C)
2. A holder whose merge verify is red is never pushed: seat B is started once with the merge prompt naming the attempt, the top and the red run, and the leaf stays in `merge` until B's call.
3. A holder that cannot be rebased mechanically (a conflict or a dirty worktree) gets the existing `attempt=<id> solo` prompt to seat B, and the command runs no merge verify for it first.
4. A `merged --check` gate refusal on a green top starts seat B with the refusal recorded where B can read it, and pushes nothing. (C)
5. A push refused as non-fast-forward whose restack is clean is verified and pushed again by the command with no seat; a restack that needs a manual rebase, a second consecutive refusal, or any other push error starts seat B and the command does not push again. (C)
6. A command-landed push that completes an issue or an epic starts exactly one seat with a broadcast-only prompt naming that completed owner, and a push that completes no owner starts none. A crash after the owner closes but before that seat starts still starts it on a later run, and repeated hooks never start a second one. The broadcast send itself is that seat's work under `skills/broadcast-issue/SKILL.md`, not part of this leaf's proof. (B,C)
7. While the command's merge run is in progress, a second `akrogon next` (hook or cron) neither starts another merge verify nor prompts seat B for that attempt; a run that died without finishing is detected on a later `next` and the turn proceeds without a duplicate push. After a red, refusal or push error has been handed to B, later hooks and `next` calls keep the attempt with B and never restart the command's verify for it. (B)
8. After the command pushes and before the phase moves, a crash leaves the holder recoverable: the next run moves it to `merged` exactly once, as for a seat-run push today.
9. `akrogon stop <slug>` and `akrogon stop --all` stop a running command merge for a leaf even when it has no tab. (B)
10. `skills/merge-issue/SKILL.md` describes the seat's merge work as red, conflict, gate refusal and push handling only; `skills/broadcast-issue/SKILL.md` names the broadcast-only seat as sender after a command-run merge; `src/AREA.md` describes the command-run green path. (C)
