# Review A: watch-consults check.review

Base `88d40095` (AKROGON_BASE), reviewed head `ac3df7cd`. Inputs: brief, design, plan (with implementation notes), `implementation/report.md`, the diff `88d40095..ac3df7cd` (14 files), `skills/watch-issues/SKILL.md` as it stands, and the live-run evidence in `implementation/watch-consults-e2e-g3/`.

## Verification evidence

- `akrogon verify` on `ac3df7cd`: setup, format, typecheck and test all 0 (1304 pass), receipt green (`implementation/check-test-1795303998000-4003912.log`). I reran nothing: no code changed after that receipt.
- Criteria 1–2: `check watch-consults: 0`, run `1795303796269` on `be617169` (`implementation/check-watch-consults-1795303796269-3594806.log`). `ac3df7cd` adds only an empty trailer commit. I read the case files: both turn files exist and record the watch's agreement, the signature parses, two non-attention notices landed, the consultant was gone before the leaf left `failed`, and `absence.json` is `{"left": []}`.
- Criteria 3–6: their tests sit in the green full suite above.
- AREA.md pointers: every path named by the lines this diff changes exists (`scripts/consults.ts`, `consultant-brief.md`, `tests/e2e/watch-consults.e2e.ts`). The other unresolved names in `skills/AREA.md` belong to lines this diff does not touch.
- Grant audit: grants[1] used 4 of 4 and grants[2] used 2 of 2. Both counts match the `check-watch-consults-*` logs for runs `1795296133939`, `1795296549346` and `1795303796269`. The grants[0] overrun (at least 15 against a bound of 6) is corrected in the report and acknowledged by the operator in grants[2]. I record it as information.

## Fix

### F1. `consults.ts match` reads a `resumed` case as open, so the signature gate lets a consult reopen

- Source: `SKILL.md` Loop end tells the watch to write `status` `resumed` when a leaf leaves `failed` by the operator's own action. The operator resuming a failed leaf by hand is a documented user action (`docs/use/watch-while-away.md`, the Limits page). The watch may also write `resumed` after its own resume, because Loop end says "write `status` `closed` or `resumed`" without tying either value to who resumed.
- Trace: the `status` file holds `resumed`. `matchingCases` sets `closed` only when the trimmed status equals `closed` (`skills/watch-issues/scripts/consults.ts:176`). `verbMatch` then prints `open <dir>`. `SKILL.md` Signature gate: "`open <dir>` rejoins that case: … else start one on it."
- Consequence today: a leaf that fails again with an identical signature gets a new paid consultant on a case the record says ended. An identical signature means no commit and no push, for example after the operator retries, or after the consultant's evidence that a prerequisite was met. Each later identical failure repeats this. That is the consult loop the gate exists to stop.
- Hits criterion 3: "a failure whose next consult would carry the same signature as a closed case starts no consultant". `consults.test.ts` covers only the `closed` value.
- Repair: `match` treats every ended status (`closed`, `resumed`) as closed, with a case in `consults.test.ts` writing `resumed`.

### F2. Due coalescing works only during the watcher's first turn ever; every later busy turn still queues one due per boundary

- Source: a real watch running for hours, with a consult opened on any tick after the first. The S4 wait has no give-up time, and a base fix plus `akrogon verify --holder` can take longer than one interval.
- Trace: `timer.ts` `poll` sets `backedUp` only when `watcher.turn === 0` (`skills/watch-issues/scripts/timer.ts:163`). hc's `turn` counts completed turns: `oldest.sent.turn` is compared against `watcher.turn` to detect a finished turn. In the live run the watcher stayed at `"turn":0` through its first turn (watcher screen). After the first tick completes, `turn >= 1`, so every crossed boundary pushes its own `coalescing: false` entry. When the watcher goes idle, each entry is sent in turn as its own check turn. The kept frozen test "each due runs one check …; busy dues each run their own check" (`tests/watch-timer.test.ts:393`) asserts exactly this for a later turn. `SKILL.md:15` still states "Ticks queued while a check runs each run their own check".
- Consequence today: after a long consult on any later tick, the watch runs one redundant paid check turn per elapsed boundary. Consult-loop item 10 rejected that burst ("drain every due"), and its pitfall list names "tick bursts" as avoided.
- Hits criterion 4 ("While the watcher works through several tick boundaries, the timer holds the sent due and at most one unsent due, set to the latest boundary") and design consult-loop item 10. The plan note of 2026-11-21 records the narrowing as "a known narrowing, recorded for review". The criterion has no first-turn limit, so the narrowing leaves the criterion red for every turn after the first.
- Repair, for A only: correct the planned frozen test's busy-dues expectation (a brief-line correction under the test exception, citing criterion 4 and consult-loop item 10), drop the `turn === 0` condition so coalescing holds on any busy turn behind a sent due, and update `SKILL.md:15`. The `unreceipted due` and `receipt without a watcher turn` tests keep the resend and drop path.

## Nits

- N1. `stop.ts` prints `stopped <timer> stopped consultant <address>` on one line (`lines.join(' ')`). Design fix-and-config item 8 says "a second line". No consumer parses it today: the watch reads stop's reply as text, and `tick.ts` never runs stop. The file's header comment still names only `stopped <address>`. Deferred because nothing breaks. A parser of stop output would promote it.
- N2. `tests/AREA.md` names the cell as "(pi watcher, agy consultant, codex seat — 3 harness sessions)". Since grants[1] the seat is the tier stand-in and a run spends 2 sessions (cell header). Deferred: the only effect is an over-sized grant ask. A grant sized from this line would promote it.
- N3. The Judge's human-prerequisite line lost the owner-resolution steps (merged-only owner, unresolved candidates, never reopened) and the owner-defect attention notice. Replacing notify with consult is design item 5. Ownership facts now reach the consultant only if the watch carries them into `brief.md`. Deferred: no criterion names the owner path. A case brief missing a named owner would promote it.
- N4. `watch-issues stop` with no live timer prints `stopped` and leaves a live verified consultant in place. Every timer exit path sweeps, and the consultant has `outlive: false` under the watcher. No realistic source leaves a consultant without its timer today. A timer killed outside `stop.ts` (SIGKILL) with its watcher alive would promote it.
- N5. The consultant runs the installed release `akrogon` from the hc core's PATH. That is harmless while the leaf base equals the release, and the report records it. Try 1 showed a skewed release writing records the checkout refused. Deferred: it is a tier artifact, and a real install has one `akrogon`.

## Docs

`docs/use/watch-while-away.md` `## What stays yours` matches the new behavior. `docs/reference/skills.md:72` ("recovers some failures … notifies you when a leaf needs you") is still true at that level of detail. `SKILL.md:15` is stale and is covered under F2.

## Verdict

fix
