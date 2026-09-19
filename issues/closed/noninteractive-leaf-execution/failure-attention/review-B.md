# Review B: failure-attention

Base: `f91cea968ac46f5a30119e4ce03eac611cc66abd`
Reviewed head: `3c946f8ab91939d6ca542002575dad1ea8ba579b` (one commit, 10 files, +339/-97)

## Verification evidence

- `bun test` — 244 pass, 0 fail (run by B pre-commit on the committed tree; format was a no-op).
- `bun run typecheck` — clean.
- Live scenario (fixture + fake herdr, run by this reviewer): `phase demo failed --reason 'worker died'` on a tabbed leaf → exit 0, `failure.delivery: 'shown'`, `.calls` shows `['notification','show','repo/demo failed','--body','blocked: worker died','--sound','request']` then `['tab','rename','w9:t1','demo failed']`; `phase demo implement` → `['tab','rename','w9:t1','demo']`, stored label back to `demo`.
- `grep failed_notified src/` — only the `readState` legacy-strip filter; `grep` of tests confirms remaining references are the legacy-key fixtures in `state.test.ts`.
- Every `phase ... failed` CLI call in `phase.test.ts` without `herdr.env` is refused before `commitMove` (bad slot, done slot, missing/blank reason) — no test reaches the real herdr.

## Done-criteria check

1. Move to `failed` records one `notification show` with `--sound request` and one `tab rename` to `<slug> failed`, `delivery` = fake's reason — asserted exactly in `stop from implement` and the new announce test; verified live.
2. Move out renames back; `failRename` twice → move stands, two calls, non-zero exit with `timeout` in stderr — covered.
3. No-tab failed move → notification only, zero renames — covered.
4. `failNotification` → one call, `delivery: 'error'`, tab renamed, non-zero; `failRename` → `delivery: 'shown'`, non-zero — covered.
5. `failed_notified` gone from schema/runtime, stripped by `readState` (legacy cases added to both loops), `dispatchLeaf` failed branch is `return 'waiting'`, rewritten test asserts zero notifications across repeated `next` runs — covered.

## Design/contract check

- Announce sits inside `commitMove`'s `try` so `logMove` still runs in `finally` and the herdr error propagates after — matches D1/D3 and the "committed move stands, exit non-zero" contract.
- `delivery` is persisted in a second `saveState` before the rename attempt — matches the brief's "before anything else happens".
- `retryable` moved verbatim to `shell.ts`; `herdrCall` retries once only on `CommandError` with a retryable code, warns with structured fields — matches D3/D4.
- `failureSchema.parse(state.failure)` in `announceFailed` throws rather than silently skipping when the invariant breaks — consistent with boundary parsing.
- No AREA.md files in the diff; `docs/guide/in-practice.html`'s "failed leaf shows a herdr notification" remains true (notification now fires at the transition).
- Tests assert observable contracts (exact argv, persisted state, exit codes), not prose; the fake is a boundary double, not a mock of the unit under test.

## Findings

None. Two observations below Nit threshold: the fake validates `--body`/`--sound` only when present (keeps `observeBusy` legacy calls working — intentional, noted in report); `herdrCalls` duplicates `next.test.ts`'s `calls()` pattern across files (test-local, acceptable).

## Verdict

ready
