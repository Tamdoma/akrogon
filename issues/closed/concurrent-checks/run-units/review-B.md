# Review B — 2026-10-14

Base: ca023641f2945cb8902ebccbf9b6314c77027df4
Reviewed head: 95010f3d7e44fd02db1b140f307813b5de42a33d
Verdict: fix

Blind initial review. Debate is off, so no positions/rebuttal artifacts exist. Read brief, amended plan/design, report, readiness grant, reference index, affected docs and complete initial diff. No code changes or commits.

## Fixes

### F1 — base-run escapes the owning leaf slice

Location: src/base-run.ts:166.
Real source: a review seat runs the documented top-level `akrogon base-run --base <sha> -- <command>` from its leaf worktree. callerLeaf resolves the owner, but runSlice receives literal `akrogon.slice`; both the guard and command therefore become siblings of the leaf slice. `akrogon stop <slug>` (src/stop.ts:52) stops only leafSlice(repo, slug). The base command and its descendants survive that leaf stop. This breaks brief What, C4's same kind of unit, plan D3 and the documented leaf-stop guarantee.

Use the resolved leaf's slice. The current base-unit test overrides AKROGON_RUN_SLICE, masking this default-placement defect. Required proof must exercise the ordinary base-run placement without the override or assert its default argv at the CLI boundary.

### F2 — cleanup tests fail under their own run wrapper

Locations: tests/run-units.test.ts:253 and :411.
Real source: the configured test command runs through run-check. Once this implementation is installed, that command itself owns a live akrogon-run scope. Both assertions list every `akrogon-run-*.scope` on the host and demand an empty result, including the enclosing check and independent seats' runs. Tests fail even though the fixture's scopes were cleaned up. This breaks C8 and concurrency isolation.

Reproduced on the reviewed head with the actual new CLI: `AKROGON_RUN= AKROGON_RUN_SLICE=akrogon-test-review-b-1000-227698.slice bun src/akrogon.ts run-check --name review-proof -- bun test tests/run-units.test.ts --timeout=30000`. Exit 1, 8 pass / 2 fail. Both failures received the outer scope `akrogon-run-24f9bc24-7c4b-4680-baa0-4a480aea146a.scope` instead of []. Evidence: implementation/review-B-scoped-tests.log. Check only units this fixture created. This is caused by the leaf diff, so no retry/base comparison applies. Correcting an existing test expectation belongs to A under the repair rules.

### F3 — new test mechanically rejects prose wording

Location: tests/run-units.test.ts:520.
Source/check gap: the added C7 test rejects the prose strings `recorded PID` and `by the PID it recorded`, independently of whether the skill's executable stop command is correct. The design explicitly requires no wording tests on skill prose, and check-issue rejects these checks except executable commands, numbers and fixed references. A valid explanatory rewrite mentioning the previous rule can fail this gate without changing behavior. Remove the prose wording assertion and assess C7 by review. Assertions about literal executable commands can stay.

### F4 — wrapper-death proof does not enforce the criterion's deadline

Location: tests/run-units.test.ts:367-378.
Criterion gap: C3 requires an inactive unit and zero descendants within TimeoutStopUSec + 5 seconds after the signal. The test separately permits 10 seconds for scope inactivity, another 10 for guard inactivity, then another 15 for descendants to drain. The final empty-cgroup assertion has no elapsed-time limit measured from the kill. A late descendant cleanup can pass despite violating the named outcome, so the reported green test does not prove C3. Use one deadline measured at signal delivery and verify both unit state and descendant absence within that deadline, for both signals. This is a proof correction, not evidence that the current guard actually takes too long.

## Verification

- Existing final-head report and retained log: test 902 pass / 0 fail on 1c41d05, format and typecheck exit 0. The two later commits only add Test-Change trailers, with no tree changes (`git diff 1c41d05..HEAD` empty), so this evidence remains current for the files tested.
- Missing current test_changed evidence supplied by B using the exact printed config command, AKROGON_BASE=ca023641f2945cb8902ebccbf9b6314c77027df4: exit 0, 888 pass / 0 fail, 45 files, 158.43 s. Log: implementation/review-B-test-changed.log. This installed CLI run passes, while the new scoped CLI reproduction above fails, exposing the integration gap.
- Setup before the extra dependency-using proof: flock on git's akrogon-install.lock, bun install --frozen-lockfile, exit 0.
- Changed AREA paths listed from repository root in one command for each document. All source, test, skill and reference pointers exist. Missing issues/base-runs.jsonl, issues/red-records.jsonl, issues/timings.jsonl, issues/config.yaml and issues/merge-attempts.jsonl describe runtime records or registered-checkout configuration, not missing checked-in implementation pointers. No dead-pointer Fix.
- Docs opened: README command table, docs/guide/setup.md, docs/guide/next.md, src/AREA.md, tests/AREA.md and changed skills. The base-run leaf containment claim is assessed in F1. No merge_checks exist. No lesson removal is in the diff.
- Initial pre-implementation red evidence exists in the plan/report. Test-Change trailers below cite the operator amendment for removed memory/spacing expectations and stdout parser regressions for the stderr change. These sources justify those changes. The final tree has no uncommitted code changes.

## Grant and cleanup

Used readiness.yaml grants[0], local ivan uid 1000, systemd user manager, only transient scopes/services beneath akrogon-test slices. Scoped proof run ID: 24f9bc24-7c4b-4680-baa0-4a480aea146a. Created outer slice akrogon-test-review-b-1000-227698.slice and its name-hierarchy parents. Test processes created akrogon-test-227914-{0,1}.slice (scoped proof) and akrogon-test-304849-{0,1}.slice (changed check). Creation and fixture cleanup confirmed in the user journal. Tests removed the numbered children but left the parent slices active. B stopped only those owned parent slices and the owned review hierarchy. Authenticated list-units --all read-back for those exact names/patterns printed nothing, exit 0. Other preexisting akrogon-test slices were left untouched. No retained fixtures or operator actions.

## Test-Change trailers

All trailers in base..HEAD are reproduced below with their commit context. Grouped-path citations were supplemented by the final per-path trailer-only commits. Sources accepted as described above, with F2-F4 addressing defects in the current proof independently of trailer validity.

```text
95010f3 test: cite helpers and run-permit individually
Test-Change: tests/helpers.ts — AKROGON_SPACING_MS dropped from admissionEnv in 81196b3 and the dead admissionEnv removed in ec4ef70 under the operator memory-check amendment
Test-Change: tests/run-permit.test.ts — wait/spacing/threshold assertions superseded by the operator 2026-10-14 amendment, inverted to immediate-start asserts (81196b3, a26774a, ec4ef70)

6cc737b test: cite remaining changed test files
Test-Change: tests/AREA.md — the run-permit/run-units blurbs were updated when the operator amendment removed reservations and spacing (commit 81196b3)
Test-Change: tests/check-names.test.ts — the empty-stderr assert widened to 'only the run line' when run <id> moved to stderr (commit b3e2532)
Test-Change: tests/run-check.test.ts — same stderr assert widening (commit b3e2532)

1c41d05 Apply prettier output from the final format check
Test-Change: tests/run-units.test.ts — prettier reflow only, no expectation changed

6f82675 Pin XDG_RUNTIME_DIR and the bus address in the test's systemctl helper
Test-Change: tests/run-units.test.ts — the run-check environment strips
XDG_RUNTIME_DIR and cuts the session bus, so sysctl() now supplies both;
is-active flakes in the check run came from systemctl with no bus

a26774a Drop the dead cgroup-root env from the no-stat permit test
Test-Change: tests/run-permit.test.ts — AKROGON_CGROUP_ROOT is gone from
code, so the pointed-at empty root proves nothing; the test just asserts
a plain run succeeds

ec4ef70 Remove the dead cgroup-root seam from test spawns
Test-Change: tests/run-units.test.ts, tests/run-permit.test.ts,
tests/helpers.ts — AKROGON_CGROUP_ROOT no longer exists in code, so
spawns stop passing it and admissionEnv is removed; seedStat/statPath
stay only as ignored-stat proofs

81196b3 Drop the memory start check and start spacing (operator amendment)
Admission registers the run record and starts at once: usage(),
memory.stat, the 48 GiB limit, RUN_GIB peer reservations, the 30 s
spacing (AKROGON_SPACING_MS, last-start) and the admission flock are all
gone. run records, the run <id> stderr line, the stale sweep, nested
identity and stop-run stay.

Test-Change: tests/run-permit.test.ts — the wait/spacing/threshold
assertions are superseded by the operator 2026-10-14 amendment (brief
criterion 5 replaced); tests now prove starts at once over the old
reading, ignored spacing overrides, no status waiter lines, immediate
starts with memory.stat missing, and unmatched AKROGON_RUN tokens
starting their own runs
Test-Change: tests/run-units.test.ts — the reservations test is
superseded by the same amendment; it now proves starts at once over the
old 48 GiB reading inside the old spacing window; seedUnitStat and the
per-launch stat seeding are removed
Test-Change: tests/helpers.ts — AKROGON_SPACING_MS dropped from
admissionEnv since the env var no longer exists in code

ab14720 Reach the user bus when the caller's session bus is cut; unflake record counts
stopRunUnits and stop-run's stop pin DBUS_SESSION_BUS_ADDRESS to a verified
socket (sessionBusAddress), since a run launched from inside a check sees
only the cut bus. The test file routes its systemctl calls through env -u
for the same reason and counts only outer/inner records for the nested
assertion.

Test-Change: tests/run-units.test.ts adds sysctl() (env -u DBUS…) for every
systemctl touch, drops the dead-bus override on the seeded scope spawn, and
scopes the nested record assertions to check names — is-active failures and
sibling leftover records made absolute counts racy; no expectation semantics
changed

5c84e51 Apply prettier output from the format check

fd938a8 Wait for unit activation before teardown assertions
Test-Change: tests/run-units.test.ts adds waitActive() after the cgroup dir
appears and drains cgroup.procs with a poll instead of a snapshot. Under the
full suite, is-active is non-zero for 'activating' units, so the teardown
window raced the kill; no expectation semantics changed

7ce8e2b Fall back to the runtime bus when the session bus is a dead socket
run-check cuts DBUS_SESSION_BUS_ADDRESS for its children, so a check that
spawns its own akrogon runs inherited the dead address and systemd-run
could not reach the user manager. sessionBusAddress now trusts the env
address only when its unix socket exists.

bcb122c Drop the unused boot argument from peerReservations

b3e2532 Move the run line to stderr; checks keep a clean stdout
run <id> and the stop-run listing now write to stderr so a check command's
stdout stays machine-parseable (18 changed-tests failures were all stdout
line-offset and JSON-parse breakage), matching the existing waiting-to-start
precedent.

Test-Change: tests/run-units.test.ts asserts the run line on stderr and the
bare stop-run listing on stderr — run-check stdout is now reserved for the
boxed command's output, per the stderr-move decision
Test-Change: tests/check-names.test.ts and tests/run-check.test.ts widen their
empty-stderr asserts to 'only the run line' — the run line is sanctioned
stderr signal; no other expectation changed

da42807 docs: name akrogon stop-run in skills and guides, document run units and reservations

3fbd8b6 Fix unit stat paths for nested slices and reap dead wrappers' records
Slices nest by name (a-b-c.slice under a.slice/a-b.slice), so reservation
stats and the test's unitDir expand the chain below akrogon.slice.
systemctl resolves a bare unit name to .service, so the guard stops
<base>.scope, and stopRunUnits stops one unit per call so a missing name
cannot abort the sibling stop. The guard also removes the run record on
wrapper death: a killed wrapper's finally cannot run, and a lingering
state=live record misleads the next run's readers until the sweep.

Test-Change: tests/run-units.test.ts revised brief-1 section 4 authorizes
the unitDir chain expansion

f7ae65e Box run-check and base-run in run units with guard, reservations, stop-run and stale sweep
Each top-level run-check/base-run gets akrogon-run-<id>.scope under the
run slice plus a -guard service that reaps the scope when the wrapper
dies. Admission reserves 16 GiB per live run minus measured unit usage,
prints run <id> once held, sweeps stale records and their units, and
release() ends the record before cleanup. akrogon stop-run [<id>] stops
only runs whose record scope equals the caller scope.

Test-Change: tests/run-permit.test.ts brief-1 section 4: denial reason
shape widened to 'anon+shmem <u> GiB + runs <r> GiB >= 48 GiB'

dbdb89c test: order bare stop-run refusal before its stop and wait for the released record
Test-Change: tests/run-units.test.ts moves the bare 'refuse while two match' step ahead of the a1 stop so both records deterministically exist, and polls for the a1 record's removal before the bare single-match step; the wrapper's release can lag unit stop, so the old order raced. No expectation semantics changed — the same refusals and stops are asserted, in an order that matches how records actually disappear.

ba450a3 test: prove run units, stop-run authority, wrapper-death reaping, base-run units, reservations and sweep
Test-Change: tests/helpers.ts adds unitBin and a fixture-managed fake systemd-run PATH shim plus an AKROGON_RUN scrub in cli() and fakeAkrogon() so run-check spawns stay virtualized unless a test opts into real units; no existing expectation changed
Test-Change: tests/command-reference.test.ts adds the stop-run [<run-id>] contract row for the new verb; no existing expectation changed
Test-Change: tests/run-permit.test.ts scrubs AKROGON_RUN and prepends the fake systemd-run bin in run() so its spawns match cli() semantics; no existing expectation changed

```

## check.repair — 2026-10-14

Start/reviewed head: 95010f3d7e44fd02db1b140f307813b5de42a33d.
Repair head: 6bc5faf057a7536f8d5b44f01bcde517a4bff910.

Repaired A/F1 in its own commit 6bc5faf (docs: describe immediate run starts and registration timing). Before: README run-check/base-run said "starting it once the start check admits it"; files.md described wait_ms as "the time spent waiting for the start check". After: both command rows say "Register the run, start a command at once"; files.md says "the time spent registering the run before its immediate start". The latter follows admission.ts: begun is recorded before writeRecord, wait_ms is computed immediately before fn. Only those three lines changed. git diff --check passed. No new test is needed for this documentation correction.

### Handed to A

- B/F1: default base-run slice correction and its reproduction/proof. The current planned real-unit test masks default placement with AKROGON_RUN_SLICE. Fixing this requires the missing ordinary-placement test and live containment proof, assigned to A by check.repair. Product code left unchanged.
- B/F2: correct the two existing global-empty cleanup expectations to check owned fixture units. Existing test expectation corrections belong to A. Re-run through the new scoped CLI as in the initial finding, not only through the installed older wrapper.
- B/F3: remove the existing prose-wording assertion. This corrects an existing test expectation and belongs to A.
- B/F4: correct the existing wrapper-death test to use one deadline from the signal for inactivity and descendant absence. This changes its existing acceptance expectation and requires a current real-unit run, both assigned to A.

No plan/design changes, no operator actions. The existing proof harness is available; F4 is an acceptance-test correction, not absent evidence machinery.

### Repair verification

All commands ran from /home/ivan/.akrogon/worktrees/akrogon/run-units at 6bc5faf, with AKROGON_BASE=ca023641f2945cb8902ebccbf9b6314c77027df4 for printed checks. The configured setup ran under git's akrogon-install.lock. No merge_checks ran.

- Planned proof command `bun test tests/run-units.test.ts tests/command-reference.test.ts`: 15 pass / 0 fail, exit 0, 8.58 s. Log: implementation/repair-B-planned-proof.log. This executes the planned C1-C7 tests, including real-unit nesting, stop authority, SIGTERM/SIGKILL, base-run setup/command, immediate admission, flags and sweep. C7 was also manually reviewed in the three skill files. F1-F4 still limit this proof as stated above.
- Printed format check: exit 0, implementation/repair-B-format.log.
- Printed typecheck check: exit 0, implementation/repair-B-typecheck.log.
- Printed full test check: exit 0, 902 pass / 0 fail, 50 files, 252.30 s, implementation/repair-B-test.log.
- The planned proof, format and typecheck first attempts exited 1 with ENOENT because the inherited TMPDIR /tmp/akr-1000/5d20/358c1156 no longer existed. This has no cause in the docs-only repair or initial run-unit diff. First logs preserved as repair-B-<name>.first.log and one comparison record per command written before its only retry. Recreated the expected leaf temp directory, retried with the same command arguments/cwd; all green. Records mark inconsistent and retain the initial startup stage plus green retry. No base run and no known-red claim. JSON/YAML records validated through parseComparison. These initial failures exercised no product test outcome.
- The installed akrogon CLI still has main's old admission queue and lacks run scopes. Its configured checks pass without addressing B/F2. A must also rerun the new scoped CLI boundary from B/F2 once its expectation corrections land.

Grant: readiness.yaml grants[0], local ivan uid 1000, only test-owned transient scopes/services under akrogon-test slices. Planned proof created akrogon-test-4164116-{0,1}.slice; full suite created akrogon-test-212947-{0,1}.slice. Fixture cleanup removed numbered slices; B stopped their owned parent slices after each terminal result. Authenticated systemctl --user list-units --all for those exact parent/child names printed nothing, exit 0. No peer units were stopped, no fixtures retained.

- Final printed test_changed check: first exit 1, 887 pass / 1 fail, 206.96 s, unchanged tests/next.test.ts owner-resolution scenario timed out at 60000 ms. One exact-command whole-selection retry exit 0, 888 pass / 0 fail, 165.25 s. First/retry logs: implementation/repair-B-test_changed.first.log and implementation/repair-B-test_changed.log. Comparison record written before the retry, completed as inconsistent in implementation/compare-repair-B-test_changed.yaml. Inspected the scenario: it invokes next for owner-name/path equivalence across root/subfolder/worktree, not run-check or base-run. No changed owner-resolution/dispatch implementation or test and no plausible cause from the added run shim. No base run and no known-red claim. This is the same timeout unit A noted in its initial review.
- Changed-test first/retry fixture slices: akrogon-test-929985-{0,1}.slice and akrogon-test-1590799-{0,1}.slice. B removed only their owned leftover parent slices after each terminal result. Final authenticated list-units --all read-back covering all four repair proof/check parent/child sets printed nothing, exit 0. No retained resources.

Repair result: A/F1 docs fixed in 6bc5faf. All printed checks and planned proof commands green, with initial unrelated errors and their single retries preserved. B/F1-F4 remain handed to A. No reusable Nit is being carried by B and no lesson write is required. Requested phase: check.fix, slot A.

## Re-check after check.fix — 2026-10-14

Prior reviewed base: ca023641f2945cb8902ebccbf9b6314c77027df4.
Prior reviewed head: 95010f3d7e44fd02db1b140f307813b5de42a33d.
B repair head: 6bc5faf057a7536f8d5b44f01bcde517a4bff910.
Reviewed repair head: 2dbcf9942afc8c9f06f028dc982953bea639ee16.
Verdict: ready.

Reviewed only 95010f3..2dbcf99, including B's already-verified documentation fix and A's base-run/test repairs. Branch was not refreshed or rebased, so no range-diff is needed. This handoff did not follow a rejected merge check, so no merge replay is required. No new defects or Nits introduced by repair.

### Findings resolved

- A/F1: README and files.md now describe immediate start and registration timing, matching the amended C5 and current admission code. B commit 6bc5faf remains intact.
- B/F1: src/base-run.ts now passes leafSlice(repo, leaf.state.slug) into runSlice, used by both scope and guard. New CLI-boundary test asserts default placement without AKROGON_RUN_SLICE through the existing fake-systemd-run argv seam. Report records reproduction b436566 red before c1827c7 and green after. This meets the original finding's permitted default-argv proof and removes the leaf-stop escape.
- B/F2: both cleanup assertions filter by cgroup membership in the fixture's slice, excluding the enclosing check and peer scopes. The latest scoped CLI run below passes those assertions with a live enclosing run, reproducing the exact prior failure boundary.
- B/F3: the prose-wording assertion was deleted. Remaining assertions concern executable commands. Manual review confirms all three skills use stop-run and retain the pattern-kill ban.
- B/F4: one 10000 ms deadline after signal delivery now controls the polling for scope inactivity, guard exit and descendant drain. Scope inactivity and descendant absence are asserted at that deadline. Both SIGTERM/SIGKILL cases passed with the long sleepers still unable to end naturally in that window.

### Evidence

A's retained repair logs: check-test-1791967067820-2009134.log, 903 pass / 0 fail, 132.09 s; check-test_changed-1791967830556-3080996.log, 889 pass / 0 fail, 124.89 s; check-typecheck-1791966847527-2009140.log and check-format-1791966907651-2009144.log, exit 0 per report. These use the configured check commands. No planned test was skipped, filtered out or disabled by the repair. Formatter commit 2dbcf99 only reflows the new default-placement test, with no behavior/expectation change. B nevertheless supplied current proof after that last test edit.

B current proof at 2dbcf99: configured setup under git's akrogon-install.lock, exit 0; then the actual new CLI with AKROGON_RUN empty and AKROGON_RUN_SLICE=akrogon-test-recheck-b-1000-4032021.slice, `bun src/akrogon.ts run-check --name recheck-proof -- sh -c '<print diagnostic; exec bun test tests/run-units.test.ts>'`. Exit 0, 11 pass / 0 fail, 57 assertions, 9.44 s. Full output: implementation/recheck-B-scoped-proof.log. The diagnostic PID text was shell-transformed to a literal dollar sign, so ownership is grounded in the authenticated unit journal rather than that line. No product assertion relies on it. This proof covers every repaired acceptance test, including the new default base placement and both signal deadlines. No additional full-check rerun is justified after this formatting-only change. git diff --check passed and worktree is clean.

Grant: readiness.yaml grants[0], local ivan uid 1000, only owned transient scopes/services beneath disposable akrogon-test slices. Outer run ID b85c11e8-8219-4944-a488-89bfcff31fe5. Authenticated read-back shows its scope and guard not-found/inactive. Journal identifies the owned test slices akrogon-test-4032549-{0,1}.slice and owned recheck hierarchy. Tests removed numbered child slices. B stopped only their owned leftover parent and the owned recheck hierarchy. Final systemctl --user list-units --all for the exact test parent/child names and owned recheck prefix printed nothing, exit 0. No peer unit was stopped, no retained fixture or operator action.

### Repair Test-Change trailers

Sources accepted: B/F1 supplies the real documented base-run action; B/F2 supplies the recorded scoped-CLI failure; B/F3 cites the design's prose-test exclusion; B/F4 cites C3's deadline. Formatter trailer carries no semantic expectation change. Each behavior reproduction/fix remains separate. Trailers in prior reviewed head..current head:

```text
2dbcf99 Apply prettier output from the format check
Test-Change: tests/run-units.test.ts — prettier reflow only, no expectation changed

4cd7788 Scope cleanup assertions to the fixture slice and correct the reap deadline
Test-Change: tests/run-units.test.ts — B review F2: 'no akrogon-run scopes left' asserted on host-wide list-units fails under the new scoped run-check wrapper; assertions now count only units with a cgroup under this file's test slice. B review F4: SIGTERM/SIGKILL proof now enforces one deadline measured at the signal covering unit inactivity, guard exit and descendant drain, per the brief's TimeoutStopUSec+5s criterion. B review F3: prose-wording assertion on skill text removed; executable-command assertions stay

c1827c7 Place base-run units under the resolved leaf slice
Base-runs used literal akrogon.slice, so 'akrogon stop <slug>' could not
end them and they escaped the leaf's containment. runSlice now receives
leafSlice(repo, leaf.state.slug), matching run-check.

b436566 test: reproduce base-run placing its scope outside the leaf slice
Test-Change: tests/run-units.test.ts adds a base-run assertion at the CLI
boundary via the fake systemd-run seam; B review F1: a documented
'akrogon base-run --base <sha> -- <cmd>' from a leaf worktree puts its
scope and guard under akrogon.slice, so 'akrogon stop <slug>' cannot end
them — red on this head

6bc5faf docs: describe immediate run starts and registration timing

```

## Merge — 2026-10-14

Attempt: 3a254162-d709-4e19-8fd2-77d714dd2e81. Built on / refreshed AKROGON_BASE: ca023641f2945cb8902ebccbf9b6314c77027df4. Recorded and tested candidate top: 2dbcf9942afc8c9f06f028dc982953bea639ee16. Applied stack, no carried members. No fetch/rebase or commits. Initial worktree clean. Four checks required, no merge_covers, merge_checks or advisory commands. Exact commands below, from the existing leaf worktree:

format:
```sh
AKROGON_BASE=ca023641f2945cb8902ebccbf9b6314c77027df4 akrogon run-check --name 'format' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run format'\''' > /home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/run-units/implementation/merge-B-format.log 2>&1
```
typecheck:
```sh
AKROGON_BASE=ca023641f2945cb8902ebccbf9b6314c77027df4 akrogon run-check --name 'typecheck' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run typecheck'\''' > /home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/run-units/implementation/merge-B-typecheck.log 2>&1
```
test:
```sh
AKROGON_BASE=ca023641f2945cb8902ebccbf9b6314c77027df4 akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\''' > /home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/run-units/implementation/merge-B-test.log 2>&1
```
test_changed:
```sh
AKROGON_BASE=ca023641f2945cb8902ebccbf9b6314c77027df4 akrogon run-check --name 'test_changed' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\'': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'\''' > /home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/run-units/implementation/merge-B-test_changed.log 2>&1
```

Completion owner: concurrent-checks. Read ISSUE.md and all three leaf briefs. memory-start-check and worker-test-duty already merged. The operator amendment in run-units supersedes the earlier memory/spacing gate, so the completion update will describe immediate starts, not the obsolete gate. Broadcast only after a completion line.

Merge format and typecheck: exit 0, respective merge-B-format.log and merge-B-typecheck.log. Full test first run: exit 1, 874 pass / 29 fail, 179.44 s; all 29 failed units timed out in unchanged tests/batch-dispatch.test.ts. The stack does not change batch implementation or this test. Read its fixture/next/merge path; the added fake systemd-run shim does not run in these batch tests and has no plausible cause for their timeouts. Wrote comparison record before the exact-command whole-suite retry. Retry exit 0, 903 pass / 0 fail; result inconsistent, no base run or known-red claim. Both logs retained in implementation/merge-B-test.first.log and merge-B-test.log. The attempt-bound record implementation/merge-B-compare-test.yaml records every failed unit and both outcomes.

Final merge results: format exit 0, typecheck exit 0, full test retry exit 0 (903 pass / 0 fail, 143.00 s), test_changed exit 0 (889 pass / 0 fail, 133.52 s). No code or integration change between runs. All required check logs are implementation/merge-B-<name>.log; failed first full test retained separately. HEAD remains the recorded top and worktree is clean. `akrogon phase run-units merged --slot B --check --attempt 3a254162-d709-4e19-8fd2-77d714dd2e81` returned ok. The inconsistent retry record is retained as evidence, not a known-red waiver, so none is attached to the green stamp.

Grant readiness.yaml grants[0]: local ivan uid 1000, systemd user manager, only owned transient test fixtures. First full-suite, retry and changed-suite processes created akrogon-test-641070-{0,1}.slice, akrogon-test-1244056-{0,1}.slice and akrogon-test-1761369-{0,1}.slice. Journal proves ownership and child-slice cleanup. B stopped only those owned leftover parent slices after each terminal result. Final authenticated list-units --all read-back for all exact parent/child names printed nothing, exit 0. No retained resources, peer units untouched. Existing repo red entries inspected; none matches both current passing file and test name, so no unsupported green resolution record was submitted. The temporary empty match inventory was removed.

Gathered completion owner concurrent-checks ISSUE.md and all leaf briefs. Ready to push tested candidate through the command, then broadcast only the completion line it returns.
