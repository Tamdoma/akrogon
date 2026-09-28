# Implementation report: operation-proof

Base: `1607ee7fbf4a2362340c2d6b8de4257d72684ec6`
Committed head: `f984c8ae83156b31aaa5502abab4b02a0c96f360` on branch `operation-proof` (3 commits, worktree clean, no `issues/` diff).

## Changed files and reasons

- `skills/chart-issues/SKILL.md` (D1, D2, D5): new canonical Take paragraph with every external operation getting one real call with the leaf identity before handoff plus all recorded fields, smallest-reversible-write rule, dry-run limits, decline/hold/no-waiver; credential clause now requires keys in the consumer `.env` before handoff so probes can run; Handoff audit gains the Take operation-proof cross-ref without a field list.
- `skills/chart-issues/assets/shapes.md` (D3, D5): Preflight paragraph gains refusal when a brief names an operation with no recorded proof under the Take rule; implementer-audit paragraph gains the check of that refusal. Additive sentences only, no rewording, no field list.
- `skills/chart-issues/assets/questions.md` (D4, D5): Optional measurement scoped to exploration only, never replaces required proof, declining a required probe holds the handoff under the Take rule. Sandbox sentences intact.

No src, test, docs, README or config change. Single-definition check: `grep -rn "cleanup result|identity reference without|smallest reversible" skills/chart-issues/assets/` exits 1 (no match outside SKILL.md).

## Worker returns folded in

One wave of 3 parallel workers, each in a detached worktree at lane head, each committed one file and was cherry-picked serially onto the lane with lane changed tests after each pick. All worker worktrees removed before the full suite.

- U1 (brief-1, SKILL.md): commit `dbb1e8270eb942bc8bce5d368611e7d33e1fa0df`. Changed-test exit 0, 0 pass 0 fail ("1 changed file, but no test files are affected"). Greps: canonical paragraph present (line 53), "before dispatch" absent (exit 1), Handoff cross-ref present (line 63). Limitations: none. Unverified: none.
- U2 (brief-2, shapes.md): commit `43e78eac9bfccbbdcb32f907e1f27e49c9778a85`. Changed-test exit 0, 0/0. Greps: preflight refusal on line 166, audit check on line 168. Limitation noted at worker time (Take rule not yet in SKILL.md at detached head) resolved by the lane pick of U1. Unverified: none.
- U3 (brief-3, questions.md): commit `9d8fe22d19f86d0bc2d1872bf983bf3914ae6f04`. Changed-test exit 0, 0/0. Greps: exploration-only, never-replaces, declining-holds all on line 54; sandbox sentences intact. Same forward-ref note as U2, resolved by the lane pick of U1. Unverified: none.

Lane picks: `a72fa61` (U1), `a30afc7` (U2), `f984c8a` (U3). Lane changed tests after each pick: 1, 2, then 3 changed files, each "no test files are affected", 0 pass 0 fail, exit 0.

## Commands run with pasted results

From `/home/ivan/Work/infra/akrogon/issues/worktrees/operation-proof`:

- `bun test` (full suite as B): 306 pass, 0 fail, 3621 expect() calls, 14 files, [118.85s].
- `bun run typecheck`: `tsc --noEmit`, exit 0.
- `bun run format`: all `src`/`tests` files reported unchanged, exit 0. `git status --porcelain` empty after.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with base above: after final pick, "3 changed files, but no test files are affected", 0/0, exit 0.
- `git diff --stat 1607ee7...HEAD`: 3 files changed, 7 insertions, 5 deletions (SKILL.md 4/2, questions.md 1/1, shapes.md 2/2). `git diff --name-only origin/main...HEAD -- issues` empty.

No end-to-end artifact applies to prose; no `.evidence/` path was created.

## Three-case audit (brief criterion 6)

Against the edited SKILL.md:53 rule, shapes.md:166 refusal and questions.md:54 scoping:

- I2 sufficient real probe: fork holds command, inputs, identity name only, version, date, 2xx plus field id, cleanup DELETE result and limits for every brief-named operation, credentials present before handoff. Rule satisfied, preflight finds recorded proof. Outcome: handoff proceeds.
- I3 limited dry-run: provider `validate` documents auth-only proof, run with the real identity. Rule credits auth only; the write scope still needs its own record. Outcome: partial credit plus further evidence; a sufficient no-write check is preferred where one exists.
- I4 unproven or declined: brief names `POST /locations/customFields` with only GET evidence, or the probe is declined. Rule holds the handoff without narrowing scope and offers no waiver; preflight refuses (no recorded proof); Optional measurement explicitly never replaces required proof. Outcome: handoff held. This is the #20 case the leaf closes.

## Link check (brief criterion 6)

- Real links in `skills/chart-issues/SKILL.md:19` (`assets/questions.md`, `assets/shapes.md`, `assets/standing-design.md`): all three resolve to existing files.
- `skills/chart-issues/assets/questions.md`: zero markdown links, nothing to resolve.
- `skills/chart-issues/assets/shapes.md`: five template placeholders (`forks/<fork-slug>.md` x2, `<issue>/ISSUE.md`, `<other-issue>/ISSUE.md`, `<leaf>/brief.md`) are shape examples, exempt per plan D7, not navigational links.

## Sweeps

- `grep -rn "before dispatch" skills/chart-issues/ docs/guide/ README.md`: no match in `skills/chart-issues/`; remaining hits are unrelated (`docs/guide/setup.md` "before dispatching work" x2, `README.md:33` export-csv rows/columns). No pre-dispatch credential timing remains.
- D8 `docs/` sweep: `docs/guide/chart.md:199` says only "named, not pasted" with no timing and no preflight restatement, so it stays valid. No human-doc edit made.

## Known limitations

- R1 (plan): base-preflight edits the same shapes.md paragraph in parallel; this leaf's sentences are additive so the later merge rebases at sentence level.
- R2 (plan): the rule is enforced by the charting agent and human review, not automation; no prose test added per standing design.
- Worker forward-ref notes (U2, U3) resolved on the lane and are not residual.

## Unverified criteria

None. C1-C4 verified by reading the edited paragraphs plus greps; C5 by the audit and link check above; C6 by the full suite, typecheck and format.
