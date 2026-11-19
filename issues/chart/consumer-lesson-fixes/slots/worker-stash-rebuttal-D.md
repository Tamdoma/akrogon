# Rebuttal, slot D: worker-stash (#141)

Q1. Pick stays 1a, with one disagreement on placement.

- 1a lists three homes for one rule: brief-template section 5, worker-protocol "Launch and return" beside the `pkill` ban (C), and implement-issue SKILL.md. The worker-protocol copy is a second copy of the brief-template line for the same reader chain (A writes the sub-brief from the template). Drop it. Keep brief-template section 5 for workers and the SKILL.md sentence for A. Two readers, two lines, no duplicate.
- The door's run-check probe settles 1b better than my map did. My costs were weaker than "run-check fails from a clone". No disagreement with rejecting it.

Q2. Pick stays 2a.

- 2b's reason, "matching the case", is true: the only recorded case is worker to worker. But the mechanism the probe proved is "worktrees of one repo share `refs/stash`", and every leaf worktree is one. 2a costs a few words in a SKILL.md sentence that already bans stashing for A at refresh. 2b leaves that sentence saying stashing is fine at other times.

Missing from the pitfalls: the WIP-commit replacement interacts with cherry-pick. A picks only the returned commit ID. A worker that leaves a WIP commit under its unit commit returns a commit whose parent A never picks, and the pick then conflicts or drops work. The merged note's fix ("the returned commit is made after the WIP is folded in") is right, but it should say how: one commit on top of the wave's start HEAD. That is checkable by A at return with no new mechanism, since A already knows the start HEAD.

Proof and retirement: no disagreement.
