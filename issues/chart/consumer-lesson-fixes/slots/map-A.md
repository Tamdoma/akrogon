# Opening map, slot A

Probes ran free in a scratch repo (git 2.56.1, 2026-11-17), scratch deleted after.

## #141 stash in worker worktrees

Reproduces. Two detached worktrees of one repo: w1 stashes, w2 stashes and pops twice; w2's second pop applied w1's edit (`f=one`). No akrogon code creates worker worktrees: A runs `git worktree add --detach` by worker-protocol `## Launch and return` text; git has no stash hook.

Fork W1: how is the swap stopped?
- a (A's pick) Remove the shared ref: each worker gets its own clone, `git clone --shared --no-checkout <leaf worktree> <worktree_store>/<slug>-u<N>` then `git checkout --detach <leaf HEAD>`; A integrates by `git fetch <clone> HEAD` then `git cherry-pick FETCH_HEAD`. Probe: the clone's stash stayed its own, the leaf saw none, fetch plus cherry-pick landed the unit commit. Stops the swap in every harness, whatever a worker types. Cost: launch, integration, retained-worktree recovery and removal lines in worker-protocol and SKILL.md change wording; `--shared` clones depend on the source objects staying (the leaf worktree lives until after the last wave). Invites: a worker pushing from its clone (origin is the leaf path, not the remote, so a push lands only in the local repo).
- b Prose: workers never stash, they WIP-commit. Cheapest; lesson stays active under today's Retire.
- c A checks `refs/stash` before launch and at return and refuses integration when it moved. After the harm, so not a stop.
- d PATH shim refusing `git stash`. Fails signposts 3a (subagent env differs per harness) and is bypassable.

## #142 wrapped Test-Change trailer

Reproduces. A wrap whose continuation lines start without whitespace gives an empty `%(trailers:key=Test-Change,valueonly,unfold)`; indented continuation lines parse and unfold to one value. The refusal already exists; its message ("Add each line to the final trailer block") never names the wrap.

Fork T1: what changes?
- a (A's pick) The refusal names the cause: for each missing path whose `Test-Change: <path>` text appears in a branch commit body but not in git's parsed trailers, the error names that commit and says to keep the citation on one line or indent each continuation line. git stays the only reader of what counts.
- b akrogon parses wrapped lines itself. Forbidden (signposts hard limit).
- c Only skill prose about one-line trailers. Leaves the misleading message.
Proof: own test in the phase tests: a temp repo commit wrapped as in framework 106ac8ce is refused with the named commit and the fix; the same reason indented passes. Retire: the framework line's harm (misleading block) is stopped by a loud refusal naming the cause, so the framework can retire it (framework work).
Off route: requireFrozenCitations demanding citations for added fixture paths (history file's second point, not in the report).

## #143 consumer judgment lesson exit

Reproduces by reading: learn-issues SKILL.md Sort "A judgment lesson whose step lives in another repo stays", lesson-rule.md Transfer "lives in another repo stays". Five identical lesson-rule.md copies under skills/*/.

Fork L1: what exit does a consumer lesson get when an installed akrogon step carries its rule?
- a (A's pick) A new Sort outcome inside Stopped/Retire wording: "carried" — the lesson's rule is stated by an installed akrogon step reached on that repo's leaf path (cite installed file and section); the line leaves with `Carried <date> by <installed file:section> (<release>)` in history. Same for a lesson the installed line contradicts: rewritten to the narrow case or removed, reason in history. Operator approval as for Transfer.
- b Widen Transfer to cover installed akrogon steps. Muddles Transfer (which edits the step).
- c No change; framework copies the rule. Leaves the loop.
Fork L2: "each kept add-or-tighten lesson names its one-right-answer source" (report's Expected): in scope as a Sort instruction or handed to framework #650? A's pick: a one-sentence Sort instruction (rule text) — the source sits in the history file, read by the sorting model.
Proof: reading by the review seat against framework lines 146,148,156,172,178,214,243,72,268; copies kept identical by the existing test if one exists (check).

## Dependencies

None real. #141 and #143 may both touch skills/implement-issue/ (lesson-rule.md copy); overlap orders nothing.
