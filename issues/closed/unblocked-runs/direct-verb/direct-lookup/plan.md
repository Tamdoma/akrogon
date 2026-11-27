# Plan: direct-lookup

Delivers Tamdoma/akrogon#162 and #163. Brief and design agree, so no conflict note is needed.

## Read first

- `docs/reference-index.md` (grounding index) and `src/AREA.md` (the `src/direct.ts` and `src/hc.ts` lines)
- `docs/reference/commands.md` (the `akrogon direct` row)
- `src/direct.ts` (`probeExactlyOne`, `directCommand`)
- `src/state.ts:227` (`slugLeafFolders`), `src/park.ts:14` (`issueFolders`)
- `src/hc.ts:305` (`terminalIfPresent`)
- `tests/direct-create.test.ts`, `tests/hc-fixture.ts` (`hcCore`, `link`)
- `learnings/LESSONS.md`: no lesson covers hc session lookup or the owner walk.

## Decisions

- D1. Seat A is `{session: HC_SESSION, address: HC_TERMINAL_ID}`. `directCommand` reads `process.env.HC_SESSION` right after the `HC_TERMINAL_ID` check and refuses with a message naming `HC_SESSION` when it is unset or blank.
- D2. Seat B is `{session: HC_SESSION, address: --reviewer}`. One private helper in `src/direct.ts`, `liveSeat(session, address, label): Promise<SeatRef>`, calls `terminalIfPresent(session, address)` and throws `` `${label}: not a live terminal in HC_SESSION ${session}` `` unless the result has `state === 'live'`. A null result (absent socket, not found) and a non-live state both refuse. Other `HcError`s propagate unchanged.
- D3. Both seats are resolved once, at the top of `directCommand`, before `directLeafPath`. This replaces the two later `probeExactlyOne(reviewerAddress, ...)` calls, so the create path and the rerun path both refuse before any read of the leaf folders and before any write.
- D4. `probeExactlyOne` is deleted. The `./hc` import becomes `terminalIfPresent` only (`HcError`, `sessions` and `terminal` drop).
- D5. `slugLeafFolders` iterates `issueFolders(repo.root, \`issues/${area}\`)` for `area` in `open`, `closed`. This answers the design's open question: `issueFolders(root, area)` takes the repo root plus the relative path `issues/open` or `issues/closed`. It already returns `[]` for a missing area, so the `existsSync(root)` guard goes. The open-draft and closed-with-`state.yaml` rule stays.
- D6. Test edits: the `direct()` helper in `tests/direct-create.test.ts` passes `HC_SESSION: f.core.session` per call, and a case can override or unset it. `tests/direct-land.test.ts` passes `HC_SESSION: seats.A.session` on its `akrogon direct` call. The old test `direct refuses a reviewer two live sessions resolve` is deleted because its expectation is now false: an address live in two sessions resolves to the caller's. Its replacement is the C1 test. `tests/hc-fixture.ts` is unchanged.
- D7. Docs: `src/AREA.md`, `docs/reference/commands.md` and `docs/reference-index.md` say seats resolve in the caller's `HC_SESSION`. The index's Command line names direct's seat lookup as the exception to "every hc call pins `HC_SESSION` to the resolved repo session".

Model-choice criteria: none. No model or paid call, no credentials (`akrogon status direct-lookup` shows no `Missing:` lines), and no restart boundaries (every run takes seconds).

## Interfaces

- CLI unchanged: `akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...`
- `state.yaml` `seat.A`, `seat.B` keep `{session, address}`, with both sessions now equal to `process.env.HC_SESSION`.
- `terminalIfPresent(session: string, address: string): Promise<Seen | null>` from `src/hc.ts`, unchanged.
- `issueFolders(root: string, area: string): string[]` from `src/park.ts`, unchanged.

## Waves

Wave 1 has two units with disjoint paths. They share no live resource: each test makes its own throwaway hc cores. Neither depends on the other.

- U1 code. Owns `src/direct.ts` and `src/state.ts`. Implements D1–D5. Prerequisite: the test commit is already on the branch. Proof: C1–C3 below.
- U2 docs. Owns `src/AREA.md`, `docs/reference/commands.md` and `docs/reference-index.md`. Implements D7. Prerequisite: none.
  - `src/AREA.md`: the `src/direct.ts` line changes from "each probed live in exactly one live session — zero or more refuse" to "each checked live in the caller's `HC_SESSION`, refused when `HC_SESSION` is blank or either is not live there". The `src/hc.ts` line's `probeTerminal` sentence gets direct's lookup through `terminalIfPresent` in the caller's session.
  - `docs/reference/commands.md`: in the `akrogon direct` row, "either address does not resolve as a live terminal in exactly one live session" becomes "`HC_SESSION` is blank or either address is not a live terminal in the caller's `HC_SESSION`".
  - `docs/reference-index.md`: the Command line notes that direct's seat lookup uses the caller's own `HC_SESSION`.
  - No other agent or human doc is affected. Skills call `akrogon direct` without naming sessions.

## Criteria, observations and proofs

All tests are committed on the leaf branch before product code. The proof command for C1–C3 is the configured `test` check, which runs the whole suite and then reruns each changed test file 5 times. The direct command per criterion is listed below. Every observation takes seconds. The rerun trigger is any change to `src/direct.ts`, `src/state.ts`, `src/hc.ts` or `tests/direct-create.test.ts`.

### C1: both seats resolve in the caller's session when another session holds the same addresses

- Boundary: the CLI against two real fixture cores in one runtime dir (`f.core` plus `secondSession` linked). Both cores hand out `t1` and `t2`, so the same addresses are live in both sessions.
- Before: on base, the command refuses with `HC_TERMINAL_ID t1: the terminal resolves in 2 live sessions`. After: create writes `seat.A` and `seat.B` with `session = f.core.session`. A rerun with `HC_SESSION = other.session` rewrites both to `other.session`.
- Product failure caught: #162, where a door can't create a leaf while other herdr sessions are open. Also misbinding to the repo session instead of the caller's.
- Test: `tests/direct-create.test.ts`, "direct resolves both seats in the caller HC_SESSION when another live session holds the same addresses".
- Command: `akrogon run-check --name c1 -- bun test --timeout=120000 tests/direct-create.test.ts -t "caller HC_SESSION when another live session"`
- Conditions checked:
  - Seat sessions come from the caller's `HC_SESSION` (D1, D2). The case is this test. Violation V1 (base cross-session scan) gives red: `error: HC_TERMINAL_ID t1: the terminal resolves in 2 live sessions (akt1999e-20, akt1999e-5)` (`check red-v1-base: 1 .../implementation/check-red-v1-base-1795648260692-2111336.log`). Violation V2 (temporary edit: both seats resolved in `repoSpace(repo).session`, the rejected alternative) gives red at the rerun assertion, `expect(received).toEqual(expected)` (`check red-v2-repospace: 1 .../implementation/check-red-v2-repospace-1795648262217-2115106.log`).
  - The rerun rewrites both seats (D3). The value is made once per invocation at the top of `directCommand` and is used by `rewriteSeatRefs` in that same invocation. There is no loop and no carried state. The rerun half of this test covers it, and V2 shows it red.

### C2: refusals before any write

- Boundary: the CLI with one or two fixture cores. Each case asserts nonzero exit, stderr naming what is missing, no `state.yaml`, no worktree and no branch.
- Product failure caught: silent misbinding to a terminal in another session, or a partial leaf left behind after a refusal.
- Tests in `tests/direct-create.test.ts`:
  - "direct refuses an HC_SESSION that is blank, nothing written" and "... unset ..." (stderr contains `HC_SESSION`)
  - "direct refuses a caller address live only in another session, nothing written" (stderr contains the address, `f.core.session` and `HC_TERMINAL_ID`)
  - "direct refuses a reviewer address live only in another session, nothing written" (stderr contains the address, `f.core.session` and `reviewer`)
  - Existing tests "direct refuses a dead HC_TERMINAL_ID" and "direct refuses a reviewer address dead in every live session" keep covering not-live in a single session.
- Command: `akrogon run-check --name c2 -- bun test --timeout=120000 tests/direct-create.test.ts -t "refuses"`
- Conditions checked:
  - Refuse when `HC_SESSION` is blank or unset, with no fallback scan (D1). Violation V1 (base, which ignores `HC_SESSION`) makes both cases red: `expect(received).not.toBe(expected)` on the exit code, because base created the leaf (red-v1-base log above).
  - Refuse even when another session holds the address live (D2). In the caller and reviewer cases the other session's `t1` and `t2` are ended, so only `t3` is cross-session and the base scan resolves it uniquely. V1 makes both red with `expect(received).not.toBe(expected)` (red-v1-base log).
  - The reviewer is checked live (D2). Violation V3 (temporary edit: reviewer ref built without `liveSeat`) gives red in both reviewer cases (`check red-v3-reviewer-unchecked: 1 .../implementation/check-red-v3-reviewer-unchecked-1795648263690-2118032.log`).
  - Nothing is written before a refusal (D3). Violation V6 (temporary edit: reviewer check moved after `createSparseWorktree`) gives red, `expect(received).toBe(expected)` on the worktree or branch absence, in both reviewer cases (`check red-v6-late-check: 1 .../implementation/check-red-v6-late-check-1795648265135-2121248.log`).
  - The rerun path refusal is covered by tracing. D3 puts both checks before `directLeafPath`, so a rerun refuses before `withLock`/`rewriteSeatRefs`. No write happens between the check and the refusal.

### C3: plain files beside owner folders

- Boundary: the CLI with `issues/open/README.md` and `issues/closed/legacy-note.md` beside owner folders.
- Before: on base, `ENOTDIR: not a directory, stat '.../issues/open/README.md/fix-alpha'` (red-v1-base log). After: a drafted open direct leaf is created (`direct: true`, phase `implement`). After the owner moves to `issues/closed` as merged, a rerun rewrites `seat.B`.
- Product failure caught: #163, where legacy plain files block the direct route.
- Test: `tests/direct-create.test.ts`, "plain files beside owner folders: direct creates an open leaf and reruns a closed one".
- Command: `akrogon run-check --name c3 -- bun test --timeout=120000 tests/direct-create.test.ts -t "plain files beside owner folders"`
- Conditions checked: the open-draft and closed-with-state rule stays (D5). The existing "no open folder holds the slug", "two owner folders" and "merged leaf in issues/closed" tests keep covering it.

### Existing direct-land rerun

- `tests/direct-land.test.ts` "a pending broadcast keeps cleanup held for a replacement reviewer" now passes `HC_SESSION`.
- Command: `akrogon run-check --name land -- bun test --timeout=120000 tests/direct-land.test.ts -t "replacement reviewer"`

### C4: docs

The reviewing seat reads `src/AREA.md`, `docs/reference/commands.md` and `docs/reference-index.md` (U2). They must contain no "exactly one live session" claim, and the index must not claim that every hc call pins the repo session.

### Planning evidence

- With temporary D1–D5 code applied and then discarded, the whole of `tests/direct-create.test.ts` passed 19 of 19: `check green-temp-impl: 0 .../implementation/check-green-temp-impl-1795648239690-2090523.log`. The direct-land case passed: `check green-temp-land: 0 .../implementation/check-green-temp-land-1795648242141-2093278.log`.
- The intended red for each new test on base: `check red-c1-c2-c3: 1 .../implementation/check-red-c1-c2-c3-1795648199989-2059100.log`. That run predates the kill edit to the caller and reviewer cases. `red-v1-base` is the current red.
- Log paths are under `/home/ivan/Work/infra/akrogon/issues/open/unblocked-runs/direct-verb/direct-lookup/`.

## Open limitation

A door can no longer name a reviewer that lives only in another session. This is C's standing dissent, and the design accepted it.

## Implementation notes
