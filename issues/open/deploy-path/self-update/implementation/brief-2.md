# Sub-brief 2: phase-committed (plan U2, wave 1)

## 1. Goal

`phaseCommand` in `src/phase.ts` returns the committed phase so the caller can tell a move landed at `merged`. Plan decision D5.

## 2. Acceptance criteria

1. `phaseCommand`'s return type becomes `{ repo: Repo; committed: boolean; to?: Phase }`.
2. `to` is set by the existing `onCommitted` closure: change it to also record `committedTo = requested` (every call site that passes `onCommitted` transitions to `requested`; verified). The two paths that set `committed = true` directly without a move — the `--red-on-base` hold (~line 857) and the batch split (~line 942) — must leave `to` undefined.
3. `MoveCommittedError` is unchanged; it already carries `to`.
4. `bun test tests/phase.test.ts tests/merge-attempts.test.ts tests/batch-merge.test.ts tests/next.test.ts --timeout=30000` passes; no test file is edited.
5. `bun run typecheck` passes.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/phase.ts:774-951` — `phaseCommand` body; `onCommitted` at ~813; hold path ~847-870; culprit ~912; split ~937.
- `src/phase.ts:228` (`transition`) and `:132` (`commitMove`) — confirm `onCommitted` always accompanies `to === requested`.
- `src/akrogon.ts:59-84` — the caller that will consume `to` (do not edit it).

## 4. Change list and needed interfaces

Owns: `src/phase.ts` only.
- Add `let committedTo: Phase | undefined;` beside `committed`; set it inside `onCommitted`.
- Return `{ repo, committed, to: committedTo }`.
- Do not change `commitMove`/`transition` signatures: `onCommitted` stays `() => void`.

## 5. Do-not, reasons and exceptions

- Do not edit `src/akrogon.ts`, `src/next.ts`, tests, or docs — other units own them.
- Do not add `to` where no move was committed (hold/split) — the consumer distinguishes a committed `merged` move from a bare commit by exactly this field.
- If any `onCommitted` call site turns out not to commit `requested`, return a mismatch naming the site; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the listed ranges.
2. Make the change.
3. Run `bun install` if needed, then the section-7 commands.
4. Commit `src/phase.ts` alone. Size: 1 file, ~4 turns.

## 7. Commands

```
AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Return type updated, `to` populated exactly on committed moves. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
