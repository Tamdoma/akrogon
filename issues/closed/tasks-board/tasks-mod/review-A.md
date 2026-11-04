# Review A: tasks-mod

Base `ada0dab9`, reviewed head `419e2161` (clean worktree). Initial review, blind to B.

## Verification evidence

- `akrogon verify` on `419e2161`: `reuse receipt dcf65d3d-2fd5-48e8-be12-5b93a0bafe6a tree=7795d9f518da752b950be0d8f116d8fc0e4a2134` — tree identical to green head `2298a50` (trailer-only commit).
- `herdr-app check herdr-app/tasks` on the worktree at `419e2161`: `check passed: herdr-app/tasks` (exit 0).
- Read `report.md` cites: `tasks-model` / `tasks-install` logs and `implementation/evidence/` PNGs exist and are consistent with the diff (12 theme shots, live board, error envelope, expand/pin).
- `src/AREA.md` path check: every backticked file path in the file exists (unresolved items are commands, placeholders and globs, not paths).
- Doc pages for changed behavior (`docs/start/install.md`, `docs/reference/releases-and-updates.md`): claims match the diff — install links `herdr-app/<name>` into `~/.config/herdr-app/mods`; deploy sources are `current/herdr-app/*` so links run through `current`. README/docs grep: no other page enumerates link destinations. No documented behavior otherwise changed.
- `tests/install.test.ts` diff adds mod-link assertions in install and deploy cases; `tests/tasks-mod.test.ts` is new. Test-Change trailers present on `d1b3bdf` (install.test.ts), `2011245a` (tasks-mod.test.ts expectation correction), `2298a50`, `419e2161` (frozen paths).

## Fixes

### Fix 1 — Failed initial scan retries in an unbounded exec loop

`herdr-app/tasks/main.js` `start()`: when a scan leaves `env === null` and an `error` (binary missing, or `akrogon status --json` exit 1 with non-JSON stdout — e.g. zod/diagnostic output), it calls `requestScan("scan-failed", cx)` which launches a new spawn immediately; that scan fails the same way and re-requests, forever. Realistic source: `akrogon` absent from the app's `exec` PATH (an app on a minimal PATH, or an install mid-relink) or a persistently erroring producer after deploy. Consequence today: once the mod is mounted (`place: "none"` mounts with the layout), it spawns `akrogon status --json` processes back-to-back with zero delay until something else triggers a rescan that succeeds — continuous process churn on a machine where akrogon is broken, the exact state the board exists to surface. Hits done-criterion 6's scheduling surface (the scan lifecycle may not self-accelerate into an exec storm) and is a concurrency defect, which rarity cannot downgrade. Bounded fix: no immediate `scan-failed` rescan (the 30 s tick already retries), or a delayed/limited retry.

### Fix 2 — `panel.request` seq restarts at 0 on every mod remount

`main.js` sets `this.seq = 0` in `init` and `pinIntent` emits `seq + 1`, so after any layout switch (each `layout.switch` remounts mods — observed during proofs), code reload or app restart, the first Files/Changes press emits `panel.request { op: "open", seq: 1 }` again. The locked interface (design.md) says "`seq` increases per request so a repeated request is a new one"; a non-increasing seq is a repeated request to a seq-deduplicating consumer and is dropped — a real press that does nothing, and the number collides with requests other writers already sent. Realistic source: the user pressing Files after a layout switch. Consequence today: criterion 4's "send `panel.request` {op: open, view}" silently not sent. Plan D9 recorded the decision as an in-memory `Date.now()`-seeded counter (monotonic across remounts); `0` is a deviation with the observed drop. Seed `this.seq = Date.now()` (or persist via `shared()`); a `Test-Change` trailer is needed only if the existing pin-intent test is edited — the pure `pinIntent` signature already takes `seq`.

## Nits

- `.gitignore` `herdr-app/**/*.d.ts` also matches hand-written sibling `.d.ts` files (`model.d.ts`/`schedule.d.ts` are the mod's own typed boundary): a future new pure module's `.d.ts` would be untracked, missing from `git archive`, and the release would fail typecheck only after deploy. Deferred: generated `.d.ts` names land on release builds today, so narrowing the pattern is a robustness improvement, not a live defect; a naming collision would promote it.
- `watch.files` are polled on the 30 s tick only, not "every notify" as D3 sketched: file-triggered rescans lag up to 30 s (within the design's 60 s redraw window; folder events stay immediate). Promote only if a done-criterion expects file-watch latency under that.
- Inline `props().envelope` JSON string (`{...}`) parses unguarded in `propsEnvelope`/`loadEnvelope` and would reject the scan spawn on malformed input; the file variant handles an unreadable path but not unparseable content. Demo-prop-only surface — a bad hand-built envelope in a proof session, not a production path; a malformed-envelope render test would promote it.
- `alerts()` adds per-leaf `Failed:`/`Missing:` alert lines beyond D6's listed set; duplicates the row flags but is consistent with "alerts on top" — ordering choice, not a defect.

## Verdict: fix
