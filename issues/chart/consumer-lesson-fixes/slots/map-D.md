# Opening map, slot D

Probes ran in a temp repo on git 2.56.1. Framework read at HEAD 84fd038548. The reports cite line numbers from 5de547004a and all have moved, so done records should cite history file names, not lines.

Real dependencies between the three: none. No issue consumes another's output. #143 changes Transfer, and a checkable lesson never transfers, so it cannot change how #141 or #142 are judged.

## #141 stash in worker worktrees

### 1. Reproduces: yes
Two `git worktree add --detach` worktrees. `git stash` in w1, then `git stash list` and `git stash pop` in w2: w2 saw and applied w1's edit. Reading: only implement-issue SKILL.md "Shared context refresh" mentions stashing, for A's refresh. brief-template.md and worker-protocol.md say nothing to workers. No `src/` code creates worker worktrees. A does it by following worker-protocol "Launch and return".

### 2. Forks
F141-1. What stops it?
- O1 (pick) One do-not line in brief-template section 5, so every sub-brief carries it with its reason and the replacement (a WIP commit on the detached HEAD). Small, holds in every harness. It is prose, so the lesson stays.
- O2 Each worker gets `git clone --local` instead of a worktree. Probe: the clone's stash is invisible to the main repo, and `git fetch <clone> <sha>` plus cherry-pick works. Costs: loses `git worktree remove`'s dirty-tree refusal (removal becomes a directory delete), loses repo-local git config (identity, hooksPath), changes resume paths, and `src/reconcile.ts` and `src/evidence.ts` read `git worktree list`. It also leaves leaf worktrees sharing `refs/stash`, so the lesson still would not retire.
- O3 Create `refs/stash/blocked` so git cannot create `refs/stash`. Probe: `git stash` then fails with "Cannot save the current status", exit 1, edits untouched. It is the only option that refuses on every path. Costs: cannot be created when any stash already exists, blocks the operator's own stash in every consumer repo, breaks `git rebase --autostash` recovery in `src/sync.ts`, and the message names no cause.
- O4 Harness hook: banned by signpost 3a. A git alias cannot override `stash` (probed).
- Why O1: O2 and O3 are not "one change" under 2a, and neither covers every path cleanly. No code path reaches a worker's git call.

F141-2. Does the line also bind A and other leaf worktrees?
- O1 (pick) Yes. Widen the SKILL.md sentence from "before every refresh" to any time, because leaf worktrees share the same ref.
- O2 Workers only. Leaves the same failure open between two leaves' A seats.

### 3. Practitioner questions
- Q1 Why did the workers stash? If it was to test the base, the line must name the replacement or workers will stash anyway.
- Q2 Does anything else write `refs/stash` in a leaf or worker worktree? I found only `src/sync.ts` autostash, on the registered checkout.

### 4. Pitfalls
- P1 The completion claims the lesson is stopped. Removed by a done-criterion: the done record says the framework lesson (history `2026-10-16-stash-shared-across-worker-worktrees.md`) stays.
- P2 A later `/learn-issues` pass prints the same seed line again. The framework history file holds no report URL today. Framework step: append the #141 URL there.
- P3 The do-not line lands in worker-protocol only, which workers never read. Removed by placing it in the brief template.

### 5. Proof and retirement
Proof: review seat reads the changed text. No test, since no code changes. Retirement under today's Retire: no. Prose is none of the three exits.

## #142 wrapped Test-Change trailer

### 1. Reproduces: yes, and wider than reported
`git log --format='%(trailers:key=Test-Change,valueonly,unfold)'` on probe commits:
- Unindented wrap: prints nothing. Matches framework 106ac8ce, whose wrap lines start at column 0.
- Indented wrap: parses, joined into one value.
- Two valid trailers plus one unindented wrap line: prints nothing. One bad line hides every citation in the block.
- Trailer paragraph followed by a blank line and another paragraph (for example a harness-added `Co-Authored-By`): prints nothing. Same error, different cause, not in the report.
- Wrap plus a `Signed-off-by` line: parses, reason cut short, path still cited.
Both throw sites in `src/phase.ts` (`requireTestChangeCitations`, `requireFrozenCitations`) print the same text, which names no cause. `tests/phase.test.ts` has no wrap case.

### 2. Forks
F142-1. What does the fix do?
- O1 (pick) On the failure path only, read the raw commit messages in the range. For each missing path that has a `Test-Change: <path>` line git did not parse, the error names the commit and says the line sits outside a valid trailer block, with the rule: one line per trailer or indented continuation, last paragraph, nothing else in it. The line is never accepted. Covers every cause above with one check.
- O2 Static text added to the error listing the rules, no detection. Cheapest, but the seat still has to find which commit and why.
- O3 Akrogon parses wrapped trailers itself. Banned by the hard limit.
- O4 Prose only in brief-template section 8. Rejected by 2a, since a refusal already exists here.
- Risk in O1: someone later reads the raw-line scan as a second parser and lets it accept. Removed by a done-criterion: a wrapped trailer still blocks the move.

F142-2. One message or two?
- O1 (pick) One shared helper builds the error for both throw sites. They are identical today.
- O2 Fix only the site the report hit. Leaves the frozen-citation path misleading.

### 3. Practitioner questions
- Q1 Does the empty-commit count logic in `requireFrozenCitations` need the hint too? It fails through the same message, so the helper covers it.
- Q2 Does the rule depend on git version? The test builds real commits, so it follows the installed git.

### 4. Pitfalls
- P1 A test that asserts the full sentence breaks on rewording. Removed by asserting only the commit id and path appear and the move is refused.
- P2 The hint fires for a path that was never cited. Removed by showing it only when a raw line for that path exists.

### 5. Proof and retirement
Proof: one red-first test in `tests/phase.test.ts`. A commit with an unindented wrapped trailer, the phase move refuses, and the error names that commit. A second case for the trailing-paragraph cause is cheap in the same fixture.
Retirement: partly. The guard is a reader that refuses loudly, and after the fix it names the real cause, so the wrap half of the lesson (history `2026-10-24-test-change-trailer-single-line.md`) can leave. That lesson line also says added files need citations. That half is plain knowledge, not this failure. The done record should say the framework decides whether the line retires whole or is trimmed.

## #143 learn-issues exit for consumer judgment lessons

### 1. Reproduces: yes, by reading
lesson-rule.md Transfer: "in the same repo" and "lives in another repo stays". learn-issues SKILL.md Sort, Transfer: "in this repo", and another repo's step "stays". Retire needs removal, loud refusal or a running guard. A standing line a model reads is none of them. The seven framework lessons exist (now lines 135, 137, 145, 159, 165, 195, 223), and none of their history files has an `Applied` or `Transferred` line. standing-design.md carries the one-right-answer line. The five lesson-rule.md copies are byte-identical.
Weak part: the two "contrary" lessons. The old line 72 ("recorded in the leaf log needs each item verbatim") does not read as contrary to the standing line. Old line 268 is arguable. The contradiction case rests on one arguable example.

### 2. Forks
F143-1. Which exit carries a covered lesson out?
- O1 (pick) Widen Transfer. The step may be an installed akrogon skill step that runs on this repo's leaf path and already states the rule. The pass then adds nothing to the step, removes the line and appends the existing `Transferred` history line. Operator approval of the diff stays. No new record kind.
- O2 A new `Covered` history line. Clearer wording, but a new record kind, against 5a.
- O3 Count a standing line as a Retire exit. Breaks M1a: prose would then retire checkable lessons, including #141's.
- O1 could invite lessons draining out on a loose match. Removed by the rule requiring the pass to quote the installed line and name why the lesson's case is on a path where that step runs.

F143-2. How is the installed step cited?
- O1 (pick) Akrogon release commit, skill file and the line's opening words. Stable across machines and releases.
- O2 `file:line` of the installed copy. It is a home-directory path and the line moves each release.

F143-3. What happens to a lesson a standing line contradicts?
- O1 (pick) The root pass proposes a rewrite of the line so it agrees, with the reason appended to its history file as a dated note, in the same operator-approved diff. A rewritten line that the standing line now fully carries leaves by F143-1. No new exit.
- O2 A new retire-with-reason exit. A new record kind, and a removal path that needs no stop.
- O3 Leave it out. The report's main ask (the seven lines) is still met, and the evidence for this class is thin. Acceptable fallback if O1's wording grows.

F143-4. The report's "each kept add-or-tighten lesson names its one-right-answer source in its history file".
- O1 (pick) Leave out. It writes into every kept lesson's history, comes from a framework chart signpost, and is not needed for the seven lines to leave. Record it as framework work.
- O2 Add it to Sort. Widens the pass well past the failure.

F143-5. Which files change?
- O1 (pick) lesson-rule.md Transfer in all five copies, and learn-issues SKILL.md Sort and Apply (Apply says "add the lesson as one instruction at that step", which the covered case must skip).

### 3. Practitioner questions
- Q1 Does anything check the five copies stay identical? If not, a done-criterion must.
- Q2 Does the widened Transfer also cover akrogon's own lessons that a standing line already carries? It should, with the same "adds nothing" clause.
- Q3 Who judges "carries its rule"? The pass's model, then the operator on the diff. No script.

### 4. Pitfalls
- P1 The five copies drift. Removed by a done-criterion: all five identical after the change.
- P2 The completion claims the seven lessons are gone. They leave only when the framework installs the release, runs `/learn-issues` and the operator approves. Removed by the done record naming that as framework work (Tamdoma/tamdoma-framework#650).
- P3 A lesson transfers out, then the standing line is reworded or dropped in a later release, and the rule is lost. Removed by F143-2's citation: the history file names the release and words, so the lesson can be restored.

### 5. Proof and retirement
Proof: review seat reads the new text against the seven lessons and confirms each now has a path out, and that #141's and #142's lessons still do not transfer. No run. Retirement: #143 cites no lesson of its own. The seven can leave by Transfer after the framework's own pass.
