# Review B: stored-failure-names

Date: 2026-11-11. Phase: `check.review`, initial blind review.

Base: `ec988c5cb1bc4996d48515cdb16e078e0edc2576`.
Reviewed head: `b73a4cefb50e86225a6e2d1a0f976c74da49c147`.
Verdict: **fix**.

## Fixes

### F1 — C2 lacks the required verify-to-flaky proof

Source and trace: the reported failure is a real `akrogon verify` red run whose evidence is retired before a later same-tree green is reported by `akrogon flaky`. Brief criterion 2 and the design's standing-design interpretation require a run written by the verify CLI, followed by the flaky consumer after evidence removal, with fail-before/pass-after evidence.

`tests/flaky.test.ts:352` creates its red and green rows with `run`/`seedRun`, supplies `failures: ['alpha']` itself, deletes a separately written log, then calls `flakyLines` and the flaky CLI. It never invokes verify. The C1 writer tests in `tests/verify.test.ts:1926` and `:1968` invoke verify but never perform the later same-tree green, remove that red run's evidence, or feed its resulting ledger into flaky. No other changed test joins those steps. The recorded C2 red and green runs both exercise the seeded case.

Consequence today: the report marks C2 complete without the particular producer-to-consumer proof the locked design requires. Writer and reader behavior have separate passing tests, but the required chained scenario has no recorded run. This is a C2 verification gap, not a demonstrated product failure.

Required repair: use the existing isolated fixture and verify helpers to write a red and later green run on the same tree, remove the red log and any archive, then assert the flaky consumer reports the stored name instead of `(log gone)`. Record that scenario red on the base and green after, and correct the report's C2 evidence. This needs a missing case using existing machinery, not a new runner.

Evidence read through `akrogon log`: `check-stored-failures-c2-1794436408044-1349223.log` (red: alpha collapses into `(log gone)`), `check-stored-failures-e2-1794436417941-1359470.log` (same reader-only break), and `check-impl-flaky-1794436877122-1818805.log` (1 pass).

### F2 — The AREA verify paragraph omits required entry exclusions and compatibility cost

Source and trace: an agent following `docs/reference-index.md` reaches `src/AREA.md` for the verify ledger contract. Its verify paragraph at line 17 says a red entry records `failures`; its rewrite paragraph at line 31 repeats that shorthand. Neither states that setup-failed, blocked and reused entries carry no field, and neither warns that older akrogon versions cannot parse a ledger containing it. `docs/reference/files.md:71` does state those facts.

Consequence today: the AREA description includes copied red entries in its unqualified writer claim and omits the rollback incompatibility at a contract surface explicitly named by brief criterion 6. A reader cannot learn the complete new entry contract there. C6 requires both named surfaces to state which entries carry the field, its readers and non-reader, and the older-version parse cost.

Required repair: complete the existing AREA verify paragraph with the writer exclusions and older-version compatibility warning. No new document or prose assertion test is needed.

## Verification and scope

- **V1:** Schema shape, both own-command writer sites, both `newRedUnits` reads, and the stored-first `flips` read match D1–D4. Setup-failed and blocked pushes remain fieldless. `knownRedReceipt` is unchanged and still reads both logs. The locked ledger rewrite preserves the parsed field through notice and slow updates.
- **V2:** Read the kept implementation logs with `akrogon log`. `impl-targeted` ran all six new verify cases, including corrected merge-member and beta-notice cases. `impl-flaky` ran the new stored-name case. `impl-c5` ran six schema/legacy-log cases. `impl-c6` ran all 12 docs-link cases. Targeted verify/flaky proofs preceded the final documentation-only commit, but followed the last changes to their tests and implementation inputs. The full suite ran on the reviewed head.
- **V3:** Receipt `c4a0e3a4-9a7a-4455-9b8c-84e4bf785322` records the reviewed head and all configured checks at exit 0. Read `check-format-1794436914961-1854333.log`, `check-typecheck-1794436917532-1854333.log`, and the test summary in `check-test-1794436978265-1854333.log`: 1177 pass, 0 fail. No check runner/configuration was changed, skipped or disabled by this diff. No redundant rerun was needed.
- **V4:** Read the deliberate-break logs E1, E2, E3, E4, E4b and E6. They show setup-copy exclusion, stored-first readers, gone-log receipt refusal and deduplication failures. The C1/C3/C4 proofs were bundled in `impl-targeted`; its output includes every planned case. The C6 grep variant and combined test selection retain the planned observations and tests. These command differences introduce no lost case or widened operation.
- **V5:** Opened the behavior pages `docs/reference/files.md` and `docs/reference/commands.md`, the reference index and the changed AREA. Listed the concrete `src/`, `tests/` and `docs/` file paths named by `src/AREA.md` in one Python shell invocation from the repository root; every listed path exists. No deleted AREA, index change, lesson-line change or unrelated code change appears in the diff.
- **V6:** `readiness.yaml` has empty inputs, produces, grants and retained lists. Artifacts and matching `issues/timings.jsonl` records describe local fixture checks only. No paid/live count, cleanup or operator action is outstanding. This review launched no covered operation, edited no code and made no commit.

All cited `check-*.log` files are under this leaf's `implementation/` directory.

## Test-Change trailers in base..HEAD

- **T1 — `6d0541e1`:** `Test-Change: tests/verify.test.ts added five cases proving stored-failure-names done-criteria 1, 3, 4 and 5 (stored names written on red entries only, stored-first notice matching, receipt ignoring the field, field shape); no existing expectation changed.` Accepted: these are new criterion cases, with no pre-leaf assertion removed or weakened. The message says five cases; the final file has six new verify tests, which is a descriptive count error with no test omission.
- **T2 — `6d0541e1`:** `Test-Change: tests/flaky.test.ts added the stored-name flip case and a failures option on the row builder; no existing expectation changed.` Accepted for the additions. F1 concerns the proof's required producer scenario, not authorization to add this test.
- **T3 — `6e7c003e`:** `Test-Change: tests/verify.test.ts corrected two planned stored-failure-names cases against real output: \`red\` check \`echo "(fail) gamma"; exit 7\` (checkedRun already wraps in sh -c) and a post-beta worktree for the different-name notice stage.` Accepted: the command quoting correction preserves the expected gamma/exit-7 result at `runOnce`'s actual `sh -c` boundary. A worktree created after the beta push makes its merge-base contain beta, matching the real `verify --known-red` base selection. Both corrected cases pass in the post-change targeted and full runs. Existing regression expectations are unchanged.

## Nits and operator actions

No reusable Nit or operator action. The trailer's descriptive case count does not affect execution or merit a separate finding.

## check.repair — 2026-11-11

Started from reviewed head `b73a4cefb50e86225a6e2d1a0f976c74da49c147`; read both initial reviews. A has no Fixes. B's F1 and F2 are the complete repair scope.

### F2 repaired

Commit `01f71d9ab6c4cd1a05e1e4745a89a8bd8e87e93f` changes only the existing verify paragraph in `src/AREA.md:17`.

Before: "a red entry also records `failures`". The paragraph did not name the excluded entry kinds or older-version parse failure.

After: "only an entry whose own command ran and exited non-zero records `failures`", "green, `blocked`, reused and setup-failed entries carry none", and "an akrogon older than this change cannot parse a ledger holding the field". It also explicitly excludes `(log gone)`. The existing stored-first reader and receipt non-reader rules remain in the same paragraph. Read the final paragraph against C6 and D5.

The existing planned C6 proof passed after the edit, with the required flocked setup prepended:

```sh
akrogon run-check --name stored-failures-c6 -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && grep -n "failures" docs/reference/files.md src/AREA.md && bun test tests/docs-links.test.ts'
```

`check stored-failures-c6: 0 /home/ivan/Work/infra/akrogon/issues/open/failure-identity/stored-failure-names/implementation/check-stored-failures-c6-1794437242526-2428107.log`

Read that log back with `akrogon log`: the field descriptions were found and all 12 docs-link tests passed. `git diff --check` passed and the worktree is clean after the commit. This is a documentation repair with quoted before/after evidence, so no prose test was added.

### Handed to A

- **F1 / C2:** The skill assigns a missing proof case using existing machinery to A. Use the isolated fixture, `verify` helper and `flakyLines` or flaky CLI to cover a real verify-written red followed by a same-tree green after red evidence removal, record fail-before/pass-after, and update the C2 report. Existing machinery is present; no new runner, fixture factory, permission or live action is needed.

Only the C6 documentation input changed, so its planned proof was rerun. Earlier C1/C3/C4/C5 evidence remains applicable; F1 remains unresolved. No full verify or merge check was run because this pass hands off to `check.fix`. No paid/live operation, reusable Nit or operator action is outstanding.

## check.review re-check — 2026-11-11

Prior reviewed base: `ec988c5cb1bc4996d48515cdb16e078e0edc2576`.
Prior reviewed head: `b73a4cefb50e86225a6e2d1a0f976c74da49c147`.
Handed-off base remains `ec988c5cb1bc4996d48515cdb16e078e0edc2576`.
Reviewed repair head: `d44920b8d45e0713450b374d9f0ec18bce5a2112`.
Verdict: **ready**. F1 and F2 are resolved. No repair-introduced defect, reusable Nit or operator action remains.

### Repair scope and findings

- **F1 resolved:** `d44920b8` adds the actual producer-to-consumer scenario in `tests/verify.test.ts:2182`. The verify CLI writes a red row, a fixture-owned external marker permits a green run without changing the tree, the red log is removed, and both `flakyLines` and the flaky CLI report `alpha`. The fixture never packs logs, so no archive survives the removal. The test asserts the two tree IDs match and both command exits are the expected observations. It adds no mocked product unit or new machinery. The plan and report now include the chained proof.
- **F2 resolved:** `01f71d9a` completes the AREA verify paragraph with own-command execution, green/blocked/reused/setup exclusions, sentinel exclusion and the older-version parse cost. Read the final paragraph against criterion 6 and the files reference. Listed the AREA's concrete source, test and documentation paths in one shell invocation from the repository root; all exist. This repair changes the documented field contract only.

Computed the range-diff myself after the reported refresh:

```sh
akrogon run-check --name checkreview-range -- git range-diff ec988c5cb1bc4996d48515cdb16e078e0edc2576..b73a4cefb50e86225a6e2d1a0f976c74da49c147 ec988c5cb1bc4996d48515cdb16e078e0edc2576..d44920b8d45e0713450b374d9f0ec18bce5a2112
```

`check checkreview-range: 0 /home/ivan/Work/infra/akrogon/issues/open/failure-identity/stored-failure-names/implementation/check-checkreview-range-1794437492227-2923958.log`

Read the log back with `akrogon log`: all five initially reviewed commits are unchanged; only `01f71d9a` and `d44920b8` were added. Reviewed those repairs only. No main commit or conflict resolution entered the range.

### C2 fail-before/pass-after evidence

A's new case and green run resolve the missing chained case, but its report did not include that case's red run on the original base. B supplied that evidence here without changing the leaf branch: created a detached temporary worktree at `ec988c5c` under `$TMPDIR`, copied the current `tests/verify.test.ts` into it, ran the required flocked setup, then ran `bun test tests/verify.test.ts --test-name-pattern 'flips to green on the same tree'` through `akrogon run-check --name checkreview-c2-base`. An EXIT trap removed the temporary worktree and directory. A subsequent filesystem read and Git worktree listing confirmed both absent.

`check checkreview-c2-base: 1 /home/ivan/Work/infra/akrogon/issues/open/failure-identity/stored-failure-names/implementation/check-checkreview-c2-base-1794437492895-2924172.log`

Read the log back with `akrogon log`: both verify observations and the same-tree assertion pass before the consumer assertion fails, returning `(log gone)` instead of `alpha`. The runner ends normally with exactly this case failing. This is the expected leaf-caused red required by C2, not a configured-check failure or unrelated known-red.

The unchanged current case passes in A's `check checkfix-c2: 0` log `check-checkfix-c2-1794437316115-2500081.log`, also read back with `akrogon log` (1 pass, 9 assertions). Together these runs prove the locked C2 scenario before and after the implementation.

### Other verification and test trailer

- **V7:** Read `check-checkfix-targeted-1794437325288-2509148.log` (8 pass) and `check-checkfix-c5-1794437326041-2512223.log` (7 pass) with `akrogon log`. They include the new case and the existing writer, schema, notice, receipt and legacy-log cases after the latest test change. No earlier planned case was disabled or replaced. C6 retains the passing proof from B's documentation repair; its inputs have not changed since.
- **V8:** Receipt `ebfa3aa8-ceb9-4422-9cae-3c43d5603eba` records the reviewed repair head with format, typecheck and test all exit 0. Read `check-format-1794437330658-2515647.log`, `check-typecheck-1794437333192-2515647.log`, and the summary of `check-test-1794437393760-2515647.log` through `akrogon log`: 1178 pass, 0 fail. The branch is clean and `git diff --check` passes. Reused these current results without repeating the full suite.
- **T4 — `d44920b8`:** `Test-Change: tests/verify.test.ts added the verify-to-flaky chained case required by check-issue F1 (criterion 2's real producer-to-consumer scenario); no existing expectation changed.` Accepted: it adds exactly the missing criterion case, preserves every existing expectation, and now has the concrete base-red and repaired-head-green evidence above. Earlier trailers T1–T3 retain their recorded judgments; the documentation repair needs no test trailer.

All short log names above refer to this leaf's `implementation/` directory. No paid or live operation was launched. The only new proof used isolated local fixtures, all temporary review resources were removed, and no code or commit was changed during re-check.
