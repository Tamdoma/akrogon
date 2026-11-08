# Signposts angles: A

Settled in the intake (not asked): one cutover, no compatibility layer or fallback; every agent akrogon starts gets a visible pane in the same step; consultant names `<repo prefix>-slot-<letter>`; chart work lives in the chart folder from the start; consultant reset is kill and restart; a seat's own `hc send` report is the done signal (operator 2026-11-06: no polling).

1. Delete or keep guards: when hc already does what akrogon built by hand (parent/child, done messages, waits, labels), how much of akrogon's own guard code survives?
   - 1a (recommended) Delete akrogon's version and rely on hc. Keep a guard only where testing recorded hc being wrong (intake "Things hc got wrong": `started: true` not proof, codex popup swallowing prompts).
   - 1b Port every guard akrogon has today.
   - 1c Delete all of it; report hc's faults upstream and live with them.
   - Steers: size of peer-*/door-reset scripts, next.ts prompt delivery, stall notices, test fakes.

2. Gaps in herdr-app or hc (no pane weights, no rename, no agent session id, codex question shows `working`, no CLI notify): who fills them?
   - 2a (recommended) Report upstream through `herdr-app feedback` and keep the smallest akrogon workaround only when the gap blocks a done-criterion.
   - 2b Build akrogon-side replacements (own mod, tab-tree writes, transcript readers).
   - 2c Drop the need that hits the gap.
   - Steers: notifications, usage measurement (`agent_session.value`), equal pane heights, codex stall detection.

3. Bootstrap: the epic's own leaves are dispatched by the engine being ported, and every merge on main auto-deploys (docs/reference/releases-and-updates.md "Self-update runs on these triggers"; the only hold is a one-commit rollback hold, src/self-update.ts:253). How does the port itself run?
   - 3a (recommended) Engine dispatch first as one small prerequisite leaf (or direct route), released, then every later leaf runs in herdr-app under the new engine.
   - 3b All leaves run on the old herdr `infra` session one last time, with deploys held until the last leaf lands (needs a new epic-long hold).
   - 3c Port by hand outside the lifecycle.
   - Steers: leaf order, whether a deploy hold is built, where the operator watches leaves during the port.

4. Agent awareness boundary: may anything akrogon installs change how Claude, Codex, pi or agy behave when they run outside herdr-app?
   - 4a (recommended) No. Awareness reaches an agent only when it runs inside herdr-core (`HC_TERMINAL_ID` set). Global CLAUDE.md / AGENTS.md stay untouched.
   - 4b A short global line is acceptable.
   - Steers: the awareness fork (skill vs env-gated text vs akrogon briefs), removal of `~/.claude/skills/herdr`, install steps per harness.

5. Live proof before handoff: proving start, done report, restart and pane placement across four harnesses means paid model launches. How much is proved at charting?
   - 5a (recommended) One smallest live run per operation per harness at charting, in a throwaway herdr-app session, within one paid budget you approve (same as the last session's 3a).
   - 5b Use the recorded hand tests in the intake (2026-10-30, 2026-11-03, 2026-11-05) as proof and let leaves prove the rest.
   - Steers: proof list, charting time, which harness quirks become done-criteria.

6. Tests: what replaces `tests/fake-herdr.ts` across ~700 test lines?
   - 6a Real `hc` in a throwaway `HC_SESSION` per test run: true behavior, slower suite.
   - 6b (recommended) A small fake `hc` covering only the calls akrogon keeps, plus a few real-hc tests for the start/report/restart path.
   - Steers: suite speed, leaf size of the test port, how much hc behavior is pinned.

7. Outside-repo work (`~/.claude/skills/herdr`, harness awareness, codex sandbox flag): same chart or its own?
   - 7a (recommended) Same epic: akrogon's install owns what it can, the rest is a listed operator step.
   - 7b Its own chart after akrogon's port.
   - Steers: install/self-update scope, chart count this session.
