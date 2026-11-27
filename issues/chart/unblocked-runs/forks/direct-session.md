# Which session akrogon direct resolves seats in (#162)

## Question

Q1. Which session holds seat A? Q2. Which session holds the `--reviewer` (seat B)?

### Carries

Signposts 2a, 5a. Related: forks/owner-walk.md (same leaf).

## Findings

- Merged notes `slots/forks-merged.md` § Fork direct-session: caller via `HC_SESSION` (A,B,C); reviewer in caller's session (A,B); C keeps a cross-session scan for bare reviewer addresses.
- Rebuttal C F1: `tests/direct-seats.test.ts` puts B in another core and broadcast uses B's recorded session; caller-only lookup rejects a valid remote reviewer or binds a local namesake.
- Rebuttal B 4: `tests/direct-land.test.ts` also calls `akrogon direct` with blank `HC_SESSION` from `tests/hc-fixture.ts`.
- Charting observation (free), 2026-11-25: this door terminal t126 carries `HC_SESSION=infra`, `HC_TERMINAL_SOCKET=/run/user/1000/herdr-core/infra.sock`, `HC_TERMINAL_ID=t126` (`env | grep ^HC_`); the #162 report shows the same three variables in the pi-extensions door. Limits: does not prove every hc launch path sets `HC_SESSION`; a blank value is refused loudly by the decision below.

## Taken

A's pick (full autopilot), 2026-11-25:

Q1: seat A is `{session: HC_SESSION, address: HC_TERMINAL_ID}`, checked live with the existing `terminalIfPresent` (`src/hc.ts`), refused before any write when `HC_SESSION` is blank or the terminal is not live in that session, even when another session holds the same address live. Reason: hc addresses are per session and the caller's own environment names its session; signpost 2a.

Q2: `--reviewer` resolves in the same `HC_SESSION`, with the same live check and refusal; `probeExactlyOne` and its cross-session scan are deleted. Reason: the door addresses every terminal through its own session's hc (`hc send`, `hc get`), so the only reviewer address it can name is one in its session; the scan is the bug class #162 names for both seats (signpost 5a); stored seat refs keep `{session, address}`, so dispatch, broadcast and the cross-session state in `tests/direct-seats.test.ts` (written directly, not through the verb) keep working.

Rejected: `repoSpace(repo)` (binds the wrong terminal when the door runs outside the repo's session, refuses when the repo has no space); keeping the scan for B (C's O1, keeps the fragile probe and the reported ambiguity for B); a reviewer session qualifier (C's O2, a new flag no skill uses); falling back to a scan when `HC_SESSION` is unset (silent misbinding).

Standing dissent (C): a reviewer in another session can no longer be named; C prefers keeping the bare-address scan for B.

Pitfalls removed: `terminalIfPresent` (not `terminal`, which boots a dead core; not `probeTerminal`, which hides every HcError); existing direct tests set `HC_SESSION` (`tests/direct-create.test.ts`, `tests/direct-land.test.ts`); the old two-session refusal test is replaced by a test where the address is live in two sessions and resolves to the caller's.

Correction (A, 2026-11-25, from leaf review C F2 and F3): the no-core-start claim is scoped to `terminalIfPresent`'s socket check, which runs only when `XDG_RUNTIME_DIR` is set. No new refusal is added for a blank `XDG_RUNTIME_DIR`: both lookups use the caller's own `HC_SESSION`, whose core is running because the caller runs in it, so the socket check is a guard, not a criterion. `docs/reference-index.md`'s Command line ("every hc call pins `HC_SESSION` to the resolved repo session") names direct's seat lookup as the exception, and that file is an owned surface.
