# Opening map, slot C

Probes below ran in temp repos this session. Nothing was written in the akrogon or framework repos. Notes that cut across all three: the framework checkout has moved since the intake (now 84fd038), so cited LESSONS.md line numbers have drifted, but every cited lesson is still active. `lesson-rule.md` has six identical copies (`skills/lesson-rule.md` plus five skill folders), not five.

## #141 `git stash` in worker worktrees

### Reproduces: yes
Temp repo, two detached worktrees w1 and w2. Stash pushed in w2, then `stash pop` in w1 applied w2's edit to w1's files. `refs/stash` sits in the common git dir. Also probed: a config alias cannot shadow the builtin `stash` (builtin wins), and per-worktree config has no stash-ref key (only `stash.index`, `stash.show*`). A separate clone has its own empty stash. No `src/` code creates `<slug>-u<N>` worktrees: `createSparseWorktree` in `src/next.ts` makes the leaf worktree, `src/reconcile.ts` only cleans the store up. Workers and their worktrees are created by seat A following `worker-protocol.md` Launch and return, so no akrogon code runs a worker's git.

### Forks
1. Where is the stop?
   - a. Prose only: ban all stash verbs in worker worktrees, name the WIP commit as the replacement, at the points a worker reads (see Pitfalls). Breaks nothing. Invites a repeat whenever a model does not recall it.
   - b. Prose plus A compares the full stash list at wave start and at each worker return, and refuses to cherry-pick that worker's commit if it changed. Catches foreign edits before they reach the lane, after any in-worker swap. Invites false refusals when A or the operator stashes anywhere in the repo mid-wave, since the ref is repo-wide.
   - c. A `reference-transaction` hook in the common hooks dir refusing `refs/stash` updates from `worktrees/<slug>-u<N>` git dirs. Probed: `stash push` and direct `update-ref` fail loudly before harm, the main checkout still stashes, and `rebase --autostash` is unaffected (it does not use `refs/stash`). But `stash apply` and the apply half of `pop` touch no ref, so a worker can still lift an entry made outside worker worktrees. No code path installs it, it can clash with a consumer's own hook or `core.hooksPath`, and `-c core.hooksPath=` bypasses it.
   - d. Removal: a separate local clone per worker instead of a worktree, so each has its own `refs/stash`. The mechanism is gone, but this is not one change: cherry-pick becomes fetch-from-clone, the sparse-checkout `issues/` exclusion, store cleanup, the clone's `origin`, setup cost and retained-worktree resume text all change.
   - Pick: a plus b. c is the only true point-of-use refusal and it still misses `apply`, with an unsolved install owner inside the hard limits. d pays protocol-wide cost for one banned command that WIP commits fully replace.
2. Ban scope: worker worktrees only (pick), or every linked worktree. Worker-only matches the case. A's refresh already never stashes under implement-issue SKILL.md Shared context refresh. The operator's main checkout stays theirs. If the scope widens later, b's false refusals grow with it.
3. Replacement the prose names: WIP commit on the detached HEAD, then reset back before the final commit (pick, and it is the history file's own fix), or a saved patch file. Risk: a leftover WIP commit gets returned as the chunk, removed by stating in the same prose that the returned commit is made after the reset.

### Practitioner questions
- Who stashes legitimately in the leaf lane or main checkout while a wave runs? That sets fork 1b's false-refusal rate.
- Standalone workers run in the current checkout, not a `-u<N>` worktree. In scope or not? They run one at a time, but the checkout may be a leaf worktree A also uses.
- Does any akrogon path need stash inside a worktree? `src/sync.ts` uses `rebase --autostash` on the registered checkout only, and the probe shows autostash never touches `refs/stash`.
- Proving a failure pre-existing on base is a known stash use. The named replacement has to cover it (a second worktree of base, per the framework's own 2026-09-12 lesson).

### Pitfalls and what removes each
- Prose placed only where A reads never reaches the worker, which gets the brief plus one reminder line. Removed by an option part: ban boilerplate in `brief-template.md` section 5 (Do-not), plus the check in `worker-protocol.md` Launch and return beside the existing `pkill` ban, which has the same shape.
- 1b comparing only the stash top sha misses push-then-pop inside one worker run. Removed by an option part: compare the full stash list including reflog positions.
- Hook drift or clobber under option c. Removed by not picking c. The door probe above is the evidence.
- Two siblings both touch the stash in one wave and 1b cannot name the culprit. Accepted: the refusal names the wave, the worktrees are retained, A inspects.

### Proof and retirement
Cheapest under 6a: the recorded charting probe for the mechanism, and the review seat reading the new text in both worker-read points. No paid launch to prove a model obeys prose. Retirement under today's Retire: no. 1b fails after the in-worker harm, and Retire says a failure after the harm is not a stop. Only d retires it. The completion record must say the framework stash lesson stays, now with a named replacement and an integration refusal.

## #142 Wrapped Test-Change trailer

### Reproduces: yes, with the shape corrected
On framework commit 106ac8ce, `%(trailers:key=Test-Change,valueonly,unfold)` prints nothing. Temp-repo probes: one-line trailer reads fine; a continuation line starting with a space reads fine (`unfold` joins it); a flush-left continuation makes git read nothing, and it also kills a second good trailer in the same block; a trailer outside the final paragraph, or with no blank line before it, also reads nothing; a bare `Test-Change: <path>` with no reason is read by git but dropped by `trailerValues` in `src/phase.ts`, which requires path plus reason. So the guard agrees with git. The real failure is that the refusal says "need a citation, add to the final trailer block" to a writer who believes they did. Writer instructions in five skill files (`plan-issue`, `implement-issue` SKILL.md and `brief-template.md`, `check-issue`, `merge-issue`) never state the one-line rule. The error text exists twice, in `requireTestChangeCitations` and `requireFrozenCitations`.

### Forks
1. What changes?
   - a. Error text states git's reading rule in both refusals: final paragraph after a blank line, each trailer one line (fork 3), path followed by source and reason. Small, and existing tests assert substrings (`final trailer block`, `empty commit`) that can stay.
   - b. Near-miss diagnosis: scan raw commit bodies in the range for `Test-Change: <missing path>` lines git did not accept, and name the commit and likely cause. Names the real cause per case. Costs per-path range plumbing in `requireFrozenCitations`, plus a second reader beside git's that must stay diagnosis-only and can misfire on quoted body text.
   - c. Writer-side rule: the skill files that tell seats to write the trailer state the same reading rule the checker uses. This is the standing-design rule that writer and checker share one rule definition.
   - d. Accept flush-left wraps with a custom parse. Rejected by the taken hard limit: never a second parser beside git's.
   - Pick: a plus c. The reader of the error is a model that can pick its cause from three listed ones. b spends plumbing to save it that step and creates a parser-shaped thing to maintain.
2. The bare-path case (citation with no reason): covered by the same new text (pick), or accepted as cited. Accepting it guts the reason requirement, which is the trailer's point.
3. Writer rule strictness: "one line each" (pick) versus teaching indented folding, which git accepts. One line is simpler and immune to editor auto-wrap; the checker still accepts folded input, so a stricter writer rule is the safe direction. The framework lesson's own title already says one line.

### Practitioner questions
- Is `Test-Change` the only trailer key read this way? Yes today: both guards share the two helpers. The fork should keep it that way rather than fixing one guard.
- Does anything in the path re-wrap commit text (amend, cherry-pick, editor cleanup modes)? Delegated commits are cherry-picked, which keeps the message, but a consumer editor config that hard-wraps at 72 columns would fight fork 3 whenever a human amends.
- History says long reasons happen (106ac8ce's reason is five lines of real content). Does the one-line rule need a stated home for the long version, such as keeping the trailer short and putting detail in the body above the trailer block?

### Pitfalls and what removes each
- The duplicated error text drifting apart when only one site changes. Removed by a done-criterion: both refusals carry the rule text, and the proof exercises one and reads the other (or the leaf extracts one shared builder, its call).
- New text dropping a phrase existing tests assert. Removed by a done-criterion naming the kept phrases.
- The completion claiming the lesson's second half (added-path citations under the frozen guard) changed. It does not. Removed by the 4a done record reading the history file's full claim.

### Proof and retirement
Cheapest: one added case on the existing citation fixture in `tests/phase.test.ts`: an edited test file cited only by a flush-left wrapped trailer is refused, stderr names the one-line rule, then a one-line trailer on an empty commit lets the move pass. Red before, green after, no new machinery. Retirement under today's Retire: arguable, my reading is yes. The reader already refused loudly at the point of use; the harmful effect was a blocked move with a wrong diagnosis, and the fix makes the refusal name the wrap. A stricter reading (the wrap is still writable) says no. The completion record should state the reading it took and leave the call to the framework pass under 4a.

## #143 Exit for consumer judgment lessons

### Reproduces: yes, by read-only sort (6a)
All seven cited history files still have active lines in the framework's current LESSONS.md and none carries `Applied` or `Transferred`. The model-choice standing line is in `skills/chart-issues/assets/standing-design.md` Standing design lines and is applied by plan-issue and check-issue on consumer leaves. Under current text (lesson-rule Transfer, learn-issues SKILL.md Sort) each of the seven sorts Stays, because the step lives in another repo and no Retire exit fits a model-read line. The contrary 2026-10-29 deterministic-floor line is also still active.

### Forks
1. Which exit?
   - a. Extend Transfer to installed akrogon steps: a judgment lesson may transfer when a named installed step runs on this repo's leaf path for its case and already states the rule. Nothing is added at the step. The consumer diff removes the line and appends `Transferred <date> to <installed file:line>, approved by <who>`, gated by the existing operator approval of that diff. Pick.
   - b. A new Retire exit for model-read standing lines. This calls prose a stop, lets any documented lesson retire as `Applied`, and reopens the loop signposts 2a rejected 2b over. Reject.
   - c. Stays plus a "covered by" note. No exit, fails the report's expected behaviour, the line keeps teaching beside its replacement. Reject.
   - Invites under a: transfers to any vaguely related installed text. Removed by forks 2 and 5.
2. Who judges "carries the rule", and to what bar? The sorting seat, per lesson, naming the installed line as evidence in its printed list, operator approval as the gate (pick). Bulk transfer on theme match loses specifics several of the seven carry (prefix regex, token-presence polarity, verbatim records) that the standing line does not state; partial coverage stays. This is a model judgment, which is what Transfer already is.
3. Contradicted lessons: the same pass may prepare a rewrite or removal in its uncommitted diff, with a dated history note naming the contradicting installed line, operator approval completing it (pick), or Stays plus a printed conflict for the operator to edit by hand later. The chart must judge whether the dated note stays inside 5a (a history append, reusing the Transfer shape) or counts as a new record kind. Caution: the deterministic-floor lesson may not actually be contradicted, since exact repeats have one right answer. Per-lesson reading under fork 2 decides.
4. Which text counts: the installed copy the seats actually read, recorded with a release or commit id in the `Transferred` line (pick), or akrogon main. Consumer seats never read akrogon main, and a consumer sorter may have no akrogon checkout. Cost: two machines on different installs can sort differently, which is already true of skills generally.
5. Eligible steps: only akrogon lifecycle steps and the standing design they invoke, which akrogon runs on every consumer leaf (pick), or any installed skill from any repo. The wider reading creates exits akrogon cannot keep true when a vendor edits their text. Current Transfer also says "review step": check-issue is one and covers the seven, but the fork should say plainly whether plan-issue (a writer step) counts, or the wording stays review-only.

### Practitioner questions
- How does a sorter running in a consumer repo locate the installed akrogon skills and their version? The running learn-issues copy sits beside them, but is there a release id to record in fork 4, or only the path and date?
- When a later akrogon release edits or removes the carrying line, who notices the transferred lesson is orphaned? Under 5a there is no registry, so the honest answer may be "nobody, accepted".
- Do other consumer repos hold such lessons? Not inspected per the intake. The rule text must name no framework file, or it fixes one repo by name.
- What happens to lessons whose other-repo step does not yet carry the rule? Stays and names the repo and step, as today. That path produced #143 itself and should keep working.

### Pitfalls and what removes each
- The six identical copies drifting. Removed by a done-criterion: all six byte-identical after the edit, plus Sort in `skills/learn-issues/SKILL.md` saying the same thing.
- Orphaned transfers after an akrogon edit. Only partly removed, by fork 4's recorded release and line. Full removal needs a registry the hard limits ban. Stated as the accepted cost of picking 1a.
- This exit becoming a back door for checkable lessons re-labelled as judgment. Removed by a done-criterion: "a checkable lesson never transfers" and the Sort order stay untouched.
- Rubber-stamp removals. Removed by reusing the existing Transfer shape: uncommitted diff, operator approval completes, a decline reverts.

### Proof and retirement
Under 6a, rule text is proven by reading, not a run: the review seat works the new text against the seven cited lessons, the two contrary ones, and the #141 stash lesson (which must still not transfer), and the completion record shows those sorts. No code test exists for this text, and none should be invented for wording. Retirement does not apply: the exit is Transfer, never `Applied`. The seven lines leave only in a later framework /learn-issues pass under Tamdoma/tamdoma-framework#650 (4a). This leaf's honest claim is that the exit now exists.

## Dependencies between the three

No real dependency, meaning no issue consumes another's output, and no order is forced. One interaction to record without acting on: if #143 fork 1a lands and #141 lands as prose in installed worker text, a later sorter may try to transfer the stash lesson into that text. It is barred while the stash lesson sorts Checkable, and #141's completion must not lean on #143 (signposts 1a). #142 is untouched by #143 either way, since its guard is code and its lesson is checkable.
