# Map: slot B (blind)

Read: INTAKE.md, signposts `## Question` and `## Taken`, `src/run-check.ts` (whole), `src/reconcile.ts` (`reconcile` scratch-root block, `ownerKeeps`, `readOwner`, `drop`, `dropChecked`, `dropUnowned`, `reconcileNeedsPanes`), `src/config.ts` (`leafTemp`, `leafTempRoot`, `ensureLeafTemp`), grep hits in `src/verify.ts`, `src/status.ts`, `src/leftovers.ts`, `src/seat.ts`, test names. Not read: test bodies, `src/verify.ts` bodies, framework drivers.

## Shape of the smallest fix

Two edits. `checkedRun` skips its final `rmSync(runRoot)` when the command exited nonzero and leaves one marker file in the run root. `reconcile`'s run-root loop gets one line beside the `refusal.json` check: marker present, `continue`, with no `keep()` call. The folder then dies with the leaf temp through the existing `dropChecked(dir)` (tab gone), which is direction 2a.

## Consumers of the run root's existence

- C1. `src/run-check.ts` `checkedRun`: creates it, writes `.owner`, removes it in `finally` unless `refused`. The `refused` flag already models "do not remove"; the red keep is the same flag with a second cause.
- C2. `src/run-check.ts` `constructedEnv`: sets `TMPDIR` to it. Unchanged.
- C3. `src/reconcile.ts` `reconcile`, loop over `run-*` children: `refusal.json` keeps visibly, no `.owner` drops after 60s, dead owner drops, live owner keeps visibly. A red-kept root has a dead owner, so it is dropped on the next pass without the new rule.
- C4. `src/reconcile.ts` `reconcile`, leaf temp release: `kept.length === keptBefore` gates `dropChecked(dir)`. Any `keep()` on a run root pins the leaf temp. The new rule must not call `keep()`.
- C5. `src/reconcile.ts` `reconcile`, `ownTemps` branch (`checkout`, `self-update`): the whole dir goes through `dropUnowned` when nothing inside was kept. A silently kept root does not protect it. See K5.
- C6. `src/reconcile.ts` `ownerKeeps`: a `run-*` dir with a dead owner yields no veto. A kept root stays veto-free. Unchanged.
- C7. `src/reconcile.ts` `reconcileNeedsPanes`: any entry in the repo temp dir already returns true. Unchanged.
- C8. `src/verify.ts`: three `checkedRun` call sites (setup, serial member, parallel members). They inherit whatever `checkedRun` does.
- C9. `src/status.ts` (`readKept`, `Kept:` lines) and `src/leftovers.ts` (`leftover`): show only `keep()` entries. A silent rule adds nothing to either. Unchanged.
- C10. `src/seat.ts` (seat `TMPDIR` is the leaf temp): seat files sit beside `run-*` and already live until leaf temp release. A kept root gets the same lifetime.

## Forks

- K1. How is a kept root told apart from a crashed one in `reconcile`?
  - (a) Marker file in the run root, akrogon-named, checked beside `refusal.json`. Could break: a child writing the same name. Remove by a dotted akrogon-specific name.
  - (b) Optional `exit` field on `.owner`. Could break: `ownerSchema` and `writeOwner` are shared with `batch-*.owner` records, so the batch record type widens for a run-only fact.
  - (c) No mark; `reconcile` stops dropping dead-owner run roots. Invites: every killed green run leaks until tab gone, and breaks `run root with a dead owner pid is removed`.
  - Pick (a). It copies the existing refusal shape and touches no shared type.
- K2. What triggers the keep?
  - (a) Nonzero exit code from `spawnLogged`. (b) Nonzero exit and the child left files. (c) Any exit that leaves files.
  - (b) saves empty folders but adds a directory scan and a second branch. (c) changes green runs, which 2a forbids.
  - Pick (a). A thrown error (spawn ENOENT, lock failure) still removes, so `run-check preserves failed executable errors and removes their capture directories` keeps passing.
- K3. Which callers?
  - (a) Every `checkedRun` caller, no parameter. (b) `run-check` only, through a new parameter.
  - (a) invites kept temp for every red verify member, including deliberate red base passes under `--known-red`. (b) adds a mode flag to a shared function.
  - Pick (a). It is the version with no new parameter, and K4 bounds the disk. A must rewrite one verify test (see Tests).
- K4. Is retention bounded before the leaf temp is released?
  - (a) No bound. (b) At a red exit, remove earlier kept roots in the same leaf temp that carry the same check name (name stored in the marker). (c) Size or age cap.
  - (a) invites disk growth on `/var/tmp`: an implement seat reruns a red check many times and each run keeps its temp (Chrome profiles, fixtures). (b) adds one sibling scan and makes unnamed runs (`run`) replace each other. (c) needs a number nobody has.
  - Pick (b), unless a probe shows red roots are small. Probe: `du -s` one red framework check's run root before removal. Under 10 MB, pick (a).
- K5. `--holder` runs (slug `checkout`): the kept root dies on the next idle `reconcile` pass (C5), called from `src/next.ts`.
  - (a) Accept. (b) Make the marker protect the `checkout` temp, which needs a visible keep or a new timer and breaks 2a.
  - Pick (a) and state it in the AREA line. The reported case was a leaf run.
- K6. Does `run-check` announce the keep?
  - (a) Silent; the child's own printed path now works. (b) One extra stderr line per red run.
  - Pick (a). (b) adds a line to every red check and touches `run-check prints check name, exit and kept path on its own stderr line`.

## Tests that pin today's behavior

- T1. `tests/run-check.test.ts` `run-check TMPDIR is a fresh run root under the leaf temp dir and is removed on success and failure`: the failure half flips.
- T2. `tests/verify.test.ts` `verify removes each command TMPDIR on success and failure`: flips under K3 (a).
- T3. `tests/reconcile.test.ts` `run root with a dead owner pid is removed, live owner kept` and `a dead-owner run dir is removed under an unavailable pane list, strays stay`: must stay green; they prove an unmarked dead-owner root still goes.
- T4. `tests/reconcile.test.ts` `an unfinished leaf temp is removed once its tab is gone and kept silently while its tab lives`: must stay green with a marked root inside. New case: marked root survives a pass with tab live, goes with the leaf temp, and adds no `Kept:` entry.
- T5. `tests/durable-capture.test.ts` SIGKILL cases and `an owner moved aside at publication keeps output in the run root`: must stay green; the refusal path is untouched.

## Practitioner questions

- P1. Does framework #617 (lesson 2026-11-15) come from a leaf run or a `--holder` run? If holder, K5 (a) leaves that case open.
- P2. Does anything in a red run root hold a live process after exit (a Chrome left running)? `stopRunUnits` in `checkedRun` stops the run scope first, so likely no. A nested run (`admission.kind === 'nested'`) has no own scope; confirm.
- P3. Does any check read sibling `run-*` dirs or assume the leaf temp holds only live runs?

## Pitfalls and what removes each

- R1. Wrapper killed (seat Bash timeout, SIGKILL): `finally` never runs, no marker, `reconcile` drops it. A paid capture that hits a timeout still loses evidence. Direction 1a gives this up. Removed only by keeping the lesson's "explicit evidence root" advice for bounded paid runs, so the lesson is reworded, not deleted.
- R2. Kept folder pins a leaf temp or shows as a leftover. Removed by T4's new case asserting no `Kept:` entry and release on tab gone.
- R3. Disk growth from repeated red runs. Removed by K4 (b) or the probe.
- R4. Sensitive data from paid sessions stays on disk longer. It stays in a 0700 dir (`ensurePrivateDir`) outside the repo and outside `pack`, same as seat temp today. No action.
- R5. Docs drift: `src/AREA.md` run-check line and `docs/reference/checks.md` ("a private `TMPDIR`") do not say the folder outlives a red run. Removed by one clause in each as a done-criterion.
- R6. Marker written but `rmSync` skipped on a green path by mistake. Removed by T1's success half staying as is.
