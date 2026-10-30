# Review A — durable-check-capture (initial, blind)

Base: `63c20f9859578c179a30dac9c6ab0ac648a6f62b` (origin/main, = AKROGON_BASE)
Reviewed head: `f87102aaff1c...` (`git rev-parse HEAD` of leaf branch; tree identical to `fe5c1d25`, the verified head — HEAD adds only the empty citation commit `f87102aa`).

## Verification evidence

- `verify leaf fe5c1d251f2f22001a811632c7d7107569b9a347: green` — `verify test: 0` (1224 pass / 0 fail / 70 files), `verify typecheck: 0`. Receipt accepted by the phase move into check.review.
- `check c1-capture: 0` (`implementation/check-c1-capture-1793119697417-1167317.log`) — durable-capture.test.ts 5/5, covers C1, C2, C4, C5, C6.
- `check c7-closepack: 0` (`implementation/check-c7-closepack-1793119695375-1167318.log`) — close-pack + run-check + check-names + command-reference + docs-links, 45/45.
- `check u1-nested: 0` (`implementation/check-u1-nested-1793119684224-1165885.log`) — nested leg green.
- `check rerun-slices: 0` (`implementation/check-rerun-slices-1793120198572-1645870.log`) — leaf-slices keep scenario green after test update.
- Independent probe on this host: `flock -F <lock> sh -c 'printf ready\n; exec tail --pid=$PPID -f /dev/null'` — after SIGKILL of the wrapper the lock releases (fuser/flock -n probe free after tail's ~1 s pid poll). `flock -F` runs the command directly under the wrapper: `ps --forest` showed `bun → tail`, no `flock` or `sh` parent. The SIGKILL durability claim holds on this platform.
- AREA.md sweep: every path named in the changed `src/AREA.md`/`tests/AREA.md` entries exists (src/flock.ts, src/run-check.ts, src/pack.ts, src/pack-command.ts, src/phase.ts, src/evidence.ts, tests/durable-capture.test.ts, docs pages, skills). No missing paths.

## Verdict: fix

Two Fixes; the rest are Nits.

### Fix 1 — `mkdirSync(owner)` before the lock can recreate and publish into a phantom owner (src/run-check.ts ~line 291)

- Defect: the sequence is `existsSync(owner)` → `mkdirSync(owner, {recursive:true})` → `flockHold(owner/.lock, -s)` → fence recheck. The fence (`ownerRefusal`, `locate`) is pure path math: an existing empty `issues/open/<owner>` satisfies every check (`state === 'open'`, `existsSync(open)` true, no `.closing` needed, `evidence.tar.zst` absence not checked). So any rename `issues/open/<owner>` → `issues/{closed,parked}/<owner>` landing between `existsSync` and `mkdirSync` produces this chain: mkdir recreates the open owner dir → flock creates `<phantom>/.lock` → fence passes → captures + published `check-*.log` land in the phantom while the real owner sits in `parked` or `closed` with its archive. The recreated leaf dir has no state.yaml: the owner reappears on the open board with a ghost leaf, and the check's evidence is orphaned outside the owner's archive.
- Realistic source: `akrogon park <owner>`/`unpark` rename owners between open and parked taking no `.lock` (src/park.ts:93); owner completion renames into closed. Both are real commands racing a run-check start — the same rename mechanism the leaf's own moved-aside test uses, only timed inside the lock-acquisition window instead of after it.
- Consequence today: criterion 4's "the owner folder is not recreated" is violated exactly in the window the check cannot distinguish; evidence lands outside the owner's archive; a ghost open owner dir (with a stateless leaf dir inside) appears and is commit-worthy to sync.
- Criterion/gap hit: brief done-criterion 4; design item 3 (the under-lock fence cannot see a recreated owner); design binding "never recreating the owner".
- Repair shape for the repair seat: the unconditional `mkdirSync(owner)` is the recreate vector. flock already creates `.lock` inside an existing dir, so dropping the mkdir and mapping a failed lock open (ENOENT, parent gone) into the existing `owner gone` refusal closes the race with fewer moving parts. Note this also changes the current "refuse a not-yet-created `--holder <dir>`" behavior into owner-gone refusal; whether a holder outside `issues/` should keep the old create-on-publish behavior is B's call.

### Fix 2 — `implementation/report.md` was never written

- Defect: `implement-issue` SKILL line 67 requires `implementation/report.md` (changed files, commands run with results, base/head, proof results per criterion, limitations, worker returns) before handoff. The leaf folder has `brief-1.md`/`brief-2.md` and check logs, no `report.md`. `ls implementation/` shows none.
- Consequence today: B's mandated check "the implementation report runs the planned tests through the commands plan.md names" has no artifact to judge; later passes (check.fix refresh records, merge-issue's prior reviewed base/head reads) read from this file.
- Gap hit: implement-issue Shared context end-of-pass requirement; check-issue shared context names `implementation/report.md` a read-first input. Material to verification, so it blocks rather than riding as a Nit.

## Nits

- **N1 — nested run-check completing the outer capture's owner deadlocks.** A nested `akrogon run-check` inherits the outer owner's shared `.lock` fd (the outer command argv is wrapped `flock -s O1/.lock`, inherited through `systemd-run`/exec chains). If the inner command runs `phase merged`/`pack` on the *outer* owner, `enclosingCapture` sees only the innermost owner (`AKROGON_CAPTURE_OWNER` is overwritten with O2) and does not refuse, while the process itself holds O1's shared lock → the exclusive `flockHold(O1)` waits on itself forever. Realistic but requires the nested-completion shape (a check command running a nested run-check whose command completes an ancestor owner — our own close-pack tests have this shape minus the extra nesting). Why deferred: no proof shown on this head; promoting evidence = a fixture with run-check → run-check → `phase <outer-owner leaf> merged` hanging, or an env dump proving the inherited fd. Fix direction if promoted: propagate the full enclosing-owner chain, not just the innermost.
- **N2 — deleted reconcile-keep assertions.** The removed close-pack leg asserted `reconcile` keeps the `refusal.json` run root and that the run root still exists after `next`. The new gone-owner test checks `refusal.json` + `out.log` + no-recreation but never runs `next` on the refused run root, so nothing on this branch proves criterion 4's "keeps its output" survives reconcile. Pre-existing reconcile behavior covers it and other suite legs exercise kept roots, so it is coverage-only; a one-line `cli next` + `existsSync(runRoot)` in the moved-aside test would close it.
- **N3 — `enclosingCapture` checked twice on the packOne path.** `packOne` checks `enclosingCapture(target.packDir)` before the marker; `packFolder` checks it again on entry. Harmless duplication; keep if `packFolder`'s exported surface is meant to be self-defending, drop one otherwise.
- **N4 — a self-close refusal marks the leaf `failed`/`blocked`.** `refuseEnclosingCompletion` mutates state before throwing. Defensible (prevents re-dispatch of a turn that will refuse again), but it is a state consequence of a refusal the design only describes as "refuses loudly before waiting". If a future caller hits this refusal legitimately (e.g., scripted `akrogon phase merged` inside a check), the leaf needs recovery rather than being finished. No test asserts the failed state either way.
- **N5 — a run-check on a not-yet-created `--holder` dir now refuses `owner gone` at start.** Today `--holder <new-dir>` created the holder at publish (`mkdirSync(target)`). The start-time `existsSync(owner)` gate refuses first. No criterion or doc promises holder creation, and no test used it, so it is an unannounced contract tightening rather than a defect; worth one line in checks.md or folding into Fix 1's decision.
- **N6 — `unlinkSync` after `check_end`.** If a capture path is removed between publish and unlink, `unlinkSync` throws after the receipt and combined log are already written — the caller sees an exception on a completed check. `rmSync(force:true)` matches the defensive shape used for the stale-capture cleanup two dozen lines above. Cosmetic; an operator cannot reach it without racing the holder dir by hand.

## What was checked and found sound

- Lock model: `-F` puts `tail --pid` under the wrapper directly (verified on host), so SIGKILL of the wrapper releases the lock ~1 s later; the command-side `flock -s` rides the `systemd-run` exec chain and survives orphaned writers — D3/D4 as planned.
- Ordering: shared lock → fence recheck → holder mkdir → capture creation → `capture` line → `check_start` → guard/spawn → replay → late fence → publish → `check_end` → unlink captures → release. `check_end` and the combined log are write-then-record (no partial-capture receipt), satisfying authority item 7.
- Self-close refusal precedes `.closing` and any exclusive wait in `packOne`, `packFolder`, `completeOwner`, and (pre-push) `batchPush`/`commitMove` — deadlock-free by placement, env-driven not probe-driven, naming the run uuid, matching design item 6 and plan D5.
- `enclosingCapture` sibling matching (open/closed/parked + chart direct) covers the owner-moved-mid-run self-close case via realpath.
- Criterion 2: `capture <name>:` prints before the wait and before `check_start`, carries no exit claim; stderr shape regexes updated in check-names/run-check tests.
- Test exceptions: the three `Test-Change`-trailed commits each cite a real changed-contract source (owner completion now waits on the lock; nested fixture env mechanics; dotfile visibility). The leaf-slices test fix preserves the keep-scenario's intent (reconcile runs while the run is live) rather than weakening it.
- The moved-aside test (criterion 4), pack-wait test (criterion 5), and kill tests (criteria 1, 2, 6) exercise real wrappers, real SIGKILL, real flock, real reconcile/pack — no mocked units.

## Footer

Last operation: review findings recorded — verdict fix (F1 phantom-owner recreate/publish race in run-check.ts; F2 missing implementation/report.md); 6 Nits; no commits made, no peer review read.
Next: awaiting aggregate — peer B's initial verdict decides check.repair vs merge; if fix: check-issue durable-check-capture slot=B phase=check.repair leaf=/home/ivan/Work/infra/akrogon/issues/open/killed-check-log/durable-check-capture
