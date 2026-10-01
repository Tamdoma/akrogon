# Intake: test-time-and-temp

## Scope
Destination akrogon. Seats spend test time only on failures their leaf owns, and leaf temp files live on disk and are removed with the leaf. Two forks: check-proof (#50) and leaf-temp (#49).

## Provenance
- GitHub: Tamdoma/akrogon#49
- GitHub: Tamdoma/akrogon#50
- Operator: chart-issues door 2026-10-01

## Source: operator 2026-10-01
Look at the incoming pooled issues. I really want to get this fixed because there is a lot of time going away on these tests that are sometimes stupid and meaningless and just take too long to carry out. Please look at all of the issues find systemic and core problems that need to be resolved and then resolve them. Also look at the Tmp folder problem. This needs to be resolved graciously, without overcomplicating the system or adding new mental model strains. For this use both slot B and slot C consultants. They are already there, so you can use the active panes next to you.

## Source: Tamdoma/akrogon#49
# Seats and workers leave temp folders in /tmp forever; give each leaf its own TMPDIR on disk and delete it when phases and leaves end

Source: Tamdoma/akrogon#49
URL: https://github.com/Tamdoma/akrogon/issues/49

Unverified intake.

## Observation
On 2026-10-01 the operator machine's `/tmp` reached 98% of its inode limit (1,026,087 of 1,048,576 used, 22k free) while tamdoma/framework leaves were running. `/tmp` is a RAM tmpfs (`size=62G, nr_inodes=1048576`). The operator keeps the machine on for days or weeks, so leftovers accumulate until something fails.

What filled it (inode counts from `find | wc -l`):

| Path | Inodes | Origin |
|---|---|---|
| `/tmp/claude-1000/<framework>/c3ccb36d.../scratchpad` | 265k | an old Claude session scratchpad, untouched since 2026-09-30 |
| `/tmp/fixB-spine-manual` | 68k | emdash-conversion fix-B debug copy, left after merge |
| `/tmp/u9-debug` | 66k | emdash-conversion u9 debug copy |
| `/tmp/tmp.pBXnOyaZh9`, `/tmp/tmp.CWVaJO1EfF` | 66k each | `mktemp -d` fixture copies, owner unknown |
| `/tmp/fixture-*` (several) | 66k each | test fixtures holding a full `node_modules` |
| `/tmp/tamdoma-hooks-spec-*` | 560 dirs | hook self-test temp state |

Each project or fixture copy that includes `node_modules` costs about 66k inodes. Fifteen of them fill the limit.

Seats, implement workers and tests create these through `mktemp`, `os.tmpdir()`, Bun and Chrome profiles, and through ad-hoc debug folders. Nothing deletes them when a phase or leaf ends. The operator's hourly `tmp-clean` timer deletes only known name patterns (`fixture-*`, `pretool-*`, `tamdoma-hooks-spec-*`, ...), so new names such as `u9-debug` or `tmp.*` survive. The system tmpfiles rule ages `/tmp` at 10 days.

Same day, a merge seat's `hooks:selftest` run stalled for 25 minutes at 95% CPU, with hook child processes left as zombies. The same commit passed in 90 s on rerun. Inode pressure was rising during that window. It is unproven as the cause, but it is a plausible contributor (`strategy-output-relocation/implementation/selftest-hang.md`).

## Location
- Seat launch and environment: `akrogon next` and herdr prompting.
- Implement worker dispatch: `implement-issue` subagents.
- Phase transitions and leaf end: `akrogon phase`, `merge-issue`, `close` and `park`.

## Reproduction
Run several leaves whose tests copy fixture projects with `node_modules` into the system temp dir, and debug in ad-hoc `/tmp/<name>` folders. Leave the machine on for a day. Watch `df -i /tmp` climb, with no owner deleting the leftovers.

## Expected behavior
Akrogon owns the temp space of the work it runs, and removes it automatically.

1. **Per-leaf temp dir on disk.** For each leaf, create `~/.cache/akrogon/<repo>/<slug>/tmp` (or a configurable root) and export it as `TMPDIR`, `TMP` and `TEMP` to both seats and every implement worker. Disk-backed btrfs or ext4 has no small inode cap, unlike the RAM tmpfs.
2. **Cleanup on phase end.** Clear the leaf temp dir when a phase finishes, so a leaf that runs for a day does not pile up copies.
3. **Cleanup on leaf end.** Delete the dir on merge, close and park. A failed leaf keeps its dir for diagnosis until it is recovered or closed.
4. **Guidance in skills.** `implement-issue` and `check-issue` tell seats and workers to write temporary files, logs and debug copies under `$TMPDIR`, never fixed `/tmp/<name>` paths.
5. **Visibility.** `akrogon status` shows per-leaf temp size, so growth is visible before it hurts.

Out of scope for akrogon, and kept as an operator-level backstop: an OS age-based sweep of `/tmp` for sessions akrogon does not run, such as standalone Claude sessions and manual runs. Test hygiene (tests delete their own temp folders) is tracked in tamdoma/framework#115.

## Urgency
High for long-running operator machines. At 98% inode use, any process creating files in `/tmp` fails, which can stall or fail every running seat at once. Workaround: manual cleanup by the operator.

## Source: Tamdoma/akrogon#50
# Check evidence is still unrecorded after #48, and seats cannot tell new failures from base failures

Source: Tamdoma/akrogon#50
URL: https://github.com/Tamdoma/akrogon/issues/50

Unverified intake.

## Observation
#48 was closed on 2026-10-01 at 08:21Z after three commits: `67b8ccf` (implement-issue SKILL.md), `a9b0cb4` (brief-template and worker-protocol) and `af8d363` (chart audit and docs). All three change skill prose only. Nothing under `src/` changed. #48 expected behavior items 1 to 3 are not built:

- No tool-written check record with check name, command, commit SHA, exit code, wall time and log path.
- No reuse by exact SHA.
- No merge refusal without a passing record for the final SHA.

The same day, on tamdoma/framework leaf `emdash-content-fixes`, implement seat A (session started 08:14Z, after the #48 merge, with skills linked to the akrogon repo) still spent about an hour on whole-folder test failures it did not cause:

1. Whole `dev-build-emdash/test` run: 123 pass, 38 fail. Most failures are `build-seed.test.ts` crashing in `setupProject`, and those tests pass when run alone. They fail only in whole-folder runs, which suggests cross-file interference.
2. `spine.test.ts` also fails on the base commit `27827b928` (the last emdash-conversion fix).
3. To find this out, the seat built its own base copy at `/tmp/edd-base-check` and compared results by hand.
4. One whole-folder rerun was killed by the seat's own 600 s tool timeout.
5. The operator had to stop the seat and tell it to treat base-red tests as pre-existing.

The seat ran whole suites because its plan asked for them. The plan was charted before #48:

- C8 requires `bun run framework:verify`.
- IN5 requires the new tests to stay green under the whole-folder `test:emdash-conversion`.

The new rule, "run `merge_checks` only at merge unless a done-criterion needs a whole run", therefore still allowed it.

## Location
- akrogon `src/` (check runner, `checks`, `merge_checks` in `src/config.ts`, merge path).
- `skills/implement-issue/SKILL.md` lines 48 and 62, `skills/check-issue/SKILL.md` line 51, `skills/merge-issue/SKILL.md`.
- Chart audit (`skills/chart-issues`) for leaves charted before the audit existed.
- Observed on tamdoma/framework `issues/open/emdash-cms/emdash-build/emdash-content-fixes` (plan.md C8, IN5).

## Reproduction
1. Have a base commit where some tests in a suite already fail, or fail only when the whole folder runs together.
2. Run a leaf whose plan names that whole suite or a repo-wide check in a done-criterion.
3. The implement seat reruns the suite and investigates every red test, including ones that fail on base.

Seen on `emdash-conversion` (#47, #48) and again on `emdash-content-fixes` after #48 merged.

## Expected behavior
Each check runs once per commit, a seat only spends time on failures its own commit introduced, and nothing untested merges.

1. **Build #48 items 1 to 3 in code.**
   - A runner such as `akrogon check <name>` writes the record.
   - Seats reuse a passing record only for the exact head SHA.
   - Merge refuses to push without a passing record for the final rebased SHA.
   - Prose alone cannot be enforced, as this leaf shows.
2. **Record the base result too.** When a check fails, the runner runs the same check, in the same mode (whole folder versus single file), on the leaf's base SHA and records both. The report splits failures into:
   - new on head,
   - already red on base,
   - fixed by head.

   Only new failures block the leaf or need investigation. Base records are keyed by base SHA and reused by every leaf on that base.
3. **Leaves charted before the audit.** Starting a phase on a leaf whose criteria name a repo-wide or whole-folder suite flags it for an operator decision instead of running it silently. One option is narrowing the criterion to the leaf's own test files plus fast checks.

Problems to anticipate:
- **Flaky tests.** A test that fails on head but passes on base may be flaky. Rerun only the new failures once before blocking, and record both runs.
- **Interference-only failures.** Tests that fail only in whole-folder runs must be compared against a whole-folder base run, or they will look new.
- **Main stays red.** Base-red tests are no leaf's job, so nobody fixes them. A post-merge or scheduled main run should report the new base-red tests to the operator, for example as a herdr notification or a seeded issue (see tamdoma/framework#115).
- **Agent timeouts shorter than the check.** The 600 s tool limit killed a run of about 900 s. The runner should own the check timeout from config, not the agent's shell tool.
- **Temp residue.** Base and head copies of a fixture repo cost about 66k inodes each on tmpfs. Base runs should use the per-leaf temp folder from #49 and clean it up.
- **Records from a dirty tree.** A record must refuse an uncommitted worktree, so a SHA always matches what ran.

## Urgency
High.
- Every leaf charted before #48 can still spend an hour or more per seat on base-red or interference failures.
- Base red on tamdoma/framework main is still unowned.
- Workaround: the operator stops seats by hand and tells them to treat base-red tests as pre-existing and run only the leaf's own tests. That was done on `emdash-content-fixes` on 2026-10-01.

## Agent findings
See [slots/map-merged.md](slots/map-merged.md). Independent maps: slots/map-A.md, map-B.md, map-C.md.
