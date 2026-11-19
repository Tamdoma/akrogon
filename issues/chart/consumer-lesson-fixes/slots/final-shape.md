# Proposed final shape, all three forks (A's picks under autopilot, one batch)

Changes from the merged notes are marked [changed] with the slot whose rebuttal drove them.

## worker-stash (#141)

- Pick 1a prose, scope 2a.
- [changed, D] Two homes, no duplicate: brief-template.md section 5 (every worker sub-brief carries it) and implement-issue SKILL.md (A). No worker-protocol copy.
- Brief-template line, in substance: never run any `git stash` subcommand; every worktree of the repo shares one stash, so a pop can lift a sibling's edit. To set work aside, make a WIP commit; [changed, C, D] before returning, reset it away (`git reset --soft <start HEAD>`) and make the returned unit commit once on the start HEAD, so A's cherry-pick of that one commit carries all the work. To check behaviour on the base, use a second worktree of the base.
- SKILL.md: the Shared context refresh sentence "never stashing or discarding it" widens to: A never runs `git stash` in a leaf or worker worktree, at a refresh or any other time, since leaf worktrees of different leaves share the stash too.
- [changed, C] 1c (A's stash-list compare) is an add-on, not an alternative; rejected as an add-on too: it acts after the swap, false-refuses when anyone stashes elsewhere in the repo, and signposts 2a rejected a second mechanism for one failure. C dissent stands.
- Done record: the change is prose; the framework lesson `history/2026-10-16-stash-shared-across-worker-worktrees.md` stays active under today's Retire. Proof: the review seat reads both lines against the case.

## trailer-message (#142)

- Pick 1a (B, C, D now agree), Q2 one shared builder for both refusals.
- [changed, C, D] Refusal states one writer rule only: each `Test-Change: <path> <source and reason>` on one line; in the commit message's last paragraph; [D] that paragraph holds only trailer lines, because one other line hides every citation in it; a later empty commit may carry it. It does not advertise indented folding and does not claim a wrap happened.
- [changed, B, D] Writer sites unchanged: no copies of the rule in five skill files (no agreement test exists for copies; the existing writer lines do not misstate git's rule). C's writer-side edit rejected; C dissent stands.
- [changed, C] Proof: one red-first case on the existing citation fixture in tests/phase.test.ts: an edited test cited only by a flush-left wrapped trailer is refused and stderr names the path and carries its own short phrase for the one-line rule (as existing tests assert "final trailer block"); the same reason on one line on a later empty commit lets the move pass. The review seat reads the full text.
- [changed, B, C] Done record: the refusal now states the reading rule; whether the framework lesson `history/2026-10-24-test-change-trailer-single-line.md` retires is the framework pass's call; its added-path half is untouched.
- [changed, D] The bare-path claim is C's alone; not part of the leaf.

## installed-transfer (#143)

- Pick 1a: lift Transfer's same-repo limit for installed akrogon steps only. [D Q6] A step qualifies when it is a plan-issue or check-issue step, or a standing-design line those apply, reached on the leaf path where the case happened; when that step already states the rule the pass adds nothing at the step, removes the line and appends the Transferred line; the existing operator approval completes it. Everything else in Transfer unchanged, including "a checkable lesson never transfers".
- [changed, C, D] Citation: `Transferred <date> to <installed akrogon file> § <section> "<line's opening words>" at release <sha>, approved by <who>`, the sha read from the `realpath` of the running installed skill (`~/.akrogon/releases/<sha>/...`).
- Q3: the sorting model judges per lesson, quoting the installed text and why the case is on that step's path; partial coverage keeps the local duty.
- [changed, D, B] Q4 rewrite only, no removal-only exit: a lesson the installed line contradicts or partly covers gets a proposed rewrite in the same approved diff, its reason appended to its history file; a lesson the installed step then fully carries leaves by Transfer. Declined approval leaves the line unchanged.
- [changed, C, D, folds B] Q5 5b: no per-lesson source-naming duty. B's substance is served by Q4: a kept lesson recommending a script check with no named one-right-answer source contradicts the installed model-choice line and gets the rewrite. The report's history-naming clause stays framework work under Tamdoma/tamdoma-framework#650, stated in the done record. A and B's 5a rejected.
- [changed, C] Orphaned transfers after a later akrogon edit are undetected loss, accepted; the record helps only someone who already suspects one.
- Files: all six lesson-rule.md copies byte-identical after; learn-issues SKILL.md Sort (Transfer bullet) and Apply (the add-at-step instruction is skipped for an installed step).
- Proof: the review seat reads the new text against framework histories 2026-09-30-resolver-guidance-prose-tests, 2026-09-30-offer-analytics-guide-checks, 2026-10-01-discovery-prose-assertions, 2026-10-03-prefix-regex-does-not-prove-meaning, 2026-10-05-analytics-guard-proof, 2026-10-08-residue-triage-prose-proof-layout, 2026-10-17-noop-step-commit-proof (should transfer or be rewritten), 2026-09-12-injector-and-routes and 2026-10-29-cross-site-repeat-fix-layer (contrary candidates, read per lesson), and 2026-10-16-stash-shared-across-worker-worktrees (checkable, must not transfer). Copy parity checked by `cmp`.
