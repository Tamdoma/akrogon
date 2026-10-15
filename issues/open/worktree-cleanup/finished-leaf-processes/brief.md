# Brief: finished-leaf-processes

## What
Reconcile stops the leaf slice of a leaf that is `merged` or `failed` and whose tab is gone, so processes it left running end. Guard units are collected by systemd when they fail, and failed `akrogon-run-*` units already loaded are cleared.

## Why
Store-hygiene F4: a merged leaf's background loop ran 4 h 43 min in its slice after its tab closed, with its folders deleted; 51 finished-leaf slices and 22 failed guard units stay loaded. Leftover processes also block folder cleanup.

## Done-criteria
1. A process left running in the slice of a `merged` leaf whose tab is gone and whose slice holds no live run record is gone after the next reconcile pass, and the slice is inactive; the same holds for a `failed` leaf. (C)
2. The slice of a leaf whose tab is live, or that a live admission record names (an `akrogon verify` or `run-check` started from a shell outside any tab), is not stopped. (C)
3. A finished leaf with no worktree and no leaf temp left but a live tab keeps its slice: the pass fetches the pane list rather than reading an empty one. (B,D)
4. A pass with the pane list unavailable stops no slice of a leaf that has a recorded tab. (B,D)
5. A loaded `akrogon-l*.slice` that matches no leaf record and holds no process and no live run record is stopped. (C)
6. A reconcile pass running inside a leaf slice does not stop that slice.
7. `akrogon phase <slug> merged` stops no slice: its log line and completion run to the end.
8. A guard unit that fails is no longer listed by systemd afterwards.
9. A failed `akrogon-run-*` unit already loaded is no longer listed after a reconcile pass.
