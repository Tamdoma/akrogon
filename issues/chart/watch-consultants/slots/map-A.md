# Map (A)

Surfaces read: skills/watch-issues/SKILL.md (Invocations, Judge, Never), scripts/timer.ts header and `poll`, scripts/stop.ts `main`, src/akrogon.ts `seat` case, src/seat.ts `startConsultant`, src/config.ts `globalSchema`, src/hc.ts `consultantName` and `run` (parent outlive), skills/merge-issue/SKILL.md (Shared context, attempt top, Shared endings), `hc run --help` (name unique among live terminals), `hc wait --help` (message ends a children wait).

## Forks

F1 Config shape and absence. Where does the recipe live and what happens without it? (a) top-level `consultant: {harness, model, effort}` checked against `harnesses:` like slots; optional in schema; `akrogon seat --slot <x>` with no flags reads it; absent and no flags is a loud error naming the key, and the watch then notifies as today, (b) `slots.c` (reads as a leaf seat; slots means lifecycle seats a/b), (c) required key (every machine without it breaks `readGlobal`). Rec a.
F2 Name and start. `consultantName` gives `<prefix>-slot-<x>`; hc names are unique among live terminals, so a watch consultant named `ak-slot-b` collides with a chart door's B in the same repo and the start fails. (a) a watch-specific name `<prefix>-watch-consult` through the same `startConsultant` (new name parameter or verb flag), (b) reuse `--slot` letters and refuse when taken. Rec a.
F3 Exchange protocol. What the consultant gets and returns, and where files live given Never "Edit issues/". (a) brief and return files under the akrogon state folder (`~/.akrogon/watch/<repo>/consults/<id>/`), brief holds the observe line, failure reason, log excerpt, the affected leaves and the operator-stop list; return holds diagnosis, action taken or proposed, and evidence; report `hc send <watcher> "done consult: <path>"`; questions either way are `hc send` lines answered in the same consult, (b) files under issues/ (needs a Never change and commits on main). Rec a.
F4 Root cause grouping. Whether two failures share a cause is the watch's model choice (standing-design model-choice line): it decides from the failure reasons, failing commands and base evidence, records the choice and reason in the consult record; no text match decides it.
F5 Fix path. (a) base fix: consultant works in its own throwaway worktree off `<remote>/<default_branch>`, runs the repo's configured `checks` green there, pushes fast-forward (no force); leaf fix: consultant steers or corrects through the leaf's own seats and lifecycle (`akrogon phase`, a corrective prompt), never commits into a leaf worktree a seat owns; resume: watch runs `akrogon phase <slug> <failure.phase>` + `next` once the fix is on main, (b) consultant may commit into leaf worktrees too. Rec a.
F6 Never list. "Kill/remove an hc terminal" gains the watch's own consultant (after its answer is acted on, on stop, on a stuck consultant); "Answer a seat" stays (busy seats are not in 1a); "Edit issues/" stays; "Run phase failed" stays; recovery of the human-prerequisite class becomes allowed after a consult says the cause is cleared, except operator stops.
F7 Liveness. No give-up time (S4): the watch loops `hc wait --children any` with a check-in timeout, reading the consultant's state from the wait JSON; a consultant that stops without its return gets one nudge; a second silent stop, an error or exit ends that consultant and starts a fresh one for the same consult (no total cap, S5) — or notifies? Ticks queue in the timer while the watcher is working (timer.ts `poll` readiness requires idle/done) and each runs its own check after.
F8 Proof. Real watch (claude) + real agy neon consultant in a throwaway hc session and repo, staged base red (a failing `checks` command); the consultant fixes and pushes to the throwaway remote; the watch resumes the failed leaf. Plus free tests for config parse and name.

## Pitfalls

- Name collision with chart doors (F2) — hc refuses the start.
- Ticks piling during a long consult: each queued due runs a full check later; harmless but noisy.
- Consultant pushes a fix that changes a decided contract — S3 stop; the consultant must read the leaf's brief/design before pushing.
- A fix on main racing a leaf's merge turn: the merge queue rebases onto the new tip; push must be fast-forward only.
- Watcher exit kills the consultant (`outlive: false`) — wanted.

## External operations needing observation

`akrogon seat`-style consultant start from a watching conversation; consultant `hc send` to a watcher inside `hc wait`; timer due delivery after a long watcher turn; `hc kill`/`hc rm` of the consultant; `git push` fast-forward to a throwaway remote; agy neon launch with a task.
