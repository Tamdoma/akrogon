# Plan: nested-temp-root

Slot A synthesis, 2026-11-25. From the leaf brief and design; the design's binding decisions hold verbatim. No conflict between brief and design found. The design holds no `Open for the plan:` questions. No credential named; `akrogon status` reports no `Missing:` lines. No paid or live work: free tests only.

## Read-first

1. `src/run-check.ts` — `copied` (constructed-env caller copies), `constructedEnv` (undefined-skip copy loop, env/pass_env layering, `scratchEnv`), `checkedRun` (`ensureLeafTemp` → `mkdtempSync` run root, removed in `finally`).
2. `src/config.ts` — `leafTempRoot` / `retiredLeafTempRoot` (the two env reads and defaults), `leafTemp` (the `sha256` path grammar), `ensureLeafTemp`, `repoSchema` `superRefine` `constructed` reserved-name set (stays unchanged).
3. `src/verify.ts` `passForwarded` and `src/land.ts` `launchLand` — the two boundaries already forwarding both names; run-check is the odd one out.
4. `tests/run-check.test.ts` — the allowlist expectation (`envNames`/`displayEnv`), the two nested-test models (`constructed PATH can dispatch akrogon itself`, `a nested run-check inherits neither AKROGON_SESSIONS…`).
5. `tests/helpers.ts` — `cli` env construction (default `AKROGON_LEAF_TEMP_ROOT`/`AKROGON_RETIRED_TEMP_ROOT`/`AKROGON_HOME`/`AKROGON_RUN: ''`), `fakeAkrogon`, `leafWorktree`, `leafTempRoot(f)`.
6. `tests/isolation.ts` — suite preload: per-worker scratch `AKROGON_LEAF_TEMP_ROOT`; the nested-run fallback path is what writes to the real `/var/tmp`.
7. `docs/reference-index.md` + `src/AREA.md` (run-check line), `docs/reference/checks.md` (checked-command env paragraph) — doc grounding; neither enumerates the copied names (see D7).
8. `learnings/LESSONS.md` — no lesson covers this mechanism; the closest rows are the two `run-check` TMPDIR lessons, which concern evidence placement, not env copying.
9. `docs/reference/checks.md` Test-change refusals — the `Test-Change` trailer contract used for the test commit and the implement-phase expectation update.

## Decisions

- **D1 Fix.** `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` are added to `copied` in `src/run-check.ts` only, beside `AKROGON_HOME`, with a comment giving the reason (a nested akrogon call resolves the caller's leaf temp root), as the `AKROGON_HOME` entry carries. Locked binding decision; no other mechanism is added. The copy loop already sets a name only when the caller defines it, so a caller holding neither name sees nothing change — the brief's production default; the mechanism itself, not a check, is why this cannot break.
- **D2 No reserved-name change.** `repoSchema`'s `constructed` set in `src/config.ts` is not touched, so configs listing either name in `env`/`pass_env` keep parsing (locked binding decision, criterion 2).
- **D3 Proof test.** One test, `a nested run-check inherits the caller temp roots` in `tests/run-check.test.ts` (a case extending the existing nested-test cluster, not a new file): real CLI both levels through `cli()` + the `fakeAkrogon` PATH shim — the pattern the two existing nested tests use — on a fixture whose config declares neither name. The innermost `sh -c` writes `${AKROGON_LEAF_TEMP_ROOT:-unset}:${AKROGON_RETIRED_TEMP_ROOT:-unset}` into a file under the fixture home; the test asserts exact equality with the caller's values (`leafTempRoot(f)` and `resolve(f.home, 'retired-temp')` as `cli`/`shim.env` set them) and asserts the default-root leaf dir — `/var/tmp/akr-<uid>/<sha256(root)[0:4]>/<sha256(root + "\n" + slug)[0:8]>` computed in-process for the fixture's registered root (`readRepo(f.repo, f.root).root`) and slug `nested-roots` — does not exist. The shared `/var/tmp/akr-<uid>` root is never scanned (rejected 3b).
- **D4 Allowlist update.** The exact-allowlist expectation in `tests/run-check.test.ts` gains the two names. It lands with the product change in the implement phase (not the plan-time test commit): it asserts inclusion, so it is green before and after the fix — it is a policy expectation update, not a new test, and carries no separate red. Its commit carries the `Test-Change` trailer (the file exists on base).
- **D5 Run shape.** One unit in the single wave — serial-solo; implement-issue's rule has A implement the plan itself with no workers.
- **D6 Criterion-2 proof.** No new test: the existing tests that declare `AKROGON_LEAF_TEMP_ROOT` in `env`/`pass_env` (`tests/run-check.test.ts` two nested tests and the `.env`-write case, `tests/run-permit.test.ts`, `tests/run-units.test.ts`, `tests/close-pack.test.ts`, `tests/timing.test.ts`, `tests/durable-capture.test.ts`, `tests/abandoned-capture.test.ts`) already exercise config parse plus value forwarding and are the proof the brief names, run by the `test` check.
- **D7 Docs.** No doc is affected. `docs/reference/checks.md`'s checked-command env paragraph is written generically ("a few other basics, the names you list in `env` and `pass_env` …") and enumerates neither `AKROGON_HOME` nor the display names, which are already in `copied` today; `src/AREA.md`'s run-check line describes capture/admission, not env contents; `tests/AREA.md` describes `tests/run-check.test.ts` by topic and does not enumerate its tests; the README carries no copied-name list. A one-line addition would document a mechanism the docs deliberately leave generic.
- **D8 No scope growth.** `src/reconcile.ts` `reconcileHost`, the worktree-store clause, the land empty-HOME flag, the preload's `AKROGON_HOME`, `cleanEnv` and the seven existing fixture crutches stay exactly as they are (design exclusions). Existing host leftovers under `/var/tmp/akr-<uid>` are not this leaf's to delete.

## Acceptance criteria, proofs and condition checks

### C1 — nested run-check receives both names; no default-root leaf dir (brief criterion 1)

Behavior locked by the criterion: a nested `akrogon run-check` inside a checked command, in a repo config declaring neither name, receives the caller's values of both names and creates its run dir under the caller's leaf temp root; after the run the default-root leaf dir for that repo+slug does not exist; the innermost checked command's recorded values compare equal to the caller's.

Proof: `tests/run-check.test.ts` test `a nested run-check inherits the caller temp roots` (committed red-first at `40e4f50f`, before any product code).
Proof command: `akrogon run-check --name nested-roots-c1 -- bun test tests/run-check.test.ts -t 'nested run-check inherits the caller temp roots' --timeout 120000`
Boundary: the real CLI, both levels — outer `run-check` constructs the env, nested `akrogon run-check` re-resolves the same leaf through `leafTarget`, calls `leafTemp()` and `ensureLeafTemp` where the forwarded name points. Real boundary, not a mocked seam.
Observation: the innermost recorded values (state after, read back from the fixture-home file), the absent computed default-root leaf dir (state after), and the exit chain 0. Product failure it catches: `constructedEnv` dropping either name — the exact bug that leaves ~2,900 empty `/var/tmp/akr-<uid>/<hash4>/<hash8>` dirs.
Size: seconds (0.2 s red runs; a green run is the same path with one extra dir creation — well under the 120 s test timeout). Rerun trigger: any change to `constructedEnv`/`copied` in `src/run-check.ts`, to `leafTemp`/`ensureLeafTemp`/the root resolution in `src/config.ts`, or to `tests/helpers.ts` env construction. Free test; no budget sizing.

Red evidence recorded at plan time (all through `akrogon run-check` from the leaf worktree; only the test file is committed):

- Base red (no product code): `check nested-roots-base: 1 /home/ivan/Work/infra/akrogon/issues/open/test-temp-leftovers/nested-temp-root/implementation/check-nested-roots-base-1795612628251-2833360.log` — fails at the value assertion with `Received: "unset:unset"`, proving the leaf-half and retired-half values do not arrive on base. Not vacuous.
- Condition: leaf-root value forwarded per-name — discrimination by temporary edit forwarding only `AKROGON_LEAF_TEMP_ROOT` (discarded): `check nested-roots-leafonly: 1 /home/ivan/Work/infra/akrogon/issues/open/test-temp-leftovers/nested-temp-root/implementation/check-nested-roots-leafonly-1795612694407-2837525.log` fails with `Received: "<…>/leaf-temp:unset"`, so the retired half of the value assertion is independent of the leaf half, and the leaf half plus default-dir assertion pass under leaf forwarding (no implementation can pass by forwarding the wrong name).
- Condition: retired-root value forwarded per-name — discrimination by temporary edit forwarding only `AKROGON_RETIRED_TEMP_ROOT` (discarded): `check nested-roots-retiredonly: 1 /home/ivan/Work/infra/akrogon/issues/open/test-temp-leftovers/nested-temp-root/implementation/check-nested-roots-retiredonly-1795612702354-2838221.log` fails with `Received: "unset:<…>/retired-temp"`, so the leaf half is independent of the retired half.
- Condition: the default-root leaf dir does not exist after the run — traced rather than red-demonstrated: every implementation that passes the value assertions makes the nested run resolve `leafTempRoot()` to the caller's root, so `ensureLeafTemp` physically cannot create the default-root path; the assertion's creation evidence is confirmed on base (the base run created exactly `/var/tmp/akr-1000/7afc/77a63c18`, empty after its `run-*` removal, verified on the host after the run), and the leaf-only edit run created no default-root dir (`/var/tmp/akr-1000/2709/d67d9cb5` absent). The assertion is criterion-required insurance against a wrong-value forward, kept because its cost is one line.
- Condition: config declares neither name — a fixture property, not runtime state: an implementation forwarding only declared names fails the value assertions because the checked command then holds neither. No separate case needed; the base red run exercises exactly this shape.
- Condition: a caller holding neither name sees nothing change (brief statement, production default) — not a done-criterion, no case planned: the copy loop's existing `value !== undefined` guard is untouched by D1, so the absence path cannot break; any implementation that set the names unconditionally would surface in review as a departure from the loop's single shape.

### C2 — configs already declaring the names keep parsing and forwarding (brief criterion 2)

Proof: the existing tests that declare `AKROGON_LEAF_TEMP_ROOT` in repo `env`/`pass_env` (D6), run by the configured `test` check. The repo schema's `constructed` set is unchanged (D2), so parse behavior cannot regress, and forwarding already flows through the same env/pass_env copy loop the fixture covers.
Proof command: `akrogon verify` (the repo's configured runner); its `test` leg runs `bun test` plus the changed-file `--rerun-each=5` leg, which includes `tests/run-check.test.ts`. Run at implement end with the leaf diff on HEAD; green means every declaring fixture passes.
Observation: the `test` check exit and the per-file pass lines of the declaring-test files in the kept verify log. Product failure it catches: adding the names to `repoSchema`'s reserved set (config parse refusal) or breaking the env/pass_env copy order so a declared name loses to the constructed copy.
Size: minutes (green `test` rows in `issues/timings.jsonl`: 146–291 s). Rerun trigger: the leaf's own diff (implement end) and any later change to `constructedEnv` or `repoSchema`; free test, no budget. A fresh run is required at implement end because the leaf's diff touches the mechanism directly.

### C3 — a caller holding neither name sees no env change

Not a done-criterion; no test planned (see C1's traced condition). Recorded here so review sees the decision explicitly.

## File/criterion checklist and waves

### Wave 1 — U1 (serial-solo: the only wave holds exactly one unit; implement-issue's serial-solo rule applies)

Owns: `src/run-check.ts` (`copied` + comment), `tests/run-check.test.ts` (allowlist expectation update, `Test-Change` trailer on its commit).
Shared test resources: none beyond the leaf's own fixtures. No dependencies.
Steps: add the two names to `copied` with the reason comment; add the two names to the allowlist expectation in the same file as the criterion test; run the C1 proof command (green), then `akrogon verify` for the implement-end receipt the implement phase requires anyway.
Verify: C1 and C2 proof commands above.

Doc checklist: no agent or human doc is affected (D7).

## Open limitations

- The default-root leaf-dir absence assertion is insurance whose red cannot be demonstrated once the values compare equal (C1 condition tracing); it is kept because the criterion names the directory explicitly.
- Host leftovers the suite already wrote under `/var/tmp/akr-<uid>` stay (design exclusion; the host sweep keeps unregistered dirs on purpose, #151).
- The worktree-store clause of the intake is Off route in the chart with its reopen trigger; not this leaf's scope.

## Implementation notes

None at synthesis.
