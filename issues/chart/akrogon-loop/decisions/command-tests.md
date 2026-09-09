# Command Tests

Chart skill version: 4

Status: resolved
Type: grilling

## Question

How is the `akrogon` command itself tested: inline self-tests behind one flag as the July 28 lifecycle.ts had, a small test tree run by the repo's own `checks` config, or nothing beyond the leaf checks agents write? Graduated 2026-09-09 from Not Yet Specified: "the intake leans to inline self-tests behind one flag and no test tree".

Locks that bind: the tool builds itself on its own repo (# Bootstrap), so its leaves run the repo's `checks` like any consumer (# Config Shape: lint, typecheck, test, test_changed against `$AKROGON_BASE`, every one blocks); implement-issue writes tests from the brief's criteria before code (# Quality Layers); intake 29 and 61: the July 28 snapshot had zero test files and inline `--self-test` asserts; test failures were under 3 percent of stall time; intake 53: ten of 79 issues existed only to serve the machinery's own gates.

## Findings

Slot A view and slot B blind pass agreed on real-scenario tests, on the never-touch list, and that test placement is a preference, not a reliability difference. They split on placement: A a small test tree run by the repo's own checks, B inline `--self-test` (B's rebuttal: "fixtures bloat the command" is a risk, not a fact, since test files stay in the checkout under source-checkout distribution anyway). B's rebuttal reshaped Q3: the allowed list names observable contracts (state transition, file shape, refusal, observed defect), not only transitions, and exact text stays testable where it runs as written. B's rebuttal reshaped Q4: the ban on real panes, install roots, GitHub and the herdr socket binds routine automated tests, and the Bootstrap live proof is exempt.

Operator 2026-09-09: 1-A, 2-A ("I don't want this to become a testing nightmare"), 3-A, 4-A. The 2-A note binds: the scenario set is the ceiling, not the floor.

## Resolution

Separate test files, one per subcommand, run by bun test as the akrogon repo's `checks.test`; the shipped command carries no test code. The tests are a handful of command-level scenarios on a temp repo with real files and real processes: a stale phase move refused, the same command run twice, two processes racing on one leaf, pull adding and deleting seeds, status on a fixture tree. Herdr and gh are substituted at one thin boundary. The Bootstrap takeover stays the live integration proof. A test exists only for an observable contract: a state transition, a file shape, a refusal, or a defect that happened; never for prose or output wording, except text that runs as written (commands, numbers, fixed references); no coverage target; check-issue treats a wording test as a maintainability defect under # Quality Layers. Routine tests never touch the operator's real panes, install roots, GitHub issues, or the herdr socket. New tests need a contract or a defect behind them, never coverage, and the akrogon repo's briefs say so; the operator's rule is that the suite stays small.

Forecloses: inline `--self-test`, a line budget for tests, tests that restate the routing table, and any test that drives real herdr or GitHub.
