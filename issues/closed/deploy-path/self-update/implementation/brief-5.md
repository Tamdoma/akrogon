# Sub-brief 5: wiring (plan U5, wave 3)

## 1. Goal

Wire `selfUpdate` into the merge wake and `akrogon next` triggers. Plan decisions D5-D8. Depends on landed lane work: `src/self-update.ts` exports `selfUpdate(repo, ownRoot = toolRoot, home = homedir())` (never throws, one line), and `phaseCommand` returns `{ repo, committed, to?: Phase }`.

## 2. Acceptance criteria

1. `src/akrogon.ts` `phase` case: `committed` records `{ repo, to? }` from `result` or `MoveCommittedError`; `mergeWake(readGlobal(), committed.repo, committed.to)`.
2. `src/next.ts` `mergeWake(global, repo, committedTo?: Phase, pressureDir = '/proc/pressure')`: `await selfUpdate(repo)` is the first statement inside the existing `try`, before the pause-check `withLock`, gated on `committedTo === 'merged'`.
3. `src/next.ts` `nextCommand`, after the `selection` computation and before the global-lock `withLock` (~line 1447-1448): `input === '--all' || input === '--resume'` → `selfUpdate` for every repo of `registeredRepos(global, invocation).repos`; `selection !== undefined` (manual next) → `selfUpdate(selection.repo)` once. Hooked/tab_closed paths produce neither → no call. The step's own line is the only behind output; add no extra printing.
4. New tests in `tests/next.test.ts` using `mock.module` on `../src/self-update.ts` (spawned-script pattern already in this file ~line 1638, and `phaseBody`/`nextBody` in `tests/merge-attempts.test.ts` ~line 212): (a) `phase <slug> merged` through `src/akrogon.ts` entry with a mocked self-update recorder → recorded exactly once, repo = fixture repo; assert `moved merged` and exit 0; (b) same entry moving to a non-merged committed phase (e.g. `failed` with `--reason` and a valid prior phase) → zero recorded calls; (c) mocked `selfUpdate` that throws → `phase` still exits 0 with `moved merged`, and `next` still dispatches (criterion 7); (d) `next --all` and `next --resume` and manual `next` on a leaf in the repo → recorded with the selected/registered repos, called before dispatch output.
5. `bun test tests/next.test.ts --timeout=30000` and `bun run typecheck` pass.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/akrogon.ts:59-92` — phase and next cases.
- `src/next.ts` — `mergeWake` (~1287), `nextCommand` selection → lock boundary (~1437-1448), `registeredRepos` (~195), `dispatchFixture` usage.
- `src/phase.ts:774-951` — where `to` comes from.
- `src/self-update.ts` — consumed signature (read it on your worktree HEAD).
- `tests/next.test.ts` — `dispatchFixture`, `next()` helper (~:64), spawned-script mock pattern (~:1638-1660).
- `tests/fake-herdr.ts`, `tests/helpers.ts` — `cli`, `leaf`.

## 4. Change list and needed interfaces

Owns: `src/akrogon.ts`, `src/next.ts`, `tests/next.test.ts`.
Consumed (verify on HEAD, do not redefine):
```ts
export async function selfUpdate(repo: Repo, ownRoot?: string, home?: string): Promise<void>;
// phaseCommand -> { repo: Repo; committed: boolean; to?: Phase }
export async function mergeWake(global: GlobalConfig, repo: Repo, committedTo?: Phase, pressureDir?: string): Promise<void>;
```
Note `mergeWake`'s signature gains `committedTo` before `pressureDir`; update its only other caller if any exist (grep `mergeWake(`).

## 5. Do-not, reasons and exceptions

- Do not edit `src/self-update.ts`, `src/install.ts`, `src/phase.ts`, other test files, or docs.
- Do not add output lines, config keys, flags, or state fields; per-pane hooked events stay non-triggers.
- Do not let `selfUpdate` run inside the global lock — call sites sit before the `withLock` boundary so its fetch/line precede dispatch output.
- If the consumed interfaces differ from section 4, return a mismatch; the exception is a revised brief from A.

## 6. Ordered steps

Derive tests before code. Size: ~3 files, ~12 turns.
1. Write the four mocked-module tests in `tests/next.test.ts`.
2. Make the three source edits.
3. Run `bun install` in your worktree if needed, then section-7 commands.
4. Commit `src/akrogon.ts`+`src/next.ts` in one commit and `tests/next.test.ts` in a second commit with trailer `Test-Change: tests/next.test.ts added self-update wiring cases; no existing expectation changed`, or one commit carrying the trailer — match the final trailer-block rule in `src/test-files.ts` (`tests/` paths match).

## 7. Commands

```
AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000
bun test tests/next.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Wiring lands, mocked-call tests green, existing next/merge tests untouched and green. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
