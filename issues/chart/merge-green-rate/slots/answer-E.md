# Consultant E — Systems Analysis: Raising Merge Green Rate

## How `reds.md` (37 non-green attempts) Shapes This View
`reds.md` confirms all 3 post-17:46 reds (`#35` `0330ca03`, `#36` `db15cf5c`, `#37` `280c513c`) and reveals 4 systemic clusters across all 37 reds:
1. **Unverified `check.repair` edits + `fastBaseline` / manifest locks (`#31, #33, #35, #36`)**: `verify-aliases` `fastBaseline` changed 4 times on `main` on 10-14 (`reds.md:61`), tripping `#35` and `#36` at `merge` and causing the `#37` rebase conflict (`promotion-script/review-B.md:448`).
2. **Bounce-induced semantic drift (`#34, #37`)**: `#37` (`HALT: missing-source-artifact: raw/toxic-links-summary.json`) happened because `promotion-script` was held 74 min in two bureaucratic `F8` bounces (`review-B.md:361,513`) while `disavow-evidence-scope` (`41561944b`) landed and changed `replay.ts` `DETERMINISTIC_OWNED` (`review-B.md:473`).
3. **Host load / cross-slot contamination (`#6, #15, #21-25, #29, #30, #32`)**: Timeouts (`#15, #22, #24`), 48 GiB admission blocks (`#21, #23`), and `"Expected -1 Received +3/+1"` (`browser-owner.test.ts:508` in `#25, #29, #30`; `scratch-writer-isolation.test.ts` in `#15, #32`) from concurrent check load across slots.
4. **Remote auth / infra faults burning merge attempts (`#16-18, #20, #26, #28` — 6 of 37 reds)**: In `#16` and `#17`, `akrogon verify` exited `0` (`268s` spent), then `git push` failed on expired GitHub auth—and because receipts bind to `attempt.id` (`src/phase.ts:539`) rather than `tip` tree SHA, the green verify was thrown away.

## Q1. Stocks and Flows
1. **S1 — Latent cross-suite / invariant defects in leaf branches**:
   - *Inflow*: Edits in `implement`, `check.fix`, and **B's edits in `check.repair`** (`src/phase.ts:313-333`) touching repo-wide files (`package.json`, fixtures, `replay.ts`).
   - *Outflow*: Pre-review `leaf` verify (`src/phase.ts:287`), review/repair (`skills/check-issue/SKILL.md:65`), or merge failure (`src/phase.ts:539`).
   - *Leaks*: (a) `check.repair -> merge` bypasses `requireGreenReceipt(repo, head, 'leaf')` (`src/phase.ts:285` only gates `requested === 'check.review'`; `skills/check-issue/SKILL.md:91` tells B not to run `akrogon verify`). (b) `<1s` static guards (`verify-aliases.test.ts` `0.26ms`, `hooks-selftest-hermeticity.test.ts`) sit in `hooks:selftest` (`merge_checks`), not `framework:verify:cheap` (`framework/package.json:169,174`).
2. **S2 — Base-to-branch drift ($\Delta\text{main}$, textual + semantic)**:
   - *Inflow*: Every `merged` fast-forward on `origin/main` (`src/phase.ts:578`) while a leaf sits in `check.*` or `merge`.
   - *Outflow*: A's refresh at `implement`/`check.fix` (`skills/implement-issue/SKILL.md:40,65,86`) and `buildStack` rebase at `merge` (`src/batch.ts:75`).
   - *Leak*: Neither `check.review` nor `check.repair` refreshes onto `origin/main` (`skills/check-issue/SKILL.md:67-95`), so leaves enter `merge` verified against a base 1–10+ commits stale (`promotion-script/review-B.md:271`, `technical-pack-selection/review-B.md:256,322`).
3. **S3 — Merge queue backlog (leaves waiting in `merge`)**:
   - *Inflow*: `check.review`/`check.repair -> merge`. *Outflow*: `batchPush` (`src/phase.ts:581`) or bounce to `check.fix` (`:741`).
4. **S4 — Host concurrent check CPU / RAM / browser-process load**:
   - *Inflow*: Merge `verify` (`1,148 CPU-s`, peak load `19`), `implement` checks, plus **forced full `merge_checks` replays in `check.fix`** (`skills/implement-issue/SKILL.md:80,86`; e.g. `timings.jsonl:2982` running `397s` `verify` concurrently with merge `verify` at `:2989`, driving `#21/#23` 48 GiB admission failures and `#15/#22/#24` timeouts). *Outflow*: Check completion / `stop-run`.

## Q2. Feedback Loops, Misplaced Sensors, and "Reds Breed Reds"
- **B1 — Pre-Review Leaf Gate (`implement`/`check.fix -> check.review`)**:
  - *Goal*: Zero cheap/invariant defects leave leaf phases. *Sensor*: `requireGreenReceipt(repo, HEAD, 'leaf')` (`src/phase.ts:287`). *Actuator*: Blocks phase transition.
  - *Flaws*: (1) **Bypassed on `check.repair -> merge`** (`src/phase.ts:285`). (2) **Wrong sensor boundary**: `framework:verify:cheap` omits `verify-aliases.test.ts` and `hooks-selftest-hermeticity.test.ts`. (3) **Measured on stale base** before rebase onto `origin/main`.
- **B2 — Serial Merge Gate & 1-Cycle Repair (`merge -> merged | check.fix`)**:
  - *Goal*: Keep `origin/main` green. *Sensor*: `akrogon verify --attempt` (`scope='merge'`, `src/verify.ts:116`). *Actuator*: Push (`src/phase.ts:578`), 1-cycle B repair (`skills/merge-issue/SKILL.md:45`), or bounce (`:75`).
  - *Flaws*: (1) **Maximal delay**: detects `0.26ms` alias/hermeticity breaks (`#35, #36`) at the serial `268s` bottleneck. (2) **Fail-slow**: `merge_covers: [cheap]` skips running `cheap` (`~14s`) as a fast pre-gate before `framework:verify` (`src/verify.ts:51`), even after `solo` conflict resolution (`promotion-script/review-B.md:471`). (3) **Handcuffed local actuator**: `skills/merge-issue/SKILL.md:45,57` forbids B from syncing mechanical baseline lists (`fastBaseline` in `verify-aliases.test.ts:276`), forcing a 28-min bounce (`disavow-evidence-scope/review-B.md:808-854`).
- **R1 — Reinforcing "Cheap-Lane Accretion & Alias-Lock" Loop (`R-cheap-accretion`, caused `#35, #36` and `#37` conflict)**:
  - *Mechanism*: Reviewer B enforces a standing rule that every new leaf test must be appended to `framework:verify:cheap` (`package.json:169`) in `check.repair` (`disavow-evidence-scope/review-B.md:215`, `promotion-script/review-B.md:196`). Because `verify-aliases.test.ts:13-39,276` locks `framework:verify:cheap` to a hardcoded `fastBaseline` array and only runs in `hooks:selftest` (`merge_checks`), B's `check.repair` edit goes straight to `merge` and fails `verify-aliases.test.ts:276` (`#35, #36`). Appending every leaf to `package.json:169` and `verify-aliases.test.ts:30-39` updated `fastBaseline` 4 times in one day (`reds.md:61`), creating serial rebase conflicts (`#37`) and bloating `cheap`.
- **R2 — Reinforcing "Bounce Drift & Replay-Load Spiral" (`R-bounce-drift`, caused `#37` and load reds)**:
  - *Mechanism*: A red merge bounces the leaf to `check.fix`. Rules in `skills/implement-issue/SKILL.md:80,86` and `skills/check-issue/SKILL.md:69` force A to replay all of `merge_checks` (`268s`, `1,148 CPU-s`) in `check.fix` (spiking `S4` load alongside active `merge` turns, `timings.jsonl:2982,2989`) and force B in `check.review` to reject (`fix`) if that full replay log is missing (`promotion-script/review-B.md:361,513` `F8`—two bureaucratic bounces costing **74 min** with zero code defects). That 74-min delay lets 6 leaves land on `main` (`S2` ↑), causing the semantic drift (`replay.ts` / spine recording mismatch) that triggered `#37`!

## Q3. Highest-Leverage Structural & Information-Flow Changes
1. **Remove the `fastBaseline` exact-string lock & move `<1s` static meta-guards into `cheap` (breaks `R1`)**:
   - *Mechanism*: In `framework/.claude/hooks/tests/verify-aliases.test.ts:13-39,268-277`, **remove** the `fastBaseline` exact-string lock on `framework:verify:cheap` (no-dropped/no-duplicate steps is already enforced dynamically against `AKROGON_BASE` at lines `289-330`). Run `verify-aliases.test.ts` and `hooks-selftest-hermeticity.test.ts` in `framework:verify:cheap` (`framework/package.json:169`), and wire leaf proofs into their domain suite in `framework:verify:core`, not `cheap`.
   - *Touches / removes*: `framework/.claude/hooks/tests/verify-aliases.test.ts:13-39,268-277` (removes ~35 LoC `fastBaseline`), `framework/package.json:169`. Prevents `#35` (`F6/F7`), `#36` (`F9`), and the `#37` conflict.
   - *Could break*: A leaf could add a slow script to `cheap` without `verify-aliases` failing (mitigated by `AKROGON_BASE` closure check).
2. **Gate `check.repair -> merge` on a `leaf` receipt atop `origin/main`, remove full `merge_checks` replay from `check.fix`/`check.review`, and match merge receipts by `tip` SHA (breaks `R2`, closes `B1`/`S2` leaks & `#16/#17` push waste)**:
   - *Mechanism*: (a) In `src/phase.ts:285-288`, require `requireGreenReceipt(repo, head, 'leaf')` and `isAncestor(trackingRef(repo), head)` on **both** `requested === 'check.review'` and `state.phase === 'check.repair' && requested === 'merge'`. (b) **Remove** the rule in `skills/implement-issue/SKILL.md:65,80,86` and `skills/check-issue/SKILL.md:69,79,91` requiring `check.fix` to replay all of `merge_checks`; replay only the **specific failed test/command** from `review-B.md` plus `akrogon verify` (`leaf`). (c) In `src/phase.ts:539`, accept any green `merge` receipt for `attempt.tip` even if a prior attempt failed at `git push` (`#16, #17`).
   - *Touches / removes*: `src/phase.ts:285-288,539` (+6 LoC); **removes ~25 lines of replay-policing rules** in `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md`.
   - *Could break*: An unrelated `merge_checks`-only regression introduced during `check.fix` waits until `merge` (isolated by `O1` bisect).

## Q4. What Not To Do (Tempting Surface Patches That Worsen the System)
- **Do NOT run `merge_checks` (`framework:verify`) in `implement`, `check.review`, or `check.fix`**: Duplicates `1,148 CPU-s` and `~50 GiB` RAM alongside `merge`, causing `#21/#23` admission blocks, `#15/#22/#24` timeouts, and `74-min` `F8` bounce loops.
- **Do NOT keep appending every leaf's unit test to `framework:verify:cheap`**: Turns `package.json:169` into a 4x/day conflict hotspot (`reds.md:61`) and bloats `cheap`.
- **Do NOT add prose review checklists**: Bureaucratic rejections (`F8`) inflate queue residency (`S3` ↑) and base drift (`S2` ↑), directly breeding drift reds (`#37`).

## Q5. The Right Metric and Target
- **"Merge green rate" (`passed / attempts`) is a lagging, noisy composite**: 8 of 37 reds (`22%`) in `reds.md` (`#16-18, #20, #21, #23, #26, #28`) didn't fail a single test (6 GitHub auth failures, 2 RAM admission blocks), and the rest conflate `<1s` static escapes (`#35, #36`), drift (`#34, #37`), and load timeouts (`#15, #22, #24`).
- **Right sensors & targets**:
  1. **Pre-merge `<1s` invariant escape count** (*target: 0 escapes into `merge`*, vs 3/3 post-17:46 reds today where a `<2s` check was already red before `framework:verify` ran).
  2. **Merge-entry base staleness** — `origin/main` commits behind at `-> merge` (*target: 0 commits*, enforced by ancestor gate).
  3. **Net leaves merged per merge-verify CPU-hour** (*target: $\ge 2.5\times$ baseline via `O1` batching + zero duplicate `check.fix` full-verify runs*).
