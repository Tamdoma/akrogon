Reviewed amended HEAD `4c9f268897945022527134c2a631911010a57f28` in the named worktree.

## F1 — P1: A timed-out pass leaves its external commands running

`src/listen.ts:40` sends SIGTERM only to the immediate akrogon process. The queue then advances or retries after that process exits, while commands spawned through `src/shell.ts:38` remain alive. This permits overlapping mutations after the killed process releases its locks. For example, `next --resume` runs self-update (`src/next.ts:1267`), whose install lock protects external git/build commands (`src/self-update.ts:355-359`). Killing the wrapper removes that protection without stopping those commands.

Verified with the actual `withLock` and `command` helpers: killed a Bun wrapper while its external shell waited on a private FIFO. The descendant remained alive, a second process acquired the same lock (`flock -n` exited 0), and releasing the FIFO let the old command write afterward. All resources belonged to the probe and were cleaned up. Terminate the pass's owned subprocesses before allowing subsequent passes. The new hung-pass test checks a second start, but does not establish that the first pass's descendants stopped.

## F2 — P1: One missing first snapshot still blocks the entire listener

`src/listen.ts:157` awaits every subscription's `ready` promise without a deadline. That promise (`:89`) resolves only on a snapshot or stream termination. A live but silent `hc events` child therefore holds startup at `:166`, so no initial pull/resume or healthy-session wake can run. After startup, the same condition blocks the serialized scan chain and discovery of later sessions. Neither the pass deadline nor the finite `hc()` deadline covers `follow()` (`src/hc.ts:383`). No rejection occurs to activate the new retry path.

Verified against the listener with mocked transport: discovery returned `silent` and `healthy`, the healthy subscription supplied its snapshot, and the silent subscription stayed open. Both subscribed, but the pass list remained empty. Initial subscription readiness needs a failure bound and owned-stream cleanup even if ongoing heartbeat monitoring remains deferred.

Verdict: changes needed
