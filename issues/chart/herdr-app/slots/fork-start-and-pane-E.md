# Fork Notes: `start-and-pane` (Slot E)

## Q1: Lifetime (`--no-parent` / `--outlive-parent` vs child of caller)

1. **Pick, reason, cost:**
   - **Leaf seats (`A`, `B`), `watch-issues`, and operator (`o-<slug>`) terminals:** start with `hc run --bg --keep --no-parent --no-notify`.
   - **Chart consultants (`<prefix>-slot-<letter>`) and direct-route reviewers:** start with `hc run --bg --keep --parent <door_terminal>` (dying when the door's terminal closes, surviving if only the door's Claude process crashes).
   *Reason:* In old Herdr, leaf panes belonged to the server and survived any caller (`forks/start-and-pane.md:5`). Under `engine-shape` `Taken` (3b), `akrogon phase` runs `next` from inside Seat A's terminal (or a door's terminal at handoff); without `--no-parent --no-notify`, Seat B would become a child of Seat A, so Seat B's turn-end notes (`<hc ...>`) would be typed into Seat A's input and closing Seat A's terminal would kill Seat B! Conversely, consultants and direct reviewers belong to one chart door, report to it via `hc send`, are waited on with `hc wait --children all` (`INTAKE.md:44-45`), and should die if the chart tab is closed. *Cost:* Two flag profiles in the start helper (`--no-parent --no-notify` vs `--parent <door>`).
2. **Rejected options:**
   - *`--outlive-parent` (keeping parent link) for leaf seats:* Rejected because `hc` still types child lifecycle notifications into the parent terminal unless `--no-notify` is set, and the parent terminal (`t15` door or sibling seat `tA`) is an accident of who invoked `akrogon phase`/`next`.
   - *`--outlive-parent` for chart consultants:* Rejected because closing a finished chart tab (`c-<repo>`) would leave orphaned consultant processes running in the background (`INTAKE.md:44`).
3. **Evidence:**
   - `operator`: `INTAKE.md:40-45,74` & `forks/engine-shape.md` `## Taken` (read 2026-11-06).
   - `better-than-training`: `hc run --help` (`--no-parent`, `--no-notify`, `--outlive-parent`, `--keep`) (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Parentless leaf seats send no child notes on crash:* **Design part:** stamp `--label akrogon=1` on all leaf seats so the `akrogon-events` listener (`hc events --label akrogon=1`) and `watch-issues` (`hc ls --label akrogon=1`) observe every crash/exit (`identity` `Taken` Q2 2a).
5. **Unasked question:** Should `akrogon land` (`src/land.ts:17-46`, transient `systemd-run` unit) also strip `HC_TERMINAL_ID`/`HC_TERMINAL_SOCKET` so its `mergeWake` never inherits a caller terminal as parent? *(Lean: yes, `identity` `Taken` Q1 1a already strips them in the `hc` module.)*

## Q2: Leaf tab creation, naming, and unfocused `[A, B]` placement

1. **Pick, reason, cost:** **Option (a) + atomic `doc.set` tab naming/layout (with `herdr-app do tab.rename` when window is open):** mint `tabId = "tb" + randomBytes(16).toString("hex")` in `state.tab`, start A then B with `hc run --bg --keep --no-parent --no-notify --label herdr.space=<spaceId> --label herdr.tab=<tabId>`, and set the tab's `name: <slug>` and 50/50 `[A, B]` row (`type: "row"`, `size: {weight: 0.5}` each) via `hc connect` `doc.get` + `doc.set` (version-CAS on the core's `herdr-app` document, `hc schema`), plus `herdr-app do tab.rename --id <tabId> --name <slug>` if the window is open. *Reason:* Works when the `herdr-app` window is closed overnight (`AGENTS.md` "The model"), **never steals window focus** (focus is window-local, not in the `herdr-app` document, `AGENTS.md` "The model"), names the tab `<slug>` even headless, and eliminates `src/next.ts:638-671`'s focus-stealing `pane.swap` repair when Seat A is replaced (`doc.set` updates `children[0].content.terminal` in place). *Cost:* ~25 lines of `doc.get`/`doc.set` CAS retry in `akrogon`'s `hc` module (which already reads `doc.get` per `identity` `Taken` Q1 1a).
2. **Rejected options:**
   - *Option (b) (`herdr-app do tab.new --name <slug> --argv ... --task ...`):* Rejected because `tab.new` requires an open window (`herdr-app --skill:18`), steals focus to the new tab (`herdr-app --skill:32`: "New spaces and tabs are shown immediately"), only creates 1 pane (not B), and cannot pass `hc run` flags (`--name`, `--no-parent`, `akrogon.*` labels).
   - *Option (a) with `herdr-app do tab.rename` only (no `doc.set`):* Leaves tabs unnamed (`1`, `2`, ...) whenever the window is closed, and restarting Seat A appends A to the right of B `[B, A]` instead of `[A, B]`.
3. **Evidence:**
   - `operator`: `INTAKE.md:77,104` & `forks/identity.md` `## Taken` (Q1 1a `doc.get`) (read 2026-11-06).
   - `practitioner`: Declarative layout-tree mutation (Zellij KDL / tree model) vs imperative split/focus scripting (tmux/WezTerm): imperative splits race with active focus and steal user input, whereas atomic tree writes preserve focus and deterministic ordering (web search: tmux/Zellij/WezTerm declarative tree vs imperative focus race, read 2026-11-06).
   - `better-than-training`: `src/next.ts:581-676`, `AGENTS.md` "The model", `herdr-app commands` (`tab.new`, `tab.rename`), live `doc.get` & `hc schema` (`doc.set` version CAS) (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Concurrent `herdr-app` window edit causes `doc.set` `conflict` error (`hc schema`):* **Design part:** CAS loop (`doc.get` -> apply pure transform -> `doc.set` with `version`, retrying up to 5 times on `conflict`).
   - *Live window reaction to `doc.set`:* **Probe before handoff:** verify in `ak-probe` that a live `herdr-app` window immediately reflects `doc.set` tab name and pane tree without needing `terminal.keep` first.
5. **Unasked question:** When a leaf fails (`src/phase.ts:125-131`), should tab rename to `<slug> failed` also use the same `doc.set` / `tab.rename` path? *(Lean: yes.)*

## Q3: Consultant column equal weights (2, 3, 4, 5, 6 seats) & single-seat restart in place

1. **Pick, reason, cost:** **Enforce exact equal heights (`size.weight = 1 / N`) for any consultant count $N$ and in-place single-consultant restart via `doc.get` + `doc.set` CAS** (either inside `akrogon`'s start helper or a small `herdr-setup` helper script called by it). *Reason:* The operator explicitly required equal heights for 3 consultants (`INTAKE.md:82,84`: `"They should all take the same amount of height (33% each)"`) and visible panes across restarts (`INTAKE.md:98,104`). Binary halving (`terminal.keep`) can only equalize $2^k$ seats (2 or 4, giving 50/25/25 for 3, `INTAKE.md:191`) and loses placement on every single-seat restart (`INTAKE.md:148,181`). Live `doc.get` on `c-akrogon` (step 23) proves the right column is a flat n-ary array (`type: "column"`, `children: [blockB, blockC, blockD, blockE]`) with per-pane `size.weight`! Updating that `column` via `doc.set` sets `weight: 1 / N` for any $N \in \{2..6\}$ AND swaps a restarted consultant's `content.terminal` in its existing `block` in place without re-parking other seats or stealing focus. *Cost:* ~20 lines of tree manipulation on the `doc.get` tab root.
2. **Rejected options:**
   - *Accept unequal heights (50/25/25) for 3, 5, 6 seats using `terminal.keep` only:* Rejected because it directly violates the operator's 3-consultant 33% rule (`INTAKE.md:82,84`) and forces full-column re-parking/focus-stealing whenever a single consultant is restarted (`INTAKE.md:148`).
3. **Evidence:**
   - `operator`: `INTAKE.md:80-84,98,104,111,147-148,191` & Signpost 3 (`forks/signposts.md` `## Taken`) (read 2026-11-06).
   - `better-than-training`: live `doc.get` on `c-akrogon` (`tbb835e98fe1a394a76342b75d79608fff` showing `type: "column"` with 4 `block` children and `size.weight` floats) & `hc schema` (`doc.set`) (read 2026-11-06).
4. **Pitfalls & removals:**
   - *If `herdr-app` requires `terminal.keep` before a terminal can appear in a `doc.set` block:* **Probe before handoff:** test in `ak-probe` whether `hc run --keep --label herdr.space=<sp> --label herdr.tab=<tb>` + `doc.set` places the consultant into the column directly, or if `terminal.keep` must run first followed by `doc.set` normalizing weights.
5. **Unasked question:** Should the `doc.set` column weight normalizer live in `akrogon`'s `hc` module (next to `doc.get`) or in `herdr-setup/bin/`? *(Lean: in `akrogon`'s `hc` module since `akrogon` already owns the start command and `doc.get`, avoiding cross-repo call overhead.)*

## Q4: One start command contract and callers

1. **Pick, reason, cost:** **One internal engine function `startAgent(...)` exposed as a CLI mode on `akrogon` (e.g. `akrogon spawn` or `akrogon start --seat ...`, keeping `akrogon start <slug>` for un-stopping a leaf at `src/akrogon.ts:158-162`).**
   - **Callers:** Engine (`src/next.ts` `allocate`/`dispatchSlot`) calls `startAgent` in-process; chart door and direct reviewer call the CLI command from `skills/chart-issues/SKILL.md`.
   - **Inputs:** `--role <leaf|consultant|direct|watch|operator>`, `--seat <A|B|C|D|E>`, optional `--leaf <slug>`, `--harness <k> --model <m> --effort <e>` (defaulting to `seats()` from `config.yaml`/`ISSUE.md`), `--task <prompt>`.
   - **Guarantees before returning `{name, address, session, tab, pane, turn}`:** (1) resolves repo session/space via `doc.get`; (2) enforces `hc` name rules (`identity` `Taken` Q3) and kills/waits for any replaced instance owned by the caller; (3) expands harness argv from `config.yaml` (rejecting resume/fork tokens `peer-restart.ts:54-58`, enforcing codex `--no-daemon` and sandbox `network_access=true` `INTAKE.md:180`); (4) passes first task in `hc run --bg --keep` with role lifetime (`Q1`) and `akrogon.*`/`herdr.*` labels; (5) places the terminal into its visible pane (`Q2`/`Q3`) and verifies presence in `doc.get`; (6) polls `hc get <addr> --json` until `first_message.sent === true` (and `foreground` is not bare shell).
   *Reason:* Satisfies Signpost 1a and `INTAKE.md:104,123` ("The start helper owns this, so it cannot be skipped by a door that forgets"). *Cost:* ~120 lines in `src/` replacing `peer-create.ts`, `peer-restart.ts`, `peer-anchor.ts`, and `src/next.ts:568-676,786-811`.
2. **Rejected options:**
   - *Overwrite `akrogon start <slug>` without preserving un-stop leaf behavior:* Rejected because `akrogon start <slug>` is an existing verb tested in `tests/leaf-stop.test.ts` and `tests/command-reference.test.ts:26`.
   - *Leave pane placement or `hc kill` outside the start command:* Rejected by `INTAKE.md:104` (doors repeatedly forgot pane placement on start/restart).
3. **Evidence:**
   - `operator`: `forks/signposts.md` `## Taken` (1a) & `INTAKE.md:46,51,98-104,123,180-181` (read 2026-11-06).
   - `better-than-training`: `src/akrogon.ts:158-162`, `src/config.ts:23-36,170-197`, `skills/chart-issues/scripts/peer-create.ts:48-96`, `peer-restart.ts:54-58,197-268` (read 2026-11-06).
4. **Pitfalls & removals:**
   - *`hc run` returns `started: true` while a startup popup or `/clear` swallows the first task (`INTAKE.md:51`):* **Design part + Probe:** verify `first_message.sent === true` and `status.state` transition (`working`/`idle`/`done`) in `hc get --json` before the start command exits 0.
5. **Unasked question:** Should consultant `harness/model/effort` be passed as CLI flags to the start command or read by the start command from `<chart>/seats.yaml`? *(Lean: read `<chart>/seats.yaml` when `--chart <path> --seat <letter>` is given, so restart from `<chart>/seats.yaml` is a single flag and never drifts.)*
