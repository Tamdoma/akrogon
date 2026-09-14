# Report 4: repair remaining test failures

## Changed files and reasons

- tests/pull.test.ts: deleted concurrent pulls serialize test. Serialization was the deleted repo lock single function; design accepts interleaved pulls.
- tests/next.test.ts stale prompt test: rewritten for no peer fallback. working+stale no prompt attempts 1; idle+done no prompt; cleared prompts 2 attempts 2; stale+idle prompts 3 attempts 3; stale+idle fails. All prompts pane B.
- tests/next.test.ts unknown panes wait test (retitled): final saveDatabase sets agent fake on every pane; null agent clears busy_since.
- tests/next.test.ts unreadable state test: retry max_active 4 not 3; total 2 leaves + 1 unreadable = 3, cap 3 still blocks.
- tests/next.test.ts merge ancestry test: rewritten without auto-recovery. Merge A idle prompts A, phase stays merge; then phase merged from worktree completes and next --all cleans up.
- tests/next.test.ts left to the merge seat test (retitled): dirty merge A idle prompts A, phase merge, file intact. No error.
- tests/next.test.ts live merge test: A working 61-min busy, next --all no prompt sets busy_notified.A, phase merge; then phase merged completes. B iteration dropped.
- tests/next.test.ts blocked non-merge seat test (new; loop kept for A only): B blocked, A idle prompts A, busy_since.B set, phase merge, file intact.

No src, docs, helpers, or fakes edits.

## Tests run

bun run typecheck: pass.

Changed run: 194 pass, 0 fail, 194 tests across 8 files, 91.01s.

Targeted: 6 rewritten next tests pass; blocked non-merge passes; kept blocked A passes in full run.

## Known limitations

None known beyond plan open limitation.

## Unverified criteria

None. Criterion 2 now green.
