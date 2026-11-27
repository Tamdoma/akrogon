# Brief 1: direct seat lookup in the caller's session, owner walk over folders

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/direct-lookup-u1`, created detached at `b862819a5a7ace4579ba61ae9907e21b8f5ad808`.

## 1. Goal

Make `akrogon direct` resolve both seats in the caller's own `HC_SESSION` instead of scanning every live session (#162). Make `slugLeafFolders` skip plain files under `issues/open` and `issues/closed` (#163). This unit covers plan decisions D1–D5.

## 2. Numbered acceptance criteria

The planned tests are already committed in `tests/direct-create.test.ts` and `tests/direct-land.test.ts`. Run them. Do not edit them.

1. C1: "direct resolves both seats in the caller HC_SESSION when another live session holds the same addresses" passes. Create records `seat.A` and `seat.B` with `session = HC_SESSION`, and a rerun from another `HC_SESSION` rewrites both seats to that session.
2. C2: the cases "direct refuses an HC_SESSION that is blank/unset", "direct refuses a caller/reviewer address live only in another session", "direct refuses a dead HC_TERMINAL_ID" and "direct refuses a reviewer address dead in every live session" pass. Each must exit nonzero with no state, worktree or branch written. Stderr must name `HC_SESSION` for the blank and unset cases. For the address cases, stderr must name the address, the session and `HC_TERMINAL_ID` or `reviewer`.
3. C3: "plain files beside owner folders: direct creates an open leaf and reruns a closed one" passes. On base it fails with ENOTDIR.
4. Every other test in `tests/direct-create.test.ts` stays green, and so does the `tests/direct-land.test.ts` case "a pending broadcast keeps cleanup held for a replacement reviewer".

## 3. Read-first list

- `src/direct.ts`: `probeExactlyOne` and `directCommand`.
- `src/state.ts:227`: `slugLeafFolders`.
- `src/park.ts:14`: `issueFolders(root, area)` lists directory names only and returns `[]` for a missing path.
- `src/hc.ts:305`: `terminalIfPresent(session, address): Promise<Seen | null>`. It returns null for an absent socket or a not-found terminal and rethrows other `HcError`s.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

`src/direct.ts`:

- Delete `probeExactlyOne`.
- Add one private helper:

  ```ts
  async function liveSeat(session: string, address: string, label: string): Promise<SeatRef> {
    const found = await terminalIfPresent(session, address);
    if (found?.state !== 'live') throw new Error(`${label}: not a live terminal in HC_SESSION ${session}`);
    return { session, address };
  }
  ```

  Type `found` explicitly, as `Seen | null`, if `Seen` is exported. Otherwise leave it inferred.
- In `directCommand`, right after the `HC_TERMINAL_ID` check:
  - read `process.env.HC_SESSION`
  - refuse when it is unset or blank, with `'akrogon direct runs inside an hc terminal: HC_SESSION is not set'`
  - set `caller = await liveSeat(session, callerAddress, \`HC_TERMINAL_ID ${callerAddress}\`)`
  - set `reviewer = await liveSeat(session, reviewerAddress, \`the reviewer address ${reviewerAddress}\`)`

  Both run before `directLeafPath`.
- Remove the two later `probeExactlyOne(reviewerAddress, …)` calls, on the rerun path and the create path. Both paths use the `reviewer` resolved at the top.
- Change the `./hc` import to `terminalIfPresent` only, plus `type Seen` if you use it.

`src/state.ts` `slugLeafFolders`:

- Iterate `for (const owner of issueFolders(repo.root, \`issues/${area}\`))`.
- Drop the `existsSync(root)` guard.
- Keep `root` for the candidate path and keep the existing `statSync(...).isDirectory() && (area === 'open' || existsSync(state.yaml))` rule.
- `issueFolders` is already imported. If `readdirSync` becomes unused in the file, remove it from the import.

Owned paths: `src/direct.ts`, `src/state.ts`. Nothing must land first. This unit shares no test resource with unit 2, because each test makes its own hc cores.

Shapes: `SeatRef = { session: string; address: string }`. `state.yaml` seat refs keep that shape.

## 5. Do-not, reasons and exceptions

- Do not use `terminal` or `probeTerminal`. `terminal` boots a dead core, and `probeTerminal` hides every `HcError`. Exception: a revised brief from A.
- Do not edit `src/hc.ts`, `src/next.ts`, `src/reconcile.ts` or any test file. They are out of scope, tests are locked, and the seat-ref consumers need no change. A wrong or red planned test is returned as a mismatch.
- Do not add a fallback scan when `HC_SESSION` is unset. The design rejected it because it would silently bind the wrong terminal.
- Do not edit docs. Unit 2 owns them.
- Never run any `git stash` subcommand. Every worktree shares one stash. To check behaviour on base, use a second worktree of the base instead. To set work aside, commit a WIP commit. Before returning, run `git reset --soft b862819a5a7ace4579ba61ae9907e21b8f5ad808` and make one commit for the unit.
- Do not stop processes by pattern (`pkill -f` and the like). Use `akrogon stop-run <run-id>`.

To restate the reasons: the forbidden helpers have unsafe side effects, tests and other files are locked or out of scope, a scan fallback would misbind seats, and the stash is shared. The only exception is a revised brief from A, which you get by returning a mismatch with evidence.

## 6. Ordered steps

1. Run `bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Edit `src/direct.ts` (criteria 1, 2).
3. Edit `src/state.ts` (criterion 3).
4. Run `bun run typecheck` and `bunx prettier --check src`.
5. Run the targeted tests below and confirm they are green.
6. Make one commit with message `Resolve direct seats in the caller's HC_SESSION and walk only owner folders`. Add no co-author line.

Advisory size: 2 files and under 10 turns.

## 7. Commands

- `akrogon run-check --name u1-direct-create -- bun test --timeout=120000 tests/direct-create.test.ts`
- `akrogon run-check --name u1-direct-land -- bun test --timeout=120000 tests/direct-land.test.ts -t "replacement reviewer"`
- `bun run typecheck`

## 8. Done-when, evidence and report

Done when both run-check commands exit 0 and typecheck is clean. Cite each `check <label>: <exit> <path>` line. Return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
