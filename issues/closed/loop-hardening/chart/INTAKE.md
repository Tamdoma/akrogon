# Intake: loop-hardening

## Scope
Harden the akrogon loop against the ten audit reports #5 to #14: sync publishes only issue records, dispatch keeps going past one bad record, completion closes GitHub sources recoverably, invalid trees and renames fail early with clear messages, reviewers cannot deadlock, and the command reference lists every verb. Proposed grouping: one epic `loop-hardening` owning #10 and #14, six issues owning their narrow sources. See CHART.md.

## Provenance
- GitHub: Tamdoma/akrogon#5
- GitHub: Tamdoma/akrogon#6
- GitHub: Tamdoma/akrogon#7
- GitHub: Tamdoma/akrogon#8
- GitHub: Tamdoma/akrogon#9
- GitHub: Tamdoma/akrogon#10
- GitHub: Tamdoma/akrogon#11
- GitHub: Tamdoma/akrogon#12
- GitHub: Tamdoma/akrogon#13
- GitHub: Tamdoma/akrogon#14
- Operator: chart door 2026-09-11, "use slot B, drain all issues and consolidate them"

## Source: Tamdoma/akrogon#5

# Failed GitHub source closure at merge is unrecoverable: folder moves first, closeSources never retries

Source: Tamdoma/akrogon#5
URL: https://github.com/Tamdoma/akrogon/issues/5

Unverified intake.

## Observation
`completeOwner` in `src/phase.ts` renames the finished issue folder into `issues/closed/` and only then calls `closeSources`. When `closeSources` fails (gh down, bad source string, comment listing failure) the command exits nonzero but the folder is already moved. Every later path short-circuits: `transition` throws `Merged is terminal`, and `completeOwner` returns early because the leaf is already under `issues/closed`, so `closeSources` never runs again. The GitHub issues listed in `sources` stay open with no later error.

## Location
akrogon command, `src/phase.ts` `completeOwner` and `closeSources`; `akrogon phase <slug> merged`, `akrogon next`.

## Reproduction
Reported by an external audit at commit 2932b4e with a temporary test: make two `gh` calls fail during the merged transition. Folder is moved, retrying `akrogon phase <slug> merged` fails, `akrogon next <slug>` exits 0 and makes zero new gh calls.

## Expected behavior
A failed source closure stays recoverable: a later run closes the GitHub issues, or the failure is surfaced until it is.

## Urgency
GitHub intake stays open silently after any transient gh failure at merge. Workaround: close the issues by hand.

## Source: Tamdoma/akrogon#6

# akrogon next has no per-leaf or per-repo error isolation: one bad record or failed cleanup stops all dispatch

Source: Tamdoma/akrogon#6
URL: https://github.com/Tamdoma/akrogon/issues/6

Unverified intake.

## Observation
`akrogon next` has no per-leaf or per-repo error isolation. Any error inside `dispatchLeaf`, `sweep`, `sweepAll`, `activeCount` or the hook owner scan propagates out of `nextCommand` and stops all dispatch. Reported cases: a registered repo whose path was deleted makes `next` fail on a healthy repo; a leaf with `blocked-by: [nonexistent]` makes `next --all` exit 1 and dispatch nothing; a corrupt `state.yaml` (bad enum, duplicate slug, repo mismatch) does the same; a merge-phase leaf whose `git fetch` fails twice kills the sweep. `next --all` also runs `cleanupMerged` for every merged leaf before the sweep, and a dirty merged worktree (`git worktree remove` refuses) aborts the whole run before any dispatch. Separately, `nextCommand` parses `HERDR_PLUGIN_EVENT_JSON` before checking `--all`, so a malformed or `working` event makes `next --all` exit early. Because the herdr event hook and the plugin startup both run `akrogon next`, one bad record disables dispatch on the whole machine and nothing tells the operator.

## Location
akrogon command, `src/next.ts` `nextCommand`, `sweepAll`, `sweep`, `dispatchLeaf`, `activeCount`, `cleanupMerged`; plugin hooks in `plugin/`.

## Reproduction
Reported by an external audit at commit 2932b4e with temporary tests for each case above. A `merged` leaf with an uncommitted file in its worktree blocked dispatch of a ready leaf.

## Expected behavior
One unreadable record or one failing cleanup is reported and skipped, and every other leaf and repo is still dispatched.

## Urgency
A single bad record stops the loop until manually repaired, with no notification. Workaround: find and fix the record by hand.


## Source: Tamdoma/akrogon#7

# akrogon sync commits the whole repo with git add -A, pushes HEAD from any branch, and takes no lock

Source: Tamdoma/akrogon#7
URL: https://github.com/Tamdoma/akrogon/issues/7

Unverified intake.

## Observation
`akrogon sync` runs `git add -A` at the repository root, so any unrelated dirty file in the consumer repo, including an operator's half-finished work, is committed as `sync issues` and pushed to the default branch. It pushes `HEAD:<default_branch>` regardless of the checked-out branch, so a detached head or side branch pushes the wrong ref. It takes no lock, so it can commit a half-renamed issue tree while `park` or `completeOwner` is moving folders. Related: `init` always ignores `issues/worktrees/`, but `worktree_root` is configurable, so a repo with another root gets its worktree checkouts committed by sync.

## Location
akrogon command, `src/sync.ts`, `src/init.ts` gitignore additions.

## Reproduction
Reported by an external audit at commit 2932b4e from reading the code. Frequency: every sync in a repo with unrelated dirty files.

## Expected behavior
Sync commits only the issue records it owns, from the default branch, under the same lock the other commands hold.

## Urgency
Unrelated work can land on main by accident. Workaround: keep the tree clean before running sync.

## Source: Tamdoma/akrogon#8

# Renaming a repo directory or registration key makes every existing leaf unreadable

Source: Tamdoma/akrogon#8
URL: https://github.com/Tamdoma/akrogon/issues/8

Unverified intake.

## Observation
`state.repo` is written into every leaf at handoff and checked in `allLeaves` (`Leaf repo mismatch`) and `status` (`z.literal(repo.name)`). `init` derives the name from the directory basename. Renaming the repo directory or the `repos` key in `config.yaml` makes every existing leaf unreadable: `next`, `phase` and `status` all fail, and there is no migration path.

## Location
akrogon command, `src/state.ts` `allLeaves`, `src/status.ts` `scanRepo`, `src/init.ts`.

## Reproduction
Reported by an external audit at commit 2932b4e. Rename the checkout directory or the registration key, run `akrogon status`.

## Expected behavior
Not provided.

## Urgency
Any rename bricks the loop for that repo. Workaround: edit `repo:` in every state.yaml by hand.

## Source: Tamdoma/akrogon#9

# Dispatch has no stall detection: a wedged or session-less agent holds its leaf forever

Source: Tamdoma/akrogon#9
URL: https://github.com/Tamdoma/akrogon/issues/9

Unverified intake.

## Observation
Dispatch has no stall detection. `dispatchSlot` returns early whenever the seat's agent is `working` or `blocked`, with no timeout, no attempt consumed and no notification, so a wedged agent holds its leaf forever. Observed live: a Codex pane dead at its context limit still reported `agent_status: working`. The `failed` notification only fires after prompt attempts are exhausted, and a permanently busy agent never consumes one. The merge check in `dispatchLeaf` only treats `working` as active, not `blocked`, so a blocked merger lets `recoverMerge` run mid-rebase and `requireClean` then throws. The session check `pane.agent !== null && pane.agent_session?.value === state.prompted[slot]` skips the prompt when `agent_session` is null on a live agent (`undefined === undefined`), so a harness whose session detection lags is never prompted. `dispatchSlot` uses `--timeout 5000` for both `agent start` and `agent prompt --wait`, so a slow cold start burns one of three attempts per 5 seconds. `allocate` throws `Expected one or two panes` when an operator splits a third pane in a leaf tab, and stale `tab`/`worktree` fields inflate `activeCount` until the startup sweep. `dispatchSlot` crashes on `z.string().parse(undefined)` when `state.pane[seat]` is missing.

## Location
akrogon command, `src/next.ts` `dispatchSlot`, `dispatchLeaf`, `allocate`, `activeCount`.

## Reproduction
Reported by an external audit at commit 2932b4e; the wedged Codex pane was observed live on this machine, the rest from code reading and temporary tests.

## Expected behavior
A wedged seat is detected and handed on or failed, a live agent without a session value is still prompted, and transient slowness does not consume attempts faster than a true wedge.

## Urgency
A leaf can wait forever with no signal. Workaround: notice the stuck tab and restart the agent by hand.

## Source: Tamdoma/akrogon#10

# Config gaps: pull ignores configured remote, install skips pi skills folder, README omits sync/park/unpark

Source: Tamdoma/akrogon#10
URL: https://github.com/Tamdoma/akrogon/issues/10

Unverified intake.

## Observation
Several configuration gaps reported together. `pull` runs `git remote get-url origin` and ignores the configured `remote`, so a repo whose GitHub remote has another name cannot pull (the test suite asserts this, so it may be intentional, but `remote` being merge-only is undocumented). `install` links skills only into `~/.claude/skills` and `~/.agents/skills`, while the shipped `pi` harness template reads `~/.pi/agent/skills`, so a pi slot receives `plan-issue <slug>` prompts without the skill installed. The README command table omits `sync`, `park` and `unpark`, and it is undocumented that `issues/parked/` is committed. `shapes.md` in chart-issues hardcodes `phase: plan.synthesis` in its state.yaml template while its text says `debate: 'yes'` starts at `plan.positions`. `ensureWorktree` throws `Worktree path mismatch` when `worktree_root` changes mid-lifecycle.

## Location
akrogon command `src/pull.ts`, `src/install.ts`, `src/next.ts` `ensureWorktree`; `README.md`; `skills/chart-issues/assets/shapes.md`.

## Reproduction
Reported by an external audit at commit 2932b4e from reading the code and README.

## Expected behavior
Configured values are honoured everywhere they apply, every configured harness gets the skills, and the README lists every verb.

## Urgency
Low individually. A pi slot without skills would fail every pass. Workaround: link the skills by hand.

## Source: Tamdoma/akrogon#11

# Failed-leaf notification fires on every sweep with no dedup

Source: Tamdoma/akrogon#11
URL: https://github.com/Tamdoma/akrogon/issues/11

Unverified intake.

## Observation
`dispatchLeaf` calls `herdr notification show` for every `failed` leaf on every `next` invocation with no dedup. Three sweeps produce three notifications, and every hook event re-notifies forever.

## Location
akrogon command, `src/next.ts` `dispatchLeaf`.

## Reproduction
Reported by an external audit at commit 2932b4e: leave one leaf in `failed`, run `akrogon next --all` three times.

## Expected behavior
One notification per failure.

## Urgency
Notification spam while any leaf is failed. Workaround: move the failed leaf out by hand.

## Source: Tamdoma/akrogon#12

# check-issue peer questions can deadlock both reviewers in check.review

Source: Tamdoma/akrogon#12
URL: https://github.com/Tamdoma/akrogon/issues/12

Unverified intake.

## Observation
`check-issue` permits the necessary peer question flow (wait for idle, prompt, `herdr agent wait` without timeout) during `check.review`, which is a two-slot phase. If A and B both decide to ask the peer, each waits for the other to go idle: permanent mutual wait with no timeout and no recovery. `plan-issue` restricts peer questions to outside blind positions; `check-issue` has no equivalent guard.

## Location
`skills/check-issue/SKILL.md`, peer question section.

## Reproduction
Reported by an external audit at commit 2932b4e from reading the skills. Not observed live.

## Expected behavior
Two concurrent reviewers cannot deadlock on each other.

## Urgency
Rare but unrecoverable without the operator. Workaround: answer one of the panes by hand.

## Source: Tamdoma/akrogon#13

# Epic issues broadcast completion per issue before sources close; discord-send drops later chunks after a failure

Source: Tamdoma/akrogon#13
URL: https://github.com/Tamdoma/akrogon/issues/13

Unverified intake.

## Observation
`completeOwner` prints `issue complete` when one issue's leaves are merged even while sibling issues in the same epic are still open, and `merge-issue` broadcasts on that line. An epic therefore produces one partial completion broadcast per issue, and the broadcast happens before `closeSources` runs (sources close only when the epic folder moves), so the message says completed while the GitHub intake is still open. Separately, `discord-send` in broadcast-issue throws out of its chunk loop on a chunk's second failure, so later chunks of the same message are never attempted and a long message can land truncated with no record.

## Location
`src/phase.ts` `completeOwner`; `skills/merge-issue/SKILL.md`; `skills/broadcast-issue/scripts/discord-send.ts` `sendWithRetry`.

## Reproduction
Reported by an external audit at commit 2932b4e from reading the code.

## Expected behavior
Not provided.

## Urgency
Misleading broadcasts for epics; possible truncated Discord messages. Workaround: none reported.

## Source: Tamdoma/akrogon#14

# Hygiene: dead state fields, silent next paths, deep tree locking, unguarded herdr stdout parse, closed folder name reuse

Source: Tamdoma/akrogon#14
URL: https://github.com/Tamdoma/akrogon/issues/14

Unverified intake.

## Observation
Hygiene findings from an external audit at commit 2932b4e, grouped:
- `state.slot` is written by `dispatchSlot` and never read; `priority` is schema-required, written, never read.
- `akrogon next` inside a herdr pane that owns no leaf exits 0 silently, and `akrogon next <path-to-a-file>` crashes with a raw `ENOTDIR`.
- `logMove` runs after the state commit, so a failure there (herdr down, removed worktree) makes `phase` exit nonzero after printing `moved <phase>`.
- `status <slug>`, `phase <slug>` and `next <slug>` report `Missing leaf` for a parked leaf without saying it may be parked.
- Leaf trees deeper than `open/<epic>/<issue>/<leaf>` make `withLeafLocks` lock the wrong ancestors and `completeOwner` rename a middle container; a `state.yaml` directly under `issues/open/` self-deadlocks on `issues/.lock`. Nothing validates depth at handoff.
- `recoverMerge` runs `git fetch` inside the repo lock with no timeout, so a hung remote stalls all dispatch for that repo.
- `herdr()` in `src/shell.ts` parses stdout with an unguarded `JSON.parse`; non-JSON stdout on exit 0 surfaces as `SyntaxError` and loses the real output.
- `completeOwner` throws `Completion destination exists` when a new issue reuses a closed issue's folder name, and `shapes.md` checks only leaf slug uniqueness, not issue folder reuse.

## Location
akrogon command `src/next.ts`, `src/phase.ts`, `src/state.ts`, `src/shell.ts`; `skills/chart-issues/assets/shapes.md`.

## Reproduction
Reported from code reading and temporary tests by the audit; none observed live.

## Expected behavior
Not provided.

## Urgency
Low. Each is an edge case or a confusing message. No workaround needed today.

## Source: operator 2026-09-11
use slot B, drain all issues and consolidate them

Q6 direction: "Whatever keeps the whole thing not complicated. That's the whole goal. No complication, no building new machinery unless absolutely necessary and before you ask me."

Q12: "Just make sure that in the future if they're not used or consumed anywhere, delete them. We want to keep everything simple and moving Without adding new machinery and potential failure points."

Q13: "look at the framework Ripple that is a sibling to this one. This one is being used as the main repo that the consumer developers use to build their own projects. So there needs to be a root file acrogon.yaml That points to the actual repo of the framework when the issues are being sent to GitHub."

## Agent findings
See slots/map-merged.md for the A/B merged verification with file:line evidence, slots/map-rebuttal-B.md for B's rebuttal, and forks/ for the settled answers. Summary: all ten reports confirmed in substance. Refuted subclaims: hook-event JSON does not affect `next --all`; stale tab/worktree fields do not inflate capacity; missing-seat crash unreachable without hand-edited state; the shapes.md template is consistent; pi reads `~/.agents/skills` so no pi link was needed; per-issue `issue complete` is intentional. B reproduced #5, #6, #7, #8, #9 (null session), #11 and #14b in temporary repos.
