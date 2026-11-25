# Eight-section implementation brief

Read when A writes or revises a worker sub-brief or a standalone task brief; replace the guidance below with the concrete task, keeping the brief below 1,500 words and 20 rules by judgment, not machinery.

A delegated leaf writes `implementation/brief-1.md`, `brief-2.md`, etc., one per unit and one unit included, each with these eight sections and only its own scope, with the binding facts for that scope copied in rather than pointed at; the leaf has no whole-leaf brief because `plan.md` is its contract. Standalone writes one task brief with these sections.

## 1. Goal

The outcome and plan decision IDs; standalone assigns its brief's own decision IDs.

## 2. Numbered acceptance criteria

Observable outcomes written before code. A test exists only as the proof of a done-criterion or as the red-first reproduction of a proven bug; after planning no seat adds an edge or negative case on a named consequence alone. For a delegated leaf the planned tests and their run command come from `plan.md`, copied in for the tests this unit touches; those tests live in the leaf diff and run under the commands section 7 names. A worker writes and edits no test: a planned test that is wrong or red returns a mismatch, never a test fix. Standalone has no planned tests and no guard; its only rule is order: tests from the brief first, committed, then code.

## 3. Read-first list

Concrete paths from the plan, one existing pattern to copy, and this skill folder's `ponytail.md`; workers open the index only for a gap in this list.

## 4. Change list and needed interfaces

Files and changes, the signatures and data shapes this worker needs, and relevant output from a preceding worker, rather than every interface in the project. For a delegated leaf each brief also records the chunks that must land first, the paths this unit owns, any shared test resource or consumed output, and the commit A created the worker worktree at, which A fills in when it creates that worktree at its wave, never when it writes the sub-briefs, because later waves start after earlier cherry-picks; a relaunched worker reads the same brief. The records carry the plan's wave values into the sub-brief, and A groups from them only when the plan has no wave grouping.

## 5. Do-not, reasons and exceptions

Task-specific exclusions with why each matters and its actual exception, including: return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Every brief also carries the standing exclusion: the worker never runs any `git stash` subcommand, because every worktree of a repo shares one stash and a pop can lift a sibling worker's edit; to check behaviour on the base it uses a second worktree of the base instead. A delegated leaf brief adds one replacement for setting work aside: commit it as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work. A standalone brief carries no reset step.

Every brief also carries the standing exclusion that the worker runs commands unattended: it writes no command that waits on a human; it writes no poll or sleep loop, and runs a slow command once in the foreground with the tool timeout set above its expected run time, waiting on its exit inside its turn; it re-expresses a harness denial of a command inside the same grant and identity (a simpler single command, the configured runner, its own read or edit tool), never around a secret, `.env` or grant rule, and when no permitted formulation answers, returns a mismatch to A with the denial text verbatim; it names no env file path on a command line, and a value it needs that is not declared is a mismatch, not a formulation to work around. The reason is that no human answers a seat's command, and a worker reads only its brief, so the rule reaches it only here; there is no exception.

End this section by restating the reasons and exceptions so they remain attached to the exclusions.

## 6. Ordered steps

Each step names its file and acceptance criterion, with red/green evidence where relevant.

Advisory size: about N files and under M turns, with M at least four turns per file because each file costs a read, an edit and a test run; work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

The unit's targeted test commands named from A's plan; when none are named the worker runs no changed-tests command. A runs the resolved changed-tests command, criterion proof and every `checks` command separately.

If the checkout has no changed-test runner, name the actual targeted check derived from its tools rather than substituting the full suite or inventing a command.

## 8. Done-when, evidence and report

Acceptance outcomes and pasted command results; the report links each done-criterion and each real bug fix to its test or evidence, with a path to any required end-to-end artifact; limitations and unverified criteria remain explicit. Command output the worker keeps goes through `akrogon run-check --name <label> -- <cmd>` citing the printed `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log. Exempt: printed `checks` commands and `akrogon verify`; `akrogon phase ... merged`; coordination commands (fetch, push), whose errors are quoted as text.

A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and a commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source; a recorded path changed or gone since the `plan.synthesis` to `implement` move, or an added `src/test-files.ts`-matched path outside that record, needs the same trailer in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count; delegated commits survive cherry-pick, so the trailer lands on the lane.

For akrogon command work, scenarios use temporary repositories, real files/processes and `hc`/herdr-app/gh replaced at one boundary (a real throwaway hc core per fixture and a strict fake `herdr-app`), with no real window, real sessions, install roots or GitHub; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.

End to end evidence with an artifact is required only when browser or runtime behavior or cross-component wiring cannot be shown by a smaller check or when a criterion asks for it; then a user-visible flow uses a real invocation or request with evidence, and browser flows use headless Playwright Chromium with trace on and video off, recorded as a consumer dev dependency when first needed.

End the concrete brief with these four fill-in lines, accepting equivalent wording by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
