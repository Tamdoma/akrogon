# Implementation report: direct-lookup

- Base: `15582bcdcfd1f14ab30f11fee4333a7da6a4871d` (origin/main). The refresh at the start and at the end left the branch where it was, so no move is recorded.
- Committed head: `364d4e696223e8c7b16ae6299f6db093d32e1518`.
- Mode: delegated, `implement: subagents`. One wave with two units, U1 (code) and U2 (docs). Briefs: `implementation/brief-1.md`, `implementation/brief-2.md`. Both worker worktrees were removed after cherry-pick.

## Commits

- `b862819a` tests (plan.synthesis)
- `64d2f2b1` U1: `src/direct.ts`, `src/state.ts`
- `de7194ef` U2: `src/AREA.md`, `docs/reference/commands.md`, `docs/reference-index.md`
- `364d4e69` A: `src/AREA.md` kept at 40 lines

## Changed files and reasons

- `src/direct.ts`: `probeExactlyOne` and its cross-session scan are deleted (D4). The new `liveSeat(session, address, label)` checks `terminalIfPresent(...)?.state === 'live'` (D2). `directCommand` refuses an unset or blank `HC_SESSION`, then resolves the caller and the reviewer in that session before `directLeafPath`. The create path and the rerun path both use the one `reviewer` (D1, D3). The `./hc` import is now `terminalIfPresent, type Seen`.
- `src/state.ts`: `slugLeafFolders` iterates `issueFolders(repo.root, \`issues/${area}\`)`, so plain files are skipped (D5).
- `src/AREA.md`:
  - The `src/direct.ts` line says seats are checked live in the caller's `HC_SESSION`.
  - The `src/hc.ts` line says `akrogon direct` uses `terminalIfPresent` in the caller's own session (D7).
  - The file was 41 lines at base. A joined two short Non-obvious-pattern bullets into one line, without changing their wording, so the file meets the 40-line AREA rule.
- `docs/reference/commands.md`: the `akrogon direct` row's refusal and seat-ref wording now names the caller's `HC_SESSION` (D7).
- `docs/reference-index.md`: the Command line names direct's seat lookup as the exception to the repo-session pin (D7).

## Proofs

| Criterion | Test / evidence | Command | Commit | Result |
|---|---|---|---|---|
| C1 | `tests/direct-create.test.ts` "direct resolves both seats in the caller HC_SESSION when another live session holds the same addresses" | `akrogon run-check --name c1-c2-c3 -- bun test --timeout=120000 tests/direct-create.test.ts` | `364d4e69` | 19 pass, 0 fail. `check c1-c2-c3: 0 .../implementation/check-c1-c2-c3-1795648452559-2538377.log` |
| C2 | the blank and unset `HC_SESSION` cases, the caller and reviewer live-only-in-another-session cases, dead `HC_TERMINAL_ID`, dead reviewer | same run | `364d4e69` | green, same log |
| C3 | "plain files beside owner folders: direct creates an open leaf and reruns a closed one" | same run | `364d4e69` | green, same log |
| C1 (existing direct-land rerun) | `tests/direct-land.test.ts` "a pending broadcast keeps cleanup held for a replacement reviewer" | `akrogon run-check --name land -- bun test --timeout=120000 tests/direct-land.test.ts -t "replacement reviewer"` | `364d4e69` | 1 pass. `check land: 0 .../implementation/check-land-1795648454700-2540427.log` |
| C4 | The reviewing seat reads `src/AREA.md`, `docs/reference/commands.md` and `docs/reference-index.md`. `grep -n "exactly one live session"` over the three prints nothing. | — | `364d4e69` | for B |
| all checks | `akrogon verify` (setup, format, typecheck, test) | `akrogon verify` | `364d4e69` | `verify leaf 364d4e69...: green`. Wall time 128 s. |

The fail-before evidence (#162 two-session refusal, #163 ENOTDIR) and the red runs for each condition are in `plan.md`, under C1–C3.

Worker runs: `check u1-direct-create: 0 .../implementation/check-u1-direct-create-1795648413862-2514566.log` (19 pass), `check u1-direct-land: 0 .../implementation/check-u1-direct-land-1795648416323-2516695.log`.

Log paths are under `/home/ivan/Work/infra/akrogon/issues/open/unblocked-runs/direct-verb/direct-lookup/`.

## Known limitations

A door cannot name a reviewer that lives only in another session. This is C's standing dissent, and the design accepted it.

## Unverified criteria

C4 is for the reviewing seat to read. No proof commands were corrected and no tests were removed. No paid runs, no credentials.
