# Log Coverage — Blind Notes (Slot D)

## Q1 · Where do chart direct logs (`issues/chart/*/direct/check-*.log`) go?

### What a chart's `direct/` folder holds, and who reads its logs and when
- **What `issues/chart/<chart>/direct/` holds**:
  - Written only when a chart takes the direct route (`skills/chart-issues/SKILL.md:87-123`).
  - Contains `plan.md` and `report.md` (`skills/implement-issue/SKILL.md:96`, `skills/chart-issues/SKILL.md:102`), plus `check-<name>-<ms>-<pid>.log` files written by `akrogon verify --holder <chart>/direct` (`skills/chart-issues/SKILL.md:108`, `src/verify.ts:95, 110, 146`) and any `akrogon run-check --holder <chart>/direct` calls (`src/run-check.ts:126-127`).
  - **Measured on 2026-10-15**:
    - `akrogon`: 5 chart `direct/` folders (`handoff-gaps`, `merge-green-rate`, `overnight-recs`, `system-flow`, `system-speed`) hold `53` `check-*.log` files (`2,722,563` bytes = `2.60 MiB`, including a `1.84 MB` `check-verify-1792049043778-2991388.log` in `system-flow/direct/`), `1` `.ask-B1.log` (`135` bytes), `1` `plan.md` (`5,724` bytes), `1` `report.md` (`2,233` bytes), and `1` `review-B-1.md` (`3,532` bytes).
    - `framework`: 1 chart `direct/` folder (`issues/chart/merge-green-rate/direct`) holds `2` `check-*.log` files (`check-setup-1792016370633-1333097.log`, `708` bytes; `check-verify-1792016646747-1333097.log`, `1,812,494` bytes = `1.73 MiB`) and `1` `report.md` (`2,382` bytes). Each `akrogon verify --holder <chart>/direct` run in `framework` adds ~`1.8 MB` of `check-verify-*.log` per repair or push-rebase round (`skills/chart-issues/SKILL.md:108, 110, 117`).
- **Who reads its logs and when**:
  - **While the chart is active (before `Closed`, `Held`, or `Handed off`)**:
    - **Slot A (the chart door)** reads `<chart>/direct/check-*.log` during `implement-issue direct` and repair/landing rounds (`skills/chart-issues/SKILL.md:102, 108, 117`).
    - **Slot B (the direct reviewer)** reads `<chart>/direct/check-*.log` during `check-issue direct` (`skills/check-issue/SKILL.md:99-101`), citing exact lines in `slots/review-B-<n>.md` (e.g., `issues/chart/overnight-recs/slots/review-B-2.md:16` citing `direct/check-test-1792041494840-2554005.log:921–934` and `review-B-3.md:14` citing `direct/check-test-1792041695693-2905336.log:921`).
    - `direct-guards.ts` (`skills/chart-issues/scripts/direct-guards.ts:20`) calls `requireGreenReceipt(repo, head, 'merge')` (`src/verify.ts:39-67`), which reads `issues/verify-runs.jsonl`, **not** the `.log` files in `direct/`.
  - **After the chart ends (`Closed`, `Held`, `Handed off`)**:
    - **`akrogon flaky` (`src/flaky.ts:10-43`)**: reads `issues/verify-runs.jsonl` (`7` receipts in `akrogon`, `1` in `framework` point to `issues/chart/*/direct/check-*.log`) and opens `prior.log` whenever a command flips from red to green on the same tree.
    - **The operator and later `learn-issues` / audit seats**: read logs cited in `CHART.md`, `direct/report.md`, `slots/review-B-*.md`, or `issues/verify-runs.jsonl` via `akrogon log <path>`.

### 1. Pick, reason, and cost
- **Pick**: **Pack when the chart ends (`Closed`, `Held`, `Handed off`) into `<chart>/evidence.tar.zst` (or `<chart>/direct/evidence.tar.zst`), gitignoring `issues/chart/**/*.log` while the chart is open and resolving `issues/chart/<chart>/...` in `akrogon log <path>` and `akrogon flaky`.**
- **Reason**:
  - Gives chart direct logs the exact same lifecycle and guarantees as leaf logs under `evidence-location.md`: plain on disk while A and B are actively working on the chart, never committed plain by `akrogon sync`, losslessly archived in git once the chart reaches a terminal marker (`Closed`, `Held`, or `Handed off`), and readable with `akrogon log <path>` and `akrogon flaky`.
  - **Compression measurement (2026-10-15)**: Packing each chart's `direct/*.log` with `Bun.Archive` + `Bun.zstdCompressSync(..., { level: 19 })` shrinks `akrogon`'s 5 charts from `2,722,698` bytes (`54` files) to `335,053` bytes (`327 KiB`, `8.1x` smaller) and `framework`'s `merge-green-rate/direct` from `1,813,202` bytes (`2` files) to `198,279` bytes (`194 KiB`, `9.1x` smaller; 15x–30x on multi-round charts).
  - Satisfies the operator's cleanliness requirement (*"I want all folders to be clean of junk and leftover files"*) and readability requirement (via `akrogon log <path>`).
- **Cost**:
  - Unlike leaves, charts do not close through `completeOwner` (`src/phase.ts:221-224`); they end when the door appends `Closed <YYYY-MM-DD>`, `Held <YYYY-MM-DD>`, or `Handed off <YYYY-MM-DD>` to `CHART.md` and runs `chart-usage.ts` (`skills/chart-issues/SKILL.md:85, 114, 121`). Packing therefore requires a hook at chart end (in `chart-usage.ts` when `CHART.md`'s last marker matches `/^(Handed off|Closed|Held)\b/gm` per `src/status.ts:319`, and as a safety net in `akrogon sync` `src/sync.ts:154-165` before `git add -- issues`) plus the `chart/<chart>/<member>` branch in `akrogon log` / `akrogon flaky`.

### 2. Rejected options and reasons
- **Rejected — Committed plain as today**:
  - Every `akrogon verify --holder <chart>/direct` run in `framework` writes a ~`1.8 MB` `check-verify-*.log` (`1,812,494` bytes in `issues/chart/merge-green-rate/direct/check-verify-1792016646747-1333097.log`). A direct chart with 2–3 repair or push-rebase rounds commits `3.6–5.4 MB` of uncompressed logs into git history and every checkout/worker worktree, recreating the #92 bloat inside `issues/chart/` and leaving loose `.log` files in `direct/`.
- **Rejected — Ignored and kept on this host only**:
  - `issues/verify-runs.jsonl` (`7` receipts in `akrogon`, `1` in `framework`), `CHART.md` (`issues/chart/handoff-gaps/CHART.md:17`), `direct/report.md`, and `slots/review-B-*.md` (`issues/chart/overnight-recs/slots/review-B-2.md:16`) are committed to git and cite `direct/check-*.log`. Leaving those logs uncommitted on one host means `akrogon flaky` and `akrogon log <path>` fail in any other clone or after host cleanup, and loses the evidence altogether if the host disk is lost.

### 3. Evidence (tier, source, date)
- `operator` · `issues/chart/check-evidence/forks/log-coverage.md:9-11` (read 2026-10-15) · Taken `evidence-location.md` packs one `evidence.tar.zst` per owner at close and reads via `akrogon log <path>`; operator requires logs to remain readable when referred to and all folders to be clean of leftover files.
- `better-than-training` · `skills/chart-issues/SKILL.md:85, 100-122`, `skills/chart-issues/scripts/direct-guards.ts:16-21`, `skills/chart-issues/scripts/chart-usage.ts:342-490`, `src/status.ts:318-321` (read 2026-10-15) · Direct route runs `akrogon verify --holder <chart>/direct`, checks receipt in `direct-guards.ts`, and marks chart end by appending `Closed <YYYY-MM-DD>`, `Held <YYYY-MM-DD>`, or `Handed off <YYYY-MM-DD>` to `CHART.md` followed by running `chart-usage.ts`.
- `better-than-training` · Live measurements on `/home/ivan/Work/infra/akrogon/issues/chart/*/direct` and `/home/ivan/Work/infra/tamdoma/framework/issues/chart/*/direct` (measured 2026-10-15) · `54` `.log` files (`2.60 MiB` raw -> `327 KiB` `.tar.zst`) in `akrogon` and `2` `.log` files (`1.73 MiB` raw -> `194 KiB` `.tar.zst`) in `framework`; `7` `verify-runs.jsonl` entries in `akrogon` and `1` in `framework` reference `issues/chart/*/direct/check-*.log`.

### 4. Pitfalls and what removes each
- **Pitfall 1 — Chart end is a markdown edit (`CHART.md`), not an `akrogon phase` call, so a chart could end without packing if only `completeOwner` packs**:
  - *Removed by*: Calling the shared pack-verify-unlink helper both in `skills/chart-issues/scripts/chart-usage.ts` (which `skills/chart-issues/SKILL.md:85` requires the door to run whenever it appends `Handed off`, `Held`, or `Closed`) when `CHART.md`'s last marker is `Handed off`, `Closed`, or `Held`, and in `akrogon sync` (`src/sync.ts:154-165`, before `git add -- issues`) for any chart in `issues/chart/*` whose `CHART.md` has a terminal last marker and still has plain `*.log` files on disk.
- **Pitfall 2 — A chart marked `Held` or `Closed` is later reopened for a new fork or round, producing new `direct/check-*.log` files alongside an existing `evidence.tar.zst`**:
  - *Removed by*: Using the exact same merge-on-retry archive rule from `evidence-location.md` Rule 3 (read existing `evidence.tar.zst` entries, merge with any plain `*.log` on disk, verify byte-for-byte, rename into place, then unlink plain `*.log`), and in `run-check` refusing `--holder <chart>/direct` when `<chart>/CHART.md`'s authoritative last marker is `Closed`, `Held`, or `Handed off` (or `<chart>/.closing` exists).
- **Pitfall 3 — Non-`check-*` logs under a chart (such as `issues/chart/system-speed/direct/.ask-B1.log`) being staged by `akrogon sync`**:
  - *Removed by*: Adding `issues/chart/**/*.log` to `.gitignore` via `src/init.ts:67-76` and packing all `*.log` under `<chart>/` (relative to `<chart>/`) into `<chart>/evidence.tar.zst` at chart end.

### 5. Unasked question
- None beyond the Q1 options (packing into `<chart>/evidence.tar.zst` with member paths `direct/check-*.log` relative to `<chart>/` matches `<owner>/evidence.tar.zst` in `evidence-location.md` Rule 5 so `issues/chart/<chart>/<member>` resolves identically to `issues/closed/<owner>/<member>`).

---

## Q2 · Do skills keep allowing hand-saved logs, or must every check output go through `akrogon run-check`?

### Sample of hand-saved logs in `framework`: what they hold vs `run-check` logs, and which skill steps make seats write them
Across `framework`'s `4,462` tracked `issues/**/*.log` files (`944.9 MiB`), `1,363` are `check-*.log` files from `run-check`, `60` (`22.69 MiB`) are legacy `base-<uuid>.log` files written by `akrogon`'s former `base-run` command (removed in `dc2e2b0` on 2026-10-14), and `3,039` are seat-written `.log` files (`1,826` in 26 pre-`run-check` owners; `1,213` in 20 post-`run-check` owners, including `145` since `dc2e2b0` on 2026-10-14). Sampling the post-`run-check` and post-`verify` hand-saved logs shows two distinct classes:

1. **Class A — Full-suite / configured-check redirects that duplicate `check-*.log` (`merge-evidence-*/*.log`, `merge-B-verify-terminal.log`, `merge-verify-final.log`, `repair-B-verify-retry-terminal.log`, `f4-wrapper-selftest.log` — `693` `merge-*` files = `247.45 MiB` + `246` plain `selftest.log`/`contracts.log`/`parity.log`/`test.log`/`verify.log` = `39.67 MiB`)**:
   - **Sampled pairs (inspected 2026-10-15)**:
     - `issues/closed/seo-crawl-evidence/structured-data-evidence/schema-value-flags/implementation/merge-B-verify-terminal.log` (`1,817,803` bytes) vs `check-verify-1791996068115-4099846.log` (`1,817,762` bytes) in the same folder: identical `1.82 MB` output, differing only by the 41-byte `run e71adc6b-e7bd-4a75-8818-526aa68214fe\n` header printed to stderr by `src/admission.ts:154`.
     - `schema-value-flags/implementation/repair-B-verify-retry-terminal.log` (`1,768,309` bytes) vs `check-verify-1791994788269-1267527.log` (`1,768,268` bytes): identical `1.77 MB` output, differing only by the 41-byte `run <uuid>\n` line.
     - `issues/closed/backlink-audit-run/disavow/prior-disavow-lookup/merge-verify-final.log` (`15,400+` lines) vs `implementation/check-verify-1792023778622-1863963.log`: holds only `run <uuid>`, `setup` stdout, a byte-for-byte copy of `check-verify-*.log`, and the two trailing `verify verify: 0 <path>` / `verify merge <sha>: green` lines from `src/verify.ts:170, 192`.
   - **What they hold that `run-check` does not**: Nothing substantive (only the 41-byte `run <uuid>` line or the 2-line `verify` summary that is already recorded in `issues/verify-runs.jsonl`).
   - **Which skill steps make seats write them**:
     - `skills/merge-issue/SKILL.md:41, 53`: *"B runs `akrogon verify --attempt <id>` in the worktree ... then records its output in `review-B.md` under the `leaf=` folder"*.
     - `skills/implement-issue/SKILL.md:25`, `skills/check-issue/SKILL.md:18`, `skills/merge-issue/SKILL.md:18`: *"Temp files and logs go under `$TMPDIR`, never a fixed `/tmp/<name>`; the full check set runs only through `akrogon verify`; **anything needed later goes in the leaf folder**."*

2. **Class B — Targeted proofs, deliberate-break negative runs, red/green bug-fix reproductions, and live/grant capture replays (`repair-B-F1-red.log`, `repair-B-F1-green.log`, `proof-A-c2-break.log`, `review-B-probes.log`, `merge-capture-review.log` — ~`957` files = `51.45 MiB` across `repair-*`, `review/recheck-*`, and `proof-*`)**:
   - **Sampled files (inspected 2026-10-15)**:
     - `issues/closed/phase-lifecycle/shared-promotion/promotion-without-git/implementation/proof-A-c2-break.log` (`3,100` bytes) and `proof-A-c4-break.log`: output of `bun test ./.claude/hooks/tests/promotion-recheck.test.ts` run against an uncommitted deliberate break of the product code (`1 fail` with assertion diff).
     - `promotion-without-git/implementation/repair-B-F1-red.log` and `repair-B-F1-green.log`, and `workflow-point-repairs/offer-prep-route/repair-evidence-B/repair-B-acceptance-before.log` (`3,716` bytes, `0 pass, 1 fail`): output of `bun test <single-file> --test-name-pattern '...'` before and after a Fix commit.
     - `workflow-point-repairs/offer-prep-route/review-evidence-B/positive-probe.log` (`3,696` bytes): B's review probe running a 2-test file in `$TMPDIR`.
     - `backlink-audit-run/disavow/prior-disavow-lookup/merge-capture-review.log` (`4` lines): output of `bun .../capture-review.ts` re-recording a fixture under a grant (`wall_ms=30030 dispatches=1 ... absence check evidence_dir_gone=true`).
   - **What they hold that a `run-check` log does not**:
     - Because seats ran `bun test <file> > implementation/repair-B-F1-red.log 2>&1` directly in bash instead of invoking `akrogon run-check --name <label> -- bun test <file>`, there is **no `check-*.log` at all** for these targeted/red/break/capture runs.
   - **Which skill steps make seats write them**:
     - `skills/implement-issue/SKILL.md:59` and `skills/check-issue/SKILL.md:53, 79, 83, 85`: *"a bug fix shows fail-before/pass-after and new behavior shows one deliberate break turning its test red"*; *"one command red on the head before the repair and green after"*; *"with the failing and passing output in `review-B.md`"*.
     - `skills/implement-issue/SKILL.md:65` and `skills/implement-issue/brief-template.md:43`: *"write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths"*.
     - `skills/implement-issue/SKILL.md:38` and `skills/check-issue/SKILL.md:67`: *"A green retry marks the check `inconsistent` in `implementation/report.md` [or `review-<slot>.md`] with both logs"*.
     - `skills/implement-issue/SKILL.md:80`: after a red merge ending, `check.fix` runs the narrowest reproducing command red on the rejected head and green after repair, recording both in `implementation/report.md`.
     - **Why seats redirected by hand even when `run-check` existed**: `runCheck` (`src/run-check.ts:143`) does **not** print the kept `check-<name>-<ms>-<pid>.log` path on exit (unlike `src/verify.ts:163, 170` which prints `verify <name>: <code> <log>`), and the skills never told seats to run targeted proofs/reproductions through `akrogon run-check --name <label> -- <cmd>`.

### 1. Pick, reason, and cost
- **Pick**: **Every check, targeted test, deliberate-break proof, red/green reproduction, or probe whose log a seat keeps must go through `akrogon run-check --name <label> -- <cmd>` (or `akrogon verify`), and skills forbid hand-saved `*.log` files under `issues/`.**
- **Reason**:
  1. **Eliminates 1.8 MB duplicate verify logs**: Stops seats from redirecting `akrogon verify` or configured `checks` into `merge-B-verify-terminal.log` / `merge-verify-final.log` (`247.45 MiB` of `merge-*` logs in `framework`), which bloats even `evidence.tar.zst` and open/worker disk with duplicate logs.
  2. **Enforces process containment, admission, env hygiene, and timing on every seat-run command**: Running a targeted test or capture script directly in bash bypasses `withAdmission` (`src/admission.ts:130-169`, so `akrogon stop-run <run-id>` cannot stop it), bypasses systemd scope isolation (`startRunGuard` / `stopRunUnits` at `src/run-check.ts:192-203`, so leaked child processes/browsers survive), bypasses `constructedEnv` (`src/run-check.ts:52-65`, so `TMPDIR` is not auto-cleaned in `finally` at `:221`), and bypasses `appendTiming` (`src/run-check.ts:182, 210`, hiding the run from `akrogon timing <slug>`). Routing through `akrogon run-check --name <label> -- <cmd>` gives every run all four guarantees automatically.
  3. **One writer, one directory (`<leaf>/implementation/` or `<chart>/direct/`), one naming rule (`check-<name>-<ms>-<pid>.log`), and one close-status guard**: Every log goes through `src/run-check.ts:207-209`, so the late-writer guard from `evidence-location.md` Rule 4 (`.closing` / `issues/closed/` refusal) protects every log without exception; no seat creates stray `merge-evidence-*/`, `repair-evidence-B/`, or `proofs/` folders.
- **Cost**:
  - Requires a 1-line addition in `src/run-check.ts:143` (or `checkedRun` `:217`) so `akrogon run-check` prints `check <name>: <code> <kept-log-path>` (matching `src/verify.ts:170`), and updating `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, and `skills/merge-issue/SKILL.md` to state that kept command logs come only from `akrogon verify` and `akrogon run-check --name <label> -- <cmd>`, never from shell redirection (`>` / `tee`) into `issues/`.

### 2. Rejected options and reasons
- **Rejected — Keep allowing hand-saved logs in skills**:
  - Seats will continue redirecting `akrogon verify` into `merge-B-verify-terminal.log` (duplicating 1.8 MB per run), creating ad-hoc subdirectories (`merge-evidence-B/`, `repair-evidence-B/`, `review-evidence-B/`, `proofs/`), bypassing systemd `.scope` process cleanup and `TMPDIR` cleanup on targeted tests/captures, and bypassing `src/run-check.ts`'s `.closing` / `issues/closed/` late-writer guard.

### 3. Evidence (tier, source, date)
- `better-than-training` · `src/run-check.ts:52-65, 105-144, 154-222`, `src/admission.ts:130-169`, `src/verify.ts:154-171`, `src/flaky.ts:20-43` (read 2026-10-15) · `run-check` already supports arbitrary `--name <n> -- <argv>...` in leaf, worker (`-u<N>`), and `--holder` scopes with systemd `.scope` cleanup, isolated `TMPDIR`, and `timings.jsonl` recording, and does not touch `verify-runs.jsonl` (so intentional red runs in `run-check` never pollute `akrogon flaky`); however, `runCheck` at `src/run-check.ts:143` currently does not print the saved `kept` log path.
- `better-than-training` · `skills/implement-issue/SKILL.md:25, 38, 59, 65, 80`, `skills/check-issue/SKILL.md:18, 53, 67, 79, 83, 85`, `skills/merge-issue/SKILL.md:18, 41, 53` (read 2026-10-15) · Skills currently tell seats *"anything needed later goes in the leaf folder"* and *"records its output in `review-B.md`"*, prompting shell redirection into hand-named `.log` files.
- `better-than-training` · Live inspection of `/home/ivan/Work/infra/tamdoma/framework/issues/closed/` (measured 2026-10-15) · `schema-value-flags/implementation/merge-B-verify-terminal.log` (`1,817,803` B) is a 41-byte-header wrapper around `check-verify-1791996068115-4099846.log` (`1,817,762` B); targeted/red/break/capture logs (`repair-B-F1-red.log`, `proof-A-c2-break.log`, `merge-capture-review.log`) have no `check-*.log` counterpart only because seats invoked `bun test` / `bun <script>` directly instead of via `akrogon run-check --name <label> -- ...`.

### 4. Pitfalls and what removes each
- **Pitfall 1 — A seat running `akrogon run-check --name <label> -- <cmd>` does not know the exact `<leaf>/implementation/check-<label>-<ms>-<pid>.log` path to cite in `report.md` or `review-B.md`**:
  - *Removed by*: Printing `check <name>: <code> <kept>` from `runCheck` (`src/run-check.ts:143`), matching `verify <name>: <code> <log>` in `src/verify.ts:170`.
- **Pitfall 2 — Intentional red runs (deliberate-break tests or pre-fix bug reproductions run via `akrogon run-check`) being mistaken for flaky tests by `akrogon flaky`**:
  - *Removed by*: `akrogon flaky` (`src/flaky.ts:20, 62`) reads only `issues/verify-runs.jsonl` (written exclusively by `akrogon verify`), never `issues/timings.jsonl`, so `akrogon run-check` red proofs never enter `flaky`.
- **Pitfall 3 — A seat running a command in `check.review` or `merge` when the worktree is detached or in a worker worktree**:
  - *Removed by*: `leafTarget` (`src/run-check.ts:105-127`) already resolves leaf worktrees, worker worktrees (`-u<N>`), `--leaf <path>`, and `--holder <dir>`.
- **Pitfall 4 — `completeOwner` archival if a seat still writes a stray `.log` file despite skill instructions**:
  - *Removed by*: Keeping `completeOwner`'s rule (`evidence-location.md` Rule 3) that packs **every** `*.log` under `<owner>/` (not only `check-*.log`), so the close-time pack remains a catch-all safety net even while skills and `run-check` enforce a single writer.

### 5. Unasked question
- Should `requireNoIssueFiles` or a phase-move guard in `src/phase.ts` refuse any `*.log` file under `<leaf>/` that does not match `implementation/check-*.log`, so the one-writer rule is enforced mechanically at phase transitions rather than by skill text alone?
