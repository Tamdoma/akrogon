# Map, slot C — autopilot-needs-and-test-isolation

Inspected: SKILL.md (Take, Drain, Autopilot, Handoff, Direct route), assets/questions.md and shapes.md (wait/proposal lines, Autopilot record), tests/hc-delivery.test.ts, tests/hc-identity.test.ts, tests/hc-fixture.ts (hcCore, cleanEnv, waitFor, pinnedSchema), tests/isolation.ts, tests/stand-in.sh, tests/hc-shim.sh, src/next.ts (dispatchLeaf, deliver, observeBusy), src/seat.ts (firstTask, START_PROOF_MS=60s, PANE_WAIT_MS=15s), src/hc.ts (hc() deadline 60s, send), src/shell.ts (spawnCaptured, credentialEnv), src/pull.ts, issues/config.yaml (`test: bun test --timeout=30000 --parallel=4 --no-isolate`), bunfig.toml (preload isolation.ts), docs/use/autopilot.md, docs/reference/limits.md, learnings history files 2026-10-15, 2026-11-08. Ran: the pinned-schema test (pass, 36 ms); the `hd-send` test twice at load ~1 (one fail at line 145 in 10.6 s, one pass 14.9 s — flaky at low load, not only under load). `hc send --help`: no flag to shorten its started-confirmation.

## What each report is

- #129: skill contract. The Autopilot and Take text permits needs/approvals to surface mid-chart and park on `wait:` lines; asks appear only in pass-end summaries. Fix is text in SKILL.md (+ assets, + docs pages that restate the rule). No code path exists for "ask the operator" — it is the door's own message.
- #130: `hd-send` runs ~17 s of real CLI passes (`akrogon next` ×3, `phase`, `hc send`, each a fresh bun process doing socket probes + hc RPCs + git/systemctl calls); under load each stretches past the 30 s budget. Signposts 2a/5a: fix in the test/fixture, no timeout raise, no product change. I also saw it fail fast at low load once — line 145's `toHaveLength(2)` after a 10.5 s run, i.e. a `not_started` send raced past `started:true` timing. Two defects, one test.
- #131: already fixed on main by `47186f90` (schema test now runs on a fixture core; fixture refreshed for 0.1.18). Verified: the test passes on HEAD. Needs a close naming the commit, not a leaf. `4b8914d3`+`97034315` already isolated runtime dirs; remaining class risk is `hc` spawns without `env` in tests/door-exchange.test.ts:92, tests/door-agent.ts:121, tests/hc-observe.test.ts:63 — they inherit whatever HC_* the suite process has. The suite strips HC_* via isolation? Not verified — low confidence; the spawns have no explicit env, so they carry the launch env.

## Material forks

### #129 — chart-issues skill text

1. Where the needs sheet lands. Today: "after the forks settle and before the door's proof calls" (Take). Options: at the signposts round (operator's 2026-11-05 words, and this session's signposts already carry a needs sheet as precedent — 5a) vs. first reply vs. after the map. Signposts position is the operator's stated ceiling and asks once. Cost: foreseen needs must be derivable from intake+map, less precise than post-forks. Later leaves: what the first reply may promise (currently "no approvals"), whether the sheet is a presented artifact or an asked round.
2. What a need/approval found after the gate does. Options: park + surface the ask immediately (recommended) vs. silent cut (Take cut rule — loses the outcome) vs. leave the `wait:` line as the only notice (today's defect). Steers Drain's move-on rule and whether "surface" is a presented round or a door message.
3. How a parked chart's ask reaches the operator. Options: door sends the ask as a message when it parks (recommended — removes the days-of-silence failure) vs. mandatory prominent pass-end line vs. `wait:` line only (today). Steers whether Autopilot/Drain get a notify step and the CHART.md `wait:` line shape.
4. Approvals vs needs at the gate. Grants are per-leaf (Take), shaped by settled forks — full grant scoping at signposts may be impossible. Options: the gate covers needs + foreseen approval classes; grants still park mid-chart but surface per #3 (recommended) vs. grants also pre-collected (forces leaf shapes before forks settle). Steers how much of Take's grant block moves.
5. Which text carries the rule. SKILL.md Autopilot/Take/Drain + questions.md (needs sheet is a presented artifact) + shapes.md (wait/proposal lines, Autopilot record) + docs/use/autopilot.md "What still waits for you" + docs/reference/limits.md:24 (lesson 2026-09-11 stale-rule-in-docs: rule changes must sweep docs/). Options: one leaf edits all of them (recommended — restatement is one rule) vs. docs-only follow-up.
6. Seeds re-mirroring after a park. `pull` regenerates `issues/seeds/` from open GitHub issues (src/pull.ts pullRepo); a parked chart's sources stay open and re-mirror — correct mirror behavior, and Autopilot already says a full seed match is A's to confirm. Not a defect; worth a recorded-only line so the next door doesn't treat it as new intake. Option: no change (recommended) vs. dedupe rule (scope creep).

### #130 — hc-delivery timing

7. What shrinks inside `hd-send`. The test needs: initial `not_confirmed`, a `not_started` send, no resend while the turn stands, resettle once the turn moves, re-prompt of the new idle turn. Options: keep all assertions, reduce fixed costs around them (recommended; each `cli` call is a fresh process running session discovery + repoSpace + leafSeats) vs. split into two tests vs. weaken assertions (deletes the pinned behavior). A measured floor: alone it takes 10–17 s, dominated by hc client sends that wait out their start-confirmation window (instrumentation in #130; consistent with `hc send` having no flag to shorten it).
8. The 30 s budget itself. Signposts took timeout raises off the table (2a). If the trimmed test still brushes 30 s under load, remaining options are `--parallel` for this file (runner config — a leaf touching issues/config.yaml is a product-ish change the signposts didn't rule out; flag it) or accepting occasional red + `--known-red`. Low confidence whether trimming suffices — the charting load demonstration (signpost 6a) settles it.
9. Race observed at low load (my run: fail at line 145 in 10.6 s). A `send` returned `started:true` (task logged twice) where the test expects `not_started` — the stand-in's `WORK`-less turn counted. Same class as #130 (timing-dependent assertions); fold into the same leaf (recommended) or file separately.
10. Verify-green evidence for the fix. Done-criterion: the file passes N consecutive runs under a bounded load demonstration at charting (signpost 6a allows it free). Pitfall: `akrogon verify` of this leaf runs the same suite — the fix must be green under real verify, not only `bun test` alone.

### #131 — hc-identity

11. Close vs leaf. 4a taken: prove on main, record, close naming `47186f90`. I ran the test — passes. The remaining question is only whether the env-inheritance class (spawns without `env`: door-agent.ts:121, door-exchange.test.ts:92, hc-observe.test.ts:63) is in scope of signpost 3a's "shared boundary they directly imply". Options: record-only those sites and close (recommended; 3a says no sweep) vs. one small preload guard stripping HC_* in isolation.ts for spawned tests' children (in-scope only if the chart counts it as the implied boundary).

## Practitioner questions a reviewer would ask

- Does the moved needs sheet still let the door check presence per draft readiness.yaml (Take) — i.e. is asking earlier compatible with checking later?
- Does "surface immediately" under autopilot violate "no chart parks on the signposts round" or the drain move-on order? (No — it's a wait, drain continues.)
- For #130: is the flaky fail at low load the same defect or a second one (send timing vs. task count)? It changes whether the done-criterion is "passes under load" or "passes deterministically".
- Does closing #131 need `akrogon close #131 --by ...` naming `47186f90` and does that run through the door's own step (Open/close) or the lifecycle? Door's own step per intake.
- Are there other tests in the same file (hd-silent, hd-done) with the same 30 s exposure? `75f61f00` reverted 90 s on two tests in this file — the other one is `hd-silent`, same structure. Signpost 3a says the reported test + directly implied boundary; hd-silent is a sibling in the same file with the same pass shape — flag as a borderline scope item for the round.

## Pitfalls over the work's lifetime

- Skill text drift: SKILL.md is installed per release link; a rule change reaches doors only next release (intake finding). Handoff review already states this.
- docs/ restatement missed (lesson 2026-09-11): autopilot.md and limits.md both restate needs/waits — the leaf must sweep them.
- A needs sheet "before charting" that lists approvals it cannot yet scope invites operators to pre-approve blanket grants — avoid by scoping only foreseen classes (fork 4).
- Pushing parked asks as messages: a door that parks repeatedly could spam; one message per park event, not per pass.
- #130: trimming assertions to fit 30 s deletes the silent-stop pinning the test exists for (standing-design: tests prove done-criteria). Trim process cost, keep assertions.
- The load demonstration at charting must be bounded and on this host; under high load it could itself take minutes — cap it.
- Fixing only `hd-send` leaves `hd-silent` (same file, same pass structure, also reverted from 90 s) able to flake the same way — the round should name whether it's in or out.
- Closing #131 without recording the class (spawns without env) invites it again — record-only lines cost nothing.

## Proposed split

One destination (akrogon repo), one chart (operator consolidated). Independently checkable outcomes → parallel leaves:

- Leaf A (#129): chart-issues skill text — needs sheet moved to the signposts round, late needs surfaced+parking rule, parked-ask notification, sweep of questions.md/shapes.md/docs. No code, no grants, no paid calls. Done-criteria: diff-based rule review by B + a dry charting walk of the changed sections.
- Leaf B (#130): hc-delivery `hd-send` stabilized — reduce per-pass fixed cost / restructure while keeping the pinned assertions; sibling `hd-silent` decided in its fork. Done-criterion: file green in `test` check; charting proof: bounded load demonstration.
- #131: verification + close, no leaf. The pinned-schema test passes on HEAD (`47186f90` delivered it); close naming the commit, record-only the env-inheritance sites.

Order inside the session: #131 close and #130 first (unblocks verify for leaf A's own verify run), then #129 — matches signposts 1a.

Low-confidence items: whether the hc-client send window dominates `hd-send`'s 17 s (needs the charting measurement); whether isolation.ts actually propagates to child spawns' env for the listed sites; whether `hd-silent` is inside scope.
