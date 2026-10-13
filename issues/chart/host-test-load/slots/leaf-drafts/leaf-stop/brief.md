# Brief: leaf-stop

## What
New `akrogon stop <leaf>` ends every process a leaf started, browsers and worker scripts included, and keeps the leaf from being dispatched again until `akrogon start <leaf>`. `akrogon stop --all` does this for every allocated leaf of the current repo. Pause and pi Esc are unchanged.

## Why
In the 2026-10-13 incident neither Esc nor pause stopped the in-process workers and their browsers (Tamdoma/akrogon#88). Blocked by seat-containment: this leaf consumes its exported `leafSlice(repo, slug)` name and the pane scopes it creates under that slice.

## Done-criteria
1. In a real herdr server, `akrogon stop <leaf>` on a dispatched leaf records the leaf as stopped, then stops its leaf slice: every process in its pane scopes ends, a Chrome started from a seat included, and herdr closes the leaf's panes. The leaf's worktree and saved harness sessions remain.
2. While a leaf is stopped, automatic `akrogon next` passes do not dispatch it, `akrogon next <leaf>` exits non-zero naming `akrogon start <leaf>`, and the merge path starts no stack or merge seat for it.
3. When stopping a loaded leaf slice fails, the leaf stays recorded as stopped, the error is printed, the command exits non-zero, and running the same stop again retries it. When the leaf slice is not loaded, stop records the leaf and exits zero (C).
4. `akrogon stop --all` stops every allocated leaf of the current repo and prints a result per leaf. One leaf's failure does not prevent the others' stops, and the command exits non-zero if any failed.
5. `akrogon start <leaf>` removes the stopped record and runs the targeted `akrogon next <leaf>` pass. `akrogon start` on a leaf that is not stopped exits non-zero.
6. `akrogon status` marks stopped leaves.
7. The README verb table and docs/guide/next.md describe `stop` and `start`.
