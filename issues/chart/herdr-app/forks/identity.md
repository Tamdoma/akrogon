# Repo, session and seat identity

## Question

Q1. Which hc session and herdr-app space does a repo's work go to, and how does the engine find it? Today the engine looks through running old-herdr sessions for the workspace whose label equals the repo name (`resolveSession`, `src/shell.ts:379-406`); live old herdr has sessions `default`, `infra`, `mdconsultingny`, `personal`, and `infra` holds workspaces `akrogon`, `framework`, `portal`, ... herdr-app has the same sessions (`~/.config/herdr-app-sessions/{infra,mdconsultingny,personal}`, started by herdr-setup `bin/herdrapp` with `HC_SESSION` and `HERDR_APP_HOME`), with spaces named after repos. Space folders shown by `herdr-app ls` are wrong (shifted by one).

Q2. What does leaf state store for a leaf and its seats? Today `tab` (old-herdr tab id), `pane: {A, B}` (pane ids) and `prompted` (agent session id) in `state.yaml` (`src/state.ts:99-102`); the leaf tab is created with label = leaf slug, `--no-focus`, in the repo's workspace (`src/next.ts:581-592`); the agent is named `akrogon-<hash of pane id>` (`src/next.ts:788`). On hc: hc name per seat (survives restart), hc address (changes on restart), herdr-app pane or tab id, labels (`akrogon.repo`, `akrogon.leaf`, `akrogon.seat`, `herdr.space`, `herdr.tab`), turn.

Q3. How are names built and kept unique? hc names are unique per hc session (not per repo), 1-32 chars `[a-z0-9-_]` (`hc run --help`). Consultants are `<repo prefix>-slot-<letter>` (intake). Leaf seats need a name too. Two doors on one repo in one session would both want `ak-slot-b`.

### Carries

- Signposts `## Taken`, including the 2026-11-06 correction: the option closest to how akrogon works on old herdr wins unless it is less elegant or does not work.
- engine-shape Taken: the engine keeps one small hc module; an akrogon-installed systemd listener follows `hc events` filtered to akrogon terminals (so identity must give it a filter); phase runs next for its leaf.
- Intake: consultant names `<repo prefix>-slot-<letter>` (`ak-slot-b` for akrogon, `fw-slot-b` for framework); reset is kill and restart under the same name; every agent gets a visible pane in the same step.
- Related forks: lifetime.md, start-and-pane.md, board-focus.md, watcher.md.

## Findings

Merged notes: slots/fork-identity-merged.md (with rebuttal corrections); seat notes slots/fork-identity-{A,B,C,D,E}.md.

Proof (free, read-only), A 2026-11-06: command `echo '{"jsonrpc":"2.0","id":1,"method":"doc.get","params":{"name":"herdr-app"}}' | hc connect`; identity: operator's user, hc 0.1.18, sessions `infra` (window open) and `mdconsultingny` (no window, `HC_TERMINAL_SOCKET/ID/SCOPE` unset, `HC_SESSION=mdconsultingny`); result: the herdr-app document with spaces (id, name, tabs, tab tree with weights), `mdconsultingny` version 15 spaces `['boulevard-automation']`; cleanup: none needed; limits: proves the read and today's document shape only, no schema promise, no write.

- Q1: discovery by space name across running hc sessions, today's refusals, read through `doc.get` (A,B,C,D,E after C withdrew a config key); sessions from `/run/user/<uid>/herdr-core/<name>.sock` without a dot in name, not from herdr-setup's script (A,C,D); env pinned per session with inherited terminal selectors stripped (B,D,E).
- Q2: tab id as today; per seat the current address qualified by session (name derived from repo/slug/seat); `prompted` as the seat's hc turn with its address; a constant filter label plus repo/leaf/seat labels; one ownership check at the boundary (all, with B's corrections).
- Q3: consultants per intake. Leaf seat names readable with an always-present short hash (A,C,D,E, C's one-rule form) or opaque hash (B, and C's first pick). Prefix: a per-repo value set at registration, duplicates refused (A,B,C,D) versus derived (E).
- Research: better-than-training · `src/shell.ts:379-428`, `src/state.ts:99-102`, `src/next.ts:555-592,788`, `src/scope.ts:13-14`, `hc run --help`, `hc events --help` (AND-only labels), `hc schema` (`doc.get`, `doc.set`, Terminal.address permanent per core) · 2026-11-06. practitioner · tmuxinator issue 206 and README (name reuse attached to the wrong session; a separate name argument for parallel instances) · Supervisor API (configured name vs process instance) · 2026-11-06.

## Taken

Operator 2026-11-06, door t15, verbatim: "1a | I'm okay with changing to pi-extensions | 2a | 3a - but remove unique codes at the end if they're not really necessary. If they are, keep |" then "3c, too".

Read as:
- Q1 1a: the engine finds a repo's space by name across running hc sessions (sessions from `/run/user/<uid>/herdr-core/<name>.sock`, no dot in name), reading the core's `herdr-app` document through `hc connect` `doc.get` so it works with the window closed; none, several or unreadable refuse with today's reasons; every hc call for a session pins `HC_SESSION` (and `HERDR_APP_HOME` for herdr-app calls) and strips inherited `HC_TERMINAL_SOCKET`, `HC_TERMINAL_ID`, `HC_SCOPE`. `doc.get` and the session list are parsed with a strict schema at the boundary, and a test pinned to `hc schema` fails the suite if the shape changes. Done 2026-11-06 by A with operator consent: space `extensions` renamed `pi-extensions` (`herdr-app do space.rename`, id sp6f9e9ac05e7ba2b0669be8c5b9863298, verified in `herdr-app ls`).
- Q2 2a: state keeps the leaf's herdr-app tab id; per seat the current hc address qualified by session (the name is derived); `prompted` is the seat's hc turn with its address; every akrogon terminal carries a constant filter label plus `akrogon.repo`, `akrogon.leaf`, `akrogon.seat`; one ownership check at the boundary; a report from an address the leaf no longer records is ignored.
- Q3 3a with the operator's condition: leaf seat names are `<prefix>-<slug>-<a|b>`. The code is necessary only when the name would pass 32 characters: names are unique without it because the prefix is unique per repo (3c), the slug is unique per repo and the seat letter differs; a cut slug can collide with another cut slug, so only then the name becomes `<prefix>-<slug head>-<4 hex of repo/slug>-<a|b>`, head cut to fit 32. Consultants stay `<prefix>-slot-<letter>`. A second door on the same repo stops on hc's `name_taken` and names the live owner.
- Q3 3c: each repo's two-letter prefix is stored once in akrogon's repo registry; registration refuses a duplicate prefix. Foreclosed: deriving it by rule (fails on `fw`, `hs`, `portal`/`portal-old`).
