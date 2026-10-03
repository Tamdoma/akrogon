# Brief 1: stale-tab rename tolerance in `src/phase.ts`

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/phase-stale-tab-u1` (detached at `69038ef`). Install deps there first (`bun install`).

## 1. Goal

Make `akrogon phase` treat a `tab_not_found` herdr error from `herdr tab rename` as an absent tab: warn once, continue, exit 0 when the rest succeeds. Implements plan.md decisions D1–D7 of leaf `phase-stale-tab`. Ref: Tamdoma/akrogon#55 (a closed tab made `phase` exit 1 and broke `phase && next`).

## 2. Acceptance criteria

Tests live in `tests/phase.test.ts` against `tests/fake-herdr.ts`, which already returns `tab_not_found` for an unknown tab id:

1. Leaf in `failed` with `tab: 'tab-1'`, fake herdr `tabs: []`; `phase <slug> implement` exits 0, `state.phase === 'implement'`, `state.tab === 'tab-1'` unchanged, `issues/log.jsonl` gains one row, `herdrCalls` is exactly `[['tab','rename','tab-1','<slug>']]` (one call, no retry), and stderr contains exactly one JSON warning line whose parsed fields include `slug`, `command: ['herdr','tab','rename','tab-1','<slug>']`, `code: 'tab_not_found'`, `message` equal to herdr's message, and `stderr` set.
2. Leaf in `implement` with `tab: 'tab-1'`, `tabs: []`; `phase <slug> failed --slot A --reason x` exits 0, `failure.delivery === 'shown'`, calls are one `notification show` plus exactly one rename, the same warning shape, one log row.
3. Same as 2 plus `failNotification: true`: non-zero exit carrying the notification error (`fixture_notification_failed`), `failure.delivery === 'error'`; the stale-tab warning must not overwrite the notification error.
4. A rename failure with any other code keeps today's handling: with new `renameScript: [{ code: 'fixture_rename_denied', message: 'denied' }]` and live `tab-1`, `phase <slug> implement` exits non-zero, stderr contains `fixture_rename_denied`, exactly one rename call (no retry). The existing `failRename` (`timeout`) tests asserting two calls and non-zero exit must pass unchanged.

## 3. Read-first list

`src/phase.ts` (`herdrCall`, `announceFailed`, `commitMove`), `src/shell.ts` (`CommandError`, `herdrError`, `retryable`, `herdr`), `tests/phase.test.ts` (`herdrCalls` helper, the `failed announce renames tabs` test near line 1230), `tests/fake-herdr.ts` (`scriptEntrySchema`, the `tab rename` handler), `tests/helpers.ts` (`leaf`, `cli`, `fakeHerdr`). Pattern to copy: `herdrCall`'s `console.warn(JSON.stringify({warning, slug, command: ['herdr', ...args], ...}))` retry warning. Also read `ponytail.md` in this skill folder.

## 4. Change list and needed interfaces

Owned paths: `src/phase.ts`, `tests/fake-herdr.ts`, `tests/phase.test.ts`. Nothing lands first; no shared test resource.

- `src/phase.ts`: add one `renameTab(tab: string, label: string, slug: string)` helper that calls `herdrCall(['tab','rename',tab,label], z.object({ tab: z.object({ label: z.string() }) }), slug)` inside a targeted catch: when `error instanceof CommandError && herdrError(error.result).code === 'tab_not_found'`, emit one `console.warn(JSON.stringify({ warning, slug, command: ['herdr','tab','rename',tab,label], code, message, stderr }))` (code/message from `herdrError(error.result)`, `stderr` from `error.result.stderr`) and return; rethrow everything else. Replace both inline `herdrCall(['tab','rename',...])` call sites (in `announceFailed` and in `commitMove`) with `renameTab`. `herdrCall` stays untouched; `tab_not_found` is not in `retryableCodes`, so it throws on the first call (no retry). In `announceFailed`, the swallowed error must not assign `lastError`, preserving a prior notification error.
- `tests/fake-herdr.ts`: add `renameScript: z.array(scriptEntrySchema).default([])` to `databaseSchema`; in the `tab rename` handler, run `scriptedFailure(db.renameScript.shift())` before the `failRename` check, keeping `tab_not_found`-for-unknown-tab first.
- `tests/phase.test.ts`: add the four tests above, extending the existing `failed announce renames tabs...` style (fixtures, `leaf()`, `herdrCalls`, `readState`, `issues/log.jsonl`).

Interfaces: `CommandError.result` is `{ code, stdout, stderr }`; `herdrError(result)` returns `{ code, message }` parsed from `result.stderr` JSON, falling back to `{ code: 'exit <n>', message }`. Real herdr 0.9.3 emits `{"error":{"code":"tab_not_found","message":"tab <tab> not found"},"id":"cli:tab:rename"}`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/next.ts`, `retryableCodes`, `herdrCall`'s retry logic, or `state.tab` clearing: next owns allocation; the plan forecloses tab recreation and `state.tab` edits.
- Do not retry `tab_not_found` or warn twice: criterion 1 asserts exactly one rename call.
- Do not swallow `tab_not_found` inside `herdrCall` or in notification calls: the tolerance applies only to tab renames, per the locked design.
- Do not weaken or rewrite existing tests; the `failRename` timeout tests must pass unchanged.
- Do not change interfaces or add abstractions beyond the one helper; return a mismatch with evidence to the plan author instead of changing scope — the only exception is a revised brief from A.
- Do not add docstring-heavy edits; follow existing terse style.

Reasons restated: scope is the two rename sites plus fixture plus tests; anything wider reopens a locked decision or fails criterion assertions. Exception to every exclusion: a revised brief from A authorizing it.

## 6. Ordered steps

1. Write the four new tests first (criteria 1–4) in `tests/phase.test.ts`; run them, expect red.
2. Add `renameScript` to `tests/fake-herdr.ts`.
3. Add `renameTab` and swap both call sites in `src/phase.ts`.
4. Run `bun test tests/phase.test.ts` until green, then the Commands section command.

Advisory size: about 3 files, under 20 turns.

## 7. Commands

`AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377 && bun test --changed="$AKROGON_BASE" --timeout=30000` (run in the worker worktree). If `--changed` behaves oddly, `bun test tests/phase.test.ts` is acceptable with a note.

## 8. Done-when, evidence and report

All four criteria proven by the new tests, existing tests green, commit your chunk on the detached HEAD. Report the commit ID plus:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
