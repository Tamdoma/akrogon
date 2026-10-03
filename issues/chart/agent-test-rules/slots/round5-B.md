This round settles test-file coverage and citation storage for the chosen phase check. Recommend one explicit path list per repo and citations in the commits that change expectations, with the same validator available before merge pushes.

Diagnosis: `src/phase.ts:222-225` currently checks cleanliness, issue-file placement and a nonempty branch, but has no citation check. `src/config.ts:28-49` has no test-path setting. The toolkit names a runner, not its fixtures (`src/config.ts:18`).
Diagnosis: correct `forks/test-change-check.md:11`: merge already records evidence in `review-B.md` (`skills/merge-issue/SKILL.md:37,41`). Its real gap is timing: it pushes at :47 and calls the final phase at :51.

### 1 · Which files should the phase check treat as tests? (Q10)

A recorder can change `test/fixture-network/**` without touching a `.test.ts` file. A broad directory rule can also catch generated traces rather than expectations. The definition must cover tracked assertions, fixtures and recorded expectations regardless of the editing tool.

Research: operator · `forks/test-authority.md:21-22`, read 2026-10-03 · every changed existing test/fixture needs its path and source, across all write paths · this excludes edit-tool hooks and runner-only discovery.
Research: better-than-training · independent `git ls-files -z` inventory of all ten registered roots, 2026-10-03 · Pi has colocated `tamdoma-devin-provider/protocol.test.ts`, Himne has `scripts/tests/test_migrate_hymnal.py`, framework has the fixture layouts at `forks/test-change-check.md:10`, and boulevard tracks `prototype/test-results/*.zip` run artifacts · naming conventions alone cannot distinguish all expectations from incidental files. This was a path inventory, not a semantic audit of every candidate.
Research: better-than-training · `src/config.ts:28-49,148-164` and [Git diff documentation](https://git-scm.com/docs/git-diff), read 2026-10-03 · Git supports path filtering, NUL-delimited status output and disabling rename detection · use the existing Git boundary rather than another glob engine.

- **1a (recommended)** Add one repo setting, `test_paths`, containing root-relative Git pathspecs for assertions and their fixture/recorded-output files. It is the sole classification rule. Populate all ten registered repos before enabling enforcement, and record the setting during initialization. Missing configuration is an explicit gap. An explicit empty list means the repo declares no protected tests, never an inferred default. This covers irregular layouts without accumulating built-in exceptions.
- **1b** Use one built-in rule for test/spec suffixes and test/tests/fixture/snapshot directories. It avoids configuration but misses unconventional expectation paths and catches unrelated artifacts. Extending it for each repository creates the exceptions this round is trying to avoid.

Pitfalls: configuration completeness needs human or agent review. The checker cannot infer that an omitted JSON file is an oracle. Directory-wide entries protect helpers too, so select known expectation files where practical. There is no built-in fallback when `test_paths` is absent.

Detection: resolve the base SHA using `src/config.ts:148-150`, the same calculation that supplies `AKROGON_BASE`. Diff `BASE...HEAD` with `--name-status -z --no-renames` and the configured pathspecs. Require citations for selected paths present at BASE and modified/deleted in the final diff, including type changes. Added files need none. A rename becomes deletion of the old protected path plus an addition, so moving a test cannot bypass its citation. An explicit empty path list returns an empty protected set, rather than passing no filters to Git and selecting everything.

### 2 · Where should the cited source and reason live? (Q11)

A writes `implementation/report.md` and B appends `review-B.md`, both outside the leaf branch (`skills/implement-issue/SKILL.md:63`, `skills/check-issue/SKILL.md:83`). A worker's committed change is cherry-picked into the lane (`skills/implement-issue/worker-protocol.md:11`). Citation storage should travel with that change and also satisfy the first-seat fix-forward decision.

Research: operator · `forks/bad-base-test.md:17` and `forks/test-change-check.md:8`, read 2026-10-03 · a wrong base expectation is fixed in its own commit with its reason, while the machine checks citation presence only · commit metadata already fits that decision.
Research: better-than-training · [Git trailer documentation](https://git-scm.com/docs/git-interpret-trailers), read 2026-10-03 · trailers attach metadata to otherwise free-form commit messages, and `--parse` reads existing trailers without adding configured values · use Git's parser instead of requiring report headings. A read-only stdin probe successfully parsed a custom `Test-Source` trailer containing a JSON record.

- **2a (recommended)** Put repeatable `Test-Source` trailers in the change commits. Each value is a small JSON record containing the exact repo-relative `path`, a nonblank `source` reference and a nonblank `reason`. Check that every net-changed old protected file has a record in `BASE..HEAD`. Parse fields, not prose or field order. This travels with worker commits and rebases, and the 8a fix's own commit contains its reason.
- **2b** Put citations in the existing pass reports. This adds no artifact, but the checker must read two mutable files outside the branch, associate records with the current diff, and ensure workers' citations are copied into them. Merge can use its existing `review-B.md` entry.
- **2c** Add a dedicated leaf citation file. One structured input simplifies parsing, but adds a separate artifact to maintain alongside commits and reports without improving source quality.

Pitfalls: a nonblank citation can still be false or stale. B evaluates the source and reason against the actual expectation change, including changes introduced during conflict resolution. No source-quality score, required wording, report heading, brief hash or assertion parser belongs in the mechanical check. A source may be a brief outcome, captured real data, external documentation or a surviving duplicate's path, with enough location detail for review.

Merge fit: after every rebase/conflict resolution, refresh BASE and update citations for changed expectations before publishing. Reuse one validator for phase admission and a proposed read-only phase validation mode immediately before every push attempt. That mode does not exist today (`src/akrogon.ts:13-14`). Checking only `phase ... merged` is too late, and after push the tracking ref can make the computed diff empty. Preserve the normal failure-reporting exit (`src/phase.ts:213-220`). This is one checker at two call sites, not another citation store.
Fix-forward fit: the first seat's separate 8a commit carries its path, source and reason. Once another leaf rebases onto the landed fix, it is part of BASE and needs no duplicated citation unless that leaf changes it again.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
The strongest objection to 1a is maintaining coverage across ten repos. Its benefit disappears if the lists omit fixtures, so initial coverage review is necessary. The strongest objection to 2a is machine-readable commit metadata. Keep only the path/source/reason boundary strict and leave the explanation free-form. These recommendations enforce recorded presence, not truth, and do not prevent a seat from directly pushing outside the prescribed merge workflow. No other round5 file was read.
