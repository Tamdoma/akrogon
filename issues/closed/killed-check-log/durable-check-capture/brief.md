# Brief: durable-check-capture

## What

`akrogon run-check` (and every other `checkedRun` caller) writes the command's stdout and stderr into run-unique capture files inside the holder from launch, and prints their path before waiting. Output the command printed before its caller died, including by SIGKILL, stays readable in the holder and, after the owner is packed, through `akrogon log`. A kernel-released lock held by every capture writer makes owner packing and movement wait until the writers and publication have ended. Completing or packing an owner from inside its own run-check is refused before the wait. Normal runs, early closed-owner refusal and receipts behave as today.

## Why

Tamdoma/akrogon#120: a pi seat's tool timeout SIGKILLed `akrogon run-check` 40 minutes into a test run. `checkedRun` copies output to the holder only after the command exits, and reconcile later deletes the dead run root, so no evidence was kept and the seat repeated the whole run with a bigger timeout.

## Done-criteria

1. When a run-check wrapper is killed with SIGKILL after its command has written distinct markers to stdout and to stderr, and reconcile then runs, both markers are readable from capture files in the holder; this holds for held and for nested admission.
2. While the command is still running, run-check has already printed the capture path on stderr in a line that claims no exit code; the existing `check <name>: <exit> <log>` line still appears only after the command exits.
3. A command that exits while its owner is open leaves exactly the completed combined log in the holder, with today's name pattern, content and result line, and no capture files; run-check's exit code and stdout/stderr replay are unchanged.
4. A command whose owner is already closed or closing when run-check starts is refused as today; a command whose owner is gone at publication keeps its output with `refusal.json` and the owner folder is not recreated.
5. An owner pack started while a capture is live does not snapshot the holder until every capture writer and the publication have ended, and afterwards `akrogon log` reads both streams of that run from `evidence.tar.zst`.
6. Capture files carry names distinct from completed check logs, are readable through `akrogon log`, and a killed run produces no completed check result line, `check_end` timing or verify receipt.
7. Completing or packing an owner from inside a run-check whose holder belongs to that owner fails fast with an error naming the enclosing run, without waiting and without losing that run's output; completing it from outside waits until the run ends and then succeeds.
