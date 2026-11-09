# Intake: autopilot-needs-and-test-isolation

## Scope

Destination repo: akrogon (registered root /home/ivan/Work/infra/akrogon). Three pulled reports, consolidated in one chart per the operator's words. Proposed grouping before the map: #129 (chart-issues autopilot asks every operator-only need before charting) and #130 + #131 (the `test` check result depends on the host: machine load, and the operator's live hc core). The map settles the split.

## Provenance

- GitHub: Tamdoma/akrogon#129
- GitHub: Tamdoma/akrogon#130
- GitHub: Tamdoma/akrogon#131
- Operator: door t15, 2026-11-09T09:05Z, /chart-issues arguments

## Source: operator door t15 2026-11-09

3 new issues have been pulled. Chart them out and consolidate them. Also, use slot b (codex) and slot c (pi) as consultants. Full autopilot mode, use lifecycle, don't do the changes yourself.

## Source: Tamdoma/akrogon#129

# chart-issues autopilot finds operator-only needs (keys, grant approvals, close yes/no) mid-chart and parks the chart, instead of asking the operator before charting

Source: Tamdoma/akrogon#129
URL: https://github.com/Tamdoma/akrogon/issues/129

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In full-autopilot door sessions on Tamdoma/tamdoma-framework, slot A found operator-only needs partway through charting and parked each chart on a `wait:` line, then moved on:

- 2026-11-01: renderer-purchase-lane (#506-#508) parked on a missing need, a Cloudflare token `CF_REGISTRAR_PROOF_TOKEN` plus an account id and one domain.
- 2026-11-01: site-identity (#512, #518) parked on grant approval for paid fixture re-record launches.
- 2026-11-04: seo-sitemap-membership (#538) parked on grant approval for paid recording runs.
- 2026-11-04: workers-bindings-go-live (#540) parked on an operator yes to `akrogon close`.

The asks only surfaced as lines in pass-end summaries. The operator did not see them for days, and the 7 seeds kept re-mirroring on each pull, so they looked like new intake.

## Location

akrogon-installed skill `chart-issues` (`~/.claude/skills/chart-issues/SKILL.md`, resolved to `~/.akrogon/releases/67f0b262f7a0c7dde48dc17fe0234befadad02cb/skills/chart-issues/SKILL.md`): sections Autopilot, Take (needs sheet, human-only prerequisites, grants) and Drain (move-on rule for charts waiting on an approval or need).

## Reproduction

1. Start a door on full autopilot with handed seeds whose fixes need a paid proof, a live-call grant, a new secret or a GitHub close.
2. Let A chart them.
3. Each such chart parks mid-chart on a `wait:` line, and the ask shows up only in the pass-end summary.

Seen in 4 charts across 2 door sessions.

## Expected behavior

Operator words, 2026-11-05: even on full autopilot, slot A foresees every need the charting will require and asks the operator before charting. Needs may also be found and asked at the signposts round (manual or automatic signposts), but nothing after that.

## Urgency

Charts sit unhanded for days with no visible ask. The operator has to dig the needs out of CHART.md wait lines. Workaround: the operator asks the door what it is waiting on.

## Suspected cause

Agent view. Autopilot in SKILL.md lists "grant approval, fixture retention and secret-save approval; ... a mutating or paid proof call ...; a missing need; and a human-only prerequisite" as things that "make that chart wait while the door moves on within its handed list". The first reply's best-guess supply list is explicitly limited to "logins, API keys, files ... and no approvals on the list". Take puts the needs sheet "after the forks settle and before the door's proof calls", which is mid-chart. So the contract allows, and in places requires, discovering approvals and needs after charting starts, and parking on them. No rule makes A gather them before the first map, or at the signposts round at the latest.

Files read: SKILL.md (Autopilot section; Take and Drain as quoted in the session). These are installed release copies, not the akrogon source checkout.

Not inspected: `assets/questions.md` and `assets/shapes.md` wait-line rules; akrogon source under /home/ivan/Work/infra/akrogon.

Related reports: Tamdoma/akrogon#128 (closed): added the signposts round, a different defect but the same opening phase where these needs would be asked. Searched Tamdoma/akrogon, all states, own reports since 2026-11-03 (limit 30), "autopilot needs approval" (limit 10) and "chart-issues autopilot wait" (limit 10).

## Source: Tamdoma/akrogon#130

# hc-delivery test 'a working seat gets no send...' times out at 30 s under machine load, on the leaf head and on base

Source: Tamdoma/akrogon#130
URL: https://github.com/Tamdoma/akrogon/issues/130

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

The test `a working seat gets no send; a send that never starts is recorded, not resent, and resettled once the turn moves` in `tests/hc-delivery.test.ts` hit the 30 s per-test timeout in 5 of 5 `akrogon verify` runs of leaf `chart-door-on-hc` on head `3ffe742209ea98e4c4293b3292e37d6beb8974ed` (load average 1 to 17 during the runs; other leaves' verifies and live runs on the same machine). The leaf's diff does not touch the test, `src/next.ts`, `src/hc.ts` or `src/seat.ts`; its `src/transcript.ts` change keeps `transcriptFor` behavior.

Run alone (`bun test --timeout=30000 tests/hc-delivery.test.ts -t 'a working seat'`), interleaved on the same machine:
- leaf head, load 6.6: pass 17.6 s
- base `e3202dff4cf2a660cb26004e1ef3d2e8af883193`, load 11.0: pass 17.5 s
- leaf head, load 10.7: pass 28.8 s
- base `e3202dff`, load 21.8: fail, timed out at 30.0 s

Other recent verifies show 16.6 to 17.7 s for this test at lower load. `akrogon verify --known-red` on the head judged `fail` because the base tree holds a whole-green row.

Kept logs (leaf `chart-door-on-hc` implementation folder): `check-test-1794109264711-557749.log`, `check-test-1794109454845-939678.log`, `check-test-1794110806447-2824599.log`, `check-test-1794111756885-968374.log`, `check-hcd-alone-base-2-*.log` (base fail), `check-hcd-alone-leaf-1-*.log`, `check-hc-delivery-alone-1794109488087-1556096.log`.

## Location

`tests/hc-delivery.test.ts` (the test at line 114), run by the `test` check (`bun test --timeout=30000 --parallel=4 --no-isolate`).

## Reproduction

Run the test while the machine is loaded (load average around 10 or more), on base `e3202dff` or the leaf head. Frequency under load: the leaf's last five full verifies all failed; alone it failed once on base at load 21.8.

## Expected behavior

The `test` check result does not depend on unrelated machine load.

## Urgency

Blocks the verify receipt of leaves while other leaves or live runs load the machine (here a check.fix return to review). Workaround: rerun verify in a quiet window.

## Suspected cause

Agent view. Step timings from a temporary, discarded instrumentation of the test (alone, load about 8): setup 0.5 s, first `akrogon next` 10.2 s, `akrogon phase ... implement` 5.3 s, second `akrogon next` 12.6 s; in a full-suite run the first `akrogon next` took 30 s. Most of the test's 17 s idle time is spent inside CLI passes that send to a stand-in seat that never starts a turn, so they wait out their delivery windows; those passes and their process starts stretch under load until the single test passes the 30 s per-test timeout. Which wait inside `next` dominates was not isolated.
Files read: `tests/hc-delivery.test.ts`, `src/hc.ts` (`hc()` deadlines), `src/seat.ts` (`START_PROOF_MS`), `src/next.ts` (`not_started` record).
Not inspected: the exact delivery wait lengths inside `src/next.ts`; a per-step timing on base under the same load would confirm or disprove.
Related reports: none found (Tamdoma/akrogon, `--author @me` since 2026-11-06 and searches "hc-delivery working seat", "hc-delivery timeout", all states, limit 10-50).

## Source: Tamdoma/akrogon#131

# hc-identity schema test reads the operator's live hc core and fails on a core that runs another hc build

Source: Tamdoma/akrogon#131
URL: https://github.com/Tamdoma/akrogon/issues/131

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

`tests/hc-identity.test.ts` "the parts of hc schema akrogon parses match the pinned copy" fails on the leaf head and on the base. `hc schema` returns an extra `first_message` property (`anyOf: [$ref FirstMessage, null]`, "A template first message that was not sent; retained for later inspection.") that `tests/fixtures/hc-schema.json` does not hold. Excerpt:

```
+         "first_message": {
+           "anyOf": [
+             { "$ref": "#/components/schemas/FirstMessage" },
+             { "type": "null" },
...
- Expected  - 0
+ Received  + 11
      at tests/hc-identity.test.ts:133:38
```

The same `hc schema` (client `hc 0.1.18`) prints no `first_message` when no core is reachable (`XDG_RUNTIME_DIR` pointed at an empty folder, `HC_*` unset), and prints it with `HC_SESSION=default` against the operator's running `default` core, which `issues/chart/herdr-app/forks/e2e-proof.md` part 7 records as still running hc 0.1.17 from a deleted executable.

## Location

`tests/hc-identity.test.ts:129-134` in the `test` check (`bun test --timeout=30000 --parallel=4 --no-isolate`), leaf herdr-sweep.

## Reproduction

- Leaf head `6d6ef4bc9aa50789eb6c3b0b743dfaf72b6f6df3`: `akrogon verify` red, then one retry of the configured `test` check red (`check test: 1 .../herdr-sweep/implementation/check-test-1794128620473-2016890.log`), and `akrogon verify --known-red` judged `fail` (a green base row exists for the merge-base, so no base pass ran).
- Base `75f61f001f0a1e2e3b98626b8ffad896f4736b21`: `bun test --timeout=30000 tests/hc-identity.test.ts -t "pinned copy"` red with the same diff (`check base-hc-identity: 1 .../herdr-sweep/implementation/check-base-hc-identity-1794128822469-3025275.log`).
- Logs are under the registered checkout's `issues/open/herdr-app/herdr-removal/herdr-sweep/implementation/`. Frequency: every run on this machine on 2026-11-08 from about 10:00 CET.

## Expected behavior

The pinned-schema test compares the installed `hc` binary's schema with the pinned copy without depending on which hc build the operator's own cores run.

## Urgency

Blocks `akrogon verify` on every akrogon leaf on this machine while an operator core runs a different hc build. Workaround: restart the operator's `default` and `mdconsultingny` cores on the installed hc 0.1.18 (e2e-proof part 7 already asks for this).

## Suspected cause

Supported hypothesis: the test calls `spawnCaptured(['hc', 'schema'])` with no `env`, so Bun forks the process's startup environment (see the `call` comment in `src/install.ts` and lesson history `2026-10-15-bun-spawn-startup-path.md`), not the preload's `XDG_RUNTIME_DIR` set by `tests/isolation.ts:66`. `hc schema` then reaches the operator's real `default` core under the real runtime folder and returns that core's schema. The test went green on main earlier because that core then answered the pinned shape or was not reached; when the core's build differs from the installed client, the test fails.
Whose view: agent.
Files read: `tests/hc-identity.test.ts:129-134`, `src/shell.ts:69-80` (`spawnCaptured`), `tests/isolation.ts:53-66`, `issues/chart/herdr-app/forks/e2e-proof.md` part 7.
Not inspected or would disprove: whether `hc schema` documents reading a running core first; the run with the operator's cores restarted on 0.1.18 (would turn the test green if the hypothesis holds).
Related reports: none found (searched Tamdoma/akrogon, all states, queries "hc schema pinned", "first_message", "hc-identity", limit 10).

## Agent findings

- No identity is in any open/closed leaf `sources` or chart intake (grep 2026-11-09). No open chart exists in issues/chart/.
- #129 reports installed release copies; the source is `skills/chart-issues/SKILL.md` and `assets/*.md` in this repo. A skill change reaches doors only at the next release link.
- #130 relates to lesson history/2026-11-08-hc-shutdown-unit-leak.md (leaked units made dispatch tests time out on base and leaves).
- #131 relates to lesson history/2026-10-15-bun-spawn-startup-path.md (spawn without `env` uses the startup environment).
- `akrogon flaky` lists 21 older tests (2026-10-17..24) outside the handed list: recorded only.
