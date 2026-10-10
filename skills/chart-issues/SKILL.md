---
name: chart-issues
description: Turn operator notes or imported reports into charts of open forks, then hand settled work directly to leaf contracts in a registered repository. Operator-invoked only.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt. After compaction on an unfinished chart, resume from CHART.md and the selected fork's linked context.

# Chart issues

Dependency: the installed `akrogon` command. This is an attended door, not a lifecycle phase.

## Shared context

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Read [questions](assets/questions.md) before an operator round, [shapes](assets/shapes.md) before creating a chart or handing off, and [standing design](assets/standing-design.md) when preparing leaf designs.

Ask operator questions in printed chat text, never through a question tool. Decision rounds, including prerequisite and handoff choices, follow [questions](assets/questions.md) and include a reply key.

## Open

In the first reply, name the operator-supplied B pane, then the C pane when given, or say single slot; C is named only with B; read `akrogon config` and use its registered repo root for chart and handoff writes, resolving worktrees through their shared Git common directory rather than their inert issues copy. An unregistered repo can be charted locally, but handoff requires a registered destination; registration and initialization are outside this door.

When the operator asks for B, optionally C, without naming panes and the door's own environment has `HERDR_ENV=1`, the door creates the peer panes at open, asking once for each created peer's harness kind and arguments: `herdr pane split <A pane> --direction right --ratio 0.65 --cwd <root> --no-focus` for B, then only when C is asked for `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading each new pane ID from `.result.pane.pane_id`, then `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer, addressing each peer by pane ID. Supplied panes are used as given and never moved or resized, the door moves no pane it did not create, and the requested sizes (A 65% wide, B and C sharing the right 35%) hold only when A's pane fills its tab; otherwise only A's area is split. Outside herdr the door says so and continues single slot or with supplied panes.

Run `akrogon pull` at open: report an unregistered or non-GitHub repo and continue charting, while any other failed refresh blocks a drain relying on that refresh rather than permitting stale mirrored intake; independent operator notes can continue.

Read the configured `grounding.index` top file, relevant linked areas and `learnings/LESSONS.md` as resources and report absent resources as gaps. Reusable findings get one mechanism/date/history-path line in LESSONS.md and a case/evidence/learning file at `learnings/history/<date>-<slug>.md` ([lesson rule](../lesson-rule.md)), with historical lessons treated as observations rather than rules.

Import operator notes, and mirrored `issues/seeds/*.md` and legacy `issues/open/<slug>.md` only when the door opens without an operator note or the note asks for them, using the provenance in shapes: skip exact GitHub identities already in open/closed leaf `sources` or any chart intake, and legacy source paths already imported, preserving original reports and copying imported text verbatim separately from agent findings and scope.

At open, name each skipped GitHub identity that is still open on GitHub and offer `akrogon close <owner/repo#n> --by <text>` for it. During the pass, run that command for any identity the chart records as delivered or duplicate, passing what delivered it: the delivering leaf slug and commit, or the other identity. A confirmed full match with no other owner whose work is undelivered is exempt and stays open as `sources` until its completion owner delivers.

The seat record holds the open time, the time the door began its first pass on this chart, before the opening map, and one entry per seat holding pane, harness kind and session id as `herdr agent list` prints them (`pane_id`, `agent`, `agent_session.value`), kept with the door's temporary files while no chart folder exists and written to `<chart>/seats.yaml` when the chart folder is created, covering A and each named peer; neither folder creation nor a replacement session resets the open time. Each time the door re-reads `herdr agent list` for a peer exchange or a chart write and a seat's session id has changed, it appends a seat entry with the same seat letter. Outside herdr the record holds the open time and no session, and the usage table says `usage unmeasured`. The door asks the operator nothing new for this record.

## Drain

Show a proportional territory map before grilling, including material forks, practitioner questions and pitfalls over the work's lifetime, what each option could break or invite later and not only now, grounded in inspected surfaces; when peers are named, A and each named peer map independently before A merges with attribution, using the blind file exchange in questions; waits on a peer follow the peer-wait script rule in questions.

A round takes one fork, the next answerable fork first, preferring the one whose answer reshapes the most remaining forks; a destination with one fork costs one round.

Propose the split by destination and speed of resolution before writing: independently checkable outcomes sharing a destination can be parallel leaves of one issue, independent issues run side by side, and only an actual dependency orders work, never file overlap or presentation preference.

Write one chart folder per destination. When every chart still holds an open fork, stop the seed drain for the operator to select one; when every fork in every chart is taken, hand off each chart in order without asking for a selection, asking the debate question once for the whole handoff. A direct single item whose map finds no open fork and no fog writes the same chart structure and proceeds to the handoff review immediately, where the route is chosen.

## Take

Research precedes every question and is redone when an answer reshapes one. Before a round, gather for each question the strongest source available in the tier order in questions: operator-placed material, a named practitioner, primary documentation or code, and the model's own knowledge only together with the searches that found nothing stronger. A question about this repository's own mechanism cites the inspected file and line and the documentation of the tool it calls; a question about anything outside it names an outside source or the recorded failure to find one. Research decides which questions are asked, which pitfalls the options are built to avoid and which option is recommended, never the answer, and a recommendation that contradicts a practitioner source shows the contradiction in the question.

With named peers, A owns interviewing and recording, sends only intake, current Question and carries, related fork paths, locks and verbatim operator corrections while developing its own view, then merges the completed independent notes with agreeing-slot tags such as `(A)`, `(B,C)`, `(A,B,C)`, a merge tag citing only a line the peer wrote, and obtains one disagreement-only rebuttal from each peer; A alone then writes the formatted operator round and presents it with the rebuttals under the challenge check; each peer answers direct operator requests in its own pane and checks the final shape once before recording a late mechanism or contract change, with restatements exempt; waits on a peer follow the peer-wait script rule in questions.

Record operator answers and their reasons in fork files. After each answer, re-read Fog and move newly sharp material questions into their own fork files, removing only that material from Fog. Reshape the remaining forks and update CHART.md's ordered Open forks list before selecting and researching the next fork; handoff becomes ready only when no material question or fog requires the implementer to guess, with small optional prototypes explicitly chosen as measurements whose scratch code is discarded.

Every external operation a brief names, whether API method and path, CLI command or launch flag, gets one real call run with the identity the leaf will use before handoff, recorded in the fork with the command, inputs, identity reference without secret values, version, date, observed result, cleanup result and limits stating what the call does not prove, linked from the leaf's `proofs` records in `readiness.yaml`. Writes use the smallest reversible call on a throwaway target with checked cleanup. A provider dry-run or validate call counts only for the property the provider documents it proves, run with the real identity and target. Declining a required probe holds the handoff; when no safe sufficient probe exists the handoff is held and scope is not narrowed. There is no waiver.

As soon as a genuinely human-only prerequisite appears, show it under Pitfalls avoided as the step that removes its trap, with its owner, exact action and pending status until done, and record completion before opening a leaf or starting a direct attempt. Needs are not such a prerequisite but are anticipated, never discovered by a blocked seat: after the forks settle and before the door's proof calls, the door shows one sheet listing every need across the proposed leaves, each with purpose, consuming leaves, exact permissions and resources, official source and date checked, destination (keys and values to the declared holder's env, files to their paths, approvals to authorization records) and what done looks like; the operator completes the sheet at their own pace, with asynchronous approvals waited for before the affected proofs; the door checks presence on each draft `readiness.yaml` and runs the proofs, and a failed proof yields a specific repair step; handoff stores the steps in `inputs[].steps`, so `akrogon status` prints a still-missing need and `akrogon next` refuses dispatch. The operator creates every missing outside-account key in one batch before handoff, from the door's list; a leaf that creates something with its own key stores that key itself, declared up front in `produces`, and dependents wait on it through `blocked-by`.

Each leaf's `grants` records one scoped live-change grant during charting, before the first mutating proof and confirmed at handoff review: approval provenance; the verified principal and account with credential name and holding repo, never the value; targets by name or ID; leaf-created fixtures by account, purpose, ownership marker, naming rule and count, with created IDs linked to the leaf before change or deletion; operations including transitive helpers, checks and cleanup; explicit destructive, public, billing, DNS and retention effects; repeat and recovery bounds; the stop line for what stays human; and lifetime. A different identity or account, a target outside the set, a new or different mutation, larger effects or expiry needs new approval.

Proof fixtures are disposable by default. Before creation the contract names the cleanup sequence covering transitive resources, contents and config, the identity for each step (the creating identity by default, another only when declared and proven before handoff) and the authenticated absence read-back with visibility shown first; the door proves a small create/use/delete cycle with the declared identities at charting. Each pass records created IDs under the grant and runs cleanup on success and failure; a leftover disposable resource is a blocker recorded with IDs, error, owner and next step. A fixture stays after its proof only by agreement before creation, naming purpose, resources, an accepting owner, removal date, cost and exposure, cleanup identity and route, and why the proof needs it alive; a cleanup failure never becomes retention afterward, and retention never satisfies a deletion criterion.

A producer's contract names its save operation: entry point, inspected revision, non-secret arguments, key name, the holding repo's real file and the private value source. Saving happens inside the producer process or in a narrow save subprocess receiving the value privately, never returned to the agent to build a command. At charting the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints, inspects the real target's effective harness controls and records why the result transfers, and proves real revocation on a disposable provider-issued key; the operator's approval of that recorded, proven operation is the explicit permission. A control that denies the operation is reconciled at its source and re-proved; tool edits, shell redirects and dumping stay refused.

## Handoff

Prepare the complete contracts using shapes and standing design, and present one attended handoff review with tree, scope, registered repo, relevant operator choices, each leaf's recorded live-change grant confirmed, each leaf's effective seats and the implementation debate recommendation: `debate` defaults to no and is asked once at the door, very small issues skip the question and use no, and naming a charting peer does not set this field; the review also shows the route question or the one-line unavailable notice from `## Direct route`, and the combined route question replaces the separate debate question for that chart; the seat question is asked at this review only when the intake, map or a leaf design names model-sensitive work, defaults to writing no block, and an answer goes into a `slots:` front matter block (shape in shapes.md) in the operator's chosen owner index (`ISSUE.md` or `EPIC.md`) before any leaf `state.yaml`; recognize concrete handoff authorization already supplied in the session instead of asking again. Right before the handoff review the door runs `bun <skill-folder>/scripts/chart-usage.ts <chart-folder> [<until>]` with `<skill-folder>` resolved to the loaded chart-issues skill directory, shows the printed lines in the review, reports the outcome word and continues on `outcome partial`, a failed measurement never holding a handoff. The door also writes its own review line for each leaf whose done-criteria need a live run, as door prose outside that script output: the session count, how many run at once with rounds counted, an estimated elapsed time and the worst case if every session hits its timeout, labelled an estimate, the existing machinery each live criterion uses, the timeout basis named as the destination's session timeout by file and value, a recorded measured case replacing that basis, or `unknown` with its reason when no basis exists; the line is information only, it never times out a leaf and never waives a criterion, and the operator approves the contract or narrows scope. A done-criterion needing machinery absent on the destination's default branch is proposed as a prerequisite leaf that delivers it, proven by one known-good case passing and one deliberate break failing and listed in the product leaf's `blocked-by`, or the criterion is narrowed with the operator at this review.

When peers are named, leaf writing is a mandatory exchange after approval and before any handoff write: A drafts every brief and design to the scratchpad, each named peer reviews each draft as an implementer and returns disagreements with evidence, A corrects the scratchpad draft files, keeping one final scratchpad version per leaf, marking changed lines with agreeing-slot tags such as `(A)`, `(B,C)`, `(A,B,C)` and carrying any held disagreement into the leaf design, and the corrected files are transferred by name into `issues/open/`, state last and prerequisites before dependents, after the existing collision and preflight checks; no contract is written a second time.

Check destinations at destination selection and again right before the handoff review, one check when both coincide and the opening pull counting only when it coincides with a checkpoint: checked repos are the source repo plus each selected registered destination, deduplicated within a checkpoint, and the source is never exempt, including when it is also the only destination. At each checkpoint run plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config` `repos`; report an unregistered or non-GitHub destination and hold the handoff to that destination only, while any other failed refresh likewise holds only that destination and other destinations continue. Then compare each checked destination's `issues/seeds/*.md` against the chart's scoped work, show candidate matches to the operator, and act only on operator confirmation; checking never imports a destination's unrelated seeds.

Audit the proposed contracts as an implementer and the Take operation-proof rule, and run the preflight in shapes before writing, refusing collisions by naming the conflicting destination and missing dependencies before any handoff write; the shapes audit also refuses a leaf owning a lesson-traced complete guard without a retirement criterion naming that history path.

Before any handoff write, run this presence check verbatim per draft leaf folder from the akrogon root resolved by `readlink -f $(command -v akrogon)`, printing names only, never values:

```bash
bun -e "import {readGlobal} from './src/config.ts'; import {readReadiness, gaps} from './src/readiness.ts'; console.log(JSON.stringify(gaps(readGlobal(), readReadiness('<draft folder>')!)))"
```

`akrogon status` cannot see drafts without `state.yaml`, so this is the pre-handoff presence check; after valid writes `akrogon status` validates the emitted files.

On the direct route no leaf files or `state.yaml` are written, `Closed <YYYY-MM-DD>` follows a direct landing after cleanup, and `Held <YYYY-MM-DD>` follows abandon. After valid lifecycle handoff append `Handed off <YYYY-MM-DD>` on its own line to CHART.md, retaining the chart and source inputs in place; command dispatch remains the authority, so finish without running `akrogon next` or a chart phase transition. The markers are `Handed off <YYYY-MM-DD>`, `Closed <YYYY-MM-DD>`, and `Held <YYYY-MM-DD>`, each beginning its own line, with the last marker in the file authoritative. The door runs the usage script again when it appends `Handed off`, `Held` or `Closed`.

## Direct route

The direct route is a second ending for the handoff: the door implements one small settled chart itself in a worktree, B reviews, and the door lands it on the default branch without leaf files. It is offered only when the destination's `akrogon config` reports `direct` true (setting in docs/guide/setup.md). With `direct` absent or false the handoff review is unchanged except one line saying direct is unavailable because the repo has not opted in.

Direct is not offered, and the review names the refusal in one line and asks the lifecycle questions as today, when any of these holds:
- the draft needs `inputs`, `grants`, `produces` or `retained`;
- a done-criterion needs a live run or outside call during implementation (charting proofs do not count);
- more than one outcome or an unfinished dependency exists (door judgment);
- a human prerequisite is pending;
- B is not named.

When on and eligible, the review asks one combined route question with the door's recommendation and a reply key: lifecycle debate no, lifecycle debate yes, or direct. The door may recommend lifecycle for a risky small job. Explicit direct authorization already given in the session is the answer. The chosen route is recorded in CHART.md as the `Route:` line, and a later setting change does not alter an approved route. Selecting direct includes the door's push authority; push, source close and broadcast are coordination, not live calls under eligibility.

Protocol, using the shapes in shapes.md:
1. Attempt start: choose a slug, create worktree `<worktree_store>/<slug>` on branch `<slug>` from the destination's default branch, and write the `Direct attempt` section with the slug recorded.
2. Implement: the door itself runs `implement-issue direct chart=<chart-folder> worktree=<path>`, which writes `<chart>/direct/plan.md` and `<chart>/direct/report.md`.
3. B review: send the chart's B pane `check-issue direct slot=B chart=<chart-folder> worktree=<path> base=<sha> head=<sha> out=<chart>/slots/review-B-<n>.md`, with `n` = 1 for the initial review and the exact path named. The Fix/Nit bar and verdict rules are check-issue's.
4. Repair rounds per the bound below.
5. Landing, after B returns ready or nits on a committed head:
   1. fetch, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` in the worktree;
   2. conflict resolution sends B a focused re-check of the resolved range with the range-diff recorded, a clean rebase reruns checks only;
   3. `checks` then `merge_checks` from `akrogon config`;
   4. `bun <skill-folder>/scripts/direct-guards.ts <worktree> <repo-key> <chart-folder>` must exit 0, with `<skill-folder>` resolved as for chart-usage.ts, run only after the fetch and rebase above;
   5. `git push <remote> <sha>:refs/heads/<default_branch>` of the exact tested SHA, never force; a rejected push keeps the branch, and at most 2 push attempts are made, each with a fresh rebase, checks and B conflict re-check, then stop with the branch kept;
   6. per delivered source, after checking other owners' outstanding work, `akrogon close <id> --by "<chart> direct <sha>"`;
   7. broadcast-issue as sender when the repo configures broadcast, with the chart brief, pushed SHA and closed sources as context, and a failure does not reopen;
   8. `git worktree remove <path>` verified by `git worktree list`, then `git branch -D <slug>` verified by empty `git branch --list <slug>`;
   9. the landed SHA into the `Direct attempt` section, then `Closed <date>`.
   The root checkout is never reset, and a failed local update is reported.

Repair bound: one round is B `fix` (or a blocking landing-check failure), one door repair pass over all Fixes, and B's re-check of the repair diff. The bound is the repo's `fix_rounds` from `akrogon config`, with the count kept in `Direct attempt` so it survives session replacement. A passing last round lands. Exhaustion stops with the open Fixes listed, and the operator chooses one more round, lifecycle handoff, or abandon. Push attempts are not rounds.

Growth stop: stop coding and landing when a locked decision must change, a need eligibility excludes appears, a criterion cannot pass in scope after permitted repairs, or a second outcome appears. The door commits existing work as one partial-labelled commit so the tree is clean, keeps the worktree, updates `Direct attempt` (trigger, done, not done) and opens the trigger as a new fork. Continuations:
- lifecycle handoff: the leaf slug equals the branch so the command's worktree setup adopts it, the leaf starts at its normal planning phase, the planner decides what to keep, and lifecycle review covers the whole diff;
- abandon: branch and worktree removed, `Held <date>`.

No new direct attempt starts while a chart names a live direct branch.

## Printed footer

End each door pass with the actual result and reason no automatic pass follows, printed rather than saved:

```text
Last operation: <what this pass wrote or observed>
Next: none <awaiting operator answer, chart selection, dispatch, or named blocker>
```

The footer is printed only when the turn ends, and never while a prompted peer's turn is open.
