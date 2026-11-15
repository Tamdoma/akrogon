# Contract and route

## Question

1. Who builds the one job, and is the job right as written?
   - 1a (recommended) Direct: the door builds it in a worktree, B reviews, the full checks run, it lands on main.
   - 1b Lifecycle: the door writes the leaf `issues/open/dispatch-flake/fixture-start-window` and the factory's seats build it.

The job as shown at the handoff review, 2026-11-10:

What: delete the shared 3 s start-proof window (`AKROGON_START_PROOF_MS: '3000'`) from tests/hc-fixture.ts so hc-fixture tests use the product's window, and give the four tests that need a seat that never proves its start their own short window: `a seat that never works stays running, is reported started not confirmed, and is not resent` (tests/hc-start.test.ts), `a working seat gets no send; a send that never starts is recorded, not resent, and resettled once the turn moves` (tests/hc-delivery.test.ts), `a manual next ignores an inherited HC_TERMINAL_ID` (tests/session-reads.test.ts), `the busy notice lands in the session holding the repo space` (tests/session-routing.test.ts).

Why: a seat start slower than 3 s in a test is recorded as not confirmed and not counted, which flips `merged phase closes tab on typed next and starts the dependent` and exposes every test on the shared setup (forks/fix-shape.md).

Done-criteria:

1. A seat start that takes longer than 3 s in a test on the shared setup is proven and counted: with the dependent's seat start delayed past 3 s, the scenario `merged phase closes tab on typed next and starts the dependent` ends with the dependent's first attempt counted once. Shown failing before the change and passing after.
2. The four unproven-start scenarios named above keep their outcome and finish inside their existing per-test limits, each with a start-proof window it sets itself. No per-test limit is raised.
3. The repo's `test` check is green on the head, with its wall time recorded before and after on the same host. The whole suite is the proof because only it shows that no other test on the shared setup leaned on the removed window.

Exclusions: no change under src/; tests/e2e/watch-tier.ts keeps its own 3000 window (attended tier outside the blocking checks, no recorded failure); `AKROGON_PANE_WAIT_MS` stays; the uncounted resettled start (forks/fix-shape.md, listed) is not in scope. No retry, serial run, fixed sleep or counter poll is added (fix-shape Taken).

### Carries

- forks/fix-shape.md, Taken: 1a and its binding avoidance steps.
- forks/signposts.md, Taken: 1a 2c 3a 4a 5b 6a 7a. Needs row N1 has no consumer here.

## Findings

- Direct eligibility: no `inputs`, `grants`, `produces` or `retained`; no live run or outside call during implementation; one outcome; no pending human prerequisite; B is named (t12g); the mode is manual.
- Destination check right before the review, 2026-11-10: `akrogon pull` at /home/ivan/Work/infra/akrogon printed `akrogon: 0 open issues pulled`; issues/seeds holds no file; `issues/open/dispatch-flake` and `issues/closed/dispatch-flake` do not exist; no leaf named `fixture-start-window` exists in open or closed.
- Pre-existing key parts and the observation that reached each: the forced delay reddens the base (K1), the product honors a set window (K2), an unset window is the product's and only four tests lean on the short one (K3), the `test` check exists (K4); records in forks/fix-shape.md, Findings. Nothing cut.
- Live-run line: no done-criterion needs a live run.
- Usage shown at the review: `chart dispatch-flake - operator wait 20.0 min, operator turns 3; A=58750, B=17614 output`, outcome done.
- Seats shown: lifecycle A pi devin/swe-2-max-lightning high, B codex gpt-6.1-sol high; no seat block proposed.
- Challenge check shown: direct spends the door's tokens on building (A's judgment that the total is lower, not measured); signpost 4a fits lifecycle more closely; B was not asked about the route.

## Taken

Operator, 2026-11-10, door t126, verbatim: `1a` (after "elid"; the review stated that the reply also approves the job as written).

- 1a: direct route. The door implements in a worktree, B reviews, the door lands on main. Includes the door's push authority. Reason given at the review: about ten lines, settled, and the door holds the forced-delay reproduction. Foreclosed: lifecycle handoff for this job.
- The job is approved as written under Question.
