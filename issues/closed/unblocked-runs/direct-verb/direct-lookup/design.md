# Design: direct-lookup

## Binding decisions, verbatim

### Which session akrogon direct resolves seats in (#162) — forks/direct-session.md


A's pick (full autopilot), 2026-11-25:

Q1: seat A is `{session: HC_SESSION, address: HC_TERMINAL_ID}`, checked live with the existing `terminalIfPresent` (`src/hc.ts`), refused before any write when `HC_SESSION` is blank or the terminal is not live in that session, even when another session holds the same address live. Reason: hc addresses are per session and the caller's own environment names its session; signpost 2a.

Q2: `--reviewer` resolves in the same `HC_SESSION`, with the same live check and refusal; `probeExactlyOne` and its cross-session scan are deleted. Reason: the door addresses every terminal through its own session's hc (`hc send`, `hc get`), so the only reviewer address it can name is one in its session; the scan is the bug class #162 names for both seats (signpost 5a); stored seat refs keep `{session, address}`, so dispatch, broadcast and the cross-session state in `tests/direct-seats.test.ts` (written directly, not through the verb) keep working.

Rejected: `repoSpace(repo)` (binds the wrong terminal when the door runs outside the repo's session, refuses when the repo has no space); keeping the scan for B (C's O1, keeps the fragile probe and the reported ambiguity for B); a reviewer session qualifier (C's O2, a new flag no skill uses); falling back to a scan when `HC_SESSION` is unset (silent misbinding).

Standing dissent (C): a reviewer in another session can no longer be named; C prefers keeping the bare-address scan for B.

Pitfalls removed: `terminalIfPresent` (not `terminal`, which boots a dead core; not `probeTerminal`, which hides every HcError); existing direct tests set `HC_SESSION` (`tests/direct-create.test.ts`, `tests/direct-land.test.ts`); the old two-session refusal test is replaced by a test where the address is live in two sessions and resolves to the caller's.

Correction (A, 2026-11-25, from leaf review C F2 and F3): the no-core-start claim is scoped to `terminalIfPresent`'s socket check, which runs only when `XDG_RUNTIME_DIR` is set. No new refusal is added for a blank `XDG_RUNTIME_DIR`: both lookups use the caller's own `HC_SESSION`, whose core is running because the caller runs in it, so the socket check is a guard, not a criterion. `docs/reference-index.md`'s Command line ("every hc call pins `HC_SESSION` to the resolved repo session") names direct's seat lookup as the exception, and that file is an owned surface. (A,C)

### Plain files beside owner folders (#163) — forks/owner-walk.md


A's pick (full autopilot), 2026-11-25: `slugLeafFolders` iterates owners through the existing `issueFolders` (`src/park.ts`, already imported by `src/state.ts`), keeping its open-draft and closed-with-state rules. Reason: signpost 2a, reuse the helper every neighbour uses. Rejected: catching ENOTDIR (still walks files, can hide a bad area root); the full inventory (needs draft support). No standing dissent. Accepted cost: symlinked owner folders are no longer followed, the same as every neighbouring walk.

### Leaf split — forks/split.md


A's pick (full autopilot), 2026-11-25: epic `unblocked-runs` with `slots: a: {harness: claude, model: claude-opus-5-5, effort: medium}`; issue `direct-route` holding leaf `direct-lookup` (#162, #163); issue `unattended-seats` holding leaf `seats-never-wait` (#161). Reason: signpost 3a; #162 and #163 share one verb, one test file and one pre-write path, #161 shares no surface with them. Rejected: three leaves (a full cycle for a two-line reuse); one leaf (mixes domains, delays the direct unblock). No standing dissent. The two leaves are independent: no blocked-by.

Correction (A, 2026-11-25, from leaf review B 1 and C F1): the first issue is named `direct-verb`, not `direct-route`, because `direct-route` is already a closed leaf folder (`issues/closed/direct-mode/direct-route`). Leaves and sources are unchanged. (A,B,C)

Excluded: the #161 seed decision (forks/approval-decision.md) and forks/seat-unattended.md belong to leaf seats-never-wait and do not apply here.

Standing design: /home/ivan/.akrogon/releases/15582bcdcfd1f14ab30f11fee4333a7da6a4871d/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, the CLI run against hc fixture cores already used by `tests/direct-create.test.ts` (`tests/hc-fixture.ts`); no new machinery, no model or paid call. Criterion 2's refusals are consequential negative cases with one right answer (refused, nothing written). The bug fixes show the new two-session test failing on the base and passing after (#162), and the plain-file test failing with ENOTDIR on the base and passing after (#163). The replaced two-session reviewer refusal test is a false expectation after this change and is deleted with its reason; edits to existing test files carry the `Test-Change:` trailer the implement skill requires.

## Held disagreements

- not a decision, the decision stands. Against forks/direct-session.md Q2 (reviewer in the caller's session). Fact: before this change a bare reviewer address unique across live sessions was accepted from another session (`tests/direct-seats.test.ts` writes such a cross-session leaf directly). Consequence: after it, a door cannot name a reviewer that lives only in another session. Raised by C (rebuttal F1). State: unanswered (autopilot; A's pick stands).

## Leaf architecture

Owned surfaces: `src/direct.ts` (directCommand; `probeExactlyOne` deleted), `src/state.ts` (slugLeafFolders), `tests/direct-create.test.ts`, `tests/direct-land.test.ts` (its `akrogon direct` call needs `HC_SESSION`), `src/AREA.md` (the src/direct.ts line and the hc.ts line's direct mention), `docs/reference/commands.md` (the `akrogon direct` row), `docs/reference-index.md` (the Command line's `HC_SESSION` claim). (A,C)

Literal interfaces: the CLI is unchanged (`akrogon direct <slug> --reviewer <address> [--source <owner/repo#n>]...`). Seat refs in `state.yaml` keep the shape `{session, address}`; both now carry `process.env.HC_SESSION`.

Session check: `HC_SESSION` blank or unset refuses like a blank `HC_TERMINAL_ID` today, before the slug lookup's writes. Each address is checked with the existing `terminalIfPresent(session, address)` from `src/hc.ts` (its socket check runs first when `XDG_RUNTIME_DIR` is set; the session is the caller's own, whose core is running) and must be `state === 'live'`; `terminal` and `probeTerminal` are not used. `sessions` import in `src/direct.ts` drops if unused. (A,C)

Consumers of the changed state: `src/next.ts` observeDirectSeats and broadcastDirect read the stored seat refs through `probeTerminal(ref.session, ref.address)`; their input shape is unchanged, so they need no change. `src/reconcile.ts` broadcastInProgress reads the same refs.

Owner walk: `slugLeafFolders` iterates `issueFolders(repo.root, <issues/open | issues/closed>)` from `src/park.ts` (already imported in `src/state.ts`), keeping `area === 'open' || existsSync(state.yaml)`. Open for the plan: the exact relative-path argument `issueFolders` takes, read from its signature.

Exclusions: `src/hc.ts` is unchanged. `akrogon seat --slot` and `notice` keep `repoSpace` (not this report's bug class). No new CLI flag.

Tests pass `HC_SESSION` per `akrogon direct` call in the two owned test files. `tests/hc-fixture.ts` is not edited: it blanks `HC_SESSION` so real-core tests prove session resolution through `repoSpace`. (A,B)
