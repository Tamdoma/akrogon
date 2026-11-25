# tool-cgroup final-shape check — slot B

## 1. Defect

**Minor, in the reasoning text, not the mechanism.** Q1's second reason
line reads: "a helper failure leaves only that one `t-`, which the next
advance or leaf close ends (B, D rebuttals)." As written this contradicts
F3 for one case: when the surviving `t-` masks the caller seat and that
same seat owes the advanced-to phase — in a single-slot phase chain, or
when no sibling seat ever commits again — there is no next advance, so
only leaf close ends it. That is the circularity the helper exists to
remove; the line reintroduces it as the failure-mode justification. My
rebuttal said the helper's failure "degrades to a's behavior, never
worse" — true, but a's behavior in that case is the unbounded circular
stall, not "the next advance ends it." What I actually verified in the
source this round partially softens this: every `akrogon` command takes
the home `.lock` before committing (phase.ts `phaseCommand` wraps the
transition in `withLock`), so any *other* seat's phase call — even one
that later errors — passes through a sweep that kills the stale `t-`.
The circle is therefore fully closed only when no other seat of the leaf
ever calls `akrogon phase` again. The reason line should say that, not
"the next advance or leaf close ends it" flatly. The mechanism itself
stands; this is a one-sentence correction so the leaf does not inherit a
false premise about its own failure mode.

No other defect: the shape is buildable as written. I checked the two
highest-risk construction points against the live source and prior probe
evidence:

- The helper's no-timeout wait is correct *because* of the lock span:
  `phaseWake`/`mergeWake` run inside `phaseCommand`'s locked section for
  up to ~75 s (F4), so the caller shell genuinely cannot exit until the
  wake finishes, and any timeout short enough to matter would fire on
  healthy moves.
- pid+starttime waiting is sound against reuse (a reused pid necessarily
  has a newer start time; both are embedded in the `t-` name the helper
  waits on, self-consistently minted by the same entry).

## 2. Missing obligation

**One: the cross-committer shell kill needs to be a recorded residual,
because Taken's lock serialization does not cover it.** The scenario:
seat B's agent runs `akrogon phase`; per Q2 the akrogon process relocates
to `akrogon/` *before* taking the lock — Taken explicitly orders
relocation "before any lock." B's akrogon then blocks on `.lock` while
seat A's `phaseCommand` holds it; A's commit sweeps every `t-` of every
seat except *A's own* caller `t-` — which includes B's caller `t-`, since
B's move has not committed and B has no deferred helper yet. B's caller
shell dies mid-wait. State is safe (B's akrogon survives in `akrogon/`,
acquires the lock, commits correctly), but B's harness sees its phase
tool call killed — the exact noise the deferred-kill mechanism was added
to prevent — in the one configuration where concurrent phase calls are
routine (check.review round 0 seats A and B concurrently). Taken neither
prevents this nor names it. The leaf contract needs one line: either a
recorded residual ("a sibling seat's in-flight phase call may see its
tool shell killed by the other seat's sweep; state is unaffected, the
harness reports a killed call, no retry is correct because the move
completes") or, if the leaf can cheaply do it, exclusion of any `t-` that
currently hosts a relocated akrogon process — though I note that test is
a /proc read of membership, a small selection read, and I would not
demand it; the residual line is enough because the behavior is correct,
just loud. Left unnamed, it is exactly the kind of observation the old
leaf's review rounds kept rediscovering as a "finding" after the fact.

Nothing else rises to the bar. Weaker items I checked and set aside, for
the record:

- Pre-existing live seats lack the env marker, so their shells never
  mint `t-`s and escapes persist until those seats restart — bounded,
  self-healing, and unfixable by any means (cannot retrofit env into
  running processes); not worth a contract line.
- The enumeration/mint race (a shell minting its `t-` between directory
  enumeration and the kill write) is the same class as the already-
  recorded seed-F1 residual; adding a second line for it is noise.
- Empty `t-` accumulation between advances is cosmetic and bounded by
  the best-effort rmdir at each sweep.
- claude hooks/MCP hitting the `CLAUDE_CODE_SHELL` wrapper is unproven
  either way (F5 established it for `BASH_ENV`, not for the shell
  override); the guard confines any hit to root-spawned shells, and
  short-lived hooks dying at advance is harmless. Not a defect, but a
  fair pilot observation to fold into the entry verification the leaf
  will run anyway.
