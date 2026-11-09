# Signposts angles, slot C

One observation before the angles: commit `47186f90` (main, 2026-11-08 10:06) moved the `hc-identity` schema test onto a fixture core it starts (`core.hc(['schema'])`) and refreshed the pinned schema for hc 0.1.18 — the exact mechanism #131 names. The report's base `75f61f00` predates it. #131 may be settled work that only needs verification and close, not a leaf. That affects chart order below.

## Angles

### 1. When does the door collect operator needs, exactly?

#129's expected wording gives two surfaces: "foresees every need and asks before charting" and "at the signposts round at the latest". Today the needs sheet sits after forks settle (Take), and the first reply's supply list is explicitly "no approvals" (Autopilot).

- **1a** The needs sheet moves to the signposts round, built from intake plus the map's fork surfaces; it is the last moment needs may be asked. Recommended. Matches the operator's own wording verbatim and asks once, at a point the door already pauses (under autopilot it is a presented round, not a wait).
- **1b** Needs are split: the intake-derived best-guess list stays in the first reply, and the sheet lands at signposts. Two asks of the same kind; more text, same information.
- **1c** Keep the sheet after forks settle but forbid `wait:` lines before it — a surfaced need asks immediately instead of parking. Accurate needs (forks settled), but the ask still lands mid-chart, which is the reported defect.

Steers: where the needs sheet lives in Take/Autopilot, what the first reply may list, when a `wait:` line can legally appear.

### 2. What happens to a need or approval discovered mid-chart, after the gate?

No gate catches every need: forks reshape surfaces. The operator's words cover needs found "before charting" and "at signposts" but say nothing about later finds.

- **2a** Surface it immediately as a visible ask and park the chart; the drain moves on within the handed list. Recommended — it is the option closest to today's move-on rule (taken signposts direction: keep akrogon's behavior, fewest moving parts) while removing the silent-days failure.
- **2b** The contract is cut to what needs nothing new (Take's cut rule), never asked. Fast, but a silent scope cut under autopilot loses the outcome the operator handed; the Take rule already reserves that decision for the operator.
- **2c** Forbid late needs: a leaf design that needs one fails at handoff review. Makes the gate a hard contract, but pushes the failure to the very end.

Steers: the Drain move-on/wait rule, whether the needs gate is a contract or a collection point, and cut-rule usage in the #129 leaves.

### 3. How does a parked chart's ask reach the operator under autopilot?

The defect is invisibility: asks appear only in pass-end summaries, so parked charts sat unseen for days while seeds re-mirrored. Autopilot says "handed-off work waits for the operator's watcher, which the door cannot check" — today nothing pushes the ask.

- **3a** The moment a chart parks, the door sends the ask to the operator as a message (the door's own `hc send`/notice path), not only a `wait:` line and a pass-end line. Recommended — the smallest change that removes the reported failure; no new machinery, reuses the notification surface the session already has.
- **3b** Keep asks in `wait:` lines and pass-end summaries, but make the pass-end line mandatory and prominent. Smaller still, but a pass that runs long still hides the ask.
- **3c** The watcher/poller surface carries it — out of scope for a skill-text fix and duplicates machinery.

Steers: whether #129 leaves add a notify step to Drain/Autopilot or only reword collection timing; how visible `wait:` lines must be.

### 4. Where is the test-isolation boundary — shared enforcement or per-test care?

#131's cause (per the report): a spawn inheriting the startup environment reached the operator's live core. `tests/isolation.ts` redirects `XDG_RUNTIME_DIR` for the test process, but Bun-spawned children may carry the startup env (lesson `2026-10-15-bun-spawn-startup-path`). The same class bit twice: live core schema, leaked units.

- **4a** One boundary: the preload/spawn layer strips the operator-reachable env (`HC_*`, real `XDG_RUNTIME_DIR`) for every child a test spawns; no test may reach live services by default. Recommended — removes the whole defect class instead of patching each test; matches "delete the fragile part" over per-site guards.
- **4b** Fix each offending call site (`env` at each `spawnCaptured`). Minimal diff, but the next test that forgets `env` reintroduces the failure.
- **4c** Boundary plus an audit marker: enforce 4a and pin each permitted live-reach site. More than needed for two reports.

Steers: whether the leaf touches `tests/isolation.ts`/`src/shell.ts` or only `tests/hc-identity.test.ts`; done-criteria shape (a test that proves a child cannot reach a live core vs. a passing test); and #131's framing — mechanism fix vs. verification that `47186f90` already did it.

### 5. For #130, may a leaf change what the product waits on, or is this test-side only?

The 17s of idle inside the test is real CLI passes waiting out `hc send`'s confirm window to a stand-in that never starts. The wait is hc's client behavior, not akrogon's; the 30s budget is the check's. A 90s raise was tried once (`233d01ca`) and reverted (`75f61f00`) because leaked units were the cause then — reverting it is not a standing ban, but it is a recorded operator decision.

- **5a** Test-side only: shrink what the test waits on (fewer redundant CLI passes, a stand-in mode that doesn't hold the confirm window) and/or a bounded per-test budget sized to a measured worst case. Recommended — the defect is a test result depending on host load; changing delivery waits to satisfy a test inverts the dependency.
- **5b** Product-side: shorten delivery confirmation waits in `src/next.ts`/`src/seat.ts` or pass a flag. Weakens the silent-stop detection these tests exist to pin, and patches hc behavior akrogon doesn't own.
- **5c** Runner-side: lower `--parallel`/isolate for the timing-bound file, or a load-aware check. Changes the whole check's duration for one test.

Steers: which files the leaf may touch (`tests/` vs `src/` vs check config); whether re-raising a timeout is inside options at all (signpost 5 sets the hard limit the fork round needs); the done-criterion "passes at load N" wording.

### 6. Fix the two reported tests, or audit the suite for the class?

The intake groups #130+#131 as "the `test` check result depends on the host". `akrogon flaky` already lists 21 tests outside the handed list, recorded only — the handed work is these two.

- **6a** The two reported tests plus the shared boundary they imply; other host-dependent sites are recorded, not fixed. Recommended — the handed list is the two reports, and autopilot forbids extending it; a full audit is a new-chart proposal, not scope.
- **6b** Full sweep of every test for host/load dependence. Larger, slower, and the flaky list already tracks the known cases.

Steers: leaf count and split inside the test-isolation destination; whether a new-chart proposal can park this chart (Autopilot's own rule — a material one given angle 2); done-criteria breadth.

### 7. Order and priority: what runs first this session?

- **7a** Test isolation first, autopilot-needs second. Recommended: #131 may already be fixed on main (`47186f90`) — if confirmed it is verification and close, the cheapest chart — and #130's fix unblocks `akrogon verify` for every leaf including #129's own, since a skill-text leaf still runs the `test` check.
- **7b** Autopilot-needs first: largest reported pain (4 parked charts, days of silence). Justified, but its own verify stays flaky until #130 lands.
- **7c** Parallel: Drain already permits independent leaves side by side; ordering only matters if the split makes them one destination.

Steers: the session's chart order in signposts, which leaf's verify is blocked today, and whether #131 reduces to a close — which A should confirm on the map before ordering.

## A could also miss

- The earlier signposts record's binding corrections (herdr-app forks/signposts.md `## Taken`): "option closest to how akrogon works today wins", "fewest moving parts", "no polling". Options 2b, 3c, 5b conflict with those; a recommendation naming the signpost that decided it should cite them.
- Full-autopilot wrinkle for angle 3: under full autopilot A answers the signposts itself, so "ask the operator at signposts" must still mean the operator sees the needs sheet even when A picks the answers — a needs sheet is supplies, not a question A can self-answer. The #129 fix should say so explicitly or the defect returns in exactly the mode that reported it.
