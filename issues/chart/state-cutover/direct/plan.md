# Direct plan: state-cutover-gate

Task: forks/writer-gate.md Taken (1a).

## Done-criteria
1. A process holding the tool root as cwd does not defer the move: the first command moves state (replaces tests/state-home.test.ts "deferred while a foreign process holds the tool root as cwd").
2. A live tool-root run record still defers the move (existing test unchanged).
3. `foreignProcess`, `ownPids`, `spawnedBySelf`, `parentPid` are gone; `settled()` checks only live tool-root run records. Locks, copy, recheck and config-last stay.

## Order
Test for 1 first, committed; then the code for 3.
