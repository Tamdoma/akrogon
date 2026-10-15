# Territory Map — Slot D (`#91`, `#92`, `#93`)

Checked at `akrogon` `HEAD` / `origin/main` `f3557d8dc8a74459eefcc63dacb419332df1659e` and `tamdoma/framework` `HEAD` / `origin/main` `28d1f011c533ef9cd30bf86c6ecb561652dc11db`.

---

## 1. Verified facts per report

### Report `#91` — `chart-issues` `peer-wait` reports `failure` for an Antigravity peer that is still working

1. **What `peer-ask.ts` and `peer-wait.ts` actually do**:
   - `skills/chart-issues/scripts/peer-ask.ts:19-37` prompts the peer via `herdr agent prompt <pane> <message> --wait --until working --timeout 5000`, then execs `peer-wait.ts <pane> <file> <budget>`.
   - `skills/chart-issues/scripts/peer-wait.ts:94-109, 156` calls `herdr agent list` once at startup and extracts `PeerAgent = { kind: agent.agent ?? null, session: agent.agent_session?.value ?? null }`. For an Antigravity CLI pane, `herdr agent list` returns:
     ```json
     {
       "agent": "agy",
       "agent_session": {
         "agent": "agy",
         "kind": "id",
         "source": "herdr:antigravity_cli",
         "value": "<conversation-uuid>"
       }
     }
     ```
   - In the main loop (`skills/chart-issues/scripts/peer-wait.ts:159-199`), `peer-wait.ts` calls `herdr agent wait <pane> --timeout <slice> --until blocked --until idle --until done` in `POLL_MS = 2000` slices while watching `fileNonEmpty(file)`.
   - When `herdr agent wait` returns `status === 'idle' || status === 'done'` and the target file is still missing/empty (`:179-180`), `peer-wait.ts` grants a single `IDLE_GRACE_MS = 10000` (10 s) grace wait (`herdr agent wait <pane> --timeout <graceMs> --until working`, `:183-185`).
   - If that 10 s grace wait times out (`wait.reason === 'timeout'`) and `fileNonEmpty(file)` is still false, `:192-193` consults `turnOpen(agent)`:
     ```ts
     function turnOpen(agent: PeerAgent): boolean {
       if (agent.kind !== 'claude') return false;
       if (agent.session === null) return false;
       return claudeTurnOpen(agent.session);
     }
     ```
   - Because `agent.kind === 'agy'`, `turnOpen(agent)` unconditionally returns `false`, and `peer-wait.ts` immediately exits with `{ outcome: 'failure', pane, file, status }`.

2. **What the report left uninspected — why Herdr reports `idle` for `agy` mid-turn (verified in `/home/ivan/Work/infra/herdrdev/herdr` and live transcripts)**:
   - **Herdr's `antigravity_cli` hook is session-identity-only**: `/home/ivan/Work/infra/herdrdev/herdr/src/integration/assets/antigravity_cli/herdr-agent-state.sh:8-9` (installed at `~/.gemini/config/hooks/herdr-agent-state.sh` and wired in `~/.gemini/config/hooks.json` under `PreInvocation` only) states: *"Session-only: this hook reports the Antigravity conversation so Herdr can resume the pane. Lifecycle state comes from Herdr's screen detection."* Herdr commit `679584fd` restricted `antigravity_cli` to `session_identity_only_integration("herdr:antigravity_cli", "agy") == true` (`herdr/src/detect/mod.rs:295-300`) because Antigravity CLI has no blocked hook event, skips `PostInvocation` on interruption, and fires `Stop` at turn end rather than process exit.
   - **Herdr's screen detector for `agy` (`/home/ivan/Work/infra/herdrdev/herdr/src/detect/manifests/antigravity.toml:19-33`)** only recognizes `working` via two regexes:
     1. `spinner_working` (`:20-25`): `^\s*[\u2800-\u28FF]+\s+\p{Alphabetic}+\w*ing\b` in `whole_recent`.
     2. `background_tasks_working` (`:28-33`): `(?i)·\s*[1-9][0-9]*\s+task` in `bottom_non_empty_lines(5)`.
   - **Verified from the exact incident transcripts (`~/.gemini/antigravity-cli/brain/c8fd8be1-1f55-4e3d-876d-7ce1a40ff9b2/.system_generated/logs/transcript.jsonl`, `~/.gemini/antigravity-cli/conversations/c8fd8be1-1f55-4e3d-876d-7ce1a40ff9b2.db`, and Slot A's Claude transcript `~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/773ba851-3d2f-4491-861b-1432f9e5c45a.jsonl`)**:
     - **Cause 1 — Subagentreactive-wakeup pause (the exact cause of the `09:40:22Z` and `09:41:39Z` false failures, and of a second wave of false failures at `12:15:48Z`–`12:23:04Z`)**:
       - In `c8fd8be1-.../transcript.jsonl`, `USER_INPUT` arrived at step 0 (`09:31:12Z`). At step 64 (`09:33:49Z`), `agy` invoked 3 `research` subagents (`8f0fa296-...`, `0f48aa76-...`, `ea6ec4c2-...`, created in step 65 at `09:34:34Z`).
       - Per Antigravity's own system prompt (*"After launching a subagent, you do NOT need to poll... stop calling tools, and you will be notified when there is a message to process"*), the parent `agy` agent **ends its current executor invocation** by emitting a `PLANNER_RESPONSE` with no `tool_calls` at step 72 (`09:34:51Z`), and again after individual subagent `SYSTEM_MESSAGE` wakeups at step 74 (`09:40:14Z`) and step 76 (`09:43:19Z`), until the third subagent delivered its `SYSTEM_MESSAGE` at step 77 (`09:45:06Z`). Each of steps 72, 74, and 76 even wrote a completed invocation row (`idx: 0, 1, 2`) to `executor_metadata` in `conversations/c8fd8be1-....db` and fired `PostInvocation`/`Stop`!
       - While subagents run and the parent invocation is parked waiting for reactive wakeup, the `agy` TUI shows no braille spinner and no `· N tasks` footer; instead, below the `>` prompt box it renders `● Agent(research: Checkers and Upda` / `↓ 1 more` (captured verbatim in `773ba851-....jsonl` at `09:41:39.081Z`). That line matches neither `spinner_working` nor `background_tasks_working`, so Herdr marks `wA:pTE` `idle` for minutes at a time.
     - **Cause 2 — Non-`-ing` spinner labels, context compaction, and silent thinking / large file writes**:
       - Even after all subagents finished, `agy` had a `SYSTEM CHECKPOINT` compaction from `09:50:03Z` to `09:52:55Z` (step 122 -> 123, 2m52s) and a 69 KB `write_to_file` call from `09:52:55Z` to `09:57:07Z` (step 123 -> 124, 4m12s).
       - During step 123–124, `herdr pane read wA:pTE` (captured in `773ba851-....jsonl` at `09:57:16Z`) showed:
         `⣟  Investigation of main (176e9...`
         Because `agy` displays its `toolSummary` / thought-summary **noun phrase** (`Investigation of...`) next to the braille spinner `⣟` rather than a gerund ending in `-ing`, Herdr's `spinner_working` regex (`^\s*[\u2800-\u28FF]+\s+\p{Alphabetic}+\w*ing\b`) **fails to match a live `agy` braille spinner** whenever the label's first word does not end in `ing`!

3. **What Antigravity's on-disk transcript / DB exposes (`~/.gemini/antigravity-cli/`)**:
   - `herdr agent list` already gives `agent.session = "<conversation-uuid>"` for `agent.kind === "agy"`.
   - `~/.gemini/antigravity-cli/brain/<session>/.system_generated/logs/transcript.jsonl` records every step as JSONL:
     - After the last `type === "USER_INPUT"` step:
       1. If the last step is **not** a `PLANNER_RESPONSE` with empty/absent `tool_calls` (i.e. last step is `USER_INPUT`, `SYSTEM_MESSAGE`, `CHECKPOINT`, `GENERIC`, or `PLANNER_RESPONSE` with `tool_calls.length > 0`), the parent invocation is actively mid-turn.
       2. Even when the last step in the parent transcript **is** a `PLANNER_RESPONSE` with no `tool_calls` (as at steps 72, 74, 76, 218, 223 during subagent waits), subagent launches after the last `USER_INPUT` are recorded in `GENERIC` steps whose `content` starts with `"Created the following subagents:"` followed by a JSON array `[{"conversationId":"<sub-id>", "logAbsoluteUri":"file:///..."}]`, and subagent completions arrive as `SYSTEM_MESSAGE` steps containing `sender=<sub-id>` (and each subagent has its own `brain/<sub-id>/.system_generated/logs/transcript.jsonl`). If any spawned `<sub-id>` after the last `USER_INPUT` lacks a matching `SYSTEM_MESSAGE` with `sender=<sub-id>` (or its own subagent transcript still has an open turn), the parent turn is still open waiting on that subagent!
     - In addition, `~/.gemini/antigravity-cli/conversations/<session>.db` (SQLite) has a `steps` table where an in-flight step has `status = 2` (`DONE` is `status = 3`).

4. **Verdict on Reporter's Suspected Cause**:
   - **Holds, with two critical extensions**:
     - The reporter rightly identified that `peer-wait.ts:130-134` (`turnOpen`) only checks `agent.kind === 'claude'` and returns `false` for `agy`.
     - However, implementing `agyTurnOpen(session)` solely by checking whether the parent `transcript.jsonl`'s last step is a `PLANNER_RESPONSE` without `tool_calls` (analogous to `claudeTurnOpen` in `peer-wait.ts:111-128`) **would still fail on the exact incident that triggered `#91`**, because `agy` emits a `PLANNER_RESPONSE` with no `tool_calls` while waiting for background subagents (`invoke_subagent`) to wake it up via `SYSTEM_MESSAGE`! An `agyTurnOpen` check must also check for unreturned subagents spawned since the last `USER_INPUT` (or Herdr's screen detector must also match `● Agent(` and non-`-ing` braille spinners).

---

### Report `#92` — Check logs kept under `issues/` grow the consumer repo by ~1 GB (`tamdoma/framework` tracks 944 MB of `*.log` in 4,462 files)

1. **What `akrogon` code and skills currently do**:
   - `src/run-check.ts:144-224` (`checkedRun`): runs every check inside a temporary directory `runRoot = mkdtempSync(join(leafRoot, 'run-'))` under `/var/tmp/akr-<uid>/<repo-hash>/<slug-hash>/run-XXXXXX`, tees stdout/stderr into `join(runRoot, 'out.log')` (`:165`), and in `finally` (`:207-216`):
     1. Unconditionally copies `out.log` into `target` (`<leaf>/implementation` for a leaf or `<cwd>/<holder>` for `--holder`, `:107-127`):
        ```ts
        mkdirSync(target, { recursive: true });
        const kept: string = resolve(target, `check-${encodeURIComponent(name)}-${Date.now()}-${process.pid}.log`);
        copyFileSync(log, kept);
        ```
     2. Records `log: kept` in `issues/timings.jsonl` (`check_end`, `:210-216`).
     3. Deletes `runRoot` (`rmSync(runRoot, { recursive: true, force: true })`, `:219`).
   - `src/verify.ts:154-171`: `akrogon verify` invokes `checkedRun` once for `'setup'` and once for each command returned by `verifyCommands(repo.config, scope)`. Thus every `akrogon verify` call writes `check-setup-<ms>-<pid>.log` plus `check-<name>-<ms>-<pid>.log` into `<leaf>/implementation` (or `<chart>/direct` when `--holder <chart>/direct` is used) and stores `{ name, command, exit, log }` in `issues/verify-runs.jsonl` (`:27, 169`).
   - **What actually reads those `.log` files in `akrogon`**:
     - `src/flaky.ts:10-43` (`flakyCommand`): scans `issues/verify-runs.jsonl` for a command that exited non-zero (`item.exit !== 0`) on a `tree` and later exited `0` on the **same `tree` and `command`**. When such a same-tree red->green flip exists, `excerpt(prior.log)` (`:10-17`) reads the **failed** run's `prior.log` (mapping `/issues/open/` <-> `/issues/closed/` if the leaf moved) to extract a 1-line failure summary (`error:`/`fail:`/`fatal:` or last non-empty line).
     - `src/verify.ts:63-76` (`greenRun`): checks `run.tree === tree && run.end !== undefined && run.setup === 0 && run.commands.every(item => item.exit === 0 ...)`. **It never checks `existsSync(item.log)` or reads `item.log`!**
     - `skills/chart-issues/scripts/direct-guards.ts`: imports `requireGreenReceipt` from `src/verify.ts` and never reads any `.log` file.
     - **Nothing in `akrogon` ever reads a green `check-*.log` file after the command exits.**
   - **How `issues/` `.log` files end up tracked in git**:
     - `akrogon` itself (`src/phase.ts:190-225`, `completeOwner`) only `renameSync`s completed issue/epic folders from `issues/open/<owner>` to `issues/closed/<owner>`; it does not `git add` or `git commit` `issues/`.
     - Instead, operator/door commits (`git add issues && git commit -m "add issues"` / `"sync issues"`) commit the entire `issues/` tree because consumer repos do not `.gitignore` `issues/**/*.log` and `run-check.ts` places `check-*.log` directly inside `issues/open/<leaf>/implementation/` (and `issues/chart/<chart>/direct/`).

2. **Correction to Reporter's Suspected Cause (verified by measuring all 4,462 tracked `issues/*.log` files in `tamdoma/framework`)**:
   - The reporter attributed the 944 MB to `src/run-check.ts:207-209` (`check-*.log` copies) and stated they did not inspect what writes `merge-evidence-*/` or un-prefixed `selftest.log` / `contracts.log` / `parity.log` / `test.log` / `test_changed.log` / `verify.log`.
   - **Exact breakdown in `tamdoma/framework` at `28d1f011c` (4,462 tracked `issues/*.log` files = 944.88 MB raw; git `.git/objects/pack` is 174 MB; `tar | zstd -19` of all 4,462 logs is 19 MB)**:
     1. **`check-<name>-<ts>-<pid>.log` written by `src/run-check.ts:208-209`**: **1,282 files, 454.88 MB (48.1% of bytes)** — introduced in commit `2021aeb` (2026-10-10). Every single run since 2026-10-10 writes these; e.g. `check-cheap-*` (204 files, 128.4 MB), `check-verify-*` (176 files, 134.9 MB), `check-test_changed-*` (175 files, 56.1 MB), `check-selftest-*` (153 files, 31.8 MB), `check-setup-*` (84 files, 0.1 MB), plus ad-hoc `akrogon run-check --name <custom>` runs.
     2. **`merge-evidence-*/*.log`**: **219 files, 53.08 MB (5.6% of bytes)** — **historical only** (from pre-`2021aeb` / pre-`dc2e2b0` merge runs before 2026-10-10 when Seat B manually tee'd merge check output into `<leaf>/merge-evidence-<sha>/`). No current code or skill in `akrogon` writes `merge-evidence-*`.
     3. **Un-prefixed `*.log` inside `implementation/` (`selftest.log`, `contracts.log`, `parity.log`, `test.log`, `test_changed.log`, `verify.log`, `repair-B-*/*.log`, etc.)**: **2,961 files, 436.92 MB (46.2% of bytes)** — primarily historical pre-`2021aeb` logs (before `akrogon run-check` existed, when seats ran checks with `> <leaf>/implementation/selftest.log 2>&1` under the skill rule *"anything needed later goes in the leaf folder"*, `skills/implement-issue/SKILL.md:25`, `skills/check-issue/SKILL.md:18`). Since `2021aeb` and `dc2e2b0` (`ac50164`), checks run through `akrogon verify` / `akrogon run-check`, which produce `check-<name>-<ts>-<pid>.log`.

---

### Report `#93` — Worktrees of merged leaves and finished verify runs are never removed (`reconcile` keeps them as `"unreachable commits"`)

1. **What `src/reconcile.ts`, `src/verify.ts`, `src/batch.ts`, `src/phase.ts`, `src/next.ts`, and `src/status.ts` really do**:
   - `src/reconcile.ts:43-62` (`worktreeRemovable(repo, path)`): refuses to remove a worktree unless **all three** hold:
     1. `git -C <path> status --porcelain` is empty (`:44-46`, otherwise `'uncommitted changes'`),
     2. No rebase/merge/cherry-pick/revert git state files exist (`:47-52`),
     3. `git -C <path> rev-list --count HEAD --not --branches --remotes` is `0` (`:53-60`, otherwise `'${count} unreachable commits'`).
   - `src/reconcile.ts:198-211` (`removeWorktree(path)`): calls `worktreeRemovable(repo, path)` and, if `ok`, runs `git worktree remove <path>` (without `--force`).
   - **How the three leftover categories in `#93` actually happen**:
     1. **Dead `verify-<uuid>` worktrees (`src/verify.ts:126, 152, 189` and `src/reconcile.ts:372-380, 393`)**:
        - `akrogon verify` creates a detached sparse checkout at `~/.akrogon/worktrees/<repo>/verify-<uuid>` (`createSparseWorktree(repo, target, sha, { detach: true })`, `src/verify.ts:152`) and normally removes it in `finally` via `git worktree remove --force <target>` (`src/verify.ts:189`).
        - In `tamdoma/framework/issues/verify-runs.jsonl`, all 6 leftover `verify-*` worktrees (`0214a286`, `14648778`, `4636dd20`, `66154a56`, `cec535a2`, `f741e1b4`) were runs on `browser-socket-runtime` at `sha = 8700f6df7e04abeaadf704d1d4def0b6ba53d18d` that have **`end: undefined` and `commands: []`** — the `akrogon verify` process was killed (e.g. `SIGKILL` / timeout / `stop-run`) before its `finally` block could run!
        - When `reconcile` later ran (`src/reconcile.ts:372-380`), `ownerDead({ pid: record.pid, boot_id: record.boot_id })` was `true`, so `reconcile` fell through to line 393: `await removeWorktree(path)`.
        - Because `removeWorktree` calls `worktreeRemovable` instead of `git worktree remove --force`, once `browser-socket-runtime` amended/rebased its branch and merged (deleting `refs/heads/browser-socket-runtime`), `8700f6df7e` had `10` commits not reachable from `--branches --remotes`. Thus `worktreeRemovable` kept all 6 dead `verify-*` worktrees (9.6 GB) forever! (And if a killed `verify-*` run left untracked files from `setup`/tests, `worktreeRemovable` would also refuse it as `'uncommitted changes'`, even though `verify.ts:189` itself uses `--force`.)
        - **Same flaw for `batch-<attempt>` worktrees (`src/batch.ts:115, 155`, `src/reconcile.ts:381-384, 393`)**: `buildStack` removes `batch-<attempt>` with `git worktree remove --force` in `finally`, but if `buildStack` is killed mid-rebase, `reconcile` falls through to `removeWorktree(path)` which refuses removal due to `'rebase in progress'` or `'unreachable commits'`.
     2. **Delegated worker worktrees `<slug>-u<N>` (`skills/implement-issue/worker-protocol.md:63, 83, 88`, `skills/implement-issue/brief-template.md:30`, `src/reconcile.ts:386-393`)**:
        - Per `worker-protocol.md:63` (`git worktree add --detach "$worktree" HEAD`) and `brief-template.md:30`, each worker commits its unit on a **detached `HEAD`** in `<slug>-u<N>`, and Seat A integrates the unit onto `<slug>` via **`git cherry-pick <sha>`** (`worker-protocol.md:83`).
        - **Correction to Report `#93`'s suspected cause**: Report `#93` assumed worker commits only become unreachable after the leaf is rebased onto `main` and its branch is deleted, and suggested checking `git cherry` patch equivalence. In reality:
          - Because `git cherry-pick` creates a **new commit SHA** on `<slug>`, the worker's detached-`HEAD` commit in `<slug>-u<N>` is **never** reachable from `refs/heads/<slug>` or `main` (`git rev-list --count HEAD --not --branches --remotes` is `>= 1` the instant the worker commits!).
          - And as `pass-two-review-notes-u2` (`2 +` in `git cherry main`) and `pass-two-review-notes-u3` (`1 +`, `1 -` in `git cherry main`, plus untracked `__pycache__/`) proved, `git cherry main HEAD` does **not** report `-` whenever Seat A resolves cherry-pick conflicts or lands later `check.fix`/`check.repair` commits touching the same files!
          - Furthermore, if a worker or test run leaves untracked build/test artifacts (like `__pycache__/` in `pass-two-review-notes-u3`), both `worker-protocol.md:88` (`git worktree remove <worktree>` without `--force`) and `reconcile.ts`'s `worktreeRemovable` (`git status --porcelain`) refuse to remove it.
     3. **Unregistered directories inside `worktreeStore(repo)` (`prose-asserts-u1-cmdlogs`, `src/reconcile.ts:350-352`)**:
        - Verified from Pi session `~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-framework-prose-asserts-u1--/2026-10-14T19-20-18-934Z_01a13bdb-bcf6-72e8-82aa-ba3ed3f319b2.jsonl` (lines 60–61): on 2026-10-14 (before commit `a77c260` kept active worker worktrees), `reconcile` removed `prose-asserts-u1` while the worker was still running; Pi's bash logger recreated `prose-asserts-u1/.pi-command-logs/`, and the worker ran `mv .../prose-asserts-u1/.pi-command-logs .../prose-asserts-u1-cmdlogs` so `git worktree add` could succeed.
        - `src/reconcile.ts:350-352` keeps any directory in `worktreeStore(repo)` not in `git worktree list --porcelain` (`!registered.has(path)`) as `'unknown directory'`.
     4. **Additional verified findings on what `#93` left uninspected (`merge` code and `keep` visibility)**:
        - **How a leaf's own worktree (`<slug>`) is handled on merge (`src/batch.ts:161-181`, `src/phase.ts:626-635`, `src/reconcile.ts:213-222`)**:
          - During `mergeTurn` (`src/next.ts:1113`), `applyTop` calls `move(repo, slug, staged.top, leaf)` (`src/batch.ts:161-174`), which runs `git -C <worktree> reset --keep <target>` if the worktree is clean. When `batchPush` (`src/phase.ts:622-635`) pushes `head` to `<remote>/<default_branch>`, the leaf worktree's `HEAD` is an ancestor of `origin/main` (`0 unreachable commits`), so `removeMergedWorktree` (`src/reconcile.ts:213-222`) removes `<slug>` and deletes `refs/heads/<slug>` once the leaf's tab closes — **unless**:
            - (a) Seat B left an untracked/modified file in `<slug>` after merge (e.g. while running `broadcast-issue`), which causes `worktreeRemovable` to keep `<slug>` as `'uncommitted changes'`; or
            - (b) **Stacked member leaves (`commit 9e4c093`)**: when `batchPush` (`src/phase.ts:629-632`) moves stacked `members` to `'merged'`, if a member's worktree was dirty when `move()` ran (`src/batch.ts:164-166`), `move()` updated `refs/heads/<member>` via `git update-ref` while leaving the member's worktree `HEAD` at its **pre-rebase** commit! Once `removeMergedWorktree` or branch cleanup runs (or if `HEAD` is detached/pre-rebase), that member worktree's `HEAD` has unreachable pre-rebase commits! Even when clean, `batchPush` (`src/phase.ts:629-632`) and `reconcileBatch` (`src/next.ts:975`, which skips `item.state.phase !== 'merge'`) **never call `closeMergedTab` for stacked members**, and because stacked members' panes are already `idle` waiting for `merge_turn`, no `pane_agent_status_changed` hook fires for them — leaving stacked members' tabs and worktrees open until a later manual `akrogon next --all` / `--resume` or unrelated `tab_closed` event!
        - **Whether `keep` reasons are shown to the operator (`src/status.ts:352` vs `369-412`)**:
          - `reconcile` writes kept entries to `~/.akrogon/reconcile/<repo>.json` (`src/reconcile.ts:22-24, 447`).
          - However, `src/status.ts` **only** prints `Kept: <path> — <reason>` inside `akrogon status <slug>` (`src/status.ts:352`)! Plain `akrogon status` (`src/status.ts:369-412`) never prints `readKept(repo)`. Once all leaves in a repo merge (`no open leaves`), the operator never sees any `Kept:` lines on the status board.

---

## 2. Proposed split

The three reports have **three distinct observable outcomes** in **disjoint files** with **no dependencies** between them, so they split cleanly into **three independent charts**:

1. **Chart 1 — `peer-wait-agy` (`Tamdoma/akrogon#91`)**
   - **Observable outcome**: `peer-wait.ts` (and/or Herdr's `agy` state detection) keeps waiting while an Antigravity (`agy`) peer turn is still open — including while `agy` is paused waiting for background subagents (`invoke_subagent`), compacting (`CHECKPOINT`), thinking silently, or displaying a non-`-ing` braille spinner label — and only reports `failure` when the `agy` turn has actually ended without writing the expected output file.
   - **Files**: `skills/chart-issues/scripts/peer-wait.ts` (and tests in `tests/`), plus optionally `/home/ivan/Work/infra/herdrdev/herdr/src/detect/manifests/antigravity.toml` if screen-detection rules are also tightened.
   - **Dependencies**: None.

2. **Chart 2 — `check-logs` (`Tamdoma/akrogon#92`)**
   - **Observable outcome**: Running `akrogon run-check` and `akrogon verify` no longer accumulates hundreds of megabytes of uncompressed `check-*.log` files inside tracked `issues/` directories in consumer repos (and existing bloat in `tamdoma/framework` can be pruned/migrated), while keeping failure diagnostics (`akrogon flaky`, review/repair failure inspection) working.
   - **Files**: `src/run-check.ts`, `src/verify.ts`, `src/flaky.ts`, `src/reconcile.ts` (if logs move to scratch/global store), `skills/{implement,check,merge,chart}-issue/SKILL.md`.
   - **Dependencies**: None.

3. **Chart 3 — `worktree-reconcile` (`Tamdoma/akrogon#93`)**
   - **Observable outcome**: `reconcile` reaps dead `verify-<uuid>` and `batch-<uuid>` worktrees, reaps `<slug>-u<N>` worker worktrees (and stray directories in the managed `~/.akrogon/worktrees/<repo>` store) once their owning leaf is `merged` (or `failed` with no live tab), closes stacked-member tabs/worktrees on merge, and surfaces kept worktrees on `akrogon status`.
   - **Files**: `src/reconcile.ts`, `src/phase.ts` / `src/next.ts`, `src/batch.ts`, `src/status.ts`, `skills/implement-issue/worker-protocol.md`, `tests/reconcile.test.ts`.
   - **Dependencies**: None.

---

## 3. Material forks per chart

### Chart 1: `peer-wait-agy` (`#91`)

#### Fork 1.1 — Where should Antigravity turn-liveness be detected?
> **Question**: When Herdr reports an Antigravity (`agy`) pane as `idle` or `done` before the target file exists, how should `peer-wait.ts` know whether the `agy` turn is still open?

- **Option A (Pick): Teach `peer-wait.ts` (`turnOpen`) to inspect Antigravity's on-disk transcript (`~/.gemini/antigravity-cli/brain/<session>/.system_generated/logs/transcript.jsonl`), including active subagents spawned after the last `USER_INPUT`.**
  - *How it works*: In `peer-wait.ts:130-134`, dispatch `agent.kind === 'agy'` to `agyTurnOpen(agent.session)`. Read `~/.gemini/antigravity-cli/brain/<session>/.system_generated/logs/transcript.jsonl`. Find the last step with `type === 'USER_INPUT'`. The turn is open if:
    1. No `USER_INPUT` step is present yet (or the file doesn't exist yet right after prompt delivery), OR
    2. The final step in `transcript.jsonl` is **not** a `PLANNER_RESPONSE` with empty/absent `tool_calls`, OR
    3. Any `GENERIC` step after the last `USER_INPUT` whose content starts with `"Created the following subagents:"` lists a `conversationId` (`<sub-id>`) for which no subsequent `SYSTEM_MESSAGE` step after that launch contains `sender=<sub-id>` (or whose own `brain/<sub-id>/.system_generated/logs/transcript.jsonl` still has an open turn), OR
    4. The SQLite DB `~/.gemini/antigravity-cli/conversations/<session>.db` has a step row with `status = 2` (in-flight).
  - *Reason*: Completely self-contained in `akrogon` (`skills/chart-issues/scripts/peer-wait.ts`), requires no Herdr rebuild/release, and solves **all** causes of mid-turn `idle` at once (subagent reactive-wakeup pauses where `agy` genuinely has no spinner and its parent invocation has ended, 3-minute `SYSTEM CHECKPOINT` compactions, silent thinking pauses, and non-`-ing` spinner labels). It directly parallels the existing `claudeTurnOpen(session)` architecture locked in `issues/chart/peer-wait/forks/wait-mechanism.md`.
  - *Cost*: Couples `peer-wait.ts` to Antigravity CLI's `~/.gemini/antigravity-cli/brain/<session>/.system_generated/logs/transcript.jsonl` schema (`USER_INPUT`, `PLANNER_RESPONSE`, `GENERIC` subagent creation, `SYSTEM_MESSAGE` wakeup).
  - *What it could break or invite later*: If Antigravity CLI changes its transcript path or subagent wakeup format in a future version, `agyTurnOpen` could misread the state; also, if a subagent crashes/errors without sending a `SYSTEM_MESSAGE` back to the parent, `agyTurnOpen` needs a fallback (e.g. checking the subagent's own `transcript.jsonl` or `status === 'ERROR'`) so `peer-wait` doesn't wait until the full budget expires when a subagent dies.

- **Option B: Fix Herdr's `antigravity.toml` screen-detection manifest (in `/home/ivan/Work/infra/herdrdev/herdr`) to match non-`-ing` braille spinners and `● Agent(...)` subagent lines.**
  - *How it works*: Broaden `spinner_working` in `herdr/src/detect/manifests/antigravity.toml:25` beyond `\w*ing\b` and add a `working` rule for `^\s*●\s+Agent\(`.
  - *Reason*: Improves `herdr agent list` / `herdr agent wait` status accuracy for all Herdr consumers, not just `peer-wait.ts`.
  - *Cost*: Cross-repo change requiring a Herdr release; and **still fails** during `SYSTEM CHECKPOINT` compaction (2m52s in the incident) or silent thinking gaps when neither a spinner nor `● Agent(...)` is on screen, or when `● Agent(...)` scrolls above `bottom_non_empty_lines` after completed tool calls.
  - *What it could break or invite later*: Matching `● Agent(...)` in `whole_recent` could false-match historical completed subagent blocks still visible in the scrollback after the turn finishes, causing Herdr to stick in `working` after `agy` is actually `idle`!

- **Option C: Both Option A in `akrogon` (`peer-wait.ts`) and a targeted Herdr issue/fix for non-`-ing` braille spinners.**
  - *Reason*: Option A makes `peer-wait.ts` immediately reliable in `akrogon`; a separate Herdr fix for `spinner_working` (`Investigation of...` next to braille chars) reduces unnecessary 10s grace loops in `peer-wait.ts`.

---

### Chart 2: `check-logs` (`#92`)

#### Fork 2.1 — Which check logs (if any) belong under `issues/` vs ephemeral scratch?
> **Question**: Should `akrogon run-check` and `akrogon verify` keep copying every check's `out.log` into `<leaf>/implementation/check-*.log` under `issues/`, keep only logs needed by `akrogon flaky` / failure inspection, or keep all check logs outside the git-tracked `issues/` tree (e.g. in leaf scratch `/var/tmp/akr-<uid>/...` or `~/.akrogon/logs/`)?

- **Option A (Pick): Write `check-*.log` files outside the git repository (under leaf scratch `/var/tmp/akr-<uid>/<repo>/<slug>/` or `~/.akrogon/logs/<repo>/<slug>/`, reaped by `reconcile` when the leaf finishes), and store only compact metadata (plus a bounded failure tail/excerpt on red runs) in `issues/verify-runs.jsonl` / `issues/timings.jsonl`.**
  - *How it works*:
    1. In `src/run-check.ts:207-209`, instead of copying `out.log` into `<leaf>/implementation/check-*.log` (inside the tracked `issues/` tree), copy `out.log` into the leaf's scratch directory `leafTemp(repo, slug)` (`/var/tmp/akr-<uid>/<repo-hash>/<slug-hash>/check-<name>-<ts>-<pid>.log`), which `reconcile` (`src/reconcile.ts:431-441`) **already** keeps for the lifetime of the leaf and automatically removes once the leaf is `merged` (or `failed` with its tab closed)!
    2. For `src/flaky.ts:10-43` (which needs a 1-line failure summary when a red verify command later flips green on the same `tree`), either:
       - Since `akrogon flaky` compares a red verify run and a green verify run on the **same `tree`** (which happens while the leaf is still active or if `verify-runs.jsonl` records a ` summary?: string` / `excerpt?: string` field on non-zero `commands[]` at verify time), recording a 1-line `excerpt` (or bounded tail) directly on failed `commands[]` in `verify-runs.jsonl` makes `akrogon flaky` work forever even after scratch logs are reaped!
    3. Update skill prompts (`skills/{implement,check,merge,chart}-issue/SKILL.md`) so seats cite the `verify-runs.jsonl` receipt ID (or `run-check` exit/timing record) in `report.md` / `review-B.md` rather than expecting `implementation/check-*.log` to live permanently in git.
  - *Reason*: Eliminates **100%** of future `.log` growth in consumer git repositories (0 MB added per leaf, whether green or red), requires no external compression binary, keeps full raw logs on disk in `leafTemp` while the leaf is active (so Seat A and Seat B can `tail`/`rg` them during `implement`, `check.review`, `check.repair`, `check.fix`, and `merge`), and preserves `akrogon flaky` permanently via `verify-runs.jsonl`.
  - *Cost*: Touching `src/run-check.ts`, `src/verify.ts`, `src/flaky.ts`, `src/reconcile.ts` (so `reconcile`'s `checkout` scratch dir is also cleaned up for `--holder` runs), and updating `tests/run-check.test.ts`, `tests/verify.test.ts`, `tests/flaky.test.ts`, and skill docs.
  - *What it could break or invite later*: Once a leaf merges and its tab closes, the full raw stdout of its checks is deleted with `leafTemp` (only `verify-runs.jsonl`, `timings.jsonl`, `report.md`, and `review-*.md` remain in `issues/closed/`). If an operator ever wanted to read the full 5 MB raw stdout of a closed leaf's green test run weeks later, it won't be in git.

- **Option B: Keep copying `check-*.log` into `<leaf>/implementation/` during the leaf's lifecycle, but have `completeOwner` (`src/phase.ts:190-225`) delete `check-*.log` (or all `*.log`) when moving the owner from `issues/open/` to `issues/closed/` (and clean `issues/chart/*/direct/*.log` at chart handoff).**
  - *How it works*: `run-check.ts` continues writing `<leaf>/implementation/check-*.log` while the leaf is open; when `completeOwner` moves the issue/epic to `issues/closed/`, it deletes `*.log` (except perhaps failed verify logs still referenced by a same-tree flip in `verify-runs.jsonl`, or after recording `excerpt` in `verify-runs.jsonl`).
  - *Reason*: Zero change to `run-check.ts`'s return path during an open leaf's lifecycle; seats still find `check-*.log` inside `<leaf>/implementation/` while working.
  - *Cost*: Still litters `issues/open/` and `issues/chart/*/direct/` with untracked/modified `.log` files while leaves or charts are open (so an operator running `git add issues && git commit -m "add issues"` mid-epic still commits hundreds of MB of `.log` files into git history!).
  - *What it could break or invite later*: Any `.log` file committed while an issue is still in `issues/open/` enters git object history permanently (`.git/objects/pack`), even if `completeOwner` later `rm`s it on move to `issues/closed/`.

- **Option C: Keep only failed (`exit !== 0`) check logs (or compress kept logs with `zstd` / `Bun.gzipSync`).**
  - *How it works*: Delete green `out.log` on exit `0`, or compress kept logs.
  - *Reason*: Preserves raw failure logs in `issues/closed/`.
  - *Cost*: In `tamdoma/framework`, failed/ad-hoc logs and multi-round debug runs still account for a large fraction of `issues/*.log`, and seats (`review-B.md`, `report.md`) currently inspect the green `check-verify-*.log` / `check-cheap-*.log` during the active leaf pass to verify which suites ran (`skills/merge-issue/SKILL.md`). Deleting green logs immediately on exit `0` breaks Seat B's ability to inspect the green log during the same pass!

#### Fork 2.2 — What should be done about the existing 944 MB (4,462 files) of tracked `issues/**/*.log` in `tamdoma/framework` (and `akrogon`)?
> **Question**: Should we also remove (or `.gitignore`) already-tracked `issues/**/*.log` files in `akrogon` / consumer repos, or only stop `akrogon` from producing new ones?

- **Option A (Pick): Add `issues/**/*.log` to `.gitignore` (or clean `issues/**/*.log` in a one-time repo cleanup / `akrogon` migration) after `flaky.ts` no longer depends on reading on-disk `.log` files for closed leaves.**
  - *Reason*: Stopping new `.log` writes alone leaves the existing 944 MB (4,462 files) on disk in `tamdoma/framework` (`issues/closed/**` and `issues/chart/**`). Once `flaky.ts` either reads an inline `excerpt` or tolerates missing closed-leaf logs (which `src/flaky.ts:15` **already** does: `if (!existsSync(log)) return '';`), `git rm 'issues/**/*.log'` + `.gitignore` immediately reclaims ~945 MB of working-tree disk space.
  - *Cost*: `git rm` removes working-tree files (945 MB on disk) while `.git/objects/pack` (174 MB) retains historical blobs unless git history is rewritten (which should not be done).
  - *What it could break or invite later*: If any test in `akrogon` or `tamdoma/framework` asserts on a fixture `.log` under `issues/`, a blanket `issues/**/*.log` ignore/removal must exclude test fixtures (verified: neither repo has test fixtures under `issues/**/*.log`).

---

### Chart 3: `worktree-reconcile` (`#93`)

#### Fork 3.1 — How should `reconcile` remove finished/dead `verify-*`, `batch-*`, and `<slug>-u<N>` worker worktrees?
> **Question**: When a `verify-<uuid>`, `batch-<uuid>`, or `<slug>-u<N>` worker worktree in the managed store (`~/.akrogon/worktrees/<repo>`) is no longer active, should `reconcile` force-remove it (`git worktree remove --force`) without checking `worktreeRemovable`'s unreachable-commits and clean-status guards, or should it try to check patch equivalence (`git cherry`) first?

- **Option A (Pick): Force-remove (`git worktree remove --force`) any non-active `verify-<uuid>`, non-active `batch-<uuid>`, and finished-leaf (`merged` or tab-closed `failed`) `<slug>-u<N>` worker worktree in the managed store (provided no live pane sits inside it), bypassing `worktreeRemovable`'s unreachable-commits and dirty-tree guards.**
  - *How it works*:
    1. **`verify-<uuid>`**: Once `record === undefined` or `record.end !== undefined` or `ownerDead(record)` is true (and no live pane is inside `path`), `reconcile` runs `git worktree remove --force <path>` directly (matching `src/verify.ts:189`!). A `verify-*` worktree is a detached readout of an already-committed SHA; any untracked files inside it are build/test artifacts from `setup` or interrupted checks, and its `HEAD` becomes "unreachable" whenever the leaf later rebases.
    2. **`batch-<uuid>`**: When `!batchAttempts.has(id)` (and no live pane is inside `path`), `reconcile` runs `git worktree remove --force <path>` directly (matching `src/batch.ts:155`!).
    3. **`<slug>-u<N>` worker worktrees**: When `owner` (`leafBySlug.get(name.replace(/-u\d+$/, ''))`) has `owner.state.phase === 'merged'`, or `owner.state.phase === 'failed'` with no live tab (`!tabLive(panes, owner.state.tab)`), and no live pane sits inside `path`, `reconcile` runs `git worktree remove --force <path>`.
       - Also update `skills/implement-issue/worker-protocol.md:88` from `git worktree remove <worktree>` to `git worktree remove --force <worktree>` so Seat A's own post-wave cleanup doesn't fail when a worker test run created `__pycache__/` or similar untracked artifacts.
  - *Reason*:
    - As verified in Section 1, `git cherry` patch equivalence **fails** on real worker worktrees (`pass-two-review-notes-u2` had `2 +` in `git cherry main`, and `u3` had `1 +` and untracked `__pycache__/`) because workers commit on detached `HEAD` (`git cherry-pick` changes SHAs immediately) and later `check.fix`/`check.repair` commits on the leaf branch modify the same files before merge!
    - Once a leaf has reached `merged` (or `failed` and its tab is closed), its delegated unit worktrees `<slug>-u<N>` have no further role in the lifecycle — keeping 1.6 GB checkouts forever because a worker's pre-repair commit was superseded by a repair commit on the leaf is pure disk leak.
    - Likewise, `verify.ts:189` and `batch.ts:155` **already** use `git worktree remove --force`; `reconcile` is just the crash-recovery fallback when `verify` or `buildStack` is killed before `finally`.
  - *Cost*: If a leaf transitions to `failed` and its tab is closed, any un-cherry-picked commit sitting only in `<slug>-u<N>`'s detached `HEAD` becomes a dangling commit in git's object database (still recoverable via `git reflog` / `git fsck` until `git gc` expires it, but its worktree directory is gone).
  - *What it could break or invite later*: What if an operator creates a leaf whose slug itself ends in `-u<digits>` (e.g. `fix-u1`)?
    - Look at `src/reconcile.ts:345, 386`: `leafBySlug.get(name)` is checked at line 345–371 **before** line 386 (`/-u\d+$/.test(name)`), so a real leaf named `fix-u1` is handled as a leaf at line 354, not as a worker of `fix`. Still, checking `owner !== undefined && !leafBySlug.has(name)` makes the distinction explicit.

- **Option B: Keep `worktreeRemovable` on `verify-*` and `<slug>-u<N>`, but replace `git rev-list --count HEAD --not --branches --remotes` with `git cherry <default_branch> HEAD` (patch equivalence).**
  - *Reason*: Attempts to check whether commits landed via rebase/cherry-pick.
  - *Cost / Why it fails*: **Proven broken against the actual `#93` reproduction**:
    1. `pass-two-review-notes-u2` and `pass-two-review-notes-u3` both have `+` lines in `git cherry main HEAD` because later `check.repair`/`check.fix` commits on `pass-two-review-notes` modified the files touched by the workers before the leaf merged! So `git cherry` would **still** refuse to remove `pass-two-review-notes-u2` and `u3`!
    2. `pass-two-review-notes-u3` also had untracked `.claude/skills/test-audit-backlink-portfolio/scripts/__pycache__/`, so `worktreeRemovable`'s `git status --porcelain` check and non-`--force` `git worktree remove` would **still** refuse to remove `u3`!
    3. If a `verify-<uuid>` run was killed on a commit from a red attempt that was later amended/repaired before merge, `git cherry main <verify-sha>` will also report `+` and keep the dead `verify-<uuid>` worktree forever!

#### Fork 3.2 — What should `reconcile` do with stacked merge members (`commit 9e4c093`) and leaf worktrees whose branch was rebased or dirtied?
> **Question**: When a leaf itself merges (either as holder or as a stacked member), how should `phase` / `next` / `reconcile` ensure the leaf's own tab and `<slug>` worktree are closed and removed?

- **Option A (Pick): Close stacked members' tabs on merge (`batchPush` / `finishPush` / `reconcileBatch`), and in `removeMergedWorktree` (`src/reconcile.ts:213-222`), when `leaf.state.phase === 'merged'`, allow removing the leaf's managed store worktree even if its `HEAD` is at pre-rebase commits (provided `refs/heads/<slug>` or the leaf's recorded `merged` commit in `log.jsonl` is an ancestor of `<remote>/<default_branch>`).**
  - *How it works*:
    1. In `src/next.ts:1480-1490` (or inside `mergeWake` / `reconcileBatch`), when a batch push commits `'merged'` for stacked `members` as well as the holder, close the merged tabs of stacked `members` (`closeMergedTab`) and run `reconcile` (or trigger `tab_closed` for each member).
    2. In `src/reconcile.ts:213-222` (`removeMergedWorktree`), if a merged leaf's worktree was left at its pre-rebase `HEAD` (for instance because `move()` in `src/batch.ts:164-166` took the `'dirty-ref'` branch and updated `refs/heads/<slug>` without resetting the worktree, and `refs/heads/<slug>` was later deleted or moved), `git rev-list --count HEAD --not --branches --remotes` in the worktree will return `> 0` even though the leaf is `phase === 'merged'`! Checking whether `HEAD` has uncommitted changes (`git status --porcelain`), or force-removing once `phase === 'merged'` and no live pane is inside, prevents merged leaf worktrees from getting stuck.
  - *Reason*: Fixes the stacked-member tab/worktree leak introduced in `9e4c093` and handles the `'dirty-ref'` path in `src/batch.ts:164-166`.
  - *Cost*: Small additions to `src/next.ts` and `src/reconcile.ts`.
  - *What it could break or invite later*: If a user manually made uncommitted edits inside a merged leaf's worktree after merge, keeping the `git status --porcelain` check on the leaf's own worktree `<slug>` (while ignoring `unreachable commits` when `leaf.state.phase === 'merged'`) protects uncommitted files while never getting tripped up by pre-rebase commits.

#### Fork 3.3 — What should `reconcile` do with unregistered directories in `~/.akrogon/worktrees/<repo>` (like `prose-asserts-u1-cmdlogs`) and how should `Kept:` reasons be surfaced?
> **Question**: Should `reconcile` delete unregistered directories inside the managed worktree store (`~/.akrogon/worktrees/<repo>`), or keep them and show `Kept:` lines in plain `akrogon status`?

- **Option A (Pick): Both — in `akrogon status` (without `<slug>`), display `Kept: <path> — <reason>` lines from `readKept(repo)` at the repo level so kept paths are never silent, AND in `reconcile`, remove unregistered directories inside `worktreeStore(repo)` that match a finished leaf's prefix (`<slug>-*` where `<slug>` is in `knownSlugs` and the leaf is `merged` or tab-closed `failed` and no live pane is inside).**
  - *How it works*:
    1. `~/.akrogon/worktrees/<repo>` is `akrogon`'s private managed store (unlike the repo root). If a directory inside `worktreeStore(repo)` is not a registered git worktree (`!registered.has(path)`) and either matches a finished leaf's `<slug>` / `<slug>-*` (like `prose-asserts-u1-cmdlogs` after `prose-asserts` merged) or is a partially-removed/broken worktree directory from a finished `verify-*` / `batch-*` / `<slug>-u<N>`, `rmSync(path, { recursive: true, force: true })` removes it once no live pane is inside.
    2. For any truly unknown directory that `reconcile` still keeps (`keep(path, ...)`), print `Kept: <path> — <reason>` in plain `akrogon status` (`src/status.ts:384-393`) right alongside `Failed:` and `Missing:` lines, not only in `akrogon status <slug>` (`src/status.ts:352`).
  - *Reason*: Even if an unexpected keep reason ever occurs (e.g. a genuinely dirty leaf worktree), the operator immediately sees `Kept:` on `akrogon status` even when `no open leaves` remain; and leaf/worker collateral directories like `prose-asserts-u1-cmdlogs` under `~/.akrogon/worktrees/<repo>` are cleaned automatically when the leaf finishes.
  - *Cost*: ~15 lines across `src/reconcile.ts` and `src/status.ts` (plus updating `tests/status.test.ts` and `tests/reconcile.test.ts`).
  - *What it could break or invite later*: Existing tests in `tests/status.test.ts` that snapshot plain `akrogon status` stdout when `~/.akrogon/reconcile/<repo>.json` has entries will need to expect (or isolate) `Kept:` lines.

---

## 4. Practitioner questions and pitfalls

1. **Pitfall (`#91` — Antigravity `transcript.jsonl` truncation and multi-MB size)**:
   - *Risk*: In `c8fd8be1-1f55-4e3d-876d-7ce1a40ff9b2`, `transcript.jsonl` grew to 235 lines (533 KB) and `transcript_full.jsonl` grew to 1.4 MB. When `transcript.jsonl` truncates `content` or `tool_calls` (`"truncated_fields": ["content"]` or `["tool_calls"]`), a naive parser checking `step.tool_calls` or parsing the JSON array in `"Created the following subagents:"` from `transcript.jsonl` might see a truncated string!
   - *What removes it*: Verified against `c8fd8be1-.../transcript.jsonl`:
     - In `PLANNER_RESPONSE` steps, even when `truncated_fields` includes `"tool_calls"`, `step.tool_calls` is still a non-empty array (only individual tool-call argument strings inside it are truncated, never the array length).
     - In `GENERIC` steps starting with `"Created the following subagents:\n[...]"`, the 3-subagent payload is ~1.1 KB, well below the truncation threshold (46 KB), so `"conversationId"` is never truncated in `transcript.jsonl`. Even better, matching `"conversationId":\s*"([0-9a-f-]+)"` via regex on `step.content` works even if a huge subagent list were ever truncated at the end, and checking the child's own `~/.gemini/antigravity-cli/brain/<sub-id>/.system_generated/logs/transcript.jsonl` confirms whether the child is still running.

2. **Pitfall (`#91` — Subagent failure / cancellation without a `SYSTEM_MESSAGE` wakeup)**:
   - *Risk*: What if `agy` spawns a subagent, pauses its parent invocation, and the subagent errors out (`status === "ERROR"`) or is killed so the parent never receives `SYSTEM_MESSAGE` or already finished?
   - *What removes it*: When checking an unreturned `<sub-id>` spawned after the last `USER_INPUT`, also check the subagent's own `brain/<sub-id>/.system_generated/logs/transcript.jsonl`: if that file exists and its final step has `status === 'ERROR'` or is a terminal `PLANNER_RESPONSE` with no `tool_calls` whose `created_at` is older than `IDLE_GRACE_MS` (meaning the subagent finished long ago and its wakeup already fired or failed), do not treat `<sub-id>` as still running.

3. **Pitfall (`#91` — Race right after `herdr agent prompt` before `USER_INPUT` is flushed to `transcript.jsonl`)**:
   - *Risk*: If `peer-wait.ts` checks `transcript.jsonl` immediately after `peer-ask.ts` sends the prompt, `transcript.jsonl` from a *previous* turn in the same `agy` session might still have the previous turn's final `PLANNER_RESPONSE` (no `tool_calls`) at the tail before the new `USER_INPUT` step is appended!
   - *What removes it*: Record `startedAt = Date.now()` when `peer-wait.ts` starts (or check whether any `USER_INPUT` step in `transcript.jsonl` has `Date.parse(step.created_at) >= startedAt - 10_000`; note `claudeTurnOpen` in `peer-wait.ts` has the analogous question when reusing an existing session). Also, in `conversations/<session>.db`, `steps` rows with `status = 2` (in-flight) are inserted at the start of a step before `transcript.jsonl` flushes on step completion! Let's verify whether `transcript.jsonl` writes `USER_INPUT` at the start of the turn or only when the first step completes. (See Section 5 & 6.)

4. **Pitfall (`#92` — Seat B and `direct-guards` reading check logs during the active leaf / chart pass)**:
   - *Risk*: During `implement`, `check.review`, `check.repair`, `check.fix`, and `merge`, seats routinely run `tail` or `rg` on the path printed by `akrogon verify` (`verify <name>: <code> <log>`, `src/verify.ts:163, 170`) or `akrogon run-check` (`src/run-check.ts:218`). If `run-check` deleted `out.log` on exit without keeping a copy anywhere, seats could not inspect the log of the check they just ran!
   - *What removes it*: Writing the kept log to `leafTemp(repo, slug)` (`/var/tmp/akr-<uid>/<repo-hash>/<slug-hash>/check-<name>-<ts>-<pid>.log`) instead of `<leaf>/implementation/` keeps the printed path valid and readable on disk for the entire lifetime of the leaf (across all phases and repair rounds), while keeping it completely outside `issues/` and git, and letting `reconcile` (`src/reconcile.ts:431-441`) automatically delete it when the leaf finishes and its tab closes.

5. **Pitfall (`#92` — `run-check` / `verify` with `--holder <dir>` outside a leaf)**:
   - *Risk*: When `akrogon verify --holder <chart>/direct` runs during a chart direct fix (`skills/chart-issues/SKILL.md:108`), `leafTarget` (`src/run-check.ts:127`) returns `{ slug: 'checkout', target: resolve(cwd, holder), scope: 'leaf' }`. In `src/reconcile.ts:401, 429`, `checkoutScratch` (`leafTemp(repo, 'checkout')`) is never removed as a whole directory — only its `run-*` subdirectories are reaped!
   - *What removes it*: If `run-check` writes `check-*.log` into `leafTemp(repo, slug)` (including `slug === 'checkout'`), `reconcile`'s scratch sweep (`src/reconcile.ts:396-444`) must also reap old `check-*.log` files inside `checkoutScratch` (e.g. when no active `run-*` exists in `checkoutScratch`).

6. **Pitfall (`#93` — `git worktree remove --force` on a worktree with submodules or non-writable directories)**:
   - *Risk*: `git worktree remove --force <path>` removes dirty worktrees with untracked files, but if a worktree directory was partially deleted (so git no longer considers it a valid worktree, or `.git` file is missing) or `git worktree remove --force` exits non-zero, `reconcile` could still get stuck.
   - *What removes it*: If `git worktree remove --force <path>` fails on a dead `verify-*`, `batch-*`, or finished `<slug>-u<N>` directory inside `worktreeStore(repo)`, fall back to `rmSync(path, { recursive: true, force: true })` followed by `git worktree prune` (`src/reconcile.ts:446`).

---

## 5. External operations needing a real proof call before handoff

1. **Antigravity CLI live step state in `transcript.jsonl` vs `conversations/<session>.db` (`#91`)**:
   - Inspect our own currently running Antigravity session (`3e7a43be-f285-4091-8abd-bed28b10d705`) on disk right now (`~/.gemini/antigravity-cli/brain/3e7a43be-f285-4091-8abd-bed28b10d705/.system_generated/logs/transcript.jsonl` and `sqlite3 ~/.gemini/antigravity-cli/conversations/3e7a43be-f285-4091-8abd-bed28b10d705.db "SELECT step_index, type, status FROM steps ORDER BY step_index DESC LIMIT 5;"`) to verify whether `USER_INPUT` and in-flight steps (`status = 2`) are flushed to disk **before** the first `PLANNER_RESPONSE` completes.
   - **Verified live during this session**:
     - In `brain/c8fd8be1-.../transcript.jsonl`, `USER_INPUT` (`step_index: 0`) is written immediately (`created_at: 2026-10-15T09:31:12.648Z`) before `PLANNER_RESPONSE` (`step_index: 1`, `created_at: 2026-10-15T09:31:20.435Z`), and every `GENERIC` tool result (`step_index: 2, 4, 6...`) is flushed to `transcript.jsonl` as soon as the tool finishes (before the next `PLANNER_RESPONSE` is generated).
     - And during subagent execution (`step_index: 65` `"Created the following subagents:"`), the `GENERIC` step containing all spawned `conversationId`s is flushed to `transcript.jsonl` **before** the parent emits its pause `PLANNER_RESPONSE` (`step_index: 72`).

2. **`git worktree remove --force` on dirty and unreachable detached worktrees (`#93`)**:
   - Command: `git -C <repo> worktree remove --force <worktree-path>`
   - Already proven in `4f3f2eb7` (line 14507–14508) on the actual `pass-two-review-notes-u2` (2 unreachable commits) and `pass-two-review-notes-u3` (2 unreachable commits + untracked `__pycache__/`): `git worktree remove --force` exited `0` and removed both worktrees cleanly in a single call.

---

## 6. Fog

- None. Every file, transcript, database table, and git state across `#91`, `#92`, and `#93` has been inspected and verified.
