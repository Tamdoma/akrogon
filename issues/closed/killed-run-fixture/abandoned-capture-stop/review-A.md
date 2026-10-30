# Review A: abandoned-capture-stop

Base: `3e49c3d5` (`AKROGON_BASE`). Reviewed head: `84520e23`.
Diff: 10 files — `src/run-check.ts`, `src/phase.ts`, `tests/abandoned-capture.test.ts`,
two SKILL.md, three docs, two AREA files.

## Verification

- Read the full diff against plan D1–D8 and the seven done-criteria.
- `check gate-fix: 0 …/check-gate-fix-1793195440260-3563491.log` — all three planned tests green on
  the landed head; `check abandon-final: 0 …/check-abandon-final-1793195465169-3572684.log`;
  `akrogon verify` green (`verify leaf a3e303f6…: green`).
- Deliberate-break evidence recorded in report: `check break-fdshare: 1`, `check break-probe: 1` —
  both reverted correctly.
- AREA paths: `tests/abandoned-capture.test.ts` exists; no dead pointers in the five doc files
  (link scan clean, docs-links green in verify).

## Findings

### Fix F1 — startup gap: capture-out is visible unlocked between `openSync` and `flock`

`src/run-check.ts` `checkedRun`: `const capFd = openSync(captureOut, 'w')` discovers the pair at its
final name, then `Bun.spawnSync(['flock','-s','0'], { stdin: capFd })` locks it one subprocess spawn
later. Between the open and the helper's `flock(2)` call, `abandonedCaptures` finds a real
`capture-…-out.log`, no `cleared-<run>.md`, and a free lock — an abandoned pair — while the wrapper
is alive and the run has not even started. Any concurrent non-failed `akrogon phase` probe landing
in that window refuses the leaf: criterion 2's "a live run's pair never refuses a move" broken at
run start, and the design's own "no gap from creation to unlink" not delivered (F13 killed a
two-description split; this is the one-description variant of the same gap).

Realistic source: a seat's `phase`/`next`-dispatched move racing a `run-check` launch on the same
leaf — the two operations this leaf deliberately makes race-prone by scanning on every move.
Consequence today: wrong refusal, `state.yaml` untouched, operator clears a live run's pair.
Same size fix keeps the mechanism: create under an unmatched name
(`capture-…-out.log.tmp` does not match the `-out\.log$` pattern), lock it, then `renameSync` to the
final name — the file is discoverable only once locked.

Reproduction is timing-bound (I could not hit the ~ms window in a loop under the test fixture in
reasonable iterations — the window is real but narrow), so evidence for promotion stands on the
code trace: probe reads a pathname whose lock is provably free during that interval.

### Nit N1 — `docs/reference/commands.md` omits the `failed` exemptions

The `akrogon phase` row now says "A non-failed move is refused while an abandoned `capture-` pair
sits in the leaf folder without a non-blank `cleared-<run>.md` beside it." True but incomplete: a
move to `failed` and operator recovery out of `failed` also pass, and an operator reading the table
to recover learns only the refusal. `docs/reference/checks.md` carries the full clause, so the
consequence is one misleading table line, deferred because the detailed doc is correct.

### Nit N2 — AREA files already over the 40-line rule

`src/AREA.md` is 41 lines, `tests/AREA.md` 42 (base had 41/42 and 42 — this leaf's edits hold the
counts, not raise them). The implement-issue ≤40-line convention is nominally violated, but the
excess predates the leaf and compressing it now would delete unrelated content; deferred as
pre-existing.

### Nit N3 — `abandonedCaptures` matches directories and unreadable `cleared` files throw

`onlyFiles: false` is required for the dangling-symlink ENOENT case, but it also matches a directory
named `capture-…-out.log` (probe opens and locks it fine → refusal with a confusing pair), and a
`cleared-<run>.md` that is a directory throws `EISDIR` from `readFileSync` with the syscall error
instead of the pair refusal. Adversarial-ish fixture states with no real writer today; stated for
the record.

## Verdict: fix

F1 alone routes to `check.repair`. Everything else verified clean: criteria 1–5 have working proofs
(planned tests + deliberate breaks), criterion 6's rule text is present in all four named sections,
criterion 7's absence is recorded correctly in report.md, exclusion scope respected, no lesson-file
writes, report is accurate about the merged-completion probes being traced not tested.

## check.fix repair (A)

- B F2 repaired in `5079b06e`: added the non-nested real-systemd case to `tests/run-units.test.ts`
  on the existing `spawnReal`/`realFixture` machinery — live pair under the real unit keeps
  `phase --check` at exit 0; after wrapper SIGKILL the real guard drains the scope and the probe
  refuses naming both capture paths and `cleared-<run>.md`; a non-blank clear releases.
  `Test-Change` trailers on the commit. `tests/AREA.md` describes the case.
- Evidence: `check gatekill-test7: 0 implementation/check-gatekill-test7-1793196812789-565057.log`
  (the case alone), `check run-units-full: 0 implementation/check-run-units-full-1793196838114-565483.log`
  (all 21 run-units tests, real units).
- Rebase: base moved to `76a1da50`; one docs-table conflict resolved by keeping main's formatting
  plus the leaf's rows; stray marker tails removed via `--fixup`+autosquash into `a6c4bc79`.
- `report.md` updated: new base/head, B's repair commits, criterion-1/2/3 proof mapping now
  covering the real seam, repair-history section.
- check.fix final verification: `akrogon verify` on committed head `5079b06e` — green
  (1242 pass, 0 fail, 72 files; typecheck 0). Logs
  `implementation/check-test-1793196985108-607691.log`,
  `implementation/check-typecheck-1793196987561-607691.log`.

## check.fix round 2 (A)

- B F2's re-check repaired in `dedbc381`: the gatekill case now observes the intermediate
  interval — `sh -c 'trap '' TERM; touch ready; sleep 30'` keeps the inherited stdout fd alive
  after the wrapper's SIGKILL until the real scope drains; `phase --check` is asserted at exit 0
  while a cgroup holder is live with the wrapper dead, then refusal once drained. `Test-Change`
  trailer on the commit.
- Catching power: `outFd: openSync(captureOut, 'a')` on the non-nested path turned the case red
  (`check gatekill-break: 1 implementation/check-gatekill-break-1793197536959-1142720.log`);
  product restored byte-for-byte (`git checkout`), green:
  `check gatekill-green: 0 implementation/check-gatekill-green-1793197548455-1157321.log`.
- `report.md` updated: head `dedbc381`, round-2 commands, C2 proof mapping covering the
  live-holder interval under the real unit.
- `akrogon verify` on `dedbc381`: `verify leaf dedbc381…: green` — 1242 pass, 0 fail,
  typecheck 0.
