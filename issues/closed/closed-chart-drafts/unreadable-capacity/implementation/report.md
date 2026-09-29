# Implementation report: unreadable-capacity

## Changed files and reasons

- `src/next.ts` (`activeCount` only): replaced the unreadable branch that counted every non-failed leaf with one shared live predicate plus `inventory.unreadable`. Unknown hold stays full. Covers plan C1.
- `tests/next.test.ts`: updated three capacity tests to new counts (C2, C3, C4) and added regression plus negative tests (C5, C6). Failed, existing-tab, duplicate-slug, foreign-summary, and unknown cases keep passing (C7).

Worker commit `4d0a7e7` cherry-picked as lane `60ab468`. Format follow-up `0a55e38` collapsed the ternary to one line. No other files touched.

## Commands run with results

Worker changed tests in worker worktree:

```text
AKROGON_BASE=53508e807128de2a77b22cf4874e266224cf4f0e bun test --changed="53508e807128de2a77b22cf4874e266224cf4f0e"
136 pass, 0 fail, 1198 expect calls, 1 file
```

Red before src fix in worker worktree (targeted runs):

```text
(fail) merged leaves do not reserve capacity for other waiting leaves - other worktree undefined
(fail) unreadable state reserves its capacity - tabs 0 not 1
(fail) bad YAML capacity 4 - tabs 1 not 2
(fail) unreadable leaves reserve capacity while foreign - healthy worktree undefined
(pass) bad YAML capacity 3 unchanged
(pass) max_active 1 negative passes pre-fix as expected
```

Lane changed tests after cherry-pick:

```text
AKROGON_BASE=53508e807128de2a77b22cf4874e266224cf4f0e bun test --changed="53508e807128de2a77b22cf4874e266224cf4f0e"
136 pass, 0 fail, 1198 expect calls, 1 file
```

Blocking checks in lane worktree:

```text
bun run format - changed src/next.ts ternary to one line, rest unchanged
bun run typecheck - clean, no output, exit 0
```

Standing-design real CLI run with retained output outside repo:

```text
command: bun test tests/next.test.ts > /tmp/unreadable-capacity-next-20260929.log 2>&1
exit: 0
artifact: /tmp/unreadable-capacity-next-20260929.log
result: 136 pass, 0 fail, 1198 expect calls, 1 file
```

Full suite in lane worktree:

```text
bun test
328 pass, 0 fail, 3874 expect calls, 15 files
```

## Base and head

- Base: 53508e807128de2a77b22cf4874e266224cf4f0e
- Head: 0a55e38 format activeCount line (on branch unreadable-capacity)

## Known limitations

- An unreadable entry reserves one slot even when the corrupt file holds a merged leaf. The count cannot tell merged from active without reading the file. Same as plan open limitation.

## Unverified criteria

- None. C1 through C9 verified by the runs above.
