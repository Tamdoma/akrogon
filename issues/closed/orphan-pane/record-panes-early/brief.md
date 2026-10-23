# Brief: record-panes-early

## What

`akrogon next` seat allocation (`allocate` in src/next.ts) records each seat pane id in the leaf's state as soon as it has the pane, before boxing it into the leaf scope, and never drops a live recorded seat while saving. A pane whose boxing fails is then a recorded pane outside its scope, which the next allocation already closes and recreates. Broadcast dispatch stops prompting a recorded B pane directly and always goes through allocation, so no seat is prompted in an unboxed pane.

## Why

Today allocate saves pane ids only after both panes are boxed. When boxing B throws (the 5 s adoption deadline) or the run stops after the split, the B pane exists but state does not record it. The next `next` splits another B and the first stays forever as an idle shell (#116: lingua-relay leaf `stvaranje-okruzenja` had panes pA, pB, pC with only pA and pC recorded). (B) Recording each returned id before boxing makes boxing failures recoverable on the bootstrap, repaired-A and missing-B paths through the existing sweep.

## Done-criteria

1. When boxing the B pane fails after its split succeeded, the leaf's state records that B pane id, (B) and the next `akrogon next` pass leaves no unrecorded pane created by this allocation, keeps any operator pane already in the tab, and has recorded A and B boxed before any seat prompt. Shown by a test in the `test` check that fails on the current code and passes after the change.
2. When boxing a newly split A pane fails while a live recorded B survives (the repair path), state still records the surviving B, and the next pass keeps that B pane, leaves no unrecorded pane created by allocation, and prompts no seat before both are boxed. (B) Shown by a test in the `test` check that fails on the current code and passes after the change.
3. A pending broadcast whose recorded B pane is live but outside its scope does not prompt that pane: the pass closes and recreates B boxed before the broadcast prompt. Shown by a test in the `test` check that fails on the current code and passes after the change.
4. A pane split by hand in the leaf tab and not recorded in state stays open and unboxed through criteria 1 and 2. Shown by a test in the `test` check.
5. docs/guide/next.md states that a pane whose id was never saved (the run was killed during the split, the reply was lost, or the state write failed) is not recorded and is closed by hand with `herdr pane close <pane>`. The `test` check passes.
