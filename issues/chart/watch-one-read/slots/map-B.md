# Map B: watch-one-read (Tamdoma/akrogon#160)

Grounded in inspected code under `/home/ivan/Work/infra/akrogon` and binding signposts `S1a–S6a` (`issues/chart/watch-one-read/forks/signposts.md`, section `Taken`).

---

## 1. Material forks

### F1: How `observe.ts` encodes the paused bit
- **Options**
  - **A (recommended): Always print a second header line `paused=true` or `paused=false` right after `session=<name>`.**
    - Breaks/invites: shifts stdout indices in `tests/hc-observe.test.ts` (fixed under `S5a`). Preserves line 1 byte-for-byte (`session=<name>`), so `tests/e2e/watch-tier.ts` `observeReady` (`lines(seen.stdout)[0] !== 'session=...'`) and any live running watcher still holding the old `SKILL.md` text (`S4a`) keep parsing `HC_SESSION` from line 1 unchanged, and `paused=false` is not `slug=` or `unreadable=`. Always-explicit boolean prevents conflating "not paused" with an older script or missing check.
  - **B: Append `paused=<true|false>` onto line 1 (`session=<name> paused=<true|false>`).**
    - Breaks/invites: violates `S4a` immediately — an old watcher extracting `HC_SESSION` from line 1 (`skills/watch-issues/SKILL.md`, section `Observe`: "Its first stdout line is `session=<name>`... with the session from that line") gets `<name> paused=false` and breaks every `hc` call. Also breaks `tests/e2e/watch-tier.ts` `observeReady`.
  - **C: Print `paused=true` as line 2 only when paused; omit line 2 when unpaused.**
    - Breaks/invites: byte-identical to today when unpaused (trivial `S4a`), but relies on absence to mean "not paused" — an agent or test cannot tell a healthy unpaused read from a pre-change script or a silent omission.
- **Pick:** **A** (`session=<name>` on line 1, `paused=true|false` on line 2). Matches `S4a`, matches `src/pause.ts` / `src/status.ts` boolean semantics, and keeps the format self-describing.

### F2: What `observe.ts` prints (and queries) when `paused=true`
- **Options**
  - **A (recommended): Short-circuit in `observe.ts` after printing `session=<name>` and `paused=true` — skip `repoInventory`, `leafSeats`, and `transcriptFor`, and print no `slug=` or `unreadable=` lines.**
    - Breaks/invites: mechanically removes waiting/failed leaf lines from the watcher's context while paused (`S1a` "removes the whole problem class") and avoids per-leaf `hc` queries/disk walks on paused ticks, matching the old paused contract ("that check observes nothing and acts on nothing"). Zero `S4a` risk because an old watcher already stops after `akrogon status` and never runs `observe.ts` when paused. Downside: someone running `observe.ts` manually on a paused repo won't see leaves (they still have `akrogon status`).
  - **B: Always walk `repoInventory` and print all `slug=` and `unreadable=` lines even when `paused=true`.**
    - Breaks/invites: keeps uniform output for manual debugging, but puts tempting `phase=failed` / waiting `A=-/-` rows into the watcher's prompt on a paused repo (relying purely on model obedience to do nothing) and still performs unnecessary `leafSeats` / `transcriptFor` calls.
- **Pick:** **A**. Withholding leaf rows mechanically when `paused=true` is strictly safer than showing them and telling a model to ignore them.

### F3: Where `observe.ts` reads the paused state (`src/pause.ts` import vs `akrogon config`)
- **Options**
  - **A (recommended): Import `isPaused` directly from `../../../src/pause` in `skills/watch-issues/scripts/observe.ts`, and pass `AKROGON_HOME` to watcher test environments that isolate state home inside shims.**
    - Breaks/invites: zero change to `akrogon config` (`src/config.ts` `effectiveConfig`). Reuses `src/pause.ts` `readPaused` / `PauseStateError` directly (`S2a` loud failure naming `paused.yaml`, `ENOENT` = empty set). `writeYaml` in `src/shell.ts` uses atomic temp-file + `renameSync`, so lockless read never sees a torn file. **Critical catch:** `globalHome()` in `src/config.ts` reads `process.env.AKROGON_HOME ?? resolve(homedir(), '.akrogon')`. Today `tests/watch-timer.test.ts` (`watchUp`) and `tests/e2e/watch-live.e2e.ts` (`launchEnvFor`) do **not** pass `AKROGON_HOME` to the watcher terminal (unlike `tests/e2e/watch-consults-body.ts` `body`, which explicitly adds `AKROGON_HOME` because `consults.ts` calls `globalHome()`). Those two harnesses must pass `AKROGON_HOME` too.
  - **B: Add `paused: boolean` to `akrogon config` (`src/config.ts` `effectiveConfig`) and read it in `skills/watch-issues/scripts/repo.ts` `resolveRepoKey`.**
    - Breaks/invites: automatically inherits any `akrogon` shim's `AKROGON_HOME`, **but** mixes mutable runtime pause state into config output AND makes a corrupt `paused.yaml` break `akrogon config` everywhere — including `watch-issues stop` (`stop.ts` -> `watchTarget` -> `resolveRepoKey`), `start.ts`, `tick.ts`, `consults.ts`, `init-akrogon`, `learn-issues`, and `check-issue`. Failing `stop.ts` because `paused.yaml` is corrupt is a real operational footgun.
  - **C: Call `akrogon status --json` or add a new `akrogon paused` subcommand.**
    - Breaks/invites: `status --json` scans every registered repo, closed leaves, verify runs, timings, and exits 1 on unreadable leaves; a new CLI verb adds a second subprocess and CLI surface (`docs/reference/commands.md`, `tests/command-reference.test.ts`) for one file read.
- **Pick:** **A**. Keeps `akrogon config` and `stop.ts` insulated from corrupt `paused.yaml`, matches how `observe.ts`, `repo.ts` (`withConsultantLock`), and `consults.ts` (`consultsRoot`) already import `src/` modules and rely on `globalHome()`, and fixes the latent `AKROGON_HOME` gap in `watch-timer.test.ts` and `watch-live.e2e.ts`.

### F4: Order of `isPaused(repoKey)` vs `repoSpace(repo)` and stdout emission on failure (`S2a`)
- **Options**
  - **A (recommended): Compute both `repoSpace(repo)` and `isPaused(repoKey)` before writing any stdout line (`console.log`).**
    - Breaks/invites: if `paused.yaml` is corrupt (`PauseStateError`) or unreadable (`EACCES`), `observe.ts` exits 1, prints the error naming the file on stderr, and writes **empty stdout** — matching `observe.ts`'s existing refusal contract (`tests/hc-observe.test.ts`, `SKILL.md` section `Observe`). Checking `isPaused(repoKey)` before `repoSpace(repo)` fails fast on a bad local file without spawning `hc`; checking after `repoSpace(repo)` reports missing space first. Either way, nothing hits stdout before both succeed.
  - **B: Print `session=<name>` first, then call `isPaused(repoKey)`.**
    - Breaks/invites: on corrupt `paused.yaml`, stdout would contain `session=<name>` alongside exit 1 + stderr — violating the "no stdout on refusal" invariant and inviting a model to mistake partial stdout for an empty board.
- **Pick:** **A** (specifically call `isPaused(repoKey)` before `console.log`, preferably right after `resolveRepoKey`/`readRepo` or right after `repoSpace`, before any `console.log`).

### F5: How `watch-timer.test.ts` and `watch-live.e2e.ts` observe checks and hold a busy check after `akrogon status` is removed
- **Options**
  - **A (recommended): Intercept `observe.ts`'s `akrogon config` call via `OBSERVE_AKROGON` (a thin wrapper in `logbin` that logs `call observe t=<turn>`, honors `<flags>/hold-observe`, and forwards to the real `akrogon` shim), AND assert `statusCalls === 0` in the existing `akrogon` wrapper.**
    - Breaks/invites: `observe.ts` already reads `OBSERVE_AKROGON ?? 'akrogon'` (`observe.ts` `main`), whereas `start.ts`, `tick.ts`, `stop.ts`, and `consults.ts` read `WATCH_AKROGON ?? 'akrogon'` (`repo.ts` `watchTarget`, `consults.ts`). So `OBSERVE_AKROGON` isolates check calls from `tick.ts`'s pre-receipt `akrogon config` call cleanly for both `standin` (`watch-agent.sh`/`watch-hook.sh`) and real model harnesses (`watch-live.e2e.ts`). **Low confidence item:** verify whether all four real harnesses (`claude`, `codex`, `pi`, `agy`) pass `OBSERVE_AKROGON` from the watcher terminal env through to Bash tool subprocesses (known to work for `AKROGON_HOME` in `watch-consults-body.ts` with `pi`, and `WATCH_TICK_SECONDS` / `WATCH_SKILLDIR` in `watch-live.e2e.ts`, but `claude`/`codex` env sanitization could differ).
  - **B: Keep a single `akrogon` wrapper on `PATH` and detect `observe.ts` as parent via `/proc/$PPID/cmdline` containing `observe.ts` when `$1 = "config"`.**
    - Breaks/invites: does not depend on harnesses forwarding `OBSERVE_AKROGON`, works even if a harness filters unknown env vars, and relies on Linux `/proc` (already used by `watch-timer.test.ts` and `skills/watch-issues/scripts/proc.ts`). Slightly less explicit than `OBSERVE_AKROGON`.
- **Pick:** **A** if `OBSERVE_AKROGON` propagates through harnesses (cleanest, uses the documented test hook in `SKILL.md` section `Observe`), or **B** if any harness strips `OBSERVE_AKROGON` (zero env-propagation fragility). Both let tests assert `statusCalls === 0` directly.

---

## 2. Practitioner questions

1. **What happens to `re-observe` inside `SKILL.md` sections `Judge` and `Consult` if the operator pauses the repo mid-check or mid-consult?**
   - `Judge` ("Merged still under open" -> `then re-observe`, "Command error" -> `run the observe script again`) and `Consult` ("After a verified fix the watch re-observes", "Resume" -> `close the consultant under Loop end, then re-observe`). Previously `observe.ts` had no pause bit, so a mid-consult pause was invisible at resume. With `paused=true` in `observe.ts`, does `Observe`'s rule ("when `paused=true`, act on nothing") automatically govern `re-observe` too (blocking post-consult `phase`/`next` on a newly paused repo)? Should `Consult` section `Resume` stay silent and rely on `Observe`, or add one clause?
2. **What should the watcher do when `observe.ts` exits non-zero (e.g. corrupt `paused.yaml` or unresolvable session)?**
   - `SKILL.md` section `Observe` currently says what `observe.ts` prints on non-zero exit ("prints the refusal on stderr and no leaf lines"), not explicitly what the watcher must do ("report the error and act on nothing this fire"). Making the no-action rule explicit on non-zero `observe.ts` exit closes any ambiguity under `S2a`.
3. **Should `watch-issues <root>` (start check) in `SKILL.md` section `Invocations` still run `observe.ts` on a paused repo?**
   - Yes: current `SKILL.md` section `Invocations` says "the check still runs on a paused repo, since starting the watch is not an act on a leaf — then reports the line." With `observe.ts`, start runs `start.ts`, then runs the `Observe` check (`observe.ts`), sees `paused=true`, acts on nothing, and reports `started <address>` (or `running <address>`) + paused. Confirming this matches `tests/e2e/watch-live.e2e.ts` `watch standin cell` (paused start in `shape === 'shell'`).
4. **If `watch-live.e2e.ts` runs a paid model cell with a paused repo (`S6a`), does `watch-live.e2e.ts`'s paid test (`watch live cell: a real harness in the tier`) currently test pause at all?**
   - **No!** Look at `tests/e2e/watch-live.e2e.ts` `watch live cell: a real harness in the tier` — currently ONLY `watch standin cell` tests `pause`/`unpause`! The paid real-harness test never calls `tier.akrogon(['pause'])`. Under `S6a` ("a paid live watch run only where a model's behavior is the property" + "Whether a model honors the paused rule is model behavior, which only a live run shows"), we must decide whether to add a paused step to `watch-live.e2e.ts` or a dedicated paid check (see Section 5).
5. **Does `observe.ts` still need `OBSERVE_AKROGON` vs `WATCH_AKROGON` alignment?**
   - `observe.ts` reads `OBSERVE_AKROGON ?? 'akrogon'`, while `repo.ts` (`watchTarget`) and `consults.ts` read `WATCH_AKROGON ?? 'akrogon'`. Keeping `OBSERVE_AKROGON` avoids breaking `tests/hc-observe.test.ts` and `SKILL.md`, and separates `observe.ts` interception from `tick.ts`/`start.ts` (F5).

---

## 3. Pitfalls over the work's lifetime & removals

1. **`AKROGON_HOME` mismatch silently reads wrong `paused.yaml` (or real `~/.akrogon/paused.yaml`) in tests.**
   - *Mechanism:* `tests/watch-timer.test.ts` (`watchUp`) sets `HOME=${f.home}` without `AKROGON_HOME`, so `globalHome()` in `observe.ts` resolves to `${f.home}/.akrogon/paused.yaml` instead of `${f.home}/paused.yaml`. Worse, `tests/e2e/watch-live.e2e.ts` (`launchEnvFor`) sets `HOME=${realHome}` without `AKROGON_HOME`, so `observe.ts` would read the operator's real `~/.akrogon/paused.yaml`!
   - *Removal:* Pass `AKROGON_HOME=${f.home}` in `tests/watch-timer.test.ts` (`watchUp`) and `AKROGON_HOME=${cell.tier.akrogonEnv.AKROGON_HOME}` in `tests/e2e/watch-live.e2e.ts` (`launchEnvFor`), matching `tests/e2e/watch-consults-body.ts` (`body`).
2. **Breaking live running watchers on release swap (`S4a`).**
   - *Mechanism:* Changing line 1 (`session=<name>`) or any `slug=` / `unreadable=` field order breaks a watcher like `w-akrogon` holding the previous `SKILL.md` in its context window.
   - *Removal:* Keep line 1 strictly `session=<name>` and keep `slug=` and `unreadable=` formats untouched; place `paused=<true|false>` on line 2.
3. **Partial stdout before `isPaused` failure (`S2a`).**
   - *Mechanism:* Calling `isPaused(repoKey)` after `console.log('session=...')` would print `session=<name>` to stdout and exit 1 on corrupt `paused.yaml`.
   - *Removal:* Call `isPaused(repoKey)` before any `console.log`, and add a `tests/hc-observe.test.ts` case asserting `code !== 0`, `stdout === ''`, and `stderr` names `paused.yaml`.
4. **Old-test anchor on `akrogon status` breaks or masks regressions.**
   - *Mechanism:* `tests/watch-timer.test.ts` (`docs describe the timer watch for all harnesses with no cron wording`) currently asserts `expect(skill).toContain('akrogon status')` (old criterion 15). Meanwhile `tests/fixtures/watch-agent.sh`, `tests/fixtures/watch-hook.sh`, `tests/watch-timer.test.ts`, and `tests/e2e/watch-live.e2e.ts` all gate on `call status` / `hold-status` and never run `observe.ts` inside the watcher loop.
   - *Removal:* Flip the doc test to `expect(skill).not.toContain('akrogon status')`, switch `watch-agent.sh`/`watch-hook.sh` to run `observe.ts`, switch `watch-timer.test.ts` and `watch-live.e2e.ts` check tracking/holds to `observe`, and explicitly assert `statusCalls === 0`.
5. **Holding `akrogon config` unconditionally holds `tick.ts` before receipt stamping.**
   - *Mechanism:* In `watch-timer.test.ts` and `watch-live.e2e.ts`, `tick.ts` calls `akrogon config` *before* stamping `akrogon.watch-due` (`tests/e2e/watch-live.e2e.ts` notes this above `sentTurn`). If a test naively holds `akrogon config` instead of isolating `observe.ts`, due 2's receipt never lands during the hold, causing a resend/timeout flake.
   - *Removal:* Isolate the hold to `observe.ts` (via `OBSERVE_AKROGON` or `/proc/$PPID/cmdline` matching `observe.ts`, see F5).
6. **Watcher agent on `watch-live.e2e.ts` still running `akrogon status` from muscle memory or model prior.**
   - *Mechanism:* Even if `SKILL.md` drops `akrogon status`, a model might still invoke it unless `SKILL.md` is clear and the paid test asserts `statusCalls(callLog) === 0`.
   - *Removal:* State cleanly in `SKILL.md` section `Observe` that `observe.ts` is the sole read of a check (no `akrogon status`), and assert `statusCalls(callLog) === 0` in `watch-live.e2e.ts`.
7. **`codex` wrapping `observe.ts` in `timeout 30s ...` during the busy-hold test.**
   - *Mechanism:* `tests/e2e/watch-live.e2e.ts` (`logbin`) documents that `codex` runs check commands under `timeout 30s ...` and uses a `SIGTERM` trap + early flag removal so the hold span still logs and doesn't poison later calls.
   - *Removal:* Preserve the exact early-`rm` + `trap 'span; exit 143' TERM` pattern when porting `hold-status` to `hold-observe` in `watch-live.e2e.ts`.

---

## 4. Consumers & `akrogon status` references in the watch path

### A. Every consumer of `observe.ts` output format
| File | Function / Section / Test | Current coupling | Must change? |
|---|---|---|---|
| `skills/watch-issues/scripts/observe.ts` | `main`, `formatLeaf` | Prints `session=<name>`, then `slug=...`, then `unreadable=...` | **Yes:** call `isPaused(repoKey)` before any stdout; print `paused=true\|false` on line 2; short-circuit after `paused=true` (F2A). |
| `skills/watch-issues/SKILL.md` | Sections `Observe`, `Judge`, `Consult` | Describes line 1 `session=`, leaves, unreadables, empty = `session=` only | **Yes (`Observe`):** document line 2 `paused=true\|false`, paused no-act rule, empty = 2 lines (`session=` + `paused=false`), non-zero exit = report & act on nothing. `Judge`/`Consult` leaf-line format unchanged. |
| `tests/hc-observe.test.ts` | `observe prints each recorded leaf from its hc seats in the repo session` | Asserts `out.slice(0, 17)` with `session=` at `[0]` and `slug=` at `[1]` | **Yes:** expect `paused=false` at `[1]`, shift slice to `0..18` and `out.slice(18)`. |
| `tests/hc-observe.test.ts` | `observe prints only the session line for an empty inventory and refuses without the repo space` | Asserts `empty.stdout` & `missing.stdout` === `session=${core.session}\n` | **Yes:** expect `session=${core.session}\npaused=false\n` (+ add paused, unpaused, and corrupt `paused.yaml` cases). |
| `tests/e2e/watch-tier.ts` | `observeReady` | Checks `seen.code !== 0 \|\| lines(seen.stdout)[0] !== 'session=...'` | **Optional tighten:** still passes as-is (line 1 unchanged); can also assert `lines(seen.stdout)[1] === 'paused=false'`. |
| `skills/watch-issues/consultant-brief.md` | Section `Case` | Embeds `<the leaf's observe line verbatim>` | **No:** leaf line format is unchanged. |
| `skills/AREA.md` | Section `Key files` | Describes `scripts/observe.ts` as "read-only inventory of hc seats..." | **Yes (`S5a`):** mention it also prints the repo's paused state. |
| Live watchers on old `SKILL.md` | Runtime (`S4a`) | Reads line 1 `session=<name>` and `slug=`/`unreadable=` lines | **Kept compatible:** line 1 and leaf/unreadable formats unchanged. |

### B. Every place naming `akrogon status` in the watch path
| File | Function / Section / Test | Current use | Must change? |
|---|---|---|---|
| `skills/watch-issues/SKILL.md` | Section `Invocations` | `started <address>` or `running <address>` runs "the one check of `akrogon status` at `<root>`" | **Yes:** replace with running the check under `## Observe` (still runs on paused repo). |
| `skills/watch-issues/SKILL.md` | Section `Observe` | "A check begins by running `akrogon status` at `<root>`..." | **Yes:** delete `akrogon status`; check begins with `observe.ts` and stops on `paused=true`. |
| `tests/fixtures/watch-agent.sh` | Main script | Runs `akrogon status`, logs `status <line>`, skips `next --all` on `*paused*` | **Yes:** run `bun "$skilldir/scripts/observe.ts" "$root"`, log observe outcome, act only when exit 0 and `paused=false`. |
| `tests/fixtures/watch-hook.sh` | Main script | Runs `akrogon status`, logs `status <line>`, emits `check paused\|acting t=<turn>` | **Yes:** run `bun "$skilldir/scripts/observe.ts" "$root"`, parse `paused=true` / `paused=false` / non-zero exit, log observe outcome and `check paused\|acting\|error t=<turn>`. |
| `tests/watch-timer.test.ts` | `statusCalls`, `logbin`, `watchUp`, `waitChecks`, `checksPerDue`, `ownBlock`, `heldPair`, and 6 tests (`start runs the check...`, `each due runs one check...`, `an unreceipted due...`, `stop kills...`, `dues queued behind...`, `dues queued during...`, `boundaries missed...`) | Tracks `call status`, arms `hold-status`, checks `status ` in hook/task logs; `watchUp` omits `AKROGON_HOME` | **Yes:** switch to observe interception (`OBSERVE_AKROGON` or parent-cmdline), add `AKROGON_HOME=${f.home}` to `watchUp`, assert `statusCalls(rig) === 0`. |
| `tests/watch-timer.test.ts` | `docs describe the timer watch for all harnesses with no cron wording` | Explicitly asserts `expect(skill).toContain('akrogon status')` and `not.toContain('akrogon status <root>')` | **Yes:** change to `expect(skill).not.toContain('akrogon status')` (also prevents `akrogon status <root>`). |
| `tests/e2e/watch-live.e2e.ts` | `logbin`, `statusCalls`, `expectHeldAcrossBoundary`, `launchEnvFor`, `startCell`, `tickRunsNoCheck`, `watch standin cell`, `watch live cell` | Tracks `call status`, arms `hold-status`, checks `status ` in hook lines; `launchEnvFor` omits `AKROGON_HOME` | **Yes:** switch to observe interception, add `AKROGON_HOME=${cell.tier.akrogonEnv.AKROGON_HOME}` to `launchEnvFor`, assert `statusCalls(callLog) === 0`, and cover paused behavior in the paid test if required under `S6a`. |
| `docs/use/watch-while-away.md` | Section `What each check does` (alt text + step 1–2) | Step 1 says "It runs `akrogon status`. If the repository is paused..." | **Yes (`S5a`):** describe the single observe read (paused check + open leaves) with no `akrogon status`. |
| `docs/pictures/watch-loop.svg` | Node text (`read status`) | Says `read status` / `(stop if the repo is paused)` | **Yes (`S5a`):** update to `observe open leaves` (or `observe repo`) / `(stop if the repo is paused)` to match `watch-while-away.md`. |
| `tests/AREA.md` | Section `Key files` | Summarizes `hc-observe.test.ts`, `watch-timer.test.ts`, `watch-live.e2e.ts` | **Check (`S5a`):** verify no stale `status` wording (currently none, no false claim). |

*(Non-watch references such as `src/status.ts`, `tests/pause-status.test.ts`, `docs/use/park-pause-stop.md`, `docs/reference/commands.md`, and other skills' `akrogon status <slug>` `Missing:` checks are outside the watch path and must NOT change.)*

---

## 5. Proof matrix (`S6a`: cheapest proof per property)

### Free tests (local, zero paid sessions)
1. **`tests/hc-observe.test.ts`** (real throwaway `hcCore`, ~2.5s):
   - *Reaches today:* `observe.ts` line 1 `session=`, leaf lines, `unreadable=` lines, empty inventory, missing `issues/open`, `akrogon config` failure, `repo: none`, missing repo space.
   - *New proof needed:*
     - Unpaused repo prints `session=<name>` on line 1, `paused=false` on line 2, then leaves/unreadables (and 2 lines only on empty inventory).
     - Paused repo (`cli(f, ['pause'])`) with open leaves & unreadable entries prints only `session=<name>\npaused=true\n` and exits 0 (F2A; or includes leaves if F2B).
     - After `cli(f, ['unpause'])`, returns to `paused=false` with leaves visible again.
     - Corrupt `paused.yaml` (e.g. `["not", "a", "map"]`, `{ <repo>: false }`, invalid YAML) exits non-zero, prints **empty stdout**, and prints error naming `paused.yaml` on stderr (`S2a`).
     - Non-`ENOENT` read error on `paused.yaml` (e.g. `paused.yaml` is a directory -> `EISDIR`) exits non-zero with empty stdout (`S2a`).
2. **`tests/watch-timer.test.ts`** (real `hcCore` + `watch-agent.sh` + `watch-hook.sh`):
   - *Reaches today:* start check, per-due checks with receipt-before-check, busy-check coalescing, paused tick acts on nothing (`call next` absent at paused turn), stale/forged ticks run no check, doc assertions.
   - *New proof needed (after porting hook/agent from `akrogon status` to `observe.ts`):*
     - `statusCalls(rig) === 0` across start, active ticks, and paused ticks (no `akrogon status` ever invoked).
     - Paused check sees `paused=true` from `observe.ts` (proving `AKROGON_HOME` alignment) and runs no `akrogon next`.
     - Corrupt `paused.yaml` causes `observe.ts` to exit non-zero and watcher acts on nothing (`call next` absent) rather than defaulting to unpaused (`S2a`).
     - Doc test asserts `SKILL.md` does **not** contain `akrogon status` (and `docs/use/watch-while-away.md` does not contain `akrogon status`).
3. **`tests/watch-issues-scripts.test.ts`** (`skills/watch-issues` `bun test scripts` + `bun run typecheck`):
   - *Reaches:* TypeScript typecheck of `observe.ts` (including new `../../../src/pause` import) and existing unit tests (`consults.test.ts`, `log-tail.test.ts`).
4. **`tests/state-inventory.test.ts`**, **`tests/docs-links.test.ts`**, **`tests/pause-status.test.ts`**, **`tests/pause.test.ts`**:
   - *Reaches:* No second state walker, valid doc links, human `akrogon status` pause behavior unaffected.
5. **`tests/e2e/watch-live.e2e.ts` free stand-in cells** (`AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE=root|shell`):
   - *Reaches:* End-to-end tier wiring (`watch-tier.ts` `observeReady`, paused start in `shell`, pause/unpause mid-watch, busy hold across boundary, `statusCalls === 0`).

### Paid live runs (`S6a`: only for model behavior, under standing grant 3b)
- **What only a paid run can prove:**
  1. A real model reading the updated `SKILL.md` executes a tick by calling `observe.ts` and **never** calls `akrogon status` (`statusCalls(callLog) === 0`), while still starting a waiting leaf (`akrogon next`) when `paused=false`.
  2. A real model reading `paused=true` from `observe.ts` honors the pause rule and runs **no** `akrogon next` / `phase` / `hc` seat commands, and resumes acting once `unpause` flips it back to `paused=false`.
- **Gap in existing paid test:** `tests/e2e/watch-live.e2e.ts` (`watch live cell: a real harness in the tier`) currently does **not** exercise `pause` at all (only `watch standin cell` does), and currently asserts `statusCalls >= 1` / `waitCallAtTurn(..., 'status', ...)`.
- **Needed paid proof:** Update `watch-live.e2e.ts` `watch live cell` to:
  - Replace `status` tracking/holds with `observe` tracking/holds, and assert `statusCalls(callLog) === 0`.
  - Add a paused tick check (pause via `tier.akrogon(['pause'])` -> wait for next due's `observe` call -> assert zero `call next` on that turn -> unpause).
  - Run the cheapest paid cell(s) under standing grant 3b (at minimum one real harness, e.g. `pi` root — the harness from the incident report — or `claude`/`pi`, budgeted via `AKROGON_SESSIONS`).
- **`tests/e2e/watch-consults.e2e.ts` (`watch-consults-body.ts`)**: calls `observeReady` (line 1 check) and runs a real `pi` watcher through start -> consult -> resume; does not directly test `pause` or `statusCalls === 0`, so it is NOT needed unless consult flow changes.

---

## 6. Surprises & contradictions vs intake

1. **Contradiction with `INTAKE.md` (`Observation`, `Suspected cause`): `akrogon status` at `<root>` is NOT multi-repo for the leaf table.**
   - `src/status.ts` `statusCommand` calls `currentRepo(global, process.cwd())` and filters `scans` to that single repo when run at `<root>` (only outside a repo or with `--json` does it scan all repos).
   - **What IS noisy/multi-repo even at `<root>`:** `lineRuns()` prints the run-line queue across **all repos** whenever any `full` run waits; plus `Unpacked:` nags, `Slow merge:`, `Listener: live|down`, `Failed:`, `Missing:`, `deploy failed:`, parked rows, and table formatting. So the intake's conclusion (two overlapping sources, the human-oriented one tempting filtering) still stands, even though the "multi-repo board" detail only holds if run outside `<root>` or for the run-line block.
2. **Surprise: `AKROGON_HOME` is missing from watcher envs in `tests/watch-timer.test.ts` (`watchUp`) and `tests/e2e/watch-live.e2e.ts` (`launchEnvFor`).**
   - Only their `akrogon` wrapper shims set `AKROGON_HOME`. Because `src/pause.ts` `pauseFile()` uses `globalHome()` (`process.env.AKROGON_HOME ?? ~/.akrogon`), calling `isPaused()` inside `observe.ts` would silently read the wrong path (`${f.home}/.akrogon/paused.yaml` in `watch-timer.test.ts`, and the **operator's real `~/.akrogon/paused.yaml`** in `watch-live.e2e.ts`!) unless `AKROGON_HOME` is added to both watcher envs (just as `tests/e2e/watch-consults-body.ts` already had to do for `consults.ts`).
3. **Surprise: Both `watch-timer.test.ts` and `watch-live.e2e.ts` (free AND paid) use `akrogon status` as their check counter AND busy-hold hook, and `watch-agent.sh`/`watch-hook.sh` never ran `observe.ts` at all.**
   - Plus `tests/watch-timer.test.ts` (`docs describe the timer watch...`) has a hard `expect(skill).toContain('akrogon status')` assertion. Updating these is a significant part of the change surface (`S5a`), and also improves test fidelity because the free timer suite will finally execute real `observe.ts`.
4. **Surprise (extension of `INTAKE.md` `Agent findings`): `akrogon next --all` ALSO ignores `paused.yaml`.**
   - `src/next.ts` `nextCommand` passes `isAutomatic = false` for both explicit `akrogon next <slug>` AND `akrogon next --all` (only `--resume` and `--wake` set `isAutomatic = true`). So every `next` command the watch can run bypasses `src/next.ts`'s pause gate — the watch's own pause check is the sole guard.
5. **Surprise: `observe.ts` uses `OBSERVE_AKROGON` while `repo.ts` (`watchTarget`) and `consults.ts` use `WATCH_AKROGON`.**
   - Helpful asymmetry: a test wrapper on `OBSERVE_AKROGON` intercepts only `observe.ts`'s `akrogon config` call without interfering with `start.ts`/`tick.ts`'s pre-receipt `akrogon config` call.
6. **Surprise: `watch-live.e2e.ts` paid harness cell does not currently test pause at all.**
   - Only `watch standin cell` calls `tier.akrogon(['pause'])`; proving real model obedience to `paused=true` under `S6a` requires adding a pause step to the paid test (or a dedicated paid pause check).
