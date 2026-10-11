# Waiting leaf, merged notes (A: waiting-leaf-A.md, B: waiting-leaf-B.md)

## Q1 what the proving leaf becomes
- O-failed-held (A): leaf goes `failed` with a new cause `held`, linked to the repo hold; dispatch moves it back to `failure.phase` itself on release. Reason: reuses failed handling (dispatch returns waiting, status shows cause), and the move back already resets pass bookkeeping so the resumed pass starts fresh; one enum value. Cost: watch's failed-recovery rule (watch SKILL.md:39) must skip `held`; failed carries the word "failed" for a leaf that did nothing wrong.
- O-typed-wait (B): leaf keeps its phase with a structured wait linked to the incident; dispatch and phase advancement refuse while it stands. Reason: a broken base is not leaf failure; no failure-cycle coupling. Cost: new state field, dispatch and phase-advance guards with locked reread, status and watch changes; must stop idle events re-prompting the waiting seat and the peer review seat advancing the leaf.
- Rejected (A,B): new `held` phase (touches every phase consumer); notice-only (misses #76); repo-pause (manual passes bypass, blocks the fix).
- Pitfalls (A,B): stale clear race, removed by revalidating under the lock (lesson 2026-10-10). Waiting must consume no watch recovery cycle.

## Q2 other leaves while held
- Pick (A,B): leaves keep working, no dispatch block. A seat whose own fresh run of a held command goes red judges whether the incident explains it (no plausible cause in its diff, same command/args/scope, equivalent conditions) and joins without its own base comparison, silently. Cost: the seat still pays its own run; equivalence is a judgment, not text match (B).
- (B) When equivalence is not shown, the seat runs today's one base comparison and, if red, records a distinct incident.
- (B) A leaf deliberately fixing the held command needs a route that does not auto-attach it.
- Rejected (A,B): block dispatch while held (Chromium sheriff doc: closed tree means nobody progresses; blocks the fix); attach on command text + SHA only (hides leaf defects, #77 environment case); every leaf repeats the base run.
- Pitfall (A,B): seats already mid-run cannot be cancelled; no promise of zero duplicate runs.

## Q3 several reds
- Pick (A,B): one repo record with a list of command incidents, each with evidence and waiters; a notice per new incident, joins silent; release of one incident does not touch others; a leaf waits while any linked incident stands. (B) record delivery separately; no exactly-once claim across a crash.
- Rejected (A,B): today's single-command last-write record (src/hold.ts:59-60); first-write-wins; per-leaf notices.
- (B) Share one truth with the merge hold without fabricating batch metadata or two independently clearable holds.

## Added question (A,B)
- Q4 the leaf's base is its merge-base with the tracking ref (src/config.ts:252-253), not current main, and leaves do not rebase before merge. (A) Proposal: an incident records only reds proven at fetched main; a seat whose base is behind fetched main runs its base comparison at fetched main; green there means not a main incident and today's path applies. (B) Do not label old-base evidence as main health.

## Where slots differ
- Q1: A recommends failed-held, B recommends typed wait.

## Corrections after rebuttal (slots/waiting-leaf-rebuttal-B.md)
- R2 accepted: Q2 reads "unattached leaves keep working; a leaf linked to an incident is not dispatched". B rejected a repo-wide gate, not the waiting leaf's gate. The Chromium citation is A's evidence only.
- R3/R4 accepted in part: Q4 is withdrawn from this fork. The incident is keyed by command and records each tested base as evidence; whether a resumed leaf refreshes its base onto current main moves to the release fork (B does not authorize an automatic rebase; open there).
