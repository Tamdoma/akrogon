# Plan: watch-session

Debate is off (`debate: "no"`); this plan is direct synthesis from brief + locked design against the live checkout. The worktree is based on `origin/main` at e0a57bd7, which contains session-routing merged, so `repoSession`/`herdrArgv` in `src/shell.ts` are live.

## Decisions

- **D1. Resolve the repo session through `repoSession` before any stdout.** `observe.ts` builds the `Repo` with `readRepo(repoKey, root)` from `src/config.ts` (the canonical constructor; it reads `issues/config.yaml`, guaranteed present on a registered repo), then `repoSession(repo, { exe: herdrBin })`. `OBSERVE_HERDR` reaches every herdr call the observer makes because it is passed as `exe` to the one resolver and into the `agent list` argv; there is no second resolver and no socket read anywhere in observe.ts.
- **D2. A refused resolution exits non-zero, prints the refusal reason on stderr, prints no stdout.** `main()` throws `new Error(resolution.reason)`; the existing `import.meta.main` catch prints to stderr and exits 1. This is the same failure shape as a herdr failure today (stderr + non-zero + empty stdout) and covers missing workspace (`no running session holds it`), duplicates (`held by multiple sessions`), unreadable sessions (`uniqueness unknown`) and a failed `session list` (`session list failed`, scope `invocation`) without per-branch code.
- **D3. `agent list` runs through `herdrArgv(['agent','list'], { session: resolved.session.name, exe: herdrBin })` under the existing local `run` helper.** The current `herdr agent list failed: exit ...` error strings are preserved verbatim so existing failure tests and the criterion-2 "same failure shape" hold. Not switched to `herdr()` because it throws `CommandError` (JSON argv dump), a different message shape.
- **D4. `session=<resolved.session.name>` is always stdout line 1 after a successful resolution, before inventory and leaf lines.** Resolution happens before the `leaves.length === 0` early return, so an empty repo prints the session line and nothing else, and a refused resolution never prints it.
- **D5. Pane ids are session-scoped; no cross-session lookup exists in observe.ts.** The only herdr read after resolution is `agent list` inside the resolved session, so a same-id pane in another session can never be reported.
- **D6. SKILL.md: `herdr agent <verb>` and `herdr notification show` commands carry `--session <name>`.** Every acting command in the skill hits a pane stored in the repo's session, and akrogon's own post-routing code scopes notifications too (src/next.ts:244, src/phase.ts:100). No other herdr verbs appear in the skill.
- **D7. Test stubs become argv-dispatching session fakes.** `herdrOk`/`herdrFail`/`herdrNonJson` in observe.test.ts are replaced by a scenario-driven stub: it parses an optional leading `--session <name>`, answers `session list --json` (bare `{sessions:[...]}`), per-session `workspace list` (`{result:{workspaces:[...]}}`), and `agent list` (`{result:{agents:[...]}}`), and appends its argv to the file named by `OBSERVE_HERDR_LOG`. Test roots gain a minimal `issues/config.yaml` (`{}`) written by `writeLeaf` and by the two no-leaf tests, satisfying `readRepo`.
- **D8. Criterion 3 proof adds a PATH shim.** A `bin/` dir containing a `herdr` symlink to a `bypassed` marker writer is prepended to PATH in the spawned environment; any call that escaped `OBSERVE_HERDR` would hit it. This follows the recorded bun-spawn PATH lesson (shim lives in the child spawn `env`, not `process.env`).
- **D9. Two recorded fixtures added verbatim:** `fixtures/herdr-session-list.json` (real `herdr session list --json`, herdr 0.9.1, captured 2026-10-24) and `fixtures/herdr-workspace-list.json` (real `herdr --session infra workspace list`). Each gets a schema-parse test mirroring the existing `herdr-agent-list.json` test. `herdr-agent-list.json` stays unchanged; `--session` does not change response shapes.
- **D10. `observe-log-tail.test.ts` gets the same stub + `issues/config.yaml` updates** and its expected output gains the `session=` first line; the wiring assertion (logA path feeds log-tail) is unchanged.

## Read-first paths

- `src/shell.ts` — `repoSession`, `SessionResolution`, `herdrArgv`, `DISCOVERY_DEADLINE_MS`, `resolveSession` refusal reasons (missing/duplicate/unreadable/session-list).
- `src/config.ts:219` — `readRepo(name, root)` builds `Repo` from `issues/config.yaml`.
- `skills/watch-issues/scripts/observe.ts` — `main()`, `agentStatuses`, `resolveRepoKey`, `reportFailures`.
- `skills/watch-issues/scripts/observe.test.ts`, `observe-log-tail.test.ts` — stub helpers and line expectations.
- `skills/watch-issues/SKILL.md` — Observe section contract and Judge acting commands.
- `issues/chart/herdr-session/forks/session-address.md` + `stopped-and-ambiguous.md` — locked resolver semantics this leaf consumes unchanged.
- `learnings/LESSONS.md` — applied: bun-spawn PATH shim lesson (2026-10-15), refusal/reason assertions over prose (2026-10-01).

## Interfaces needed (all exist)

- `repoSession(repo: Repo, { exe }): Promise<SessionResolution>` — `src/shell.ts`.
- `herdrArgv(args, { session, exe }): string[]` — `src/shell.ts`.
- `readRepo(name, path): Repo` — `src/config.ts`.
- `SessionResolution = { ok: true; session; workspace } | { ok: false; reason: string; scope? }` — reason is a JSON string naming `workspace`, `refused`, `searched`, `skipped_stopped`, `unreadable`, `duplicates`.

## Wave checklist (serial-solo)

Every wave holds one unit, so the run is serial-solo: A implements this plan itself, no workers.

### Wave 1 — Unit 1

Owns: `skills/watch-issues/scripts/observe.ts`, `skills/watch-issues/scripts/observe.test.ts`, `skills/watch-issues/scripts/observe-log-tail.test.ts`, `skills/watch-issues/scripts/fixtures/herdr-session-list.json`, `skills/watch-issues/scripts/fixtures/herdr-workspace-list.json`, `skills/watch-issues/SKILL.md`.

Changes:

1. observe.ts: import `herdrArgv`, `repoSession`, `SessionResolution` from `../../../src/shell` and `readRepo` from `../../../src/config`; in `main()` resolve after `resolveRepoKey`, throw on `!resolved.ok`, print `session=<name>`, pass `{ session: resolved.session.name, exe: herdrBin }` through `herdrArgv` for `agent list`.
2. observe.test.ts: scenario stub per D7; `issues/config.yaml` in test roots; `session=` prepended to every expected output; update the two empty-inventory tests; new tests T1–T6 below.
3. observe-log-tail.test.ts: same stub/config updates and `session=` first line.
4. Fixtures per D9.
5. SKILL.md per D6.

Tests committed before product code in c12cdbb (`test: session-scoped observe contract`), carrying `Test-Change:` trailers for `observe.test.ts` and `observe-log-tail.test.ts` since both are pre-existing files; the observe.ts + SKILL.md change lands after.

## Done-criterion proofs

All proofs run `bun test` inside `skills/watch-issues/` (its own package; the repo-root `bun test` does not scan it) through `akrogon run-check` run from that directory — run-check still attributes the log to this leaf. Sizes: seconds. Rerun trigger: rerun the same command after any change to observe.ts, the stubs, or SKILL.md.

| # | Criterion | Test | Proof command | Intended red (recorded) |
|---|-----------|------|---------------|--------------------------|
| C1 | Seats reported from session X; same-id pane in session Y not reported | T1: two running sessions (`sess-x` holds workspace `testrepo`, `sess-y` holds `other`), `pane-s` in X working with a log path / in Y idle; assert `session=sess-x` is line 1, `A=pane-s/working logA=<path>`, and no `agent list` outside sess-x in the call log | `akrogon run-check --name observe-c1 -- bun test scripts/observe.test.ts -t 'reports seats from the resolved session'` | Red: received `A=pane-s/-` with no `session=` line — old code lists the ambient session. Log: `implementation/check-observe-c1-1792868536528-485949.log` |
| C2 | Missing, duplicate or unreadable workspace: non-zero, refusal on stderr, no status lines | T2: four scenarios (zero match; two sessions both holding `testrepo`; second session `readError`; `sessionListError`) — each asserts non-zero, `testrepo` plus `no running session holds it` / `held by multiple sessions` / `uniqueness unknown` / `session list failed` on stderr, empty stdout | `akrogon run-check --name observe-c2 -- bun test scripts/observe.test.ts -t 'resolution refusal'` | Red: exits 0 — no resolution exists. Log: `implementation/check-observe-c2-1792868541387-492061.log` |
| C3 | `OBSERVE_HERDR` reaches every herdr call | T3: call log shows exactly `session list --json`, `--session sess-x workspace list`, `--session sess-x agent list`; PATH shim untouched | `akrogon run-check --name observe-c3 -- bun test scripts/observe.test.ts -t 'OBSERVE_HERDR covers every herdr call'` | Red: `session=sess-x` absent; call log holds only `agent list` with no `--session`. Log: `implementation/check-observe-c3-1792868541867-492898.log` |
| C4 | SKILL.md describes `session=` and acting commands name it | T4: read SKILL.md; assert `session=<name>` documented and every backticked `herdr ...` command carries `--session` | `akrogon run-check --name observe-c4 -- bun test scripts/observe.test.ts -t 'SKILL.md'` | Red: `session=<name>` absent from the skill text. Log: `implementation/check-observe-c4-1792868555837-507928.log` |

Supporting tests (not criterion proofs): schema-parse tests for the two new recorded fixtures (always green; they guard the recorded shapes).

## Doc checklist

- Agent doc: `skills/watch-issues/SKILL.md` — Observe section gains the `session=` line; Judge acting commands gain `--session <name>`; `notification show` gains `--session <name>`.
- Human docs: none affected (docs/reference/skills.md describes watch-issues at job level only; no doc names observe output fields).

## Limitations preserved

- A session that stops after the observer's list surfaces as a herdr/read error, never a silent retarget (locked fork Q3).
- `tab_closed`-style owner matching across sessions stays deferred to the cross-session-reads leaf; observe.ts does only `agent list`.
- Resolution is once per observe run; the cached `sessionLists`/`resolutions` maps in src/shell.ts are per-process and harmless here.
