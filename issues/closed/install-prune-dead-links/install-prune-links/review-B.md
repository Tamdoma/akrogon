# Review B

Verdict: ready.
Base: `13f92e0376d8b0a59ac7f9e61276e9667b0b2bf0`.
Reviewed head: `391bdf93097ac0bead08fd1a00757a07483ff9d6`.

No Fixes or Nits found. The worktree is clean and the reviewed head is one commit ahead of the configured base. The entire diff is limited to `src/install.ts`, `tests/install.test.ts`, and the planned supporting cases in `tests/fake-herdr.ts`.

## Acceptance review

- C1: A single four-root list drives linking and pruning. CLI coverage verifies absent-root creation, eight resolving skill links per root, the executable link, and repeat installation.
- C2–C3: The implementation uses lstat, resolves relative targets against the entry directory, applies the separator-bounded ownership prefix, and unlinks only unresolved targets. Tests cover absolute, relative, and nested stale targets and preservation of real entries, resolving owned/foreign links, dangling foreign links, and sibling prefixes.
- C4: The existing conflict predicate and removal commands are unchanged. Twelve root/conflict combinations and the executable conflict verify refusal, retained conflicts, no new links or herdr calls, and pruning before refusal.
- C5: Tests invoke the actual CLI in child-only temporary HOME. Only the external herdr boundary is replaced; its command shapes are schema-validated and logged. Call assertions use executable argument contracts, not prose. The filesystem artifact survives fixture cleanup.
- C6: Existing implementation evidence applies to the unchanged reviewed code: changed tests progressed from 14 failures/1 pass to 15 passes; the focused suite passed 15 tests/307 assertions; the full suite passed 60 tests/815 assertions; typecheck, formatter, and diff checks passed. No missing evidence or code change warranted repeating these checks.

## Verification evidence

Inspected the complete base-to-head diff, CLI entrypoint, shell command/error contract, test fixture boundary, reference index, installation documentation, implementation brief/report, and logs under `.evidence/install-prune-links/`: `red.txt`, `focused-tests.txt`, `full-tests.txt`, `typecheck.txt`, and `format.txt`.

During review, parsed `home-listing.json` and asserted for every root that all eight current skills resolve to the checkout paths, stale entries are absent, foreign dangling and sibling-prefix entries remain unresolved, and the temporary root no longer exists. All assertions passed. Git inspection confirmed a clean worktree and the committed head above.

The documented limitations remain within the locked scope: pruning is not rolled back after a later failure, ownership is lexical, and the pre-existing documentation's no-reinstall claim remains unchanged. No new lesson claim or missing grounding resource requires follow-up.
