# Implementation report

Updated: 2026-10-27, slot B check.repair.
Base: `63c20f9859578c179a30dac9c6ab0ac648a6f62b`.
Initial reviewed head: `f87102aa97ac3f85db5d76a0086bcc10c4cd0058`.
Repair head: `defe1bc468fa6d333c660e50a7c5c003ab09ad14`.
The branch was not refreshed or rebased during repair.

## Delivered behavior

- `src/run-check.ts` writes separate stdout/stderr captures inside the holder before starting either held or nested commands, prints their paths before waiting, publishes the existing combined check log after completion, and removes captures only after publication. Read descriptors preserve bytes if the owner moves during execution. Refused publication keeps the run-root output and refusal record without recreating the owner.
- `src/flock.ts`, `src/pack.ts`, `src/pack-command.ts` and `src/phase.ts` coordinate shared capture locks with exclusive packing/completion locks. The completion lock covers packing and the owner move. Same-owner completion and packing refuse before waiting, naming the enclosing run.
- Repair distinguishes new ordinary/chart holders from existing issue owners. Only new holders are created. A failed lock acquisition for a vanished issue owner becomes the existing kept refusal. Target directories are created relative to an open owner directory through `/proc/self/fd`, so a concurrent rename cannot cause recursive creation to restore an open owner path.
- Nested checks carry the complete capture ancestry in the schema-validated `AKROGON_CAPTURES` JSON array. Self-close checks search from the innermost capture outward. Verify services explicitly inherit this field. The previous scalar `AKROGON_CAPTURE_OWNER` and `AKROGON_CAPTURE_RUN` fields are replaced by this one representation.
- The original docs change covers `docs/reference/checks.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `src/AREA.md` and `tests/AREA.md`. No user-facing command or completed result-line format changed during repair. `src/shell.ts`, reconciliation, timing schemas and receipt authority remain unchanged.

## Original implementation evidence

This report was absent at the initial handoff. Its original-pass account is reconstructed from committed code, `plan.md`, retained logs and the two worker briefs. No separate worker return summaries were present, so none are invented here. The mechanism landed in `1380b3e3`; docs landed in `7c16dd30`; later commits corrected fixtures, the pre-lock gone-owner check and the live-record slice scenario.

Planning recorded red runs in `plan.md`: `c1-capture` failed on missing captures/early capture lines, `c7-closepack` failed on the old self-close behavior, and `c34-runcheck` failed on the changed environment and capture location. These prove behavior against the old implementation, not current acceptance.

Before review, configured verify receipt `e5c670b3-f0ff-470c-bc63-ba9e27241ed8` completed green on `fe5c1d251f2f22001a811632c7d7107569b9a347`, whose tree equals the initial reviewed head's tree. Its full test run had 1,224 passes and no failures. B independently ran the plan's four-file rerun on the reviewed head: 38 passes, no failures, recorded and read back as:

`check review-b-current-proofs: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-check-log/durable-check-capture/implementation/check-review-b-current-proofs-1793120375929-1984862.log`

Original test corrections have `Test-Change` citations evaluated in `review-B.md`. They cover the binding self-close change, capture-line and environment contracts, real helper PATH/dotfile behavior, and keeping the live-record slice scenario reachable while owner completion waits. No planned test was skipped, filtered out of the configured suite, or disabled. No proof command was replaced with a different runner or reduced case set.

## Repair commits and reproductions

Each product bug has a reproduction committed before its fix. Only new reproduction cases were added. Existing test expectations were left for A where correction is required.

| Finding | Reproduction | Product repair |
| --- | --- | --- |
| Review A Fix 1: owner recreation race | `7e7af7c7`, fixture-layout correction `fa728dff` | `47915ee1`, stream-result type correction `defe1bc4` |
| Review B F1: first-use holder refusal | `4615aedb` | `9dde3fc0` |
| Review B F2 / review A N1: nested self-pack deadlock | `4ffeae4b` | `153fae0a` |
| Review B F3 / review A Fix 2: missing report | This artifact supplies the report and current evidence | No code commit applies to this authoritative leaf record |

The owner-race test schedules a real owner rename immediately after the real existence read, through a child-process filesystem dependency seam. It does not mock `checkedRun`, admission, flock or publication. On the original code the check incorrectly succeeds and recreates the owner. After repair it refuses, leaves the owner parked, starts no command and retains `refusal.json`.

The first-use test exercises real CLI invocations for both a new ordinary holder and a chart's new `direct/` holder. The nested self-pack test runs two real CLI wrappers and a real `akrogon pack` of the outer chart. Its timeout bounds the failing reproduction: before repair it exits 124, after repair it exits 1 with the outer run ID and retains both runs' output.

Fail-before/pass-after log lines, all read back with `akrogon log`, are recorded in the dated repair entry of `review-B.md`. Initial failed attempts to construct the owner-race fixture are retained but are not claimed as valid regression evidence.

## Criterion proofs on the repaired head

The planned rerun was replayed after the final source/test edits, following the configured flocked `bun install --frozen-lockfile` setup:

`bun test tests/durable-capture.test.ts tests/close-pack.test.ts tests/run-check.test.ts tests/check-names.test.ts`

`check repair-b-current-planned-proofs: 1 /home/ivan/Work/infra/akrogon/issues/open/killed-check-log/durable-check-capture/implementation/check-repair-b-current-planned-proofs-1793121763823-2588720.log`

Result: **40 pass, 1 fail**. The sole failure is the existing environment allowlist test expecting the old scalar names. This is caused by the ancestry repair and is handed to A as an existing test-expectation correction. It is not a base failure, and no known-red cover or retry is claimed.

An unmodified planned proof B did not write was also run separately on the repaired head:

`check repair-b-independent-proof-final: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-check-log/durable-check-capture/implementation/check-repair-b-independent-proof-final-1793121797580-2782482.log`

Command: `bun test tests/durable-capture.test.ts`. Result: **5 pass, 0 fail**, 51 assertions.

| Criterion | Current evidence |
| --- | --- |
| C1: SIGKILL durability for held and nested admission | Both original killed-wrapper cases pass in the independent durable proof after real reconcile. |
| C2: early capture paths, completed line only after exit | Live capture assertions and the normal-exit case pass; check-names also passes in the planned rerun. |
| C3: completed log content, cleanup, exit/replay | The original normal-exit case passes, as do failure/replay cases. The environment allowlist support test remains red pending A's correction. |
| C4: early closed/closing refusal, gone-owner output/no recreation | Original refusal and moved-owner cases pass. Added owner-race and first-use-holder reproductions also pass on the repaired head. |
| C5: pack waits for writers/publication and archive read-back | The original pack/completion case passes in the independent durable proof. |
| C6: captures readable and never completed evidence after kill | Original killed-wrapper timing, result-line and `akrogon log` assertions pass in the independent durable proof. Receipt consumers still require a returned completed result. |
| C7: same-owner refusal, outside completion waits | Original self-completion and outside-wait cases pass. New nested outer-owner pack reproduction passes and names the correct outer run. |

## Remaining work

A must correct the original environment allowlist/presence assertions in `tests/run-check.test.ts` for `AKROGON_CAPTURES`, preserving undeclared-variable rejection and all other checks, then rerun the planned four-file command and `akrogon verify`. This is the check.repair exception for an existing test-expectation correction. B has not changed those assertions.

The current configured verify result is recorded in the repair entry of `review-B.md`. The earlier verify on `153fae0a` also found a stream-result annotation incompatible with the installed Bun types. `defe1bc4` corrects that annotation, and `check repair-b-flock-type-green: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-check-log/durable-check-capture/implementation/check-repair-b-flock-type-green-1793121760330-2587940.log` proves the corrected typecheck. Merge is not claimed ready while any required check is red. No credentials, live external actions, paid calls, new dependencies or operator actions are required. No merge checks were run. Temporary scripts and proof fixtures are removed by their cleanup paths.

Final configured verify pass `00bbad2a-8010-486c-a959-121e2162805f` completed on `defe1bc468fa6d333c660e50a7c5c003ab09ad14`: format 0, test 1 (**1,226 pass, 1 fail**), typecheck 0. The sole failing test is the existing environment expectation assigned to A above. This is a completed red verification result, not merge authorization or known-red cover.

## check.fix A — 2026-10-27

Input: `Handed to A` H1 from `review-B.md` — correct the env allowlist/presence assertions in `tests/run-check.test.ts` for `AKROGON_CAPTURES` (the scalar pair was replaced by B's F2 ancestry repair).

Refresh: fetched origin; `origin/main` had advanced `63c20f98 → f85cc670` (one skills-file commit). Rebased the leaf branch cleanly, no conflicts. Prior reviewed base `63c20f9859578c179a30dac9c6ab0ac648a6f62b`, prior reviewed head `f87102aa97ac3f85db5d76a0086bcc10c4cd0058`; handed-off base `f85cc67067752ca0e3d3557cee594ec75093d6ed`, handed-off head `defe1bc468fa6d333c660e50a7c5c003ab09ad14`.

Repair commit `2cd0ec17` (test expectation correction, `Test-Change` trailer citing the F2 contract change): allowlist and presence assertions now name `AKROGON_CAPTURES` only; no other isolation assertion changed.

Proofs on committed head `2cd0ec17e7179055ef1fcc3a255cb0734fb41f9d`:

- `check h1-env: 0` — targeted allowlist test green before commit.
- `check c-planned: 0` (`implementation/check-c-planned-1793121991069-2915485.log`) — exact planned command `bun test tests/durable-capture.test.ts tests/close-pack.test.ts tests/run-check.test.ts tests/check-names.test.ts`: **41 pass, 0 fail**.
- `akrogon verify` → `verify leaf 2cd0ec17e7179055ef1fcc3a255cb0734fb41f9d: green` — `verify test: 0` (**1227 pass, 0 fail**), `verify typecheck: 0`, `verify format: 0`, `verify setup: 0`. Wall time ~70 s for the full suite.

No `merge_checks` run (merge only). No red, no retry, no known-red claim, no operator action.
