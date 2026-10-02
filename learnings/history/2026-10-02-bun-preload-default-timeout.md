# bun preload setDefaultTimeout covers only the first test file

What failed: concurrent-suite put `setDefaultTimeout(30_000)` in a bunfig `preload` file to raise every test's timeout. In one round of 4 suites started at once, `next identifies dormant .../resting ...` in `tests/next.test.ts` failed with "this test timed out after 5000ms".
Root cause: in bun 1.4.2 the preload's `setDefaultTimeout` applies only to the first test file run. Every later file goes back to 5000 ms. Evidence: three files with two 6 s tests each, run with the preload, gave 2 pass (first file) and 4 fail at 5000 ms. A `[test] timeout` bunfig key and a preload `beforeAll(() => setDefaultTimeout(...))` both gave 0 pass. Only the CLI `--timeout` flag or a call at the top of each file sets the timeout everywhere.
Fix: concurrent-suite plan D2 replaces the preload with `--timeout=30000` in the `checks` test commands.
Lesson: before a design locks a test-runner setting, prove it on a multi-file probe that would fail without it. A green whole-suite run can pass with the setting doing nothing.
