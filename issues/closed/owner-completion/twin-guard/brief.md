# Brief: twin-guard

## What

`akrogon next` treats every leaf under an open completion owner whose top-level folder name also exists under `issues/closed` or `issues/parked` as blocked, in every phase: it is never dispatched and never takes the merge turn. Its leaves stay readable, so other owners' dependencies on them, cleanup and capacity behave as today (B,C). The refusal names the open owner folder and the conflicting folder, and every other owner keeps dispatching and merging in the same pass. A closed leaf addressed by its `issues/closed/...` path still dispatches.

## Why

A completion owner closes exactly once: `completeOwner` renames the whole folder to `issues/closed/<name>` and refuses when that destination exists, and evidence lookup resolves a log by owner name across open, closed and parked. Today a same-name open owner dispatches freely and only fails after every leaf merged (#108, framework satellite-plan-fit: six merged leaves stuck, wave-1 logs unreadable). Refusing at dispatch catches the twin before any work runs, when renaming is free.

## Done-criteria

1. With `issues/closed/<name>` holding a closed owner and `issues/open/<name>` holding a dispatchable leaf, `akrogon next <that leaf's slug>` dispatches nothing and exits non-zero with an error naming both `issues/open/<name>` and `issues/closed/<name>`, and no missing-leaf error (B,C); `akrogon next --all` dispatches no leaf under `issues/open/<name>`, prints that error once for the owner, and exits 1 (C). Shown failing before the change (today the open leaf dispatches) and passing after, through the CLI test fixture.
2. The same refusal holds when the conflicting folder is `issues/parked/<name>`, and when the conflicting folder is empty.
3. In the same `next --all` pass, a dispatchable leaf under a different open owner is still dispatched, including one whose `blocked-by` names a merged leaf of the twin owner (B,C).
4. A merge-phase leaf of the twin owner does not take the merge turn, and a merge-phase leaf of a different owner behind it in queue order does (B,C).
5. A closed leaf addressed by its `issues/closed/<name>/...` path still dispatches while the twin exists.
