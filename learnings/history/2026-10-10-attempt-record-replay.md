# Attempt records: persistent records create replay surfaces

## Case

merge-attempt-records (2026-10-10) appended one line per merge attempt end inside `batchPush`, `finishPush`, and `reconcileBatch`. The batch record in `state.yaml` outlives the appending call: a merged holder keeps `batch` with `candidate` set, and `src/akrogon.ts` runs `mergeWake` after every committed phase call, re-entering `reconcileBatch`'s landed and discard branches. The first implementation wrote a second identical line on the same process exit; a solo `check.fix` likewise hit the discard branch with a second `red`.

## Evidence

Worker test runs: `phase hold merged` produced two identical `{"attempt":"a1","outcome":"merged"}` lines 24ms apart; solo `check.fix` produced two `red` lines; the `reuse` landing produced two `reuse` lines. Reproduced and fixed by `batch.recorded` (persisted flag) plus appends gated on the holder being in phase `merge`.

## Learning

A one-shot write driven by a persistent state record replays whenever the record survives its trigger: post-phase wake passes, retries after a mid-call failure, and recovery reconciles all re-enter. Exactly-once on a replayable record needs a persisted `recorded` flag written in the same pass, plus a gate on the phase that owns the end. Check every append site for the path that leaves the record alive, not just the path that writes.
