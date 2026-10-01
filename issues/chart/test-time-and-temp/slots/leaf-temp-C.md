# leaf-temp, slot C

Peer C, 2026-10-01. Independent round. I read the fork, INTAKE #49, map-merged, map-rebuttal-B and map-rebuttal-C, and inspected `src/next.ts`, `src/state.ts`, `src/phase.ts` and `src/config.ts`. `fw:` = /home/ivan/Work/infra/tamdoma/framework.

## The mechanism

One function, `leafTemp(repo, slug)`, computes one bounded path. akrogon uses it in three places: export as `TMPDIR`, create it on each dispatch, and delete it once the merged leaf's tab is closed. No new state field, config key or status column.

## Q1. Location

- O1a: `/var/tmp/akrogon/<repo>/<slug>`. Readable. The length is unbounded, because the slug regex has no max (`src/state.ts:37`) and repo keys are any non-empty text (`src/config.ts:8,18`). A long slug breaks Chromium again.
- O1b: `/var/tmp/akrogon/<sha256(repo.root, slug)[0:12]>`. Bounded and short (29 bytes), but the operator cannot tell which leaf a folder belongs to.
- O1c: `/var/tmp/akrogon/<slug[0:24]>-<sha256(repo.root + "\n" + slug)[0:8]>`. Readable and bounded (at most 50 bytes).
- O1d: `<worktree_store>/<slug>.tmp` or `~/.cache/akrogon/<repo>/<slug>/tmp`. 127 and 106 bytes with the Chromium suffix for `emdash-content-fixes` (map-merged F8). Both already fail or sit at the limit.

Recommend O1c.
- **Socket fit.** The worst case is 50 + 46 (`/.org.chromium.Chromium.XXXXXX/SingletonSocket`) = 96 bytes. That is under the 107 usable bytes of `sun_path`, with 11 to spare, for any slug or repo name.
- **Readable.** The folder still starts with the leaf's name. That keeps the mental model "the leaf's temp folder is named after the leaf".
- **Precedent.** A hashed name already exists: `akrogon-<sha256(pane_id)[0:24]>` (`src/next.ts:428`).
- **Hash input is `repo.root`** (realpath, `src/config.ts:86`), not the repo key. Renaming a key in `config.yaml` then keeps the folder. Test fixtures, each an `mkdtemp` root, can never collide with a real leaf.
- **Why `/var/tmp`.** It is disk (btrfs here, `findmnt -T /var/tmp`), has no small inode cap, and is the standard place for large temp data. The operator's 2 h `tmp-sweep` only targets `/tmp`.
- **Placement.** `leafTemp` sits next to `worktreeStore` (`src/config.ts:127-129`). The path is derived, never stored.

Research
| Tier | Source, date | Finding | Changed |
|---|---|---|---|
| better-than-training | `src/state.ts:37`, `src/config.ts:8,18`, read 2026-10-01 | No length cap on slug or repo key. | Dropped O1a. Path is bounded (concedes B R3). |
| better-than-training | `src/next.ts:428`, 2026-10-01 | Truncated sha256 naming already used. | O1c follows an existing idiom. |
| better-than-training | `wc -c` on candidate paths (map-merged F8), 2026-10-01 | 127 / 106 / 93 bytes. | Ruled out worktree-side and `~/.cache`. |
| model-knowledge | `unix(7)` (`sun_path` is 108 bytes including NUL). Chromium `process_singleton_posix.cc` puts `SingletonSocket` in a `.org.chromium.Chromium.XXXXXX` dir under TMPDIR. | The limit applies to TMPDIR plus a fixed 46-byte suffix. | Sets the 50-byte budget. Proof below. |

Pitfalls
- P1. Proof by test. A leaf with a 200-character slug and a long repo root gets a path where `path + "/.org.chromium.Chromium.XXXXXX/SingletonSocket"` is at most 107 bytes. A string-length test is the cheapest sufficient proof. akrogon does not ship Chrome.
- P2. Tests that nest their own TMPDIR (for example `$TMPDIR/tamdoma-hooks-spec-*`) and launch Chrome from inside it use up the 11 spare bytes. That is framework test hygiene, but the budget is not unlimited.
- P3. akrogon's own tests will create real folders under `/var/tmp/akrogon` (they isolate only `AKROGON_HOME` and `tmpdir()`, `tests/helpers.ts:12,44`). Hashing on the fixture root avoids collisions. The test's `clean()` must remove the folder, and OS aging catches what a crashed test leaves. There are already 132 `akrogon-dispatch-*` dirs from 2026-09-05 in `/var/tmp`, so leaks happen. If the operator wants no test writes to `/var/tmp`, the only alternative is one env seam for tests.
- P4. Create the leaf folder with mode 0700. `/var/tmp` is shared and world-writable, and Claude Code expects a private temp dir (its 2.1.286 binary text says "a private (0700) directory you own").

## Q2. Deletion and failed leaves

When:
- O2a: delete where the worktree is removed (`src/next.ts:562-565`). This is what I proposed in my map. I withdraw it.
  - `cleanupMerged` returns early while the leaf is still under `issues/open` (`src/next.ts:561`).
  - `completeOwner` moves the owner to `issues/closed` only when every sibling has merged (`src/phase.ts:138-142`).
  - Six merged framework leaves keep worktrees today: `emdash-kit`, `emdash-conversion`, `emdash-access-gate`, `strategy-output-relocation`, `team-data-relocation`, `media-manifest-relocation` (`fw:issues/worktrees/`, all `phase: merged` under `issues/open`, 2026-10-01). Their temp would live until the slowest sibling merges.
- O2b: delete in `cleanupMerged` right after `closeMergedTab` and before the open-folder early return. Then run `git worktree prune` in the repo root, because the check-proof 2a base worktree is registered with git and lives inside the folder.
- O2c: also wipe at every phase end (#49 item 2). Seats run in the same pane across phases, and Claude Code keeps live task output under TMPDIR (map-merged F7). A wipe deletes files of a running session.

Recommend O2b (agrees with B R2).
- **Seats are stopped.** The tab close stops the seats first.
- **Merged leaves only.** `cleanupRepos` already visits every merged leaf on each `next`, `--all` and `--resume` (`src/next.ts:642-651`, `:706-724`).
- **Idempotent.** `rmSync(..., { recursive: true, force: true })` is a no-op once the folder is gone. A real error goes through the existing `report()` and is retried on the next sweep.
- **Failed leaves keep it.** A failed leaf is not merged, so it keeps its folder until it is recovered and merged.

Failed leaves and OS aging:
- O2d: diagnosis expires. Files untouched for 30 days in `/var/tmp` are aged out by the OS (`/usr/lib/tmpfiles.d/tmp.conf`: `q /var/tmp 1777 root root 30d`). Anything a recovery needs (failure reason, failing test names, log tail) is written into the leaf folder's report, not only linked.
- O2e: exclude `/var/tmp/akrogon` from aging with an `x` line in `/etc/tmpfiles.d`. That is a root-owned file outside akrogon. Orphans from abandoned leaves would then never age, which brings back the problem class.
- O2f: hold a lock that tmpfiles respects (systemd's recommendation for live trees). That needs a long-lived holder, and akrogon has no daemon.

Recommend O2d. State the rule once: "temp is scratch, it expires; evidence lives in the leaf folder." Active work is not affected, because aging uses the newest of a file's access, change and modify times, so files in use stay fresh.

Research
| Tier | Source, date | Finding | Changed |
|---|---|---|---|
| better-than-training | `src/next.ts:559-566,642-651`, `src/phase.ts:138-142`, `fw:issues/worktrees/` plus leaf `state.yaml`, 2026-10-01 | Merged leaves keep worktrees until the owner closes. 6 live cases. | Deletion moved before the open-folder return. My O2a withdrawn. |
| better-than-training | `/usr/lib/tmpfiles.d/tmp.conf`, `systemctl --user cat tmp-sweep`, 2026-10-01 | `/var/tmp` ages at 30 days. The user sweep covers only `/tmp`. | Picked O2d. |
| practitioner | Lennart Poettering et al., "Using /tmp/ and /var/tmp/ Safely", https://systemd.io/TEMPORARY_DIRECTORIES/ (read by B 2026-10-01; my recall) | Age cleanup is not tied to process lifetime. Live trees need a lock or must tolerate aging. `/var/tmp` is for large, longer-lived temp. | Retention stated as expiring, not indefinite (concedes B R4). |

Pitfalls
- P5. Recovery after expiry. A failed leaf's folder may be partly aged out when it is recovered. `allocate` must `mkdir -p` the folder on every dispatch (`src/next.ts:296-310` runs each time), not only when the tab is created. Otherwise the seat's existing TMPDIR points at a missing dir and `mktemp` fails.
- P6. Stale git worktree entry. If the base worktree's folder is aged out or removed, git keeps a "missing but already registered" entry. The next `git worktree add` at the same path fails. Fix: the seat removes the base worktree with `git worktree remove` once the comparison ends (same as worker worktrees, `skills/implement-issue/worker-protocol.md:11`), and cleanup runs `git worktree prune`.
- P7. Timing. Deletion inherits `closeMergedTab`'s timing. `next` with no argument closes a merged tab without waiting for B to go idle (only the hook path waits, `src/next.ts:744-753`). A merge seat still writing its broadcast could lose a temp file. This is an existing race, not new, but it is now visible.
- P8. Survivors. A detached descendant (a Chrome started with `setsid`) can survive the tab close and keep writing. Use `rmSync`'s `maxRetries`. A remaining failure is reported, not hidden.
- P9. Check-proof 2a carry. Its "both log paths in the report" must also put the failing names and log tails in the report, or O2d loses the evidence after 30 days.

## Q3. Export

- O3a: `TMPDIR` only, set via `placement` in `allocate` (`src/next.ts:302-310`). Tab creation and both pane splits use it. Workers inherit it.
- O3b: also `TMP` and `TEMP`, and pass it to workers explicitly in skill prose (#49 item 1, B).

Recommend O3a.
- **Every tool reads `TMPDIR`.** Node and Bun `os.tmpdir()` check `TMPDIR` first, and so do Python `tempfile`, `mktemp` and Chromium. `TMP` and `TEMP` matter only when `TMPDIR` is unset.
- **Nothing overrides it.** The operator's environment sets none of the three (`env`, 2026-10-01).
- **Workers inherit it.** pi worker shells spawn with `{ ...(env ?? process.env) }` (`~/.pi/agent/extensions/tamdoma-subagents/worker-shell.ts:184-186`). Claude Code 2.1.286 follows TMPDIR (A probe, map-merged F7). Codex's default `shell_environment_policy` inherits the full env, and `~/.codex/config.toml` has no override.

Research
| Tier | Source, date | Finding | Changed |
|---|---|---|---|
| better-than-training | `worker-shell.ts:184-186`, `env`, `~/.codex/config.toml`, 2026-10-01 | pi passes the env through. No temp vars are preset. Codex is not configured to strip env. | No explicit carry. |
| model-knowledge | Node `os.tmpdir()` docs. Python `tempfile.gettempdir`. Codex `shell_environment_policy` (inherit defaults to `all`, removes only names matching KEY, SECRET or TOKEN). | `TMPDIR` comes first everywhere, and Codex keeps it. | O3a. Codex left to one probe. |

Pitfalls
- P10. Codex 0.159.2 is not yet probed. The proof is one live seat after the change, where a worker prints `node -p "require('os').tmpdir()"`. If it shows `/tmp`, add a carry for Codex workers only.
- P11. herdr `--env` applies only when a tab or pane is created. Leaves running at rollout keep `/tmp` until their panes are recreated.
- P12. Fixed paths ignore TMPDIR: hardcoded `/tmp/<name>` and browser-core's `~/.tamdoma` profile (`fw:.claude/browser-core/scripts/cdp-core.mjs:67-70`). The one skill line (map-merged leaf-temp) covers seats. Tests that hardcode paths are framework work.

## Out of this fork, noticed

`fw:issues/worktrees/` still holds worker worktrees `emdash-content-fixes-uR1`, `-uR2` and `emdash-conversion-ufix-b`. `worker-protocol.md:11` says these are removed before handoff, so worker cleanup also leaks. That is not for this fork.
