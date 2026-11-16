# Opening map, slot A

Written blind before reading map-B.md and map-C.md. Signposts: forks/signposts.md (A's picks 1a-7a).

## Root causes

### #136 run-check on a failed leaf (sure)
- `leafTarget` / `leafFields` (src/run-check.ts) read the leaf state and copy `phase` into the run record; `checkedRun` checks only `ownerRefusal` and admission. Nothing reads `phase === 'failed'`.
- At the attempts fail move (src/next.ts `dispatchSlot`, end of function) the seat terminal is left alive; the failed branch in `dispatchLeaf` ends nothing for `cause: attempts`. So a live seat keeps working on a failed leaf, and its only contact with akrogon is the commands it runs (run-check, phase).
- The three re-prompts were correct under the current rule: the seat really ended 3 turns without a report while a background run went on. implement-issue already says to run slow runs in the foreground. The defect is only that the launch was not refused.

### #137 attempts burned by seat starts (sure on the count, unknown on the killer)
- `startSeat` (src/seat.ts) adds 1 to `attempts[slot]` on a confirmed first task; `dispatchSlot` `deliver` adds 1 on every re-delivery; the fail move fires when a prompted turn has ended and `attempts >= 3`, with reason "ended N turns without reporting". The counter counts deliveries, the reason claims silent turns. Those differ whenever a seat dies before ending a turn.
- Boot evidence (journalctl --user -b, 2026-11-16): the first `next --resume` at 10:30:17 refused ("no running session holds it": herdr session not up yet); starts at 10:30:55, 10:31:13, 10:31:27; scopes ended by process exit after 17.3 s and 9.9 s, no `Stopping`; the herdr-app log has no lines after 09:28Z, so nothing from herdr for this boot. Framework timings show three `prompt delivered` records (09:30:55Z, 09:31:13Z, 09:31:27Z) and the leaf has been working since. Killer: unknown, likely outside akrogon (hc, herdr restore, or claude itself exiting at boot). Not chartable as a fix (signpost 2a); akrogon can only stop it from costing attempts.
- Boot PATH crash (`Executable not found in $PATH: "akrogon"`, src/listen.ts spawn): systemd restarted 2 s later and nothing was lost. Placement: Off route as its own seed candidate (recorded only under autopilot), because it is a unit-environment issue unrelated to attempts.

### #135 seats and doors stop on prompts (sure on the seat half)
- Seats really raise question dialogs: claude transcripts in framework worktrees on 2026-11-15 contain `AskUserQuestion` tool calls (rewrite-copy-review, trust-facts-record, business-facts-records, dataforseo-keyword-commands, keyword-research-skill). The pi template already removes the same class (`--exclude-tools request_user_input` in the machine config harness line); the claude template has no equivalent.
- akrogon already sees a blocked seat: hc reports `status.state: blocked` with a `kind` (src/seat.ts `firstTask` answers `kind: permission` once at start), the listener wakes `next --wake` on it (src/listen.ts), and `observeBusy` (src/next.ts) treats blocked like working: a non-attention "Busy leaf" notice only after `STALL_MS` = 60 min. So a seat stuck on a prompt waits silently for an hour, then gets a quiet notice.
- The watch's Never list says "Answer a seat", and Claude Code's classifier denied the watch's `hc keys` / `hc send` as undermining oversight. Signpost 3a forbids passing a harness denial.
- N11b (chart approval row) is an operator approval by rule (signpost 3a) and is now covered by existing machinery: readiness `inputs` with `steps` make `akrogon status` print the missing need and `akrogon next` refuse dispatch. A chart door is not a leaf; its prompts are the operator's.

## Forks

F1 What spends the attempts budget (#136 shares the dispatch path, #137 is the case).
- a (pick) Count at the moment a prompted turn is seen ended without a phase move (the existing check in `dispatchSlot`), not at delivery or start. A seat lost before ending its turn costs nothing on this counter. Same fail point for the normal case (3 silent turns). Removes the mismatch between counter and reason.
- b Keep counting deliveries; skip the increment only for starts after a boot. Invites a boot detector and leaves other pre-turn deaths counting.
- Later risk of a: a seat that dies mid-turn every start loops forever, each start paid. Needs F2.

F2 What bounds a seat that keeps dying before it ends a turn.
- a (pick) A second count on the leaf state, of starts that replaced a seat lost before ending a turn, failing the leaf at 3 with a distinct cause and reason ("seat A lost 3 times before ending a turn"); reset on phase move like attempts. One field, one check at the existing start site.
- b Time-window cap on starts. Invites clock state and tuning.
- c No bound. Breaks signpost 4a.

F3 Where run-check refuses (#136).
- a (pick) `leafTarget` (the single resolver every leaf-scoped run goes through) throws a named refusal when the leaf phase is `failed`, naming the failure reason and the recovery command `akrogon phase <slug> <failure.phase>`. Read by the seat on stderr at the point of use. Operator recovery path stays: recover the phase, then run.
- b Refuse only grant-covered paid runs. run-check does not know which runs are paid; would need a new marker.
- c Also end the seat at the fail move. Adds a kill path the watch's Never list and recovery rely on not having; the refusal already stops spending.
- Open: should `merged` (or any phase with no seat) refuse too? Pick: failed only, the observed state; widen nothing.

F4 How a blocked seat is handled (#135).
- a (pick) Remove and notify: the claude harness line gains the flag that removes `AskUserQuestion` (mirrors pi's exclusion), and `observeBusy` sends an attention notice at once when a seat is `blocked`, naming leaf, seat, kind and message, instead of the 60-min quiet one. The watch answers nothing; its Never list stays.
- b The watch confirms non-dangerous prompts (the report's ask). Needs a danger classifier, per-harness keys, a confirmation record and an outside permission rule to pass the classifier denial; breaks signposts 1a and 3a.
- c Notify only, keep the question tool. Seats keep stopping.
- Later risk of a: a seat with no question tool must decide alone or stop `failed` with a reason (implement-issue already has the operator-blocker exit). The harness line is machine config (`~/.akrogon/config.yaml`), outside the repo: operator-applied exact text (needs row N2) or `akrogon` code appending it per kind (moves config into code, against the pi precedent).

## Practitioner questions and pitfalls
- Does `--disallowedTools AskUserQuestion` hold under `--dangerously-skip-permissions`? Needs one real observation (paid, tiny, under N1).
- Which `kind` values does hc report on blocked (permission, question, other)? Read from hc source or one throwaway terminal.
- A permission prompt inside a skip-permissions seat should not happen; if it does, the notice shows the msg so the operator learns which.
- Notice spam: one notice id per leaf+seat+blocked episode, cleared when the seat leaves blocked (the busy notice already does this pattern).
- Counting at the turn end needs the turn number to be reliable after a restart: a new terminal starts at turn 0; `prompted.turn` is reset at start.

## Split
- Issue `attempts-count`: one leaf for F1+F2 (both edit the same counting in seat.ts and next.ts; splitting them would make two leaves disagree on one rule).
- Issue `failed-run-refusal`: one leaf for F3. Independent of F1 (different file and check), parallel.
- Issue `blocked-seat`: one leaf for F4's notice; the harness flag is a needs row / Pending step, not a leaf (machine config). Parallel.
- One epic `unattended-runs` holding the three issues; each report is owned by its issue.

## External operations needing proof
- claude `--disallowedTools AskUserQuestion` effect: one haiku session asked to use AskUserQuestion (paid, N1).
- hc blocked status `kind` and `msg` fields: free read of hc docs/source, or one throwaway bash terminal is not enough (needs an agent) — paid under N1 if no source.
- `akrogon notice --attention`: existing command, already used by the watch.

## Fog
- Which permission prompt the framework seat showed on 2026-11-15 (not in the report; no transcript record found yet).
