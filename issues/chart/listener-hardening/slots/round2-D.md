# Round 2: D

## Part 2: Slot B as an indented child of slot A

### D1 Recommended design: akrogon changes the parent and two flags; no new placement machinery

1. **Indented under A.** For slot B only, pass the current live A terminal as `parent`, instead of today's `parent: null` for every leaf seat (`src/seat.ts:219-230`). Extend the existing `run()` spec, which already maps a non-null parent to `--parent` (`src/hc.ts:284-307`), with `--outlive-parent` and `--no-notify` for B. No state change is needed: the A address is already recorded (`src/state.ts:48-52,131`) and hc already returns `parent` on a terminal (`src/hc.ts:28,45`).

   The sidebar needs no new grouping logic in the normal flat layout. `agents-by-tab` already builds its tree from core parent links (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:154-164`) and draws children as indented sub-rows (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:166-190`).

2. **Pane on the right half.** Keep B's existing `herdr.space` and `herdr.tab` labels (`src/seat.ts:223-230`) and the existing placement proof, which waits until the terminal appears in that tab when a window is open and leaves closed-window placement to herdr-app adoption (`src/seat.ts:167-192`). Labelled children do get panes: the P11 window proof started three `--parent door` children with the door's space/tab labels and all four terminals sat in one row after the window opened (`issues/chart/herdr-app/forks/proofs.md:70-72`). With only A already in the leaf tab, B is the second terminal in that row; the earlier two-terminal proof recorded a 0.5/0.5 split (`issues/chart/herdr-app/forks/proofs.md:48`).

   No missing herdr-app capability is involved. `terminal.keep {terminal, place}` already exists if a future proof shows a labelled child arriving without a pane, but using it now would add a window-dependent placement call that the label path does not need. Low confidence: the exact left/right order when both A and B were started while the window was closed still depends on herdr-app's adoption order; the window-open path is the proven one.

3. **Exactly as today otherwise.** `--outlive-parent` removes hc's default "child ends with parent" behavior, and `--no-notify` removes hc's notes typed into A. Both flags are in `hc run --help`. B keeps its own systemd scope because every leaf seat is wrapped in its own `systemd-run --scope` unit inside the leaf slice (`src/seat.ts:231-255`), so the hc parent link does not join B's lifetime to A's scope.

Ownership: akrogon owns the parent choice and the two flags. Herdr-setup needs no change for indentation or the pane. Herdr-app needs no new command.

### D2 What B's parent is when A is not live

There is no parent value that gives both "always indented" and "exactly today's behavior" when no live A exists. The smallest honest rule is one derivation at B start, with no phase-specific branches:

> B's parent is A's terminal when the A seat recorded for this leaf is live in the same session and its labels still name this repo, leaf and seat A; otherwise B has no parent.

That live-and-owned check is the check akrogon already uses to recognize its seats: recorded session and address plus matching labels (`src/reconcile.ts:395-411`), and `liveSeat` is simply `state === 'live'` (`src/next.ts:103-105`). Cases:

- **Normal check.review:** A is live (usually idle), so B starts as A's child. If A and B both start in one pass, A runs first because dispatch iterates `requiredSlots` in order (`src/next.ts:648-661`), and `startSeat` records A's address before its first-task proof returns (`src/seat.ts:256-262`). B's parent derivation must therefore read the fresh state or the just-started A, not the allocation snapshot taken before A started (`src/next.ts:389-396`).
- **check.repair and merge:** B normally already exists from check.review, so no parent choice is made. If B must be restarted there and A is still live, B gets A as parent again. If A is gone, B starts parentless and behaves exactly as today.
- **A finished but not removed:** parentless. Passing a finished address buys nothing in the sidebar, whose tree walk only follows live parents (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/tree.js:8-15`). Low confidence: whether `hc run --parent <finished>` is even accepted is unprobed, which is another reason not to rely on it.
- **A killed, removed, in another session, or never recorded:** parentless. This covers a manual `akrogon seat <slug> B`, recovery into a B-only phase, and the broadcast-only B started after a command merge (`src/next.ts:939-967`).
- **A restarted before B starts:** B's parent is the new A address from current state.
- **A restarted after B starts:** B keeps the old parent address. Hc records parent once at start, so existing B cannot be reparented; while the old A is gone the sidebar shows B at top level because its tree walk only follows live ancestors (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/tree.js:11-15`). Restarting a healthy B only to restore indentation would change behavior, so do not.
- **Stop, reconcile and teardown:** end B before A. Today `endSeats` ends `[A, B]` in that order (`src/reconcile.ts:413-417`) and merged-tab close does the same (`src/reconcile.ts:427-437`). With `--outlive-parent` the order is not needed for survival, but B-first is the clean order and removes any doubt. `akrogon stop` then stops the whole leaf slice after the seats (`src/stop.ts:53-60`), unchanged.

### D3 Side effects on A and on the engine

- **Notes into A:** removed by `--no-notify`. Without it, hc would type B's blocked/error/exit notes into A's input.
- **A's exit killing B:** removed by `--outlive-parent`. Without it, A ending during check.repair or merge would end the only working seat.
- **A's `hc wait --children`:** not removable by any flag. If A ever runs it, B counts as a working child and B's stops become A's child news. No leaf skill instructs A to do this today; the only `hc wait --children` instruction in the skills is the chart door's consultant collection (`skills/chart-issues/assets/questions.md:60`). This is the one real behavior difference of a true parent link, and it is inherent to being a sub-agent.
- **Listener and watcher:** unchanged. The listener reacts to turn/status events and reads `akrogon.seat` from labels, never parent (`src/listen.ts:75-85`). Seat ownership in dispatch and reconcile is by recorded address and labels, never parent (`src/reconcile.ts:395-411`). B's own hc children, if any, were already B's children before this change.
- **Sidebar presentation:** B's row moves under A, and the family status logic treats child rows as sub-agents, including mapping a child's `done` to `idle` (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/tree.js:46-51`) and opening a peek on click (`/home/ivan/Work/infra/herdr-setup/mods/agents-by-tab/main.js:150-152,183`). That is presentation only: akrogon's own status and dispatch read the terminal directly. If the operator wants a pane-holding child's click to focus its pane instead of peeking, that is a small herdr-setup change, not part of the lifecycle design.

### D4 Simplest design I would defend

One change in `startSeat`: slot A keeps `parent: null`; slot B derives its parent from the leaf's current live A seat and sets `--outlive-parent --no-notify`. Labels, tab placement, scopes, state shape and delivery all stay as they are.

What it removes: the need for a fake grouping label, a herdr-setup placement helper, a `terminal.keep` call in the start path, and any new state field for "visual parent". The core's existing parent field becomes the single source for both indentation and lifetime exceptions.

## Part 3: Remaining bugs that can stop a leaf, ranked

### R1 A failed pass loses the only wake; a hung pass blocks every later pass

The queue runs one child pass at a time, logs a nonzero exit and moves on (`src/listen.ts:27-36`). A seat that already ended its turn may emit no further event, so a transient failure inside that one `next --wake` leaves the leaf idle with nothing scheduled. A hung child is worse: `child.exited` has no deadline, so every later wake folds into a queue that never drains.

Smallest fix: keep the existing queue, but make failure level-triggered at one remove. When a pass exits nonzero, enqueue exactly one `next --resume` (the existing catch-up pass) and do not retry a failed resume until the next event. Give the pass child one generous deadline so a hang becomes a failed pass that takes the same recovery path. This adds no new pass type and no polling: the retry is caused by the failure itself.

### R2 Finite hc calls have no deadline

Only `rpc()` passes a deadline (`src/hc.ts:110-112`). `get`, `read`, `run`, `send`, `keys`, `label`, `kill` and `rm` all go through `hc()` with no timeout (`src/hc.ts:276-332`), and the socket probe in `listening()` also has no timeout (`src/hc.ts:129-140`). One wedged core or CLI can therefore hang a pass (R1), a seat start, or teardown indefinitely, even though `spawnCaptured` already supports a timeout (`src/shell.ts:69-82`).

Smallest fix: give `hc()` one default deadline for all finite calls and delete per-call deadline choices; `follow` does not use `hc()` and stays unbounded as a stream. Add the same bound to the socket probe, reported as that socket's failure rather than a hung `sessions()`.

### R3 One session's stream, watcher or parse failure still kills the whole listener

A rejected event stream goes to the process-wide `fail` (`src/listen.ts:90-95`), a rejected watcher wake does the same (`src/listen.ts:50`), and a scan rejection does too (`src/listen.ts:115-122`). The stream parser is strict (`src/hc.ts:375-386`) and the listener parses label and status payloads inside the callback (`src/listen.ts:77-78`), so one malformed event, one hc schema addition or one failing watcher send exits the process. `Restart=always` (`systemd/akrogon-listener.service:3-8`) now brings it back, but every such restart also reruns `pull --all` and can loop on a permanent parse error.

Smallest fix: delete `fail` from the session-local paths. A stream failure cleans up only that session and lets the existing socket-watch scan resubscribe it with a catch-up snapshot; a watcher failure is logged and dropped because the watcher is optional; a scan failure keeps existing subscriptions and is retried by the next socket-directory event. Keep process exit for invariant startup failures only. This is mostly deletion: fewer paths lead to `fatal`.

### R4 A newly subscribed session gets no catch-up pass

On a snapshot, the listener enqueues `next --resume` only if that session is in the `catchUp` set, which is populated only when a previous stream ended (`src/listen.ts:53-55,71-73,90-94`). A session first discovered after startup with seats that already ended their turns gets watcher wakes for finished seats (`src/listen.ts:64-70`) but no engine pass, so an idle seat in it can sit until some other event.

Smallest fix: delete the `catchUp` set and enqueue `next --resume` on every snapshot. The queue already deduplicates by pass name (`src/listen.ts:37-40`), so startup does not gain extra passes, and every (re)subscription becomes level-triggered instead of depending on how the session was discovered.

### R5 Global space resolution lets one unreadable session block a seated leaf

Every pass resolves a repo by listing all live sessions and reading every session's document; one unreadable session makes the answer "uniqueness unknown" (`src/hc.ts:221-264`). That refusal applies even to a leaf whose seats already record their session and address (`src/state.ts:48-52,131`) and whose ownership check needs only that session's terminal list (`src/reconcile.ts:397-411`). One hung or incompatible extra core can therefore stop dispatch for leaves that are already seated elsewhere.

Smallest fix: for a leaf that already has a recorded seat, use that seat's session after verifying the terminal's labels in it, and keep the global uniqueness search only for allocating a leaf with no seat. This deletes the repeated all-session scan from the hot path instead of adding a cache.

### R6 A hung subscription blocks startup; a silent stream is never detected (low confidence on frequency)

A subscription resolves only on its first snapshot (`src/listen.ts:57-61,71`), `scan()` waits for all fresh subscriptions (`src/listen.ts:116-119`), and startup passes wait for the first scan (`src/listen.ts:124-127`). One session whose `hc events` never emits a snapshot therefore blocks every pass. After startup, heartbeats are discarded without recording their arrival (`src/hc.ts:381`), although `hc schema` documents a heartbeat every 15 seconds for `events.subscribe`, so a wedged stream looks subscribed forever.

Smallest fix: let `follow` end a stream that produces neither snapshot nor heartbeat within a few heartbeat intervals. The ended stream then takes R3/R4's existing resubscribe-and-resume path. No polling is added: the deadline is on the stream's own promised heartbeats.

### R7 Boot with no socket directory crash-loops until the first core appears

The listener watches `$XDG_RUNTIME_DIR/herdr-core` before its first scan (`src/listen.ts:101-110,124`) and `sessions()` reads that directory without an existence check (`src/hc.ts:142-153`). If the listener starts before any core has created the directory, it exits on `ENOENT` and systemd restarts it every 2 seconds until a core appears. It now self-recovers, so this ranks last, but it spams the journal and delays the first pass.

Smallest fix: treat a missing socket directory as an empty session list and watch the runtime directory for its creation. Absence becomes a state, not an exception.
