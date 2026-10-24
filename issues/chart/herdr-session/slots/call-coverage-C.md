# Fork notes, seat C: call-coverage

Blind notes, written without A's draft, this fork's Findings, or another seat's notes. Locks read: Taken sections of session-address, stopped-and-ambiguous, cross-session-reads. All evidence dated 2026-10-24. No herdr mutation, no akrogon command run. One question in this fork.

## Q1. Which herdr callers are pinned in this chart?

### Pick

Pin every src lifecycle caller and the land unit in this chart, plus the test fake that stands in for herdr. Split the skill scripts and skill prose into one named sibling leaf. Leave three callers ambient permanently.

**Pin in this chart — through `src/shell.ts` `herdr()` once it takes a session:**

- The wrapper itself and its list helpers: `src/shell.ts:202-212` (`herdr`), `:214-224` (`panes`, `tabs`, `workspaces`). This is the pinning mechanism; the `--session` prefix and the deadline plumbing both land here.
- `src/next.ts:206` pane get, `:383` pane close, `:426` tab create, `:441` pane split, `:473` tab focus, `:476` pane swap, `:505` pane split, `:866` and `:880` merge notifications. Allocate, dispatch, and notice for a leaf are the acting calls cross-session-reads Taken already binds to the tagged session.
- `src/phase.ts:43-57` (`herdrCall` and its retry), `:64` tab rename, `:87` failed notification. The rename produced the seed's first visible symptom; both are per-repo and must land in the repo's session.
- `src/verify.ts:241` main-red notification: pinned to the repo's session. A stopped repo session delays it, which the existing receipt retry already tolerates; an ambient fallback would show it to whoever owns the wrong session.
- `src/scope.ts:123` pane process-info. It feeds scope boxing inside allocate; a wrong-session read fails allocate after tab state is saved.
- `src/log.ts:40` diagnostic pane lookup via `panes()`. It inherits pinning from the wrapper for free; the cross-session-reads Taken rule for which pane it reads is separate and already locked.

**Pin in this chart — raw bypasses, converted to the same pinned argv builder:**

- `src/next.ts:192` busy notification (`command(['herdr','notification','show',...])`).
- `src/next.ts:611` agent start and `:646` agent prompt (`run(['herdr',...])`). These are the highest-stakes bypasses: they start paid seats and deliver prompts.
- `src/reconcile.ts:387` merged-tab close (`command`) and `:667` cleanup tab close (`run`). Destructive, and reconcile is where a wrong-session close silently reads as `tab_not_found` and keeps state that should have moved.

**Pin in this chart — by removal:**

- `src/land.ts:33-35`: delete the `HERDR_SOCKET_PATH` forwarding into the `akrogon-land-<attempt>` unit. The land process knows its repo and slug and resolves like every other entry path (session-address Taken already lists land wake paths as resolution entry points). Forwarding the caller's socket is the seed's vector in a systemd unit; forwarding the resolved session instead would be a second mechanism to keep consistent.

**Change in this chart — test stand-in:**

- `tests/fake-herdr.ts`: multi-session support is not optional work. The fake parses `args[0]` as the subcommand throughout (`:132-403`), holds one DB (`tests/helpers.ts:139`), and has no `session` command at all. The first pinned call (`--session` prefix) breaks every fixture. It needs: strip an optional `--session <name>` prefix, one pane/tab/workspace store per session name, and a `session list --json` answer with `name`, `running`, `socket_path`, `session_dir`, `default` per session. Unpinned calls must keep working for the leave-ambient callers below (`plugin link` at `tests/fake-herdr.ts:149`, `integration install` at `:145`).

**Split into a named sibling leaf — skill scripts and skill prose:**

- `skills/chart-issues/scripts/peer-restart.ts:60` (shared `run()` helper; call sites `:115,126,153` agent list, `:177` pane process-info, `:243` agent start, plus a direct `kill -TERM` on the pane's process group at `:215` that is not a herdr call but aims by one).
- `skills/chart-issues/scripts/peer-create.ts:61,68` (pane split and agent start, through peer-restart's `run`).
- `skills/chart-issues/scripts/peer-ask.ts:36` agent prompt, `:49` agent list.
- `skills/chart-issues/scripts/peer-wait.ts:95` agent wait, `:117` agent list.
- `skills/chart-issues/scripts/door-reset.ts:74-75` (own helper; prompts at `:121,126,130,149`).
- `skills/watch-issues/scripts/observe.ts:88` agent list (binary from `OBSERVE_HERDR`, `:220`).
- Prose-typed calls: the pre-prompt wait chain in `skills/chart-issues/assets/questions.md` (Blind peer exchange section: `herdr agent wait <paneB>` chained before `peer-ask.ts`), `herdr agent list` references in `skills/chart-issues/SKILL.md:39` and `assets/shapes.md:55,214`, and the acting commands in `skills/watch-issues/SKILL.md:32,42` (`agent read`, `agent send-keys`, `agent wait`, `agent prompt`).

Why split rather than pin here: the pinning input differs. Src pins by repo (workspace discovery); these scripts address panes the operator or door named, in whatever session those panes live, so pinning them means finding a pane's session by searching sessions for the id — a different lookup with its own ambiguity rules, not a reuse of repo resolution. They are also the tooling operating this very chart, and their fakes are different (`OBSERVE_HERDR` stubs in `skills/watch-issues/scripts/observe.test.ts`, the door-reset fixture in `tests/door-reset.test.ts`). Folding them in buys a much larger leaf for a failure that is comparatively visible: a peer prompt to a missing pane exits non-zero at an attended door.

The interim risk accepted by splitting is real and should be named in the sibling leaf: on a stale inherited socket, `peer-restart.ts` could read process-info for a same-id pane in another session and `kill -TERM` the wrong process group, and `peer-ask.ts` could deliver a prompt to a same-id pane elsewhere. Both need the same-id collision plus a stale env; the door and its consultants are normally in one tab in one session, watched by the operator.

**Leave ambient permanently:**

- `src/install.ts:136` `integration install` per harness kind. It edits harness configuration files on disk and never opens the API socket (herdr v0.9.1: `src/cli/integration.rs:88` dispatches to config-file editing under `src/integration/`). Pinning it would be meaningless.
- `src/install.ts:137` and `src/self-update.ts:284` `plugin link`. Plugin registration is global, not per-session: `herdr --session <each> plugin list` shows the identical set and config dir in all three running sessions (live probe, 2026-10-24, from the opening map), and herdr itself persists the link offline when no server is reachable (v0.9.1 source `src/cli/plugin.rs:82,131`). Pinning to a resolved session would make self-update fail when that one session is stopped, for no placement benefit.
- `plugin/herdr-plugin.toml` plus `plugin/next.sh` and `plugin/pull.sh`: these make no herdr calls; they are the entry points whose injected env the cross-session-reads Taken rules now consume. Nothing to pin.
- The new `session list --json` enumeration call: unpinned by definition.

Cost of the pick as a whole: the src side is mechanical but touches the central wrapper's signature, so every `herdr()` call site and the recorded `delivery_error.command` shape in leaf state change with the argv prefix; test assertions that compare argv exactly exist today (`tests/shell.test.ts:107`, `tests/next.test.ts:137`, `tests/status.test.ts:713`). The land unit's argv changes too (dropped `--setenv`), which unit-shape tests will feel. The split leaves a known unpinned surface running the same stale-env risk until the sibling leaf lands.

### Rejected

- Pin everything including skill scripts in this chart: one leaf would carry two different addressing mechanisms (repo discovery and pane-id session lookup), two test-fake rewrites, and edits to the scripts currently operating the chart's own consultant exchange. The blast radius is the reason to split, not a reason to skip.
- Src only, scripts left permanently: leaves `peer-restart.ts`'s kill-by-herdr-read and `observe.ts`'s status reads on the same trust that caused the seed. Accepted only as a sequencing step with a named sibling, not as an end state.
- Leave the raw src bypasses and pin only `herdr()` callers: the bypasses include agent start, agent prompt, and both tab closes — the most destructive and most expensive calls in the system. A pin that covers `pane get` but not `agent start` protects the reads and abandons the writes.
- Route raw bypasses by rewriting `HERDR_SOCKET_PATH` in their spawn env instead of the `--session` prefix: two pinning mechanisms in one codebase, and error records then hide which session was meant. The taken mechanism is the prefix; bypasses should share it.
- Forward the resolved session name into the land unit (env or argument) instead of dropping forwarding: land already re-derives everything else from repo and slug under the global lock; a forwarded name is a second copy of a fact it can resolve, and it silently disagrees if the workspace moved between claim and unit start.
- Pin `plugin link` to the akrogon repo's resolved session for symmetry: the registry is global and herdr handles a dead server itself. Symmetry here buys a failure mode, not safety.

### Evidence

- better-than-training · this repo at c5cf7be7, grepped and read 2026-10-24 · every caller line in the pick; `tests/fake-herdr.ts:132-403` subcommand dispatch and `tests/helpers.ts:137-139` single-DB fixture; `tests/fake-herdr.ts:59-61` default workspaces; exact-argv test assertions at `tests/shell.test.ts:107`, `tests/next.test.ts:137`, `tests/status.test.ts:713`. The `~/.claude/skills/chart-issues` and `watch-issues` paths are symlinks into the installed release of this same repo (verified 2026-10-24), so the repo `skills/` tree is the single inventory source.
- better-than-training · herdr v0.9.1 source, read 2026-10-24 · `src/cli/integration.rs:88` and `src/integration/` (integration install is file editing, no socket); `src/cli/plugin.rs:82,131` (offline plugin link/list fallback).
- practitioner · live probes, 2026-10-24 · identical `plugin list` output and config dir across infra, mdconsultingny, and personal; `--session` overriding a wrong `HERDR_SOCKET_PATH` on the installed 0.9.1.
- operator · INTAKE Scope and the three Taken sections, 2026-10-24 · acting calls go only to the tagged session; resolution happens in allocate, busy observation, hook ownership, reconcile, phase, and land wake paths. Call coverage is the fork that makes those locks reachable at every call site.

### Pitfalls

- P1. Argv shape change ripples into persisted records: `delivery_error.command` in leaf state (`src/state.ts:22-30`) stores the exact argv, so existing state files written before the change hold the old unprefixed shape and any test or guard comparing them breaks. Removed by: nothing structural; criteria should treat the command record as diagnostic and update the exact-match tests rather than version the field.
- P2. `phase.ts` warns with `command: ['herdr', ...args]` rebuilt by hand (`src/phase.ts:52,73`), and `src/next.ts` records raw argv arrays for start/prompt failures (`:611`, `:646` into `recordFailure`). If only the spawn gets the prefix, the recorded and retried argv disagree with what actually ran. Removed by: one argv builder in `shell.ts` that both execution and recording use, so a hand-rebuilt command has to be a deliberate act.
- P3. The fake's per-session split changes fixture authoring everywhere: tests that seed panes or workspaces must name the session those rows live in, and the fixture repo in tests is literally named `repo`, so discovery needs a running session containing a `repo` workspace by default or most next/phase tests fail for an unrelated reason. Removed by: the fake's default session set containing exactly the current default workspaces (`w1/repo`, `w3/other`) under one named running session, so unmodified fixtures resolve as before.
- P4. Dropping land's socket forwarding changes the land unit's environment completeness check: anything in the land process that (even accidentally) relied on `HERDR_SOCKET_PATH` being present — `mergeWake`'s notifications are the known one — now depends on resolution landing first in that process. Removed by: landing order inside the chart (resolution and pinned calls before the forwarding removal is exercised), and a test that runs the land path with the env var absent.
- P5. Notifications are the one pinned class with no state to protect: pinning `verify.ts:241` and the next/phase notices means a repo whose session is stopped gets no visible notice anywhere, where today it might land in whichever session the ambient env named — sometimes the operator's actual screen. Removed by: nothing in scope; stopped-and-ambiguous took 4a (no new notification), and the receipts persist. Stated so the change in operator-visible behavior is recorded, not discovered.
- P6. Splitting the skill scripts leaves two fake ecosystems diverging: once src tests drive a multi-session fake, the sibling leaf's script tests (`observe.test.ts`, door-reset fixtures) still stub a single-session herdr, and a later reader can mistake that for coverage. Removed by: naming the script fakes explicitly in the sibling leaf's scope, as done for `tests/fake-herdr.ts` here.

### Questions the fork does not ask

- Where does the pinned argv builder live for callers that cannot import `src/shell.ts` — `skills/chart-issues/scripts` run under `bun` from the installed release and do import repo code in places, but the watch observer is deliberately standalone (`OBSERVE_HERDR`/`OBSERVE_AKROGON` seam, `skills/watch-issues/scripts/observe.ts:220-221`)? The sibling leaf needs that answer before it can pin anything.
- Should `akrogon status` or any read-only reporting command show the resolved session per repo once resolution exists? Call coverage decides what is pinned, not what is displayed, but the operator's only way to learn a repo is misaddressed today is a refusal line.
- The seat shells akrogon launches inherit whatever herdr env herdr itself injected into the new pane, and tools the seat runs by hand (`herdr pane list` typed in a seat) stay ambient by construction. Is any of that in this chart's promise, or is the boundary strictly akrogon's own calls? The intake says akrogon; the question is worth recording because it bounds what "fixed" means.
