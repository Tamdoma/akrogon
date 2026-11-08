Re-check: ready

Finding 1 withdrawn. My native probe established the result of external parent removal, not a competing akrogon removal during a valid B start. Starts/restarts and reconciliation hold the same global lock (`src/next.ts:1036`, `:1054`, `:1280`). Stop marks the leaf stopped before teardown (`src/stop.ts:86-92`), and merged cleanup is guarded against pending broadcast work (`src/next.ts:1106-1108`, `src/reconcile.ts:429`). I found no additional akrogon path requiring the proposed retry.
