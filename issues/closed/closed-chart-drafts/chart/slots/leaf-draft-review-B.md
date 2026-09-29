## F1. Both designs omit the required verification artifact

Evidence: `/home/ivan/.claude/skills/chart-issues/assets/standing-design.md:9` requires an end-to-end verification command that leaves an artifact and an implementation report recording its path. Both designs name real fixture CLI invocations but omit artifact retention. `tests/helpers.ts:33` deletes the fixture and `tests/helpers.ts:51-58` returns captured output in memory. Passing the tests alone does not define a retained artifact.

Exact replacement for the user-visible-flow sentence in `keep-chart-in-place/design.md:20`:

> The user-visible flow is the CLI. Done-criterion 3 exercises real `akrogon phase`, `akrogon next --all` and `akrogon status` invocations in an isolated fixture repo. Run the test file containing this regression with `bun test`, saving stdout and stderr to a retained file outside the fixture and repository, preserve the test command's exit status, and record the command, exit result and artifact path in the implementation report. The configured blocking checks must also pass.

Exact replacement for the user-visible-flow sentence in `unreadable-capacity/design.md:15`:

> The user-visible flow is `akrogon next`, exercised by real CLI invocations in the dispatch fixture. Run `bun test tests/next.test.ts`, saving stdout and stderr to a retained file outside the fixture and repository, preserve the test command's exit status, and record the command, exit result and artifact path in the implementation report. The configured blocking checks must also pass.

## F2. Requiring every new assertion to fail on current code rejects useful invariant checks

Evidence: `keep-chart-in-place/design.md:20` says “each new assertion must fail on the current code.” Current completion already moves the owner (`src/phase.ts:172`) and does not rewrite the chart file bytes before moving it (`src/phase.ts:174`). The proposed regression needs setup-success and preserved-behavior assertions as well as assertions that distinguish the fix. Also, duplicate detection follows depth validation, so the incident's drafts already fail before generating a duplicate-slug error (`src/next.ts:97-104,120-128`). The new no-duplicate-error assertion can pass before the fix while the regression correctly fails for another reason.

Exact replacement for that final sentence in `keep-chart-in-place/design.md:20`:

> No vanity tests: the new regression must fail on current code because completion moves the chart into the leaf inventory, and pass after the fix. Supporting setup and preserved-behavior assertions need not fail before the fix.

## F3. Capacity criterion 3 does not specify allocations versus reserved capacity or require cross-repo admission

Evidence: `unreadable-capacity/brief.md:12` says waiting leaves allocate “until the total reaches 3.” The chosen rule permits only two allocations here, with the unreadable entry reserving the third slot (`src/next.ts:265-283`, adopted design line 19). A test that starts both leaves in the first repo without attempting work in the second can satisfy that wording without verifying the second repo's admission or rejection. Running `next --all` from the first repo also sweeps only that repo (`src/next.ts:702-709`).

Exact replacement for done-criterion 3 in `unreadable-capacity/brief.md`:

> 3. New test: register two repos at max_active 3. The first has one unreadable entry, several readable merged leaves and two waiting leaves with no live panes. The second has one waiting leaf with no live panes. Explicitly dispatch the second repo's waiting leaf, then one waiting leaf in the first repo, and assert both allocate. Explicitly attempt the remaining waiting leaf and assert it stays unallocated. Exactly two leaves are allocated across the repos, and the unreadable reservation brings counted occupancy to three. Preserve structured diagnostics and nonzero exit for the unreadable entry. This regression fails on current code.
