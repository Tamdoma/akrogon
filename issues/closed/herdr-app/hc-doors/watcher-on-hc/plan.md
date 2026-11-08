# Plan: watcher-on-hc

Base: `e3202dff` (engine-on-hc merged). Worktree `/home/ivan/.akrogon/worktrees/akrogon/watcher-on-hc`, branch `watcher-on-hc`. Leaf temp `/var/tmp/akr-1000/5d20/3eecfe3d`.

## Read first

- Leaf `brief.md`, `design.md`, `readiness.yaml` (grants[0], retained[0], proofs).
- `docs/reference-index.md` (top index), `src/AREA.md` lines 15 and 18 (`src/shell.ts` herdr leftovers, `src/hc.ts`, `src/transcript.ts`, `src/listen.ts`), `tests/AREA.md` line 14, `skills/AREA.md` line 18.
- `skills/watch-issues/SKILL.md`, `skills/watch-issues/scripts/observe.ts`, `skills/watch-issues/scripts/log-tail.ts`.
- `src/hc.ts` (`repoSpace`, `terminals`, `terminalSchema`/`Seen`, `wakeWatcher`), `src/reconcile.ts:396-412` (`leafSeats`), `src/transcript.ts:86` (`transcriptFor`), `src/state.ts:125` (`seat`), `src/listen.ts:60-90` (wake reasons), `src/seat.ts:203-290` (start verb, labels).
- `tests/hc-fixture.ts`, `tests/stand-in.sh`, `tests/hc-watcher.test.ts`, `tests/e2e/tier.ts`, `tests/e2e/kinds.e2e.ts`.
- `learnings/LESSONS.md`: run-check hides the desktop bus (2026-11-07), run-check ends detached children (2026-11-07), pattern kill crosses leaves (2026-10-13), explanatory prose assertions couple tests to wording (2026-10-01), review command equivalence (2026-10-16).
- Engine precedent: `issues/open/herdr-app/hc-engine/engine-on-hc/plan.md` (D16 wakes, N4 condition reds, O3/O4 trust dialogs) and its `readiness.yaml` `retained`.
- Gap: no grounding doc describes hc's keep-shell states; probe P-K below is the source.

## Planning probes (scratch cores, no harness, stopped and removed after)

- P-K keep shell, hc 0.1.18: a `--keep` terminal whose program exits with a code is `finished` (keep does not apply). One whose program dies by SIGKILL emits `lost` (reason `signaled`), stays `live` with `status: null`, `pid: null`, the old argv, then after about 2 s emits `restarted` on the session stream (a terminal-filtered stream ends at `lost`) and shows `argv: ["/usr/bin/bash"]`, a new pid, `status: null`, `keep: true`, labels kept, `reported: false`.
- P-S session pinning: inside an hc terminal (`HC_SESSION` and `HC_TERMINAL_SOCKET` set by the core), `HC_SESSION=<other> hc ls --json` lists the other core. An explicit `HC_SESSION` wins.
- P-I `hc interrupt` contract (`hc schema` InterruptResult): `key` is `esc` for a program that reports status, else `ctrl+c`; `outcome` is `stopped`, `exited`, `still_working` or `unknown`. `hc get --json` carries `reported`.

## Notes for review

- N1 Brief criterion 1 says "no line for a keep shell or exited terminal"; the locked design (watcher Q2) says such a terminal "is absent". Observe lines are per leaf, so the design wins: the seat prints `<address>/-`, as today's absent pane printed `<pane>/-`.
- N2 The design lists the skill's `observe.test.ts` and `observe-log-tail.test.ts` as owned tests. The real-core fixture lives in `tests/`, the `test` check's root is `tests/` (bunfig), and the skill tests run inside one 30 s wrapper test (`tests/watch-issues-scripts.test.ts`). So the criterion 1 test is `tests/hc-observe.test.ts`, and the two skill files plus the herdr fixtures are deleted (D13).
- N3 Observing a keep shell needs hc's `keep` field, which `src/hc.ts` (engine-owned) does not parse. D4 adds one schema field there.
- N4 Condition cases (below) are red at planning by the missing behavior, because the code each decision describes does not exist yet. The implementing seat shows each condition red with its named mutation right after U1 lands and records it in `implementation/report.md`, as engine-on-hc N4 did.

## Decisions

- D1 Session: `observe.ts` resolves the repo's session with `repoSpace(readRepo(repoKey, root))` from `src/hc.ts`. Output is unchanged: first line `session=<name>`; a refusal prints its reason on stderr, exits non-zero and prints nothing on stdout. `OBSERVE_HERDR` is removed and `OBSERVE_AKROGON` stays. `observe.ts` imports nothing from `src/shell.ts` (brief, B,E).
- D2 Seats: for each readable leaf, `leafSeats(session, repo, state)` from `src/reconcile.ts` gives seat A and B. A terminal counts only when it carries `akrogon=1`, `akrogon.repo`, `akrogon.leaf` and `akrogon.seat` and sits at the address and session `state.seat` records. The printed address is `state.seat.<slot>.address`, or `-` when no seat is recorded. Old `state.pane` ids are ignored (the engine refuses such states).
- D3 Status word: no terminal, a `finished` terminal or a keep shell gives `-`; a live terminal with `status: null` gives `unknown`; otherwise hc's `status.state` verbatim. Line format and field order are unchanged.
- D4 Keep shell: a live terminal with `keep: true` and `status: null` (P-K covers both the pending and the replaced state). `src/hc.ts` `terminalSchema` and `Seen` gain `keep: boolean` (default `false`). Engine seats start without `--keep`, so this marks a program lost under an operator's `hc keep`. Open limitation: a keep-flagged seat whose agent never reported shows `-` instead of `unknown`.
- D5 Log (design open question: how observe reaches the resolver): `observe.ts` imports `transcriptFor` from `src/transcript.ts`, as it already imports `src/config` and `src/state`. One resolver stays. `log<seat>=` prints only for status `working`: the resolved path when its file exists, else `-`. The resolver's own label write (`akrogon.transcript`) is its documented behavior.
- D6 Start: `/watch-issues` and `tick` first check `HC_TERMINAL_ID`. When it is unset, the skill says "This watch needs a terminal inside hc, so no watch is running." and claims no watch. The cron check follows. `/watch-issues` runs one check. When that check's `session=` differs from `$HC_SESSION`, it refuses with "Start the watch in hc session <name>." and sets no label and creates no job. Otherwise it runs `hc label $HC_TERMINAL_ID akrogon.watch=<repo>` (`<repo>` = `akrogon config` repo key), then the CronList/CronCreate step as today. A paused check prints no session, so the label and job step runs without the comparison, as today's paused creation does.
- D7 Stop: `/watch-issues stop` keeps today's CronList/CronDelete rules and always runs `hc label $HC_TERMINAL_ID akrogon.watch=`.
- D8 Fold: one check per turn. Several `/watch-issues tick <root>` lines in one turn's input, or ticks queued while a check ran, run one check. A cron fire and a listener wake are the same tick.
- D9 Seat commands: every `hc` command that names a seat runs as `HC_SESSION=<name> hc ...` with the session from the `session=` line (P-S). Screens: `hc read <address>` for a `working` seat, `hc read <address> --lines 80` otherwise. Own-terminal label commands run plain.
- D10 Busy stop, once per seat per watch: the seat's kind is the harness name in the terminal's `argv` from `HC_SESSION=<name> hc get --json <address>`. The skill holds a stop-key list: claude and pi `hc interrupt` (P4). Codex and agy are written from criterion 3's results (the design's open question). A kind whose seat has `reported: false`, or that the list names `esc`, gets `hc keys <address> esc` then `hc wait <address> --timeout 10`; others get `hc interrupt <address> --json`. A kind neither key stops is listed notify-only with its observed screen. After the key, confirm all of these with `hc get --json` and `hc read`: status `idle` or `done`, the same address, `labels."akrogon.transcript"` equal to the `log<seat>=` path judged with that file present, and an empty input line. Then send one `hc send --json <address> "<evidence>; the brief wants <target>; next: <step>"`. Any failed confirmation, a `log<seat>=-` seat, `started: false` or `outcome` other than `stopped` means notify instead. Never `--force`, kill or park. Stated limit (operator 3a): text typed but not submitted is not seen.
- D11 Notices: the two `herdr --session <name> notification show` lines stay word for word; notices-on-hc owns them. The general "every herdr command runs as herdr --session" sentence goes.
- D12 Never list: "Close a pane" becomes "Kill or remove an hc terminal"; "Run `esc` twice on one seat per watch" becomes "Stop one seat twice per watch"; add "Use `hc send --force`".
- D13 Tests (written at planning, before product code): `tests/hc-observe.test.ts` (criterion 1). Deleted: `skills/watch-issues/scripts/observe.test.ts`, `observe-log-tail.test.ts`, `fixtures/herdr-agent-list.json`, `fixtures/herdr-session-list.json`, `fixtures/herdr-workspace-list.json`. Attended: `tests/e2e/watch-tier.ts`, `tests/e2e/watch-stop.e2e.ts` (criterion 3), `tests/e2e/watch-check.e2e.ts` (criteria 2 and 4). `answerTrust` moves from `kinds.e2e.ts` to `tests/e2e/tier.ts` (taking an address lookup) so both tiers share it.
- D14 Attended runs keep akrogon away from herdr-app windows: akrogon runs with a scratch `HOME` holding `.config/herdr-app-sessions/akr-e2e-watch` and the strict fake `herdr-app` (window closed); the core and harnesses keep the real `HOME`. grants[0] has no window operation.
- D15 The watcher run loads this checkout's skill as a project skill (`<root>/.claude/skills/watch-issues` → worktree skill), with `claude --setting-sources project,local --allowedTools Bash,Read,Grep,Glob,CronCreate,CronList,CronDelete`. Model `AKROGON_E2E_WATCHER_MODEL=claude-opus-5-5` (config slot a). Review note: the grant says "the operator's watcher model"; no other model is recorded.
- D16 Criterion 3 order: agy first, since its trust answer is in grants[0]. Codex follows only after G1.

## Gate and risks

- G1 Grant gap (operator). Codex's "Trust and continue" answer writes a `~/.codex/config.toml` project entry. Claude Code's folder-trust answer writes a `~/.claude.json` projects entry. grants[0] `effects` allow no retention beyond agy's `trustedWorkspaces` (which cleanup removes), and `retained` lists only agy conversations. engine-on-hc met the same dialogs (its plan O3, O4) and got operator-approved `retained` entries. Before the codex stop-check launch and before the watcher launch, A checks readiness.yaml for such an approval. Without one, A writes the blocker in `implementation/report.md` and stops with `akrogon phase watcher-on-hc failed --reason "G1: codex and claude trust entries are outside grants[0]; see implementation/report.md" --slot A`. Operator action: add to readiness.yaml `retained` the codex trust entry for the folder codex names in its dialog (recorded before the answer, under `<leaf temp>/akr-e2e-watch-codex*`) and the `~/.claude.json` projects entry for `<leaf temp>/akr-e2e-watch-claude`. Each stays, removed by hand with no session of that harness running, as engine-on-hc retained[0..1]. Identity: operator user ivan. Owner: operator. The agy stop check is not gated.
- R1 `--setting-sources project,local` may still load user skills. Then the old installed skill runs and the label assertion fails, using one of the 4 sessions. The transcript shows which skill text ran.
- R2 Claude Code may deliver two queued ticks as two turns. Then the fold assertion fails and a 4th check would exceed the bound. The test stops the listener before queueing, so only the test's ticks remain. A failure is a skill-rule finding recorded in the report, not retried past the bound.
- R3 Codex may background `sleep 600` (P4 saw a background terminal stay working on esc). The test records it either way, and the skill lists codex notify-only if neither key stops it (B,C).

## Units and waves

Every wave holds one unit, so the run is serial-solo: A implements with no workers.

- W1 U1 Observe on hc. Owns `skills/watch-issues/scripts/observe.ts`, `src/hc.ts` (the `keep` field only). Shared test resource: none (fixture cores). Needs: nothing. Proof: criterion 1. Then A shows conditions C1.1-C1.7 red by mutation.
- Between W1 and W2, A runs criterion 3 (agy, then codex after G1) in `akr-e2e-watch`.
- W2 U2 Skill text and docs. Owns `skills/watch-issues/SKILL.md` (D6-D12, stop keys from criterion 3), `docs/use/watch-while-away.md`, `skills/AREA.md`, `tests/AREA.md`. Needs U1 (line wording) and criterion 3's results. Then A runs criterion 4, then criterion 5's grep and criterion 6's verify.

Docs affected, one line each:
- `skills/watch-issues/SKILL.md`: the agent doc this leaf rewrites.
- `docs/use/watch-while-away.md`: start inside an hc terminal in the repo's session, events wake the watch besides the cron, stop removes the label, "never closes a pane" becomes "never kills or removes a terminal"; the notification step keeps today's wording (notices-on-hc).
- `skills/AREA.md:18`: observe reads hc seats and the resolver's transcript path.
- `tests/AREA.md`: `tests/hc-observe.test.ts` and the watch e2e files; line 14 stays.
- `docs/reference-index.md`: unchanged (its `src/AREA.md` line is engine wording).

## Interfaces

- `repoSpace(repo: Repo): Promise<SpaceResolution>`, `leafSeats(session: string, repo: Repo, state: State): Promise<{ A: Seen | undefined; B: Seen | undefined }>`, `transcriptFor(seat: { session: string; address: string }): Promise<string | null>`, `Seen.keep: boolean`.
- Skill commands: `hc label $HC_TERMINAL_ID akrogon.watch=<repo>`, `hc label $HC_TERMINAL_ID akrogon.watch=`, `HC_SESSION=<s> hc read <address> [--lines 80]`, `HC_SESSION=<s> hc get --json <address>`, `HC_SESSION=<s> hc interrupt <address> --json`, `HC_SESSION=<s> hc keys <address> esc`, `HC_SESSION=<s> hc wait <address> --timeout 10`, `HC_SESSION=<s> hc send --json <address> "<text>"`.

## Criteria and proofs

### 1. observe on a real core

- Boundary: `bun skills/watch-issues/scripts/observe.ts <root>` as a subprocess against a real fixture core (`tests/hc-fixture.ts`) whose herdr-app document holds the repo space, with stand-in and shell seats labelled like engine seats and recorded in `state.seat`.
- Before: observe calls herdr, so it prints the fake herdr session and `-` for every hc seat. After: `session=<core>`; per leaf `A=<address>/<status>`: `unknown` (never reported), `working`/`idle`, `-` for exited, keep shell, unrecorded or other-session seats and an unknown address; `logA=<resolver path>` for a working seat whose transcript label points at an existing file, `logA=-` / `logB=-` otherwise; the state-only fields, failure details and unreadable reports as before; the path feeds `log-tail.ts`. Second case: only the session line for empty or missing `issues/open`; `akrogon config` failure and `repo: none` exit non-zero naming `akrogon config`; no repo space refuses with `no running session holds it` and empty stdout.
- Catches: a wrong label filter, trusting labels or addresses alone, ignoring the recorded session, a wrong status mapping, a keep shell or finished seat shown live, a missing log path or a dead path printed.
- Test `tests/hc-observe.test.ts`. Proof: `akrogon run-check --name c1-observe -- bun test --timeout=30000 tests/hc-observe.test.ts`, and the `test` check. Size: seconds (2.3 s at planning). Rerun: `observe.ts`, `src/hc.ts`, `src/reconcile.ts` `leafSeats`, `src/transcript.ts`, hc upgrade.
- Red at planning: `check c1-observe-red: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/watcher-on-hc/implementation/check-c1-observe-red-1794103362503-33644.log`. Excerpt: test 1 got `session=default` and `A=-/-` for every seat where it expected `session=aktq09-1`, `A=t1/unknown`, `A=t2/working busy=0h00m logA=…/pi-session.jsonl B=t3/working logB=-`. Test 2 got `session=default` where it expected `session=aktiod-2`. The keep-shell precondition held (live, `keep: true`, argv changed).
- Conditions (each in the one observe invocation, where D2-D5's state lives). Red at planning by the missing behavior (same log); mutation reds come after U1 (N4):
  - C1.1 null status prints `unknown` (D3): case `ob-null`. Mutation: print `-` for a null status.
  - C1.2 a keep shell is absent (D4): case `ob-keep`. Mutation: drop the `keep` test, so it prints `unknown`.
  - C1.3 a finished seat is absent (D3): case `ob-exit`. Mutation: ignore `state: finished`.
  - C1.4 labels and recorded address both required (D2): case `ob-unrec` (labelled stray at another address, recorded address unlabelled and working). Mutation: match by address only, then by labels only.
  - C1.5 recorded session required (D2): case `ob-elsewhere`. Mutation: ignore `ref.session`.
  - C1.6 log is the resolver's existing file, else `-` (D5): cases `ob-work` A (label path printed) and B (`logB=-`), `ob-gone` (label to a missing file). Mutation: drop the existence check.
  - C1.7 log only for a working seat (D5): case `ob-idle` (label set, idle). Mutation: resolve for every status.

### 2. Skill starts only in hc, labels, folds ticks

- Boundary: the attended watcher run of criterion 4: a Claude terminal in `akr-e2e-watch` runs this checkout's skill.
- Observed: after `/watch-issues` the watcher terminal carries `akrogon.watch=akre2e`. Two ticks sent while it works on the wake check produce one more check. The transcript holds 3 tick occurrences, 3 `akrogon status` checks in all and 2 after the first tick. After `/watch-issues stop` the label is gone.
- Catches: a skill that never labels (no wakes), one check per tick, a label left after stop.
- Limit: the refusal outside hc and the session-mismatch refusal are skill text with no live case. They cost a paid session, and a run outside hc cannot be woken. B reviews the text.
- Proof, size and rerun: as criterion 4.

### 3. Codex and agy stop keys

- Boundary: `tests/e2e/watch-stop.e2e.ts` per kind in `akr-e2e-watch`: the start verb starts a real seat on the throwaway leaf `akr-e2e-watch-<kind>`, cwd `<leaf temp>/akr-e2e-watch-<kind>`, with the task "Run exactly this shell command in the foreground and wait for it to finish: sleep 600"; `hc wait --output 'sleep 600'` shows it on the command.
- Observed and recorded under `implementation/watch-e2e/`: `reported`, the `hc interrupt --json` key and outcome (or `hc keys esc` for a non-reporting seat, then one `esc` if interrupt did not stop it), screens before and after, the transcript path. Pass: either the seat ends `idle`/`done` at the same address with an unchanged transcript label and a corrective `hc send` returns `started: true` and its turn ends, or neither key stopped it and the screen is recorded (notify-only).
- Catches: the skill naming a key that does not stop a kind, a stop that kills the seat or changes its conversation, a corrective send that is not taken.
- Model-facing inputs: the task text and the corrective text in the test. Recording: `<kind>-*.json/txt` and the transcript lines the report quotes before cleanup removes them. Consumers: A writes the codex and agy stop keys into SKILL.md from `<kind>-result.json`; the end-to-end proof before old herdr is removed replays nothing.
- Proof: `akrogon run-check --name watch-stop-<kind> -- env AKROGON_E2E=watch-stop AKROGON_E2E_KIND=<kind> AKROGON_E2E_ROOT=/var/tmp/akr-1000/5d20/3eecfe3d AKROGON_E2E_OUT=/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/watcher-on-hc/implementation/watch-e2e bun test --timeout=30000 ./tests/e2e/watch-stop.e2e.ts`. Size: minutes. Rerun: a codex, agy or hc upgrade.
- Restart boundary: each run is one kind with its own cleanup and absence check. A rerun starts from a clean `absent()`.
- Red at planning: `check p1-watch-stop-red: 1 …/check-p1-watch-stop-red-1794103745261-52516.log` (and for criterion 4 `check p2-watch-check-red: 1 …/check-p2-watch-check-red-1794103750645-52867.log`). Both stop at the pre-launch gate `observeReady` with `observe does not read akr-e2e-watch: … "refused":"session list failed","error":"herdr session list --json: exit 1"`: observe still reads herdr. No harness started. A deliberate break past the gate would need a paid session, so the first post-U1 run is the proof.

### 4. A live watcher gets a wake and records its judgment

- Boundary: `tests/e2e/watch-check.e2e.ts`: core `akr-e2e-watch`, registered repo `akre2e` at `<leaf temp>/akr-e2e-watch-claude`, leaf `akr-e2e-watch-leaf` with a stand-in seat A (`idle` mode, started by the start verb), the listener program `akrogon listen` run against the session only (scratch `XDG_RUNTIME_DIR`), and the Claude watcher terminal.
- Before: watcher idle after check 1, seat A live. After `hc kill` of seat A: the listener's wake makes the watcher work, and the transcript holds the wake tick, one check for it (its `akrogon status`) and the watcher's reply (judgment), recorded with screens, listener logs and a transcript summary.
- Catches: wake not sent or not received, wrong label lookup, a check not run per wake.
- Model-facing inputs: SKILL.md and the four messages the test sends. Recording: `implementation/watch-e2e/` files plus quotes in the report before transcripts are removed. Consumers: the end-to-end proof before old herdr removal repeats this run (design C).
- Proof: `akrogon run-check --name watch-check -- env AKROGON_E2E=watch-check AKROGON_E2E_WATCHER_MODEL=claude-opus-5-5 AKROGON_E2E_ROOT=/var/tmp/akr-1000/5d20/3eecfe3d AKROGON_E2E_OUT=/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/watcher-on-hc/implementation/watch-e2e bun test --timeout=30000 ./tests/e2e/watch-check.e2e.ts`. Size: minutes. Rerun: SKILL.md, `observe.ts`, `src/listen.ts`, `src/hc.ts` `wakeWatcher`, a Claude Code upgrade.
- Restart boundary: one run with its own cleanup and absence check.
- Red at planning: see criterion 3 (P-2 log, same gate).

### 5. No old herdr names in the watcher

- Observed: `akrogon run-check --name c5-grep -- sh -c "grep -rnE 'herdr (agent|pane|session)|HERDR_ENV' skills/watch-issues; grep -n 'src/shell' skills/watch-issues/scripts/observe.ts; true"` prints no line. Today's notice lines read `herdr --session ... notification show`, which the pattern does not match; any match would be reported against D11.
- Catches: a leftover herdr pane or session command, or the old `src/shell.ts` imports.
- Size: seconds. Rerun: any SKILL.md or script change. Recorded in the report.

### 6. Test duration

- Observed: the `test` duration from `akrogon verify` on the final head against today's baseline (median 75 s). The report explains any rise over about 10 s. Expected cost: about 2-3 s for `tests/hc-observe.test.ts` (runs in parallel), minus the deleted skill tests inside the wrapper test.
- Old tests replaced, named in the report:
  - `skills/watch-issues/scripts/observe.test.ts`: all cases drove a fake herdr. Its line-format, failure-detail, busy, unreadable, foreign, depth, duplicate, empty, missing, config-failure and refusal cases move into `tests/hc-observe.test.ts`. Not ported, for removed behavior: herdr exit and non-JSON cases, `OBSERVE_HERDR` coverage, claude/codex session-id path derivation and ambiguous rollouts (now the engine's resolver, proven by its kinds tier), the SKILL.md `--session` wording test and the herdr list schema cases.
  - `observe-log-tail.test.ts`: its observe-to-log-tail wiring moves into test 1.
  - `fixtures/herdr-agent-list.json`, `herdr-session-list.json` and `herdr-workspace-list.json` are deleted with the herdr reads. `pi-session.jsonl` and the other transcript fixtures stay for `log-tail.test.ts` and test 1.

## Grant use (readiness grants[0])

Prior use: the leaf's earlier artifacts (`brief.md`, `design.md`, `readiness.yaml`, `state.yaml`) hold no count lines, so 0 sessions so far. Bound: at most 4 harness sessions in all (one codex and one agy stop check, one repeat of either, one watcher), at most 4 prompts per stop-check session, the watcher at most 3 checks. Unit: harness session, counted when a run reaches its paid stage, whatever the outcome.

- Count line P-1 (planning red run of `tests/e2e/watch-stop.e2e.ts`, kind agy): grant grants[0], bound 4 sessions, count so far 0, unit harness session. Expected 0 sessions: the run stops at `observeReady` (observe still reads herdr) before the start verb.
- Count line P-2 (planning red run of `tests/e2e/watch-check.e2e.ts`): grant grants[0], bound 4 sessions, count so far 0, unit harness session. Expected 0 sessions: same stop before the stand-in seat and the watcher launch.
- P-1 completed: red at `observeReady`, `check p1-watch-stop-red: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/watcher-on-hc/implementation/check-p1-watch-stop-red-1794103745261-52516.log`. Harness sessions 0, count after 0 of 4, IDs none, cost none. Core `akr-e2e-watch` started and stopped. `implementation/watch-e2e/agy-absence.json` reads `{"left": []}`, and no `akr-e2e*` folder remains in the leaf temp.
- P-2 completed: red at `observeReady`, `check p2-watch-check-red: 1 /home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-doors/watcher-on-hc/implementation/check-p2-watch-check-red-1794103750645-52867.log`. Harness sessions 0, count after 0 of 4, IDs none, cost none. `watch-check-absence.json` reads `{"left": []}`.

## Old herdr ids (2026-11-08, door t15 under the operator's overnight delegation)

This leaf was dispatched by the pre-switch release seconds before the switch, so its state held herdr pane and tab ids and the hc release refused implement ("state predates hc"). Door t15 removed `tab` and `pane` from state.yaml (copy in `~/.local/state/akrogon-door-backup/predates-hc-20261108/`); the next pass starts hc seats. The old herdr seats stay idle for the operator to close.

## Implementation notes (2026-11-08)

- `Seen.keep` is `keep?: boolean` in the type, refining D4: `tests/store-sweep-safety.test.ts:177` builds `Seen` literals without it and tests are locked. `terminalSchema` still defaults it to `false`, so every parsed terminal carries it.
- C1.4's address-only mutation must also drop `leafSeats`' label filter on `terminal.list` (refines N4): with only the seat-letter check removed the hc label filter still excludes the unlabelled terminal and the test stays green.
- Until criterion 3's codex run settles its key, SKILL.md lists codex notify-only (refines D10), which is today's notify path and P4's observation (esc left codex working). The codex run replaces that line with its result.
- Criterion 3's codex run (report I-3) settled codex notify-only with its observed screen; SKILL.md names it so. The watch-stop on-command wait was corrected (commit `27b83bcd`, report I-2) because the task text matched it.

## Operator decision G1 (2026-11-08, door t15 under the operator's overnight delegation)

Delegation, operator verbatim 2026-11-07: "you send it, you fully control that process, please" and "All approvals that are needed". Blocker G1 in implementation/report.md is approved as for engine-on-hc O3/O4: one `hc keys enter` answers codex "Trust and continue" for a recorded `<leaf temp>/akr-e2e-watch-codex*` folder and Claude Code's folder-trust dialog for the recorded `<leaf temp>/akr-e2e-watch-claude` cwd; the harness itself writes the entry, no script edits `~/.codex/config.toml` or `~/.claude.json`, and both entries are retained (readiness.yaml `retained`, owner operator). The 4-session bound is unchanged.
- Pass 2 (report I-4 to I-6): the watcher launch needs `--permission-mode dontAsk` (commit `a3eb81b1`), because auto mode's onboarding dialog swallowed the wake. Claude Code runs queued ticks one per turn, so criterion 2's fold is red and waits on an operator decision (report "Blocker: criterion 2 fold").

## Operator decision C2 (2026-11-08, door t15 under the operator's overnight delegation)

Blocker "criterion 2 fold" answered (a). Claude Code submits each queued `/watch-issues tick` as its own turn, and wakes are already single-flight because the listener sends only to an idle watcher, so the skill keeps one check per tick with no time-window rule that could drop a fresh wake. Brief criterion 2 now reads "runs one full check per wake, cron fire or tick; ticks queued while a check runs each run their own check" (design watcher Q1 1a's "queued ticks run one check" is replaced by this answer). The skill text says so. `tests/e2e/watch-check.e2e.ts` counts only the `<command-args>` records for ticks and expects one check per tick. Grant renewed: harness sessions from 4 to a new total of 7 (6 used, I-1 to I-6), the watcher at most 4 checks per launch. The next launch must observe the stop step's label removal.
- Pass 3 (report I-7, I-8): after decision C2, hc counts Claude Code's back-to-back queued turns as one working span, so `tests/e2e/watch-check.e2e.ts` settles on the ticks in the transcript (commit `793055a4`), not on hc's turn count.
- check.fix (2026-11-08): criterion 3's stimulus is per kind (`tests/e2e/watch-stop.e2e.ts`, commits `e243df3b`, `f4b2e04b`): agy runs `ping -c 600 127.0.0.1` and waits for "Running (ping -c 600", because agy refuses `sleep 600` (B-R1) and shows "Running command..." for exploratory commands; codex keeps `sleep 600` and "Running". Criteria 2 and 4 count checks per `/watch-issues` turn (`d97290ff`). Proof-command correction record in implementation/report.md.
