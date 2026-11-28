# run-check discards stdin

## Case

On 2026-11-27, slot B reviewed `subagents-command-removal` in pi-extensions. Two probes supplied shell bodies through here-documents to `akrogon run-check`, with the child shell invoked as `bash -s`. Both checks exited zero and produced empty logs.

## Evidence

The leaf's `implementation/check-review-b-removal-surfaces-1795818251761-3110767.log` and `implementation/check-review-b-typecheck-scope-1795818263795-3113087.log` were empty. `spawnLogged` in `src/run-check.ts` sets `stdin: 'ignore'`. Repeating the checks with `bash -c` and the script as an argument produced the expected grep results and compiler file list in the logs cited by `review-B.md`.

## Learning

Pass scripts to run-check as arguments or files. Read back the kept evidence before using a green result to support a verdict.
