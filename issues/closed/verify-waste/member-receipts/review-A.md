# Review A: member-receipts

Base: `f89afbff` (origin/main at review). Reviewed head: `15a82fd`. Diff: `git diff f89afbf..15a82fd`.

Verification evidence: criterion suite 50 pass at `411ae35` (`check member-receipts-criterion-tests: 0 implementation/check-member-receipts-criterion-tests-1792880435921-1187646.log`); full `checks` green and `verify leaf 411ae35: green` at `411ae35`; head `15a82fd` is an empty trailer-only commit on the same tree.

## Findings

### Fix F1 — a blocked `merge_checks` member is treated as real red evidence

- **Defect.** When a `checks` entry is red, each member entry is recorded `{ exit: blocker.exit, log: blocker.log }` (`src/verify.ts`, the `blocker` branch in `runOnce`). The copied log carries the blocker's `(fail)` names, so the member entry reads as a real failure of that member.
- **Consequence today, two paths:**
  - `knownRedReceipt` treats the blocked member as a red head command whose names are extractable. A base run whose members were likewise blocked by a base-red `checks` entry holds the same command non-zero with the same names — `names.every(n => baseNames.includes(n))` holds — so the member is "covered". `akrogon verify --known-red` then exits 0 and `requireGreenReceipt` passes on a tree where the members never ran, on either side. A merge lands with no `merge_checks` evidence, which is the hole criterion 3's "never green" exists to close. Hits criteria 3, 9, 10, 11.
  - `flips` in `src/flaky.ts` stores the blocked entry under the member's own command key; a later real green run of that member records a red→green flip for the blocker's test names under the member's name — `akrogon flaky` reports a flip for a command that never ran red. Hits criterion 13's contract that only real observations are recorded.
- **Realistic source.** The ordinary known-red path: a leaf whose `checks` entry is red on both head and base (base-red flake). `verify --known-red` on the merge head produces exactly the covering pair above. Traced through `failedTests` on the borrowed log.
- **Expected fix shape (suggestion, not locked).** Mark blocked entries explicitly (an optional `blocked` field naming the blocker is parse-compatible under criterion 8) and exclude them from red-cover candidacy in `knownRedReceipt` and from `flips`. `requireGreenReceipt` needs no change (non-zero already excluded); `newRedUnits` is shielded by name dedup today but should skip them for the same reason. The criterion-3 test can then assert `blocked` names the blocker.
- **Plan defect owned:** plan.md D8 claimed a blocked member "cannot be covered"; the implementation as written does not deliver that. Recorded here for the repair pass.

### Nit N1 — packed or deleted source logs rerun instead of reusing

`reuseSource` gates on `existsSync(entry.log)`. A green entry whose log was packed into `evidence.tar.zst` (or moved with a closed issue) reruns rather than reusing. Deferred: correct direction (extra work, never wrong reuse), and only packs land under `closed/`, which follow the merge the receipt already authorized. Would promote to a Fix if a current merge path can hit a packed source before its own landing completes.

### Nit N2 — `first ??=` in the member-settle loop swallows a falsy rejection

`Promise.allSettled` reasons from `checkedRun` are `PublishRefusedError`/`Error` objects today, so unreachable now. A future rejection carrying `undefined`/`null` would silently mark the run complete. One-line hardening, deferred.

### Nit N3 — stale doc phrasing outside the leaf's owned list

`docs/reference/words.md` ("runs every check on a fresh checkout") and `docs/start/set-up-a-project.md` keep pre-reuse wording. Reported as a limitation in `implementation/report.md`; consequence is minor reader imprecision.

## Checks on the diff

- AREA.md files changed (`src/AREA.md`, `tests/AREA.md`): every named path verified to exist from the repo root; no dead pointers.
- `Test-Change:` trailers in range `f89afbf..15a82fd`: `tests/verify.test.ts` (two commits), `tests/flaky.test.ts`, `tests/AREA.md` — each names what was added; the only modified expectation is the corrected log-path comparison with its cited reason.
- Planned tests ran through the commands `plan.md` names; the only test mutation was the documented expectation correction, followed by a full green rerun.
- No `advisory` commands configured. No env/grants used.
- Behavior docs reviewed (`checks.md`, `commands.md`, `files.md`, `merge-and-announce.md`, SKILL lines): claims match the code as written; N3 notes the leftovers.

## Verdict

`fix` — F1 is a gate-correctness defect on the merge path with a concrete source.
