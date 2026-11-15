# Territory map — slot C (`failure-identity`, Tamdoma/akrogon#134)

Bound by `issues/chart/failure-identity/forks/signposts.md` (`## Question`, `## Taken`, `## Needs`: `1a 2a 3a 4a 5a 6a`) and `issues/chart/known-red-nameless/forks/coverage-rule.md` (`## Taken`).

## Corpus & live-surface facts

- **Consumer corpus (`tamdoma/framework/issues/verify-runs.jsonl`, read via `readVerifyRuns` in `src/verify.ts` and `readLog` in `src/evidence.ts`):** 2,186 total runs; 548 completed unblocked/unreused red command entries — **254 readable** on disk/archive, **294 gone** (post-retirement). Among the 254 readable red logs:
  - **164** contain `bun test` `(fail)` lines (including **2** with `(fail) (unnamed)` hook timeouts).
  - **90** contain no `(fail)` line, and **every single one (90/90)** contains Bun's `<prefix> | Exited with code <n>` (`code 1` or `code 2`; `code 0` never prints `Exited with`). **0** readable red logs in `framework` lack both.
  - **23 mixed parallel runs** contain `(fail) <test>` on one `bun run --parallel` branch **and** an uncovered `<prefix> | Exited with code 1` custom-script failure on another branch in the **same** log (including `dilutor-rebalance`, one of the two `(unnamed)` runs, where `test:variant-parity` also exited 1 and was silently dropped by `failedTests` in `src/flaky.ts`).
  - **Shard wrapper drift across flips:** Across `framework`'s 13 `(no test name)` flips, `test:remote-image` moved from `framework:verify:rest-c | test:remote-image` (1 flip) to `framework:verify:rest-d | test:remote-image` (8 flips).
  - **`(unnamed)` stream context:** Both `(unnamed)` logs carry the script prefix (`framework:verify:rest-a | test:emdash-kit`) and `bun test`'s preceding file header on the same stderr stream (`.claude/skills/dev-build-astro/test/emdash-kit/local-dev.test.ts:`).
- **`akrogon` corpus (`akrogon/issues/verify-runs.jsonl`):** 434 runs; 160 red entries — 157 readable (94 with `(fail)` lines, 63 check-only such as `format` / `typecheck` with neither `(fail)` nor `Exited with code`), and **3 `nomatch` (`(log gone)`)**, of which **2 still exist on disk as plain files** (`issues/chart/worktree-cleanup/leftovers-verify/check-test-*.log` and `issues/chart/run-release/pending/check-test-*.log`, rejected because `locate` in `src/evidence.ts` accepts only `issues/chart/<chart>/direct/...`) and 1 was `/tmp/.../scratchpad/dropfull/check-test-*.log`.
- **Seat text topology:** Three lifecycle skills (`skills/implement-issue` `## Shared context`, `skills/check-issue` `## check.review`, `skills/merge-issue` `### Shared endings`) symlink to one shared file: `skills/lifecycle-rules.md` (`## Red check with no cause in the leaf's diff`). The fourth copy is `skills/chart-issues/assets/direct-route.md` (`# Direct route`), reached from `skills/chart-issues/SKILL.md` (`## Direct route`).

---

## Material forks

### Fork 1 · Extracted identity grammar, wrapper stripping, and kind separation (`src/flaky.ts` `failedTests`)

Signpost `3a` restricts sources to Bun `(fail)` lines, Bun failed-script lines, and the check's own name. Four concrete design choices remain:

1. **Per-stream mixing (mandatory to avoid silent drops, proven by 23 `framework` runs):** Extract `(fail)` lines per stream and **also** emit failed leaf scripts whose stream produced no `(fail)` line — never treat script exit lines as a whole-log fallback behind `names.length === 0`.
2. **Wrapper chain vs leaf script + `(unnamed)` qualification + signals:**
   - **Option 1A (recommended):** Drop ancestor `bun run` chains (any failed prefix `P` where another failed chain starts with `P + " | "`), emit the **innermost leaf script** token for uncovered failed scripts (supporting both `<prefix> | Exited with code <n>` for `n !== 0` and `<prefix> | Signaled: <SIG>`), keep real `(fail) <test>` titles unprefixed (preserving `tests/flaky.test.ts` expectations and historical series), qualify `(fail) (unnamed)` with the preceding `<file>:` header on that stream (falling back to the leaf script prefix when no file header precedes it), and distinguish **identity namespace/kind** (e.g. `(script) <script>`, `(check) <checkName>`, or `<file> > (unnamed)` vs plain `<test>`).
     - *Prevents:* shard-rebalance splitting (`rest-c` vs `rest-d`), `(unnamed)` cross-file collisions, and collision between a real test literally named `test` (`(fail) test`) and nameless fallback on check `test` (`tests/verify.test.ts` `'a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work'`).
     - *Could invite:* if a monorepo later runs two subpackages whose leaf script tokens are both `test` under `bun run --parallel`, innermost token alone merges them unless disambiguated when duplicate leaf names exist.
   - **Option 1B:** Keep the full `<outer> | <inner>` prefix chain and bare `<entry.name>` with no kind marker.
     - *Breaks:* splits `test:remote-image` across `rest-c` and `rest-d` in `akrogon flaky` and `newRedUnits`, prints `1 <ts> format format` in `flakyCommand` (`src/flaky.ts`), and lets `(fail) test` collide with nameless check `test` in `knownRedReceipt`.
   - **Option 1C:** Prefix *every* `(fail) <test>` with its `<script>` when run under `bun run`.
     - *Breaks:* contradicts `tests/flaky.test.ts` (`'test:owner | (fail) browser owner > dies with run'` -> `'browser owner > dies with run'`) and splits all existing named flaky series across the cutover.

### Fork 2 · Run-record field shape and stored-vs-live precedence (`src/verify.ts` `verifyRunSchema`, `runOnce`, `knownRedReceipt`, `newRedUnits`; `src/flaky.ts` `flips`)

Signpost `4a` stores failure names on the run record from now on while keeping both real logs mandatory for `verify --known-red`.

- **Option 2A (recommended — stored-first for reporting/notices, live-logs-always for `knownRedReceipt`):**
  - Add an optional `failures?: string[]` (or `failed?: string[]`) on `verifyRunSchema`'s command object (`z.strictObject` in `src/verify.ts`), populated in `runOnce` only for executed red entries (`exit !== 0 && blocked === undefined && reused === undefined`) from the captured log before `newRedUnits` runs.
  - `flips` (`src/flaky.ts`) and `newRedUnits` (`src/verify.ts`) use `item.failures` when present, falling back to `failedTests(repo, item.log, item.name)` for legacy rows (`failures === undefined`), where `LogError('nomatch')` yields `['(log gone)']` and `'archive'`/`'member'` errors still throw (`tests/flaky.test.ts`).
  - `knownRedReceipt` (`src/verify.ts`) **always reads both `entry.log` and `onBase.log` via `readLog`** (refusing `LogError('nomatch')` on either side) and compares identities extracted by the current parser.
  - *Wins:* Zero `.tar.zst` decompression on future `flaky`/`newRedUnits` scans, survives `evidence.tar.zst` deletion and `/tmp` cleanup, and guarantees head-vs-base comparison in `knownRedReceipt` never mixes pre-upgrade stored strings with post-upgrade parsed strings or covers a missing log.
  - *Could break:* `akrogon rollback` to an older binary whose `verifyRunSchema` (`z.strictObject`) lacks `failures` will reject `verify-runs.jsonl` rows written after the upgrade (see Pitfalls).
- **Option 2B (live-log-first everywhere, `item.failures` consulted only on `LogError('nomatch')`):**
  - *Wins:* Future parser refinements apply retroactively while archives remain on disk.
  - *Breaks / cost:* Keeps O(archives) zstd decompression on every `akrogon flaky` and inside `newRedUnits`'s nested loop until archives are deleted.

### Fork 3 · `knownRedReceipt` coarse/signal matching and seat rule wording (`src/verify.ts` `knownRedReceipt`; `skills/lifecycle-rules.md` `## Red check with no cause in the leaf's diff`; `skills/chart-issues/assets/direct-route.md` `# Direct route`)

Signpost `2a` lets the command compare factual identities while seats read both logs and never treat a coarse identity as proof by itself.

- **Option 3A (recommended — uniform subset match over kind-tagged identities + coarse-identity trigger in both seat files):**
  - `knownRedReceipt` requires readable logs on both head and base (`readLog` succeeds on both; Today `onBase.log` `nomatch` fails only indirectly when head refuses `(log gone)`, so explicit refusal on both sides is cleaner when check-name fallback replaces `(no test name)`!) and requires every head identity in `baseNames` (`names.every((n) => baseNames.includes(n))`). Because identities carry kind separation (Fork 1A), named-vs-script, script-X-vs-script-Y, named-vs-check, and hook-file-A-vs-hook-file-B all fail mechanically, while check-only-vs-check-only on the same `name` + `command` still passes (`tests/verify.test.ts` `'verify --known-red covers a red command naming no test when the base run of it also names none'`).
  - Update `skills/lifecycle-rules.md` (`## Red check with no cause in the leaf's diff`) and `skills/chart-issues/assets/direct-route.md` (`# Direct route`) so the full two-log completeness + causal-fit check is required **whenever any red unit on the head is identified only coarsely (by failed script name, hook timeout `(unnamed)`, or check name), even if other units in the same log named real tests**; only commands whose red units are **all** specific real test names also failing on the base take the named branch.
- **Option 3B (also mechanically refuse `<script> | Signaled: <SIG>` in `knownRedReceipt`):**
  - *Pros:* Enforces "not killed or crashed" mechanically for signaled fan-out sub-scripts without waiting for seat review.
  - *Cons / invites:* Diverges from top-level signal exits (e.g. exit `143` on a non-fan-out command), which `knownRedReceipt` leaves to the seat's completeness check under `coverage-rule.md` `## Taken`.

### Fork 4 · Reading existing plain logs outside `locate` boundaries without breaking `readLogAcross` (`src/evidence.ts` `locate`, `readLog`, `readLogAcross`)

Signpost `5a` owns logs written outside `issues/` (and non-`direct` chart folders) that still exist on disk.

- **Option 4A (recommended — repo-interior plain fallback in `readLog` + guarded external plain fallback):**
  - Keep `locate` and archive resolution unchanged first (preserving `issues/open|closed|parked/<owner>` and `issues/chart/<chart>/direct` plain + `evidence.tar.zst` lookup, `src/pack-command.ts` `classify` alignment, and nested-boundary precedence in `tests/log-reader.test.ts`).
  - When `locate` returns `null`:
    1. If `absolute` lies `within(absolute, root)` for one of `roots(repo)`, check `resolve(repo.root, relative(root, absolute))` and `absolute`; return bytes if an existing regular file (`statSync(...).isFile()`). Because `within` binds to `repo`, `readLogAcross` matches **only** that one repo (resolving `akrogon`'s 2 `issues/chart/*` `nomatch` logs).
    2. If `absolute` is outside `roots(repo)` **and** `recorded` contains no `issues/(open|closed|parked|chart)/` segment (a true external `--holder` such as `/tmp/holder/check.log` or `f.home/chart/direct/check.log`), `readLog` reads `absolute` when `existsSync` holds, and `readLogAcross` runs repo-owned resolution across `global.repos` first and falls back once to that external plain file only when zero repos matched — keeping `tests/log-reader.test.ts` `'log resolves against every registered repo outside one and names matches or the path'` unambiguous.
- **Option 4B (repo-interior fallback only; external `--holder` outside repo roots stays `nomatch` in `akrogon log` and handled only inside `verify.ts`):**
  - *Breaks:* `verify --holder /tmp/x --known-red` or `akrogon log /tmp/x/check.log` behaves inconsistently with in-repo holders even while `/tmp/x/check.log` sits on disk.

---

## Practitioner questions

1. **How does `flakyCommand` format check-level fallbacks?** `flakyCommand` (`src/flaky.ts`) prints `${line.count} ${line.last} ${line.name} ${line.test}`. If check `format` falls back to `'format'`, naive printing emits `format format`; formatting coarse kinds cleanly (e.g. `(check)` or `(script) test:remote-image`, while `newRedUnits` formats `format` or `format: (check)`) avoids stutter in both `flaky` and `main-red` notice bodies (`src/verify.ts` `runOnce`).
2. **Does `newRedUnits` still decompress every historical base log in `O(units * runs)`?** In `src/verify.ts` `newRedUnits`, `await failedTests(repo, item.log)` currently runs inside `for (const unit of units) for (const run of runs)` without per-`run` memoization. Memoizing per `item.log` (plus preferring `item.failures`) removes repeated `.tar.zst` decompression on multi-failure base runs.
3. **What if `base` log is gone in `knownRedReceipt` under check-name fallback?** Today (`src/verify.ts` `knownRedReceipt`), a gone `onBase.log` fails only because `baseNames` is `['(log gone)']` while head refused `'(log gone)'`. Explicitly refusing `'(log gone)'` on `baseNames` too prevents any future bug from matching two gone logs.

---

## Lifetime pitfalls

1. **Concatenated `stdout + stderr` in `checkedRun` (`src/run-check.ts`):** `kept` is `result.stdout + result.stderr`, not time-ordered across streams. Both `bun test` (`<file>:`, `(fail)`) and `bun run` (`| Exited with code`, `| Signaled:`) write to `stderr`, so relative order within stderr holds, **provided** the parser never correlates a stdout line position against a stderr exit line position.
2. **Blocked command entries share their blocker's `log` and non-zero `exit` (`src/verify.ts` `runOnce`):** `runOnce` must skip `item.blocked !== undefined` when populating `failures` on `VerifyRun['commands']`, or blocked `full`/`merge_checks` entries will record the blocker's failure names.
3. **`z.strictObject` rollback hazard (`src/verify.ts` `verifyRunSchema`, `src/status.ts` `scanRepo`):** `status`, `flaky`, and `verify` parse every line of `issues/verify-runs.jsonl` with `verifyRunSchema` (`z.strictObject`). Once a new run writes `failures`, rolling `akrogon` back to a pre-change release causes `status`/`verify` to fail schema parse on that repo unless the operator knows new ledger fields are forward-only.
4. **Symlinked `skills/lifecycle-rules.md` (`tests/docs-links.test.ts`, `tests/run-units.test.ts`):** Edit `skills/lifecycle-rules.md` directly (never replace symlinks under `skills/*/lifecycle-rules.md` with plain files) and preserve all literal substrings asserted in `tests/docs-links.test.ts` and `tests/run-units.test.ts`, plus the 40-line section contract on `src/AREA.md` (`skills/check-issue` `## check.review`).

---

## Proposed split into leaves

Two disjoint code surfaces plus a linear `flaky`/`verify` chain give **2 leaves** (recommended under `1a`, fewer parts) or **3 leaves** if persistence is split from extraction:

1. **`holder-log-read`** (`blocked_by: []`) — `src/evidence.ts` (`readLog`, `readLogAcross`), `tests/log-reader.test.ts`, `src/AREA.md`.
   - *Outcome:* Plain-file logs outside `issues/(open|closed|parked)` and `issues/chart/<chart>/direct` (both repo-interior paths like `issues/chart/<c>/<subpath>/*.log` and surviving external `--holder` files) resolve through `readLog`, `readLogAcross`, and `akrogon log` without breaking cross-repo ambiguity checks; missing plain files still raise `LogError('nomatch')`.
2. **`failure-identity`** (`blocked_by: [holder-log-read]`) — `src/flaky.ts`, `src/verify.ts` (`verifyRunSchema`, `runOnce`, `knownRedReceipt`, `newRedUnits`), `skills/lifecycle-rules.md`, `skills/chart-issues/assets/direct-route.md`, `src/AREA.md`, `tests/flaky.test.ts`, `tests/verify.test.ts`, `tests/receipt-gates.test.ts`.
   - *Outcome:* Structural failure extraction (named `(fail)`, file/script-qualified `(unnamed)`, per-stream uncovered leaf `<script> | Exited with code <n>` / `Signaled: <SIG>`, check-name fallback), `verifyRunSchema` + `runOnce` persistence on executed red entries, stored-first reading in `flips` and `newRedUnits` (surviving archive deletion while legacy retired rows stay `(log gone)`), live-log mechanical identity comparison in `knownRedReceipt` (including external `--holder --known-red` via Leaf 1), and updated coarse-identity two-log judgment in `skills/lifecycle-rules.md` and `skills/chart-issues/assets/direct-route.md`.
   - *(Optional 3-leaf variant if smaller diffs are preferred: split Leaf 2 into `structural-failure-names` — extraction, `flaky`, `knownRedReceipt`, `newRedUnits`, seat texts — followed by `persisted-failure-names` — `verifyRunSchema`, `runOnce`, stored-name fallback across retired archives. Both touch `src/flaky.ts`, `src/verify.ts`, and `src/AREA.md`, so that edge is a real file/contract dependency.)*

---

## Pre-existing contracts done-criteria rest on (all observed live)

1. **Bun `bun test` stderr grammar** (observed across 164 `framework` + 94 `akrogon` logs): `(?:^|\| )\(fail\) <name>(?: \[[\d.]+m?s\])?$` for tests, `<file>:` header lines before `(fail) (unnamed)` on hook timeouts.
2. **Bun `bun run --parallel`/`--sequential` stderr grammar** (observed across 90 pure + 23 mixed `framework` logs, and probed against local `bun` for signals): `<prefix> | Exited with code <n>` (`n != 0` only) and `<prefix> | Signaled: <SIG>`, with outer orchestrator scripts emitting their own `<outer> | Exited with code <n>` after `<outer> | <inner> | Exited with code <n>`.
3. **`checkedRun` log layout** (`src/run-check.ts` `checkedRun`): `stdout` concatenated before `stderr` in `check-<name>-<ts>-<pid>.log`.
4. **`verify-runs.jsonl` row invariants** (`src/verify.ts` `verifyRunSchema`, observed across all 2,620 rows in `akrogon` + `framework`): `z.strictObject` rows; `setup === 0 && end !== undefined` marks completion; `blocked` and `reused` flags mark unexecuted entries; `compares` links base runs to head runs; `notice` tracks `'pending' | 'shown' | 'error'`.
5. **Archive packing boundary** (`src/pack-command.ts` `classify`, `src/evidence.ts` `locate`): archives exist only at `issues/(open|closed|parked)/<owner>/evidence.tar.zst` and `issues/chart/<chart>/direct/evidence.tar.zst`.
6. **Skill symlink & literal test guards** (`skills/*/lifecycle-rules.md` -> `../lifecycle-rules.md`, `tests/docs-links.test.ts`, `tests/run-units.test.ts`).
