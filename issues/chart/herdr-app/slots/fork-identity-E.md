# Fork Notes: `identity` (Slot E)

## Q1: Repo-to-session and repo-to-space resolution

1. **Pick, reason, cost:** **Multi-session discovery via `herdrapp session list --json` + `herdr-app ls` matching `space.name === repo.name`, threading both `HC_SESSION` and `HERDR_APP_HOME` (and stripping `HC_TERMINAL_SOCKET`) into every `hc`/`herdr-app` call.** *Reason:* This is the exact 1-to-1 port of `src/shell.ts:284-422` (`listSessions` + `resolveSession` matching `workspace.label === repo.name`). Live `herdrapp session list --json` already emits the identical `{sessions:[{default,name,running,session_dir}]}` schema (`herdr-setup/bin/herdrapp:182-196`) across `default`, `infra`, `mdconsultingny`, `personal`, and preserves all three safety refusals (`held by multiple sessions`, `uniqueness unknown`, `no running session holds it`, `src/shell.ts:418-420`). *Cost:* One `herdrapp session list --json` call and one `herdr-app ls` call per running session per process (cached in `src/shell.ts:273-274`).
2. **Rejected options:**
   - *Match `space.folder` in `herdr-app ls`:* Rejected because live `herdr-app ls` in `infra` reports shifted/stale folders (`framework`, `blepsis`, `herdr-setup` all show `/home/ivan/Work/infra/akrogon`, `slots/map-merged.md:8`).
   - *Assume a single `HC_SESSION` (e.g. `default` or `infra` only):* Rejected because the operator runs `default`, `infra`, `mdconsultingny`, and `personal` simultaneously (`herdrapp session list --json`), and `src/next.ts:471-511` (`secondSeat`) and `src/reconcile.ts:525` (`reconcileHost`) rely on cross-session enumeration.
   - *Match only by `hc` terminal labels (`akrogon.repo`):* Rejected as the primary space finder because a repo with zero live terminals has no `hc` labels yet, so `allocate` (`src/next.ts:585`) still needs the `herdr-app` space ID to place the first leaf tab.
3. **Evidence:**
   - `operator`: `forks/signposts.md` `## Taken` & `forks/engine-shape.md` `## Taken` ("closest to how akrogon works now on the old herdr wins") (read 2026-11-06).
   - `better-than-training`: `src/shell.ts:284-422`, `/home/ivan/Work/infra/herdr-setup/bin/herdrapp:58-64,182-196`, live `herdrapp session list --json`, `herdr session list`, `herdr workspace list --session infra`, `INTAKE.md:156` (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Caller inside an `hc` terminal leaks `HC_TERMINAL_SOCKET` / `HC_TERMINAL_ID` into child `hc` calls, overriding `HC_SESSION` (`INTAKE.md:156`):* **Design part:** the engine's `hc` module strips `HC_TERMINAL_SOCKET`, `HC_TERMINAL_ID`, and `HC_SCOPE` and sets `HC_SESSION` + `HERDR_APP_HOME` from `resolveSession(repo)`.
   - *`herdr-app` window closed while `herdr-core` is still running (`herdr-app --skill:18`):* **Design part:** fallback-read `~/.local/state/herdr-core/<session>/docs.json` (`INTAKE.md:111,191`) if `herdr-app ls` fails when the window is closed, or require the session window for GUI tab allocation.
5. **Unasked question:** When `akrogon-events` systemd service starts, should it discover sessions via `herdrapp session list --json` and spawn/maintain one `hc events` stream per running session? *(Lean: yes, one process supervising streams for all running sessions from `herdrapp session list --json`.)*

## Q2: What `state.yaml` and `hc` labels store for a leaf and its seats

1. **Pick, reason, cost:**
   - **In `state.yaml` (`src/state.ts:95-102`):** keep `tab?: string` (`herdr-app` tab ID `tb...`), replace `pane: {A, B}` with `terminal: {A?: string, B?: string}` (storing the live `hc` terminal address `t...` of each seat's current instance), and keep `prompted: {A?: string, B?: string}` storing `"<terminal_address>:<turn>"` (replacing `agent_session.value`).
   - **On `hc run` labels:** stamp `--label akrogon=1 --label akrogon.repo=<repo> --label akrogon.leaf=<slug> --label akrogon.seat=<A|B>` (plus `herdr.space=<spaceId>` and `herdr.tab=<tabId>` when placed).
   *Reason:* Storing `terminal` (`t...`) gives exact instance identity (changes on restart, refusing stale reports), works directly with `herdr-app do pane.focus --terminal <t>` (`INTAKE.md:94`, `herdr-app --skill:38`), and encoding `"<t>:<turn>"` in `prompted` preserves `commitMove` (`src/phase.ts:207`) and `broadcastPending` (`src/state.ts:116`) with minimal schema churn. Label `akrogon=1` gives `hc events --label akrogon=1` one session-wide filter (`hc events --help` repeats `--label` as AND, not OR). *Cost:* Rename `state.pane` -> `state.terminal` (or keep `pane` key holding `t...` address) across `src/state.ts`, `src/next.ts`, `src/reconcile.ts`, and tests.
2. **Rejected options:**
   - *Store only `hc` name in `state.yaml` (no terminal address `t...` or turn):* Rejected because `hc` name stays identical across kill-and-restart (`INTAKE.md:43,109`), so name alone cannot distinguish a fresh seat instance from a replaced instance or prove turn advancement.
   - *Rely on labels alone without `state.yaml` `terminal`/`tab`:* Rejected because `reconcile.ts:404-431` and `next.ts:535-558` need recorded `tab` and seat identity to detect externally closed tabs/terminals when `hc` is empty.
3. **Evidence:**
   - `operator`: `INTAKE.md:43,70,94,171` & `forks/engine-shape.md` `## Taken` (read 2026-11-06).
   - `better-than-training`: `src/state.ts:22-30,95-117`, `src/next.ts:704-772`, `src/phase.ts:202-211`, `hc events --help`, `herdr-app --skill:35-38` (read 2026-11-06).
4. **Pitfalls & removals:**
   - *`hc events --label` is a conjunction (AND), so `--label akrogon.repo=a --label akrogon.repo=b` matches nothing:* **Design part:** stamp `--label akrogon=1` on every akrogon-started terminal so `hc events --json --label akrogon=1` filters the whole session in one flag, and read `akrogon.repo`/`akrogon.leaf`/`akrogon.seat` from the event JSON.
5. **Unasked question:** Should `deliveryErrorSchema` (`src/state.ts:22-30`) replace `pane: string, session: string | null, offset?: number` with `terminal: string, turn: number`? *(Lean: yes, drop `offset` and `session` per Signpost 2a.)*

## Q3: Building and keeping `hc` names unique within 1–32 chars (`[a-z0-9-_]`)

1. **Pick, reason, cost:**
   - **Repo prefix helper `repoPrefix(repo.name)`:** for hyphenated names take first letters of first two segments (`herdr-setup` -> `hs`, `portal-old` -> `po`), else first two chars (`akrogon` -> `ak`, `framework` -> `fw`), matching `INTAKE.md:119-123,177`.
   - **Leaf seat names:** `<prefix>-<slug.slice(0,19)>-<hash6>-<a|b>` where `hash6 = sha256("${repo.name}/${slug}").slice(0,6)` (max $3+19+1+6+2 = 31 \le 32$ chars, `[a-z0-9-_]`).
   - **Chart consultants:** `<prefix>-slot-<letter>` (`ak-slot-b`, `fw-slot-b`, `hs-slot-b` per `INTAKE.md:119-123,177`). Before starting/restarting, the start helper checks `hc get <name> --json`: if live with `parent === $HC_TERMINAL_ID`, `hc kill` and reuse `<name>`; if live with a different live parent (`parent !== $HC_TERMINAL_ID`), fall back to `<prefix>-<door_terminal>-slot-<letter>` (e.g. `ak-t19-slot-b`, $\le 16$ chars) or refuse with the owning door's terminal address.
   *Reason:* Raw truncation of `<repo>-<slug>-<seat>` to 32 chars collides on leaves sharing a 25-char prefix (`practitioner` hash-suffix rule) and across repos sharing a 2-letter prefix (live `infra` has both `portal` and `portal-old`!). Including `hash6(repo/slug)` in leaf names (matching `src/scope.ts:13-15` `leafSlice`) makes leaf names readable AND collision-free across all repos and long slugs. *Cost:* ~15 lines in the start helper.
2. **Rejected options:**
   - *Raw truncation `<prefix>-<slug>-<seat>` clipped to 32 chars without hash:* Rejected because two leaves in an epic with a shared 26-char prefix (or `portal` vs `portal-old`) collide on `name_taken` in `hc run`.
   - *Opaque hash only (`akrogon-<hash24>`, `src/next.ts:788`):* Rejected because `hc ls` and the Agents sidebar become unreadable to the operator.
3. **Evidence:**
   - `operator`: `INTAKE.md:107-123,177,192` (`ak-slot-b`, `fw-slot-b`, `hs-slot-b`) (read 2026-11-06).
   - `practitioner`: Kubernetes/Docker/Helm 32/63-char deterministic naming standard: prefix truncation without a hash suffix causes silent cross-resource collisions; `<prefix>-<trunc>-<hash>` preserves readability and uniqueness (web search: K8s/Helm/Docker truncation collision mitigation, read 2026-11-06).
   - `better-than-training`: `src/scope.ts:13-15`, `src/next.ts:788`, `hc run --help` (`1-32 of a-z 0-9 - _`), live `herdr workspace list --session infra` (`portal` and `portal-old`) (read 2026-11-06).
4. **Pitfalls & removals:**
   - *Trailing hyphen when slicing `slug` at 19 chars produces `--` before `<hash6>`:* **Design part + unit test:** strip trailing `-` from `slug.slice(0, 19)` before joining.
   - *Two repos in `infra` (`portal` and `portal-old`) share first-two-letter prefix `po`:* **Design part:** hyphenated segment initials (`portal` -> `po`, `portal-old` -> `po` if 2-segment; or include `hash6` on leaf names and disambiguate colliding consultant names by door `HC_TERMINAL_ID`).
5. **Unasked question:** What `hc` name should direct-route reviewers (`chart-issues` direct landing) and `watch-issues` / operator (`o-<slug>`) terminals use? *(Lean: `<prefix>-direct-<chart.slice(0,15)>-<hash6>`, `<prefix>-watch`, `<prefix>-op-<slug.slice(0,15)>-<hash6>`.)*
