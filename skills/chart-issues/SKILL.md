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

## Open

In the first reply, name the operator-supplied B pane, then the C pane when given, or say single slot; C is named only with B; read `akrogon config` and use its registered repo root for chart and handoff writes, resolving worktrees through their shared Git common directory rather than their inert issues copy. An unregistered repo can be charted locally, but handoff requires a registered destination; registration and initialization are outside this door.

When the operator asks for B, optionally C, without naming panes and the door's own environment has `HERDR_ENV=1`, the door creates the peer panes at open, asking once for each created peer's harness kind and arguments: `herdr pane split <A pane> --direction right --ratio 0.65 --cwd <root> --no-focus` for B, then only when C is asked for `herdr pane split <B pane> --direction down --ratio 0.5 --cwd <root> --no-focus`, reading each new pane ID from `.result.pane.pane_id`, then `herdr agent start <name> --kind <kind> --pane <id> -- <args>` per peer, addressing each peer by pane ID. Supplied panes are used as given and never moved or resized, the door moves no pane it did not create, and the requested sizes (A 65% wide, B and C sharing the right 35%) hold only when A's pane fills its tab; otherwise only A's area is split. Outside herdr the door says so and continues single slot or with supplied panes.

Run `akrogon pull` at open: report an unregistered or non-GitHub repo and continue charting, while any other failed refresh blocks a drain relying on that refresh rather than permitting stale mirrored intake; independent operator notes can continue.

Read the configured `grounding.index` top file, relevant linked areas and `learnings/LESSONS.md` as resources, report absent resources as gaps, and offer a lesson prune at open; reusable findings get one mechanism/date/history-path line in LESSONS.md and a case/evidence/learning file at `learnings/history/<date>-<slug>.md`, with historical lessons treated as observations rather than rules.

Import operator notes, and mirrored `issues/seeds/*.md` and legacy `issues/open/<slug>.md` only when the door opens without an operator note or the note asks for them, using the provenance in shapes: skip exact GitHub identities already in open/closed leaf `sources` or any chart intake, and legacy source paths already imported, preserving original reports and copying imported text verbatim separately from agent findings and scope.

At open, name each skipped GitHub identity that is still open on GitHub and offer `akrogon close <owner/repo#n> --by <text>` for it. During the pass, run that command for any identity the chart records as delivered or duplicate, passing what delivered it: the delivering leaf slug and commit, or the other identity. A confirmed full match with no other owner whose work is undelivered is exempt and stays open as `sources` until its completion owner delivers.

## Drain

Show a proportional territory map before grilling, including material forks, practitioner questions and pitfalls over the work's lifetime, what each option could break or invite later and not only now, grounded in inspected surfaces; when peers are named, A and each named peer map independently before A merges with attribution, using the blind file exchange in questions; waits on a peer follow the peer-wait script rule in questions.

A round takes one fork, the next answerable fork first, preferring the one whose answer reshapes the most remaining forks; a destination with one fork costs one round.

Propose the split by destination and speed of resolution before writing: independently checkable outcomes sharing a destination can be parallel leaves of one issue, independent issues run side by side, and only an actual dependency orders work, never file overlap or presentation preference.

Write one chart folder per destination. When every chart still holds an open fork, stop the seed drain for the operator to select one; when every fork in every chart is taken, hand off each chart in order without asking for a selection, asking the debate question once for the whole handoff. A direct single item whose map finds no open fork and no fog writes the same chart structure and proceeds to handoff immediately.

## Take

Research precedes every question and is redone when an answer reshapes one. Before a round, gather for each question the strongest source available in the tier order in questions: operator-placed material, a named practitioner, primary documentation or code, and the model's own knowledge only together with the searches that found nothing stronger. A question about this repository's own mechanism cites the inspected file and line and the documentation of the tool it calls; a question about anything outside it names an outside source or the recorded failure to find one. Research decides which questions are asked, which pitfalls the options are built to avoid and which option is recommended, never the answer, and a recommendation that contradicts a practitioner source shows the contradiction in the question.

With named peers, A owns interviewing and recording, sends only intake, current Question and carries, related fork paths, locks and verbatim operator corrections while developing its own view, then merges the completed independent rounds with agreeing-slot tags such as `(A)`, `(B,C)`, `(A,B,C)` and obtains one disagreement-only rebuttal from each peer before presenting the complete operator round with challenge check; each peer answers direct operator requests in its own pane and checks the final shape once before recording a late mechanism or contract change, with restatements exempt; waits on a peer follow the peer-wait script rule in questions.

Record operator answers and their reasons in fork files. After each answer, re-read Fog and move newly sharp material questions into their own fork files, removing only that material from Fog. Reshape the remaining forks and update CHART.md's ordered Open forks list before selecting and researching the next fork; handoff becomes ready only when no material question or fog requires the implementer to guess, with small optional prototypes explicitly chosen as measurements whose scratch code is discarded.

Every external operation a brief names, whether API method and path, CLI command or launch flag, gets one real call run with the identity the leaf will use before handoff, recorded in the fork with the command, inputs, identity reference without secret values, version, date, observed result, cleanup result and limits stating what the call does not prove, linked from the leaf's `proofs` records in `readiness.yaml`. Writes use the smallest reversible call on a throwaway target with checked cleanup. A provider dry-run or validate call counts only for the property the provider documents it proves, run with the real identity and target. Declining a required probe holds the handoff; when no safe sufficient probe exists the handoff is held and scope is not narrowed. There is no waiver.

As soon as a genuinely human-only prerequisite appears, show it under Pitfalls avoided as the step that removes its trap, with its owner, exact action and pending status until done, and record completion before opening a leaf; the distinct operator choice `hand_built` cannot replace completing known prerequisites. Needs are not such a prerequisite but are anticipated, never discovered by a blocked seat: after the forks settle and before the door's proof calls, the door shows one sheet listing every need across the proposed leaves, each with purpose, consuming leaves, exact permissions and resources, official source and date checked, destination (keys and values to the declared holder's env, files to their paths, approvals to authorization records) and what done looks like; the operator completes the sheet at their own pace, with asynchronous approvals waited for before the affected proofs; the door checks presence on each draft `readiness.yaml` and runs the proofs, and a failed proof yields a specific repair step; handoff stores the steps in `inputs[].steps`, so `akrogon status` prints a still-missing need and `akrogon next` refuses dispatch. The operator creates every missing outside-account key in one batch before handoff, from the door's list; a leaf that creates something with its own key stores that key itself, declared up front in `produces`, and dependents wait on it through `blocked-by`.

Each leaf's `grants` records one scoped live-change grant during charting, before the first mutating proof and confirmed at handoff review: approval provenance; the verified principal and account with credential name and holding repo, never the value; targets by name or ID; leaf-created fixtures by account, purpose, ownership marker, naming rule and count, with created IDs linked to the leaf before change or deletion; operations including transitive helpers, checks and cleanup; explicit destructive, public, billing, DNS and retention effects; repeat and recovery bounds; the stop line for what stays human; and lifetime. A different identity or account, a target outside the set, a new or different mutation, larger effects or expiry needs new approval.

Proof fixtures are disposable by default. Before creation the contract names the cleanup sequence covering transitive resources, contents and config, the identity for each step (the creating identity by default, another only when declared and proven before handoff) and the authenticated absence read-back with visibility shown first; the door proves a small create/use/delete cycle with the declared identities at charting. Each pass records created IDs under the grant and runs cleanup on success and failure; a leftover disposable resource is a blocker recorded with IDs, error, owner and next step. A fixture stays after its proof only by agreement before creation, naming purpose, resources, an accepting owner, removal date, cost and exposure, cleanup identity and route, and why the proof needs it alive; a cleanup failure never becomes retention afterward, and retention never satisfies a deletion criterion.

A producer's contract names its save operation: entry point, inspected revision, non-secret arguments, key name, the holding repo's real file and the private value source. Saving happens inside the producer process or in a narrow save subprocess receiving the value privately, never returned to the agent to build a command. At charting the door proves on disposable data that only the named entry changes, other entries are preserved and nothing prints, inspects the real target's effective harness controls and records why the result transfers, and proves real revocation on a disposable provider-issued key; the operator's approval of that recorded, proven operation is the explicit permission. A control that denies the operation is reconciled at its source and re-proved; tool edits, shell redirects and dumping stay refused.

## Handoff

Prepare the complete contracts using shapes and standing design, and present one attended handoff review with tree, scope, registered repo, relevant operator choices, each leaf's recorded live-change grant confirmed and the implementation debate recommendation: `debate` defaults to no and is asked once at the door, very small issues skip the question and use no, and naming a charting peer does not set this field; recognize concrete handoff authorization already supplied in the session instead of asking again.

When peers are named, leaf writing is a mandatory exchange after approval and before any handoff write: A drafts every brief and design to the scratchpad, each named peer reviews each draft as an implementer and returns disagreements with evidence, A merges the consensus, marking changed lines with agreeing-slot tags such as `(A)`, `(B,C)`, `(A,B,C)` in the draft and carrying any held disagreement into the leaf design, and only the merged contracts reach `issues/open/`.

Check destinations at destination selection and again right before the handoff review, one check when both coincide and the opening pull counting only when it coincides with a checkpoint: checked repos are the source repo plus each selected registered destination, deduplicated within a checkpoint, and the source is never exempt, including when it is also the only destination. At each checkpoint run plain `akrogon pull` with cwd at each checked repo's registered root from `akrogon config` `repos`; report an unregistered or non-GitHub destination and hold the handoff to that destination only, while any other failed refresh likewise holds only that destination and other destinations continue. Then compare each checked destination's `issues/seeds/*.md` against the chart's scoped work, show candidate matches to the operator, and act only on operator confirmation; checking never imports a destination's unrelated seeds.

Audit the proposed contracts as an implementer and the Take operation-proof rule, and run the preflight in shapes before writing, refusing collisions by naming the conflicting destination and missing dependencies before any handoff write.

Before any handoff write, run this presence check verbatim per draft leaf folder from the akrogon root resolved by `readlink -f $(command -v akrogon)`, printing names only, never values:

```bash
bun -e "import {readGlobal} from './src/config.ts'; import {readReadiness, gaps} from './src/readiness.ts'; console.log(JSON.stringify(gaps(readGlobal(), readReadiness('<draft folder>')!)))"
```

`akrogon status` cannot see drafts without `state.yaml`, so this is the pre-handoff presence check; after valid writes `akrogon status` validates the emitted files.

After valid handoff append `Handed off <YYYY-MM-DD>` on its own line to CHART.md, retaining the chart and source inputs in place; command dispatch remains the authority, so finish without running `akrogon next` or a chart phase transition. The markers are `Handed off <YYYY-MM-DD>`, `Closed <YYYY-MM-DD>`, and `Held <YYYY-MM-DD>`, each beginning its own line, with the last marker in the file authoritative.

## Printed footer

End each door pass with the actual result and reason no automatic pass follows, printed rather than saved:

```text
Last operation: <what this pass wrote or observed>
Next: none <awaiting operator answer, chart selection, dispatch, or named blocker>
```

The footer is printed only when the turn ends, and never while a prompted peer's turn is open.
