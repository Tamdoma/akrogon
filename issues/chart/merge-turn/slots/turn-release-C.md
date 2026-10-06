# Turn release: slot C round

Slot C, blind. Written 2026-10-05. Not read: `map-merged.md`, A's files, slot B's files for this fork. Read: the Taken sections of `forks/merge-order.md` and `forks/issues-only.md`, the Question and Carries of `forks/turn-release.md`, the binding shape `slots/merge-order-1d-merged.md`, and the code cited below.

You decided that one leaf at a time holds the merge turn and carries the waiting leaves in one batch. Waiting leaves sit unprompted. That leaves three gaps. Nothing in the code today tells the next leaf "it is your turn now". A holder that hangs would block every merge in the repo. A leaf that comes back from a fix needs a place in the line. This round settles all three.

### 1 · When the turn becomes free, what prompts the next holder?

Today a seat is prompted in only two ways. Its own pane goes idle, which runs a pass for that one leaf, and a leaf that just merged wakes the leaves listed as blocked by it (`src/next.ts:836-842`, `:681-692`). A waiting leaf's pane is already idle and it is not blocked by the holder, so neither way reaches it. The holder can leave `merge` in five ways: to `merged`, to `check.fix`, to `failed` by its seat, to `failed` because its prompt could not be delivered (`src/next.ts:459-482`), or by your own `akrogon phase` command. Your own command does a move and stops. It prompts nobody (`src/phase.ts:330-334`).

Research: better-than-training · Kubernetes API conventions (https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md, read 2026-10-05) · the system is "level-based rather than edge-based. This enables robust behavior in the presence of missed intermediate state changes". In plain words: look at what is true now and fix it, instead of reacting to each event and hoping none was missed · It replaced a list of five wake-up hooks with one rule, option 1a.

- **1a (recommended)** One rule in one place: every `akrogon next` pass and every `akrogon phase` move ends by asking "who should hold this repo's turn right now, and has that seat been prompted?" If not, it prompts it. The answer comes from `state.yaml` each time, as the turn already does. It wins because it does not matter how the last holder left. Any path, including one added next year, ends in a pass or a move, and both do the same thing. Prompting twice cannot happen, because a prompted or busy seat is already skipped (`src/next.ts:483-492`). Cost: `akrogon phase` gains a prompt step it does not have today, so a move takes a little longer and can report a prompt failure after the move is saved.
- **1b** Add a wake to each leaving path: after `merged`, after `check.fix`, after each kind of `failed`, after a dissolved batch. Cost: five places to keep right, and a path nobody listed leaves the line stuck with no error.
- **1c** Build nothing. You run `akrogon next --all` when you see leaves waiting. Cost: merging stops whenever you are away, which is the wait this chart is meant to remove.

Pitfalls avoided: When a prompt to the new holder cannot be delivered three times, that leaf goes to `failed` inside the same pass (`src/next.ts:459-465`). The rule in 1a runs again in that pass until one prompt is delivered or nobody waits, so one dead seat does not stop the line. A failed leaf is skipped by dispatch (`src/next.ts:600`), so it can never be picked as holder. After a red batch the holder is still in `merge` and its seat is still working, so no wake is needed there. The command's output tells that seat to continue alone. Done-criteria for the leaf: with two leaves in `merge`, moving the holder out by each of the five paths ends with the other leaf's seat B prompted, with no manual `akrogon next`. A second pass right after prompts nobody.

### 2 · What happens when the holder hangs or leaves in the middle of a batch?

Two different cases hide in this question.

The holder leaves `merge` while its batch is open. The carried leaves were rebased onto each other for the batch, so their branches no longer match what their reviews saw. If the push never happened, they must be put back. If the push did happen, their code is already on main and they must not be put back.

The holder's seat stays busy forever. You ruled on 2026-09-18 that akrogon builds no clock, timer or watchdog, and that a silent hang stays invisible (`issues/chart/seat-stall-detection/CHART.md`, Off route). Before the turn, a hung seat cost one leaf. Now it blocks every merge in that repo. A seat that died is not this case. It already ends in `failed` when its prompt cannot be delivered.

Research: practitioner · GitLab merge trains (https://docs.gitlab.com/ci/pipelines/merge_trains/, read 2026-10-05) and bors-ng reference (https://bors.tech/documentation/, read 2026-10-05) · both use a time limit. GitLab drops a stuck merge with the note "The merge did not complete in time", and bors has `timeout_sec`, "Number of seconds from when a merge commit is created to when its statuses must pass" · It showed that the usual fix is a clock, which your lock forbids. So the recommended option makes the hang visible on real events and makes recovery one command.

- **2a (recommended)** The command cleans up, and you stay the one who decides a seat is hung. Part one: the rule from question 1 also checks the batch record. If it finds a batch whose holder is no longer in `merge`, it fetches and looks at whether the tested top commit is on main. Not on main: every carried leaf is restored to its saved base and head, with no solo mark, and the next holder builds a fresh batch. On main: nothing is restored, and each carried leaf is moved to `merged` when its turn comes, by the existing "already on the remote" test (`skills/merge-issue/SKILL.md:49`). Part two: each time a leaf enters `merge` behind a holder, the command shows a notice naming the holder and how many leaves wait. `akrogon status` shows the same. If you judge the holder hung, you run `akrogon phase <slug> failed --reason "..."`. Part one and question 1 then do the rest. It wins because no state is left for a person to repair, and no clock is added. Cost: a silent hang still blocks the repo's merges until you look. That is your 2026-09-18 decision, and its cost is now larger.
- **2b** Give the check run a time limit and fail the holder when it passes. This is what other tools do. Cost: it is a clock, so it needs you to reopen the 2026-09-18 lock. A limit set too low would fail every holder in turn on a slow day.
- **2c** Leave cleanup to the seats. The next holder's seat restores the leftover branches by hand. Cost: a seat working in other leaves' worktrees with no record to check against, which the batch shape moved into the command for that reason.

Pitfalls avoided: Restoring leaves whose code already landed would make them look unmerged and send them through checks again. The "is the tested top on main" test in 2a removes that. A holder that failed after its push has its code on main but sits in `failed`, and `failed` cannot go straight to `merged` (`src/routing.ts:37-50`). The failure notice must say so, and your step is to move it back to `merge`, where the same test finishes it without a run. The notice in 2a fires on a move, so it is an event and not a timer. Done-criteria: failing the holder during a batch run leaves every carried branch at its saved head and gets the next leaf prompted. Failing the holder after the push restores nothing and reruns nothing.

### 3 · Where does a leaf rejoin the line when it comes back to `merge`?

A leaf can leave `merge` and come back. After a red solo run it goes to `check.fix`, then review, then `merge` again (`src/routing.ts:32-35`). You can also move a `failed` leaf back to `merge` (`src/routing.ts:37-50`). The line is ordered by a stamp written when a leaf moves into `merge` (binding shape, step 1).

Research: practitioner · GitLab merge trains (https://docs.gitlab.com/ci/pipelines/merge_trains/, read 2026-10-05) · "If a merge train pipeline fails, the merge request is not merged. GitLab removes that merge request from the merge train", and "You can add the merge request to a merge train again later". A failed change loses its place and joins again as a new entry · It confirmed 3a as the normal behaviour and found no tool that keeps a place for a change that is away being fixed.

- **3a (recommended)** A new stamp on every move into `merge`, so a returning leaf joins at the back. It wins because it is the rule already written, with nothing extra to store. The place also matters little now. Every leaf waiting when a turn starts is carried in the same batch, so the back of the line costs at most one run. Cost: a leaf that waited, went red and was fixed can land one batch later than a leaf that arrived after it.
- **3b** Keep the first stamp, so the returning leaf gets its old place and usually becomes the holder at once. Cost: a second stored field and a rule for when it resets. The leaf that just failed gets the top of the next batch. If it fails again, everyone it carries pays for it.

Pitfalls avoided: A leaf marked solo after a red batch loses that mark when it leaves `merge` (binding shape, step 8), so under 3a it comes back as a normal member. Its fix was reviewed again in between, so that is safe. A `failed` holder whose code already landed also rejoins at the back under 3a. It lands nothing new and is moved to `merged` without a run when its turn comes, but leaves blocked by it start up to one batch later. Done-criterion: a leaf that returns to `merge` while two others wait is listed third by `akrogon status`.

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check

- The strongest objection is to 2a. Every merge queue I read uses a time limit, because a hung holder blocks everyone. 2a keeps your no-clock rule and accepts that block until you act. If merges often run while you are away, 2b is the honest answer, and it means reopening the lock.
- 1a puts a prompt step inside `akrogon phase`. An implementer may prefer to keep that command to moves only and rely on the seat's pane going idle to trigger a pass. That works for moves made by seats. It does not work for a move you make from your own shell, where no pane goes idle. That one path is why 1a covers both commands.
- 2a part one needs a fetch to know whether the tested top is on main. A failed fetch must stop the cleanup with an error and restore nothing. Guessing "not on main" would undo landed work.
- The notice in 2a only fires when another leaf joins the line. A hung holder with nobody behind it shows no notice. Nobody is blocked in that case, so nothing is lost.
- 3a and 3b differ less than they look. With batching, the place decides who is on top and whose seat does the work, and rarely who lands first.
- Peer disagreements: none recorded. Slot C wrote this blind.
