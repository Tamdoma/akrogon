# Fork notes, seat C: stopped-and-ambiguous

Blind notes, written without A's draft, this fork's Findings, or another seat's notes. Lock: session-address Taken (discover across running sessions, exact label, refuse on zero or several; resolve once per repo per invocation). All evidence dated 2026-10-24. No herdr session or workspace was started, stopped, or created.

## Settled with evidence

### S1. A `--session <name>` API call to a stopped session errors; it does not start the server

From herdr source at tag v0.9.1 (peeled commit `065ef9d6a531c49fb8bee7e818ef837065b21ee9`, cloned 2026-10-24; the installed binary reports `herdr 0.9.1`):

- Socket choice: `src/session.rs:173-181` `active_api_socket_path` returns the explicitly requested session's socket when `--session` was given, ignoring `HERDR_SOCKET_PATH`; else the socket env; else `HERDR_SESSION`; else default. Same order documented at this tag, `docs/next/website/src/content/docs/socket-api.mdx:686-691`.
- API subcommands never spawn: `src/cli.rs:769-782` `send_request` builds an `ApiClient` whose only transport is a socket connect (`src/api/client.rs:96-97`). There is no spawn call anywhere in the CLI request path.
- A dead socket (connect `NotFound` or `ConnectionRefused`, `src/cli.rs:824-829`) maps to a structured error: code `server_not_running`, message "no herdr server is running at \<socket\>; run `herdr session attach <name>` to start or attach it" (`src/cli/server_not_running.rs:29-41`).
- Spawning exists only on the interactive path: `src/server/autodetect.rs:293-322` `auto_detect_launch` (spawn daemon, wait for socket, attach client), reached from `src/main.rs:790` when no API subcommand runs (`herdr`, `herdr --session X`, `herdr session attach X`). The `--help` text "Use or create a named persistent session" describes that attach path, not API commands.
- Two narrow exceptions recover instead of reporting, still without starting anything: `plugin link` and `plugin list` fall back to a persisted offline registry on a dead server (`src/cli/plugin.rs:82,131`). akrogon does not depend on these for seat placement (install and self-update only).
- `session list --json` computes `running` live: socket file exists and a connect succeeds at list time (`src/session.rs:216-224,415-417`). A stale socket after a crash therefore lists as not running. The only gap is a server stopping after the list.

Consequence for this chart: a session that stops between `session list` and a later pinned call produces a `server_not_running` error at that call and nothing else — no server start, no plugin startup hooks. akrogon already parses this shape: `herdrError` (`src/shell.ts:188-197`) extracts code and message, and the code is not in the retryable list (`src/shell.ts:179-186`), so no retry masks it.

### S2. One session may hold two workspaces with the same label

Yes, settled from the same source. Workspace create applies the label with no comparison to existing workspaces (`src/app/api/workspaces.rs:39-84`), rename is the same (`src/app/api/workspaces.rs:104-122`), and the setter is a plain assignment (`src/workspace.rs:1002-1004`). The API `label` is the display name (`src/app/creation.rs:384`): the custom name when set, otherwise a label derived automatically from the workspace's identity cwd (`src/workspace.rs:1023-1090`). So duplicates arrive two ways: an operator names two workspaces alike, or two unnamed workspaces derive the same label from similar paths. akrogon's workspace schema sees only the label string (and workspace_id), so it cannot distinguish a custom name from a derived one.

### S3. How a per-repo failure propagates today (repo at c5cf7be7)

- Dispatch path, contained per leaf: `allocate` is called inside `dispatchLeaf`'s try (`src/next.ts:782`; second site `src/next.ts:1094` on the merge side), and the catch reports once per repo+path (and repo+slug) through `report` and returns `skipped` (`src/next.ts:793-798`, `report` at `:111-119`). Today's `No herdr workspace labeled` (`src/next.ts:408`) therefore stops that leaf only. `sweep` and `sweepAll` keep iterating leaves and repos (`src/next.ts:801-852`).
- Reconcile path, contained per repo: `reconcileRepos` catches per repo and reports at repo root (`src/next.ts:1301-1320`). The host step after the loop is outside that catch (`src/next.ts:1322`); a throw there escapes `nextCommand`'s lock and the per-repo `mergePass` loop after it never runs.
- Merge paths, contained per repo: the touched-repo `mergePass` loop catches and reports per repo (`src/next.ts:1500-1507`), and `mergeWake` catches and reports (`src/next.ts:1168-1170`). Self-update per repo is caught as a warning (`src/next.ts:1367-1379`).
- Exit code: any reported skip sets `process.exitCode = 1` at the end of `nextCommand` (`src/next.ts:1509`), after every repo ran. `unpausePass` instead aggregates skips into one thrown "Unpause pass incomplete" error after its work (`src/next.ts:1512-1530` region).
- Not contained today: `selectLeaves` runs before the lock with its own throws (`src/next.ts:1262-1299`); hook ownership `paneOwners` calls `panes()` uncaught (`src/next.ts:1330`); the `owners.length > 1` throws on the `tab_closed` and hook-pane routes escape the lock (`src/next.ts:1435,1465`). In the tab_closed route the reconcile call itself is caught, but those owner throws are not.
- Visibility: `report` writes one JSON line to stderr. For hook-spawned passes that lands in herdr's plugin command log (herdr docs at this tag, `docs/next/website/src/content/docs/plugins.mdx`, Startup hooks and Commands sections: hook completion is recorded in the plugin command log; a startup failure does not stop the server). Nothing operator-facing displays it by itself.

## Q1. Stopped sessions, duplicate labels, unreadable running session

### Pick

Four rules, all within the taken "discover across running sessions" lock:

1. Stopped sessions are not searched. Gate on the `running` flag from `session list --json`; never call into a session it reports stopped, and never start one. If a pinned call still returns `server_not_running` (the session stopped after the list), treat that session as stopped for the rest of the invocation: during discovery it counts as not searched, after resolution it surfaces as the herdr error per taken Q3, but the message akrogon records should name the session, not just the socket path herdr prints.
2. Refusal text separates searched from not searched: "label `X` not found in running sessions A, B; not searched (stopped): C, D". Plain "not found" would send the operator hunting a rename when the real fix is starting session C.
3. Duplicates count by workspace, not by session: two or more workspaces matching the label anywhere in running sessions — same session included — refuses, naming session and workspace_id of each match. S2 proves both duplicate shapes exist, and today `find` (`src/next.ts:407`) silently takes the first.
4. An unreadable running session (listed running, but `workspace list` fails with anything other than `server_not_running`) makes that repo's discovery incomplete and refuses the repo, naming the session and the error. Not-searched-because-stopped is known and consistent with the lock; unreadable is unknown — the session might hold the workspace or a duplicate, so proceeding on a unique match elsewhere reopens silent wrong placement. This matches the taken second-seat guard, which already refuses when a running session is unreadable.

Reason: S1 removes the original fear (a wrong call cannot start a server), so the stopped rules are about message quality and consistency, not side-effect safety. The `server_not_running` code gives a clean mechanical line between "known stopped" and "unknown", and akrogon already parses error codes at the boundary.

Cost: one unreadable session blocks placement for every repo, since every repo's discovery searches all running sessions. After a herdr update with a protocol bump, that is every repo refusing until the stale server restarts. That is visible and fixable in one action, but it is a wider blast radius than the repo whose workspace is missing. A derived-label workspace the operator never named can also create a duplicate refusal they did not expect (S2); the workspace_ids in the message are what let them find it.

### Rejected

- Start a stopped session when it might hold the workspace: starting restores its layout with new shells and fires plugin startup hooks once its socket is ready (herdr plugins docs, Startup hooks). For akrogon those hooks are `pull --all` and `next --resume` (`plugin/herdr-plugin.toml:7-10`), and `--resume` sweeps every unpaused repo, not just ones in that session. That is a global side effect bought by a lookup.
- Search stopped sessions by reading their saved session files on disk: a saved layout is not a running server; "found" there still ends in refuse-or-start, and parsing herdr's private snapshot format adds a second discovery mechanism for a worse answer than "not searched (stopped): C".
- Tie-break duplicates: first match (today's behavior) picks by list order; ambient-session-wins reinstates the stale env as the deciding vote; preferring a custom name over a derived label is impossible from the API akrogon reads (S2: one label string); preferring the workspace whose panes sit in the repo checkout needs cwd evidence akrogon does not collect for workspaces and would silently guess. All four convert an operator-visible ambiguity into a silent choice, against the intake.
- Treat unreadable like stopped and proceed on a unique readable match: cheaper blast radius, but the unreadable session is exactly where an unnoticed duplicate or the intended workspace can hide. The taken guard rule already refuses on unreadable for tab creation; discovery proceeding while the guard refuses would also leave allocate half-advanced.

### Evidence

- better-than-training · herdr v0.9.1 source, cloned and read 2026-10-24 · S1 lines (session resolution, no-spawn API path, `server_not_running`, live `running` computation) and S2 lines (no label uniqueness, derived labels).
- better-than-training · herdr docs at tag v0.9.1, read 2026-10-24 · socket-api resolution order (`docs/next/.../socket-api.mdx:686-691`); plugins Startup hooks (hooks run after restore and socket ready; failure does not stop the server; completion recorded in the plugin command log).
- operator · INTAKE Scope and seed Expected behavior, 2026-10-24 · refuse visibly when missing or ambiguous.
- practitioner · my live probes, 2026-10-24 · installed binary is herdr 0.9.1; `session list --json` shape and `--session` overriding a wrong socket were verified against running sessions only. The stopped-session call was deliberately not probed (see probe note below).
- better-than-training · this repo at c5cf7be7, read 2026-10-24 · `src/next.ts:407-408` first-match and refusal; `src/shell.ts:179-197` error code parsing and retryable list; `plugin/herdr-plugin.toml:7-10` startup commands.

### Pitfalls

- Q1-P1 A session stops between `session list` and its `workspace list`: without rule 1's second half this reads as an unreadable session (unknown) instead of stopped and refuses every repo with a misleading reason. Removed by: classify by error code — `server_not_running` is stopped, anything else is unreadable.
- Q1-P2 A session stops after its repo resolved but mid-pass: taken Q3 lets the herdr error surface, and per S3 that lands inside `dispatchLeaf`'s catch for dispatch, but reconcile's shared pane list (`panes().catch(() => null)`, `src/next.ts:1352`) swallows it into keep-everything. Mixed visibility is acceptable only if the dispatch-side report names the session. Removed by: the resolution record carries the session name into error reporting instead of relying on herdr's socket-path message.
- Q1-P3 `session list --json` itself failing is global, not per-session: no repo can resolve, and naively repeating the attempt per repo spawns the same failing call and the same report N times. Removed by: one session list per invocation shared across repos (a single call, cached like resolution itself), with its failure reported once. The taken Q1 already says "one `herdr session list --json`", so this is honoring it in the failure case too.
- Q1-P4 Discovery sees only sessions herdr knows from its sessions directory (source enumerates the directory plus default, `src/session.rs:190-212`). A repo workspace in a session whose directory was moved or a remote machine's session is invisible and reads as plain missing. Removed by: nothing in this fork; the refusal names what was searched, which bounds the claim.

### Question the fork does not ask

When `workspace list` calls to several sessions run during one discovery, are they sequential or parallel, and does a hung session socket stall every repo's pass? akrogon's `herdr()` has no deadline today (`src/shell.ts:202-212` via `command` without one at this call path), so one wedged server could hang discovery rather than refuse. Neither "stopped" nor "unreadable" covers "never answers".

## Q2. Does one repo's refusal stop the pass or only that repo?

### Pick

Only that repo, built on the containment that already exists (S3), with three additions:

1. A resolution refusal is reported once per repo per invocation at repo level (repo root key), and the repo's remaining leaves are not each attempted and reported. Today an allocate throw reports per leaf path; a session refusal is a repo fact, and per-leaf repetition in an `--all` pass is noise that also inflates the `unpausePass` skip count.
2. The refusal is cached with the resolution (taken Q3: resolve once per repo per invocation — the failure is the resolution result for that invocation). Later steps for that repo in the same pass (reconcile acting steps, merge wake dispatch) meet the same refusal immediately and are deduped by the one report, while steps that are safe on unknown pane state (reconcile keep decisions) still run exactly as they do on a null pane list today.
3. Resolution must be reached only through contained paths. The uncontained paths in S3 — `selectLeaves`, `paneOwners`' pane list, the owner-count throws, and the host step after `reconcileRepos`' loop — must not become new escape hatches for a per-repo refusal: in hook routes a refused owner repo reports and returns like a zero-owner route, and the host step's repo-independent work must not depend on any single repo resolving.

Reason: the pass already treats failures as per-leaf and per-repo skips and finishes with `exitCode = 1` (S3). Stopping the pass would make one repo with no workspace (Himne until the operator creates one) block seat placement for every other registered repo in every `--all`, `--resume`, and hook pass — and hook passes arrive constantly, driven by pane events in unrelated sessions.

Cost: a refused repo in an automatic pass is visible only as a JSON stderr line in the plugin command log plus a nonzero hook exit. Per-repo containment trades operator attention for continuity; if the operator never reads the log, a repo can sit refused across many passes while everything else works. That cost is real but belongs to notification choices (call-coverage), not to making one repo halt the rest.

### Rejected

- Stop the whole pass on any repo's refusal: inverts the existing containment design, makes registry hygiene (every repo must have a live workspace at all times) a precondition for any work, and interacts badly with `--resume` at server startup, where the just-started session's own pass would die on some other stopped session's repo.
- Report per leaf as allocate does today: no code saved elsewhere, and in an `--all` pass a missing-workspace repo with many leaves emits one line per attempted leaf per pass. Hook passes repeat this on every pane event. The report dedup keys (`src/next.ts:111-119`) do not collapse these because each leaf path differs.
- Skip the repo silently (no report, exit 0): manual `next <slug>` for a refused repo must fail loudly; today's exit code 1 on any skip is the minimum visible signal and should stay.

### Evidence

- better-than-training · this repo at c5cf7be7, traced 2026-10-24 · S3 in full: per-leaf catch in `dispatchLeaf` (`src/next.ts:793-798`), per-repo catches in `reconcileRepos` and the `mergePass` loop (`:1301-1320`, `:1500-1507`), uncontained `paneOwners` and owner throws (`:1330`, `:1435,1465`), host step outside the catch (`:1322`), exit code at `:1509`.
- better-than-training · session-address Taken, read 2026-10-24 · resolution occurs in every entry path (allocate, busy observation, hook ownership, reconcile, phase, land wake) and once per repo per invocation; the refusal therefore has many more arrival points than today's single allocate throw.
- practitioner · live layout, 2026-10-24 · Himne is registered with no workspace in any session right now, so stop-the-pass is not hypothetical: it would block all repos from the first multi-repo pass after this ships, until the operator layout step lands.

### Pitfalls

- Q2-P1 Land wake re-enters per repo through `mergeWake`, which catches and reports (S3). A refused repo whose land completes will report the refusal from the land process too — a second process, so the once-per-invocation dedup does not span it. Removed by: nothing cheap; accept one report per process and keep the message identical so log reading collapses them mentally.
- Q2-P2 `unpausePass` converts any skip into a thrown aggregate after doing its work (S3). With per-repo refusal reporting, unpausing a healthy repo is unaffected (single repo), but unpausing the refused repo itself throws "incomplete" with a count that no longer distinguishes one refusal from many leaf skips. Removed by: the once-per-repo report keeps the count at one for a pure refusal; anything finer needs the refusal named in that message, which the underlying report line already carries.
- Q2-P3 Touched-repo bookkeeping: in the selection and `--all` routes a repo is marked touched and gets a `mergePass` even when every leaf skipped (S3). With a cached refusal, `mergePass` sub-steps that need the session fail into the per-repo catch and dedup to the same report only if they report under the same repo-root key; leaf-path reports inside would multiply. Removed by: merge-side dispatch consulting the cached refusal before attempting leaves, same as the sweep side.

### Question the fork does not ask

Should a repo-level refusal in an automatic (hook or resume) pass raise an operator-facing herdr notification in some session, the way failed and merged leaves do (`src/phase.ts:87-99`, `src/next.ts:866-880`)? Per-repo containment makes refusal quiet by design, and this fork decides where the refusal stops but not where it is seen. Which session would even receive that notification, when the problem is that the repo has none?

## Live probes not run, and the smallest safe versions

Nothing above needs a mutating probe: S1 and S2 are settled by same-version source. If the operator distrusts that the installed binary matches tag v0.9.1, the smallest confirming probes, with side effects:

1. `herdr --session netreachconsulting workspace list` (an already-stopped real session). Expected per source: JSON `server_not_running` on stderr, nonzero exit, nothing started. If the binary behaved otherwise, side effects: that session's server starts, restores its saved layout as new shells, and after its socket is ready fires akrogon's startup hooks `pull --all` and `next --resume` (`plugin/herdr-plugin.toml:7-10`) — a network pull for every repo and a sweep of every unpaused repo, not confined to that session. A throwaway session name (`akrogon-probe`) avoids resurrecting a real layout but still fires the same global startup hooks if a server starts, and then needs `herdr session stop` and `session delete` cleanup. There is no variant with zero global side effect while the akrogon plugin is enabled, which is why source evidence was used instead.
2. Duplicate-label runtime confirmation would need `herdr workspace create --label <existing label>` in a running session. Side effects: a real new workspace and shell pane in the operator's layout, a session save, and pane events that trigger akrogon hook passes. Smallest version is inside a throwaway session, which inherits probe 1's startup-hook side effects. Not needed: the create and rename code paths contain no uniqueness check to test against.
