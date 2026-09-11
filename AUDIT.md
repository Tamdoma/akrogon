# Akrogon audit — defects and loopholes

External review of the command (`src/`), skills, plugin, tests and issue records. Read-only; no repo files were changed. All findings verified against the code at commit `2932b4e` plus working tree, herdr 0.9.0 on this machine, and bun 1.4.0. Suite: 104 tests green, `tsc --noEmit` clean.

Severity: **S1** = loses work or bricks the loop, **S2** = stalls or corrupts under realistic conditions, **S3** = edge case / UX / hygiene.

---

## S1 — loses work or bricks the loop

### F1. GitHub source closure is unrecoverable once it fails

`src/phase.ts` `completeOwner()` renames the issue folder to `issues/closed/` and *then* calls `closeSources()`. If `closeSources` throws (gh down, bad source string, comment-listing failure), the command exits nonzero but the folder is already moved. Every later path short-circuits:

- `transition()` throws `Merged is terminal` before anything else.
- `completeOwner()` returns early at `within(leaf.path, issues/closed)` — before reaching `closeSources`.

Proven with a temp test: two failed `gh` calls at merge → folder moved, `akrogon phase <slug> merged` retry fails, `akrogon next <slug>` exits 0 and makes **zero** new gh calls. The GitHub issues stay open forever with no error surfaced anywhere after the first failure.

Fix direction: run `closeSources` before the rename, or make `completeOwner` retry `closeSources` for already-closed leaves.

### F2. `next` has no per-leaf or per-repo error isolation — one bad record kills all dispatch

`dispatchLeaf`/`sweep`/`sweepAll` let any error propagate out of `nextCommand`. Proven with temp tests:

- One registered repo whose path was deleted → `akrogon next <slug>` on a *healthy* repo exits 1 (`readRepo` → `realpathSync` ENOENT inside `activeCount`). Same for the hook path (`owners` scan reads every repo) and `next --all`.
- One leaf with `blocked-by: [nonexistent]` → `dependenciesReady` → `findLeaf` throws `Missing leaf` → `next --all` exits 1 and dispatches nothing.
- One corrupt `state.yaml` (bad enum, duplicate slug, `repo` mismatch) → `allLeaves` throws → same total outage.
- A `merge`-phase leaf whose `git fetch` fails twice → `retryCommand` throws → sweep dies.

Because the herdr event hook and the plugin `[[startup]]` both run `akrogon next`, one bad record disables the entire machine until manually repaired — and nothing notifies the operator that dispatch itself is broken.

Fix direction: catch per-leaf (and per-repo in `sweepAll`/`activeCount`/hook scan) errors, report them, continue.

### F3. `cleanupMerged` failures abort `next --all` before the sweep

`nextCommand('--all')` runs `cleanupMerged` for every merged leaf *before* `sweepAll`. Two proven failure modes:

- Dirty merged worktree → `git worktree remove` refuses → exit 1, sweep never runs. Proven: a `merged` leaf with an uncommitted file blocked dispatch of a ready leaf.
- `git branch -d <slug>` fails when the leaf branch has no upstream configured (created via `git worktree add <path> <slug>` on a pre-existing branch, or merged by a different remote name). Reproduced in a scratch repo: `branch -d` exits 1 even after the commits are on `origin/main` and fetched. The suite only covers the upstream-tracked case.

Since `next --all` is the plugin startup command, one leftover worktree disables startup dispatch permanently.

Fix direction: `--force`-equivalent handling after proving the branch is an ancestor of the target, and per-leaf error isolation as in F2.

### F4. `sync` commits the whole repo, not `issues/`

`src/sync.ts` runs `git add -A` at repo root. Any unrelated dirty file in the consumer repo — including the operator's half-finished work — is committed as `sync issues` and pushed to the default branch. It also takes no lock, so it can commit a half-renamed issue tree mid-`park`/mid-`completeOwner` (both hold only the global lock or leaf locks, never the repo lock `sync` ignores).

Fix direction: `git add issues/ learnings/` (or explicit paths), and take the repo lock.

### F5. Renaming a repo directory or registration key bricks every leaf

`state.repo` is written at handoff and checked in `allLeaves` (`Leaf repo mismatch`) and `status` (`z.literal(repo.name)`). `init` derives the name from `basename(root)`. Rename the directory or the `repos` key and every existing leaf becomes unreadable — `next`, `phase`, `status` all fail. No migration path exists.

Fix direction: store the repo key once and tolerate rename (match by root path), or document + provide a rename command.

---

## S2 — stalls and realistic corruption

### F6. No stall detection: a wedged agent parks a leaf forever

`dispatchSlot` returns early whenever the seat's agent is `working` or `blocked` (`src/next.ts:230` area). There is no timeout, no attempt consumption, no notification. Observed live: a Codex pane dead at the context-window limit still reported `agent_status: "working"` to herdr — under dispatch that leaf waits forever, silently. The `failed` notification only fires after prompt *attempts* are exhausted; a permanently-busy agent never consumes an attempt.

Same class: `dispatchLeaf`'s merge check (`src/next.ts:299-305`) only treats `working` as active, not `blocked` — a blocked merger lets `recoverMerge` run mid-rebase, and `requireClean` then throws and (per F2) kills the sweep.

### F7. `agent_session` null on a live agent → permanent silent skip

`src/next.ts:230`: `if (pane.agent !== null && pane.agent_session?.value === state.prompted[slot]) return;`

When `agent` is set but `agent_session` is absent/null (schema allows both; session detection lags agent detection), `undefined === undefined` is true → the slot is never prompted, no attempt consumed, no error. If session detection never populates for that harness, the leaf stalls forever.

Fix direction: only skip when a session value exists *and* matches.

### F8. `tests/park.test.ts` drives the real herdr

`cli(f, ['next', '--all'])` in park tests runs without `FAKE_HERDR`/PATH override, so `next` calls the installed `herdr` and creates real tabs/panes in the operator's workspace (17 stray `busy`/`free` tabs observed from two runs; closed during the audit). The tests pass anyway because they only assert on stdout/stderr.

Fix direction: give park tests the fake-herdr fixture, or stub `herdr` to fail fast.

### F9. `init` writes fixed `.gitignore` entries but `worktree_root` is configurable

`src/init.ts` always ignores `issues/worktrees/`. A repo configured with a different `worktree_root` gets worktrees that are not ignored — and per F4, `sync` will then commit entire worktree checkouts.

### F10. `pull` hardcodes `origin`, ignoring configured `remote`

`pullRepo` runs `git remote get-url origin`. A repo whose GitHub remote is named otherwise (config `remote: upstream` is supported for merges) fails pull with "origin" errors. The test suite explicitly asserts this behavior, so it is intentional — flagging because `remote` being merge-only is undocumented and surprising.

### F11. Failed-leaf notification fires on every sweep — notification spam

`dispatchLeaf` calls `herdr notification show` for `failed` leaves on every `next` invocation, with no dedup. Proven: 3 sweeps → 3 notifications. Every hook event re-notifies forever.

### F12. `check.review` allows peer questions in a concurrent phase → deadlock risk

`check-issue` permits the "necessary peer question" flow (wait-for-idle → prompt → `herdr agent wait` with no timeout). `check.review` is a two-slot phase: if A and B both decide to ask the peer, each waits for the other to go idle — permanent mutual wait, no timeout, no recovery. `plan-issue` restricts peer questions to "outside blind positions"; `check-issue` has no equivalent guard.

### F13. Broadcast fires per-issue inside an epic, before the epic completes

`completeOwner` prints `issue complete` when a single issue's leaves are merged, even while sibling issues in the epic are still open. `merge-issue` broadcasts on `issue complete` — so an epic produces N partial-completion broadcasts, and the broadcast happens before `closeSources` runs (sources close only at epic rename). Message says "completed issue" while the GitHub intake is still open.

### F14. `discord-send` skips remaining chunks after a failed chunk

`sendWithRetry` throws out of the chunk loop on a chunk's second failure — later chunks of the same message are never attempted. A long message can be delivered as a truncated fragment with no record of what was sent.

---

## S3 — edge cases and hygiene

- **F15.** `state.slot` is written by `dispatchSlot` and never read anywhere. `priority` is schema-required, written, never read. Dead fields.
- **F16.** `akrogon next` inside a herdr pane that owns no leaf exits 0 silently (hook path returns early). Manual `akrogon next` from an unrelated pane looks like it worked and did nothing.
- **F17.** `akrogon next <path-to-a-file>` crashes with raw `ENOTDIR` (`existsSync` true → `requireRepo` → `git rev-parse` on a file). Minor UX.
- **F18.** `nextCommand` parses `HERDR_PLUGIN_EVENT_JSON` before checking `--all`; a malformed or `working`-status event makes even `akrogon next --all` exit early or crash.
- **F19.** `logMove` runs after the state commit; a failure (herdr down for `panes()`, removed worktree for `rev-parse`) makes `phase` exit nonzero *after* printing `moved <phase>` — confusing but consistent state.
- **F20.** `allocate` throws `Expected one or two panes` if a third pane exists in a leaf tab (operator split) — permanent dispatch failure for that leaf. Stale `tab`/`worktree` fields also inflate `activeCount`, consuming `max_active` capacity until the startup sweep.
- **F21.** `install` links skills only into `~/.claude/skills` and `~/.agents/skills`. The `pi` harness is a first-class configured slot (`config.yaml` ships a `pi` template) but pi reads `~/.pi/agent/skills` — dispatch sends `plan-issue <slug>…` prompts to an agent with no skills installed.
- **F22.** `README.md` command table omits `sync`, `park`, `unpark` (usage string has them). `init` doesn't add `issues/parked/` to `.gitignore` (probably intended — parked records are meant to be committed — but undocumented either way).
- **F23.** `akrogon status` reports a repo `unreadable` when `issues/open` is missing — i.e. a fully drained repo looks broken. A parked leaf (`status-empty-open`) already exists to fix this; recorded here because it's live today.
- **F24.** `status <slug>` / `phase <slug>` / `next <slug>` can't see parked leaves (`findLeaf` scans only open+closed) — `Missing leaf` is correct behavior but the error doesn't say the leaf may be parked.
- **F25.** Leaf trees deeper than `open/<epic>/<issue>/<leaf>` misbehave: `withLeafLocks` locks the wrong ancestors and `completeOwner` renames a middle container out from under its parent. Malformed input, but nothing validates depth at handoff.
- **F26.** A leaf `state.yaml` directly under `issues/open/` self-deadlocks: `withLeafLocks` tries to flock `issues/.lock`, already held by `withRepoLock` (verified: nested `flock -x` on the same file blocks). Malformed input again.
- **F27.** `shapes.md`'s state.yaml template hardcodes `phase: plan.synthesis` while the text says `debate: 'yes'` starts at `plan.positions` — copy-paste trap for the door agent.
- **F28.** `ensureWorktree` throws `Worktree path mismatch` if `worktree_root` config changes mid-lifecycle — leaf stalls permanently.
- **F29.** `recoverMerge` runs `git fetch` inside the repo lock; a hung remote stalls all repo dispatch (no fetch timeout).
- **F30.** `dispatchSlot` crashes (`z.string().parse` on undefined) if `state.pane[seat]` is missing — possible on hand-authored or migrated states.
- **F31.** `herdr()` parses stdout with unguarded `JSON.parse` — a non-JSON stdout on exit 0 surfaces as `SyntaxError` losing the real output (the stderr side of this was already fixed per learnings; stdout wasn't).
- **F32.** `sync` pushes `HEAD:<default_branch>` regardless of the checked-out branch — running it on a detached head or side branch pushes the wrong ref.
- **F33.** `new-beginning/` is an empty untracked husk the merged `retire-old` leaf was told to delete (criterion 1). Harmless, but the done-criterion is technically unmet.
- **F34.** `completeOwner` throws `Completion destination exists` when a new issue reuses a closed issue's folder name — permanent stall, and `shapes.md` only checks *leaf* slug uniqueness, not issue-folder reuse.
- **F35.** `dispatchSlot` uses `--timeout 5000` for both `agent start` and `agent prompt --wait`; a slow cold-start harness burns one of only 3 attempts per 5s timeout. Combined with F6's missing stall detection, transient slowness can fail a leaf while a true wedge never does.

## Verified non-issues (checked, no action needed)

- `bun test --changed=<sha>` exists in bun 1.4.0 — `test_changed` config is valid.
- `herdr pane split --no-focus`, `tab create --cwd/--env/--no-focus`, `agent prompt --wait --until` all exist in herdr 0.9.0.
- `Bun.YAML` parses `yes`/`no`/`n` as strings — `debate: yes` unquoted is safe *in this repo's parser* (still a YAML 1.1 trap for any other tool reading state files).
- Lock ordering global → repo → issue → leaf is consistent everywhere; leaf locks are redundant under the repo lock but harmless.
- `park` correctly refuses running issues, dependency-stranding moves, and name collisions; the other reviewer's claim that `park.ts` races `next`/`phase` is wrong — it holds the global lock they also take. (It does race `sync`, which takes no lock — see F4.)
- `closeSource` retry logic (view → close → comment-dedup on retry) is correct and well-tested.
- `seed-issue`, `init-issues`, `broadcast-issue` skills: no functional defects found beyond F14.

## Test artifacts

Temporary probe tests were written under `/tmp` (never in the repo): `probe-stale-repo.test.ts`, `probe2.test.ts`, `probe3.test.ts`, `probe4.test.ts`. All findings marked "proven" reproduce with them. Stray herdr tabs created by the leaky park tests were closed.
