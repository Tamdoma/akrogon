# Map C: test time loss (#50) and /tmp residue (#49)

Charting peer C, 2026-10-01. Read-only. Paths are relative to /home/ivan/Work/infra/akrogon unless prefixed `fw:` (= /home/ivan/Work/infra/tamdoma/framework) or `leaf:` (= fw:issues/open/emdash-cms/emdash-build/emdash-content-fixes).

## 1. Root causes

The hour lost on `emdash-content-fixes` was not a missing runner. It came from three things: criteria that demand whole runs, no rule for failures already red on base, and tests that share machine-wide state. A SHA-keyed record would have saved nothing, because every run in question was red.

- RC1. Charted criteria still demand whole suites, and nothing migrated leaves charted before the audit.
  - `leaf:brief.md:27` (charted 2026-09-30) requires `bun run framework:verify`. The plan copies it (`leaf:plan.md:89` C8) and adds IN5, a whole-folder run (`leaf:plan.md:111`).
  - `skills/implement-issue/SKILL.md:48,62` lets it through: "run `merge_checks` only at merge unless a done-criterion needs a whole run".
  - The new audit (`skills/chart-issues/assets/shapes.md:132,170`, commit af8d363) only runs on new charts.
  - The next victim is already queued. `fw:.../emdash-launch/brief.md:84` (phase `plan.synthesis`) requires `framework:verify`. That command is red in 9 places (fw seed 115) and was removed from framework `merge_checks` (fw e9b0104bd). The criterion cannot pass today.
- RC2. No rule covers a failure that is also red on base.
  - `implement-issue/SKILL.md:48` says "repair any failure". `check-issue/SKILL.md:51` says failed `checks` "always block". Neither says what to do when the same command fails on `AKROGON_BASE`.
  - So the seat investigates every red test. The operator's spoken rule became the rule (`leaf:implementation/report.md:58-69`). Once told, the seat built a base copy, compared, recorded and moved on.
  - The gap was the rule, not enforcement. The seat obeyed the plan exactly.
- RC3. Tests depend on shared machine state, so the result depends on what else is running. Up to `max_active: 12` leaves run at once.
  - browser-core defaults its runtime and profile to `~/.tamdoma/browser-core/runtime/browser-profile` (`fw:.claude/browser-core/scripts/cdp-core.mjs:67-70,246-247`). The only override is `BROWSER_CORE_RUNTIME_DIR` or `CDP_PROFILE_DIR`.
  - Another session's live Chrome held that profile. The spine was red on base and head for that reason alone (`leaf:implementation/report.md:61,63`).
  - Fixed `/tmp/<name>` debug paths are the same class (`/tmp/edd-base-check`, `/tmp/A-conv-base.log` at report.md:60, and `u9-debug` in #49).
  - Whole-folder `bun test` runs every file in one process. That adds interference (shared env, ports) that never shows when a file runs alone (report.md:62).
- RC4. Temp space has no owner.
  - Seats get only `AKROGON_BASE` and `GIT_EDITOR` (`src/next.ts:302-310`).
  - Cleanup removes only the worktree (`src/next.ts:559-566`).
  - So anything written to the system temp dir outlives the leaf. Worker worktrees already have an owner: `<worktree_store>/<slug>-u<N>`, removed by A (`skills/implement-issue/worker-protocol.md:11`).
- RC5 (minor). The agent's shell tool timeout (600 s) is shorter than whole runs (514 s on base, about 900 s in #50). Killed runs get repeated. Fixing RC1 removes most of these runs.
- RC6 (minor, framework). Framework `checks` repeats work. `test` and `test_changed` each rerun `hooks:parity` and `contracts:verify`, which are also their own entries (`fw:issues/config.yaml` checks). Each check pass runs both three times. Each takes seconds (report.md:53), but `selftest` is the one that hung for 25 min (#49).

## 2. Forks

- Q1. Reopen check-scheduling Q1 (build the check-record runner)?
  - O1a: keep 1a (no runner). Add the base-red rule (Q2) and migrate open leaves (Q3).
  - O1b: build #50 items 1 and 2 (runner, SHA records, automatic base diff).
  - O1c: build only merge refusal without a record.
  - Recommend O1a.
    - The #50 evidence is fully explained by RC1 to RC3. SHA reuse saves nothing when runs are red.
    - An automatic base diff doubles the cost of every red run and needs a dependency install per base.
    - The seat did the base comparison correctly once it had the rule.
    - O1c guards a failure nobody has seen. `merge-issue/SKILL.md:33` already runs `checks` and `merge_checks` before every push.
- Q2. What does a seat do with a failure that also fails on `AKROGON_BASE`?
  - O2a: rerun the same command in the same mode on base (detached worktree under the leaf temp dir). Compare failing test names. Only failures new on head block. Record base-red ones in the report with the base log. They are not repaired.
  - O2b: any base-red failure fails the leaf to the operator.
  - O2c: no rule (status quo).
  - Recommend O2a, as one sentence in implement-issue (`:48`, `:62`) and check-issue (`:51`). A whole `checks` command red on base cannot be split by test name, so it fails the leaf with "red on base <sha>". That is a repo-config problem for the operator, not leaf work.
- Q3. How to handle leaves charted before the audit?
  - O3a: a one-time chart pass now over open leaves. Today that is `emdash-content-fixes` (C8, IN5) and `emdash-launch` (criterion 10). The operator approves narrowing each criterion to the leaf's own tests plus `checks`.
  - O3b: a code flag at phase start (#50 item 3).
  - Recommend O3a. The set is finite and known. A permanent code check for a one-time transition is machinery with no future use.
- Q4. Where does a leaf's temp dir live?
  - O4a: `/var/tmp/akrogon/<repo>/<slug>`.
    - It is the standard disk temp location, on btrfs here.
    - It has no small inode cap, and the OS already ages it at 30 days (`/usr/lib/tmpfiles.d/tmp.conf`). That covers orphans for free.
    - The path is short.
  - O4b: `~/.cache/akrogon/<repo>/<slug>/tmp` (the seed's proposal). It is a new place to learn, and the path length is borderline (Pitfall P1).
  - O4c: `<worktree_store>/<slug>.tmp`, next to the worktree. It matches the `-u<N>` pattern, but the path is too long (P1).
  - O4d: under `/tmp`. The operator's hourly `tmp-sweep` deletes entries untouched for 2 h, which can delete a live leaf's files. It is also RAM-backed.
  - Recommend O4a.
- Q5. When is it deleted?
  - O5a: only where the worktree is removed (`cleanupMerged`, `src/next.ts:559-566`).
  - O5b: also at every phase end (the seed's item 2).
  - Recommend O5a.
    - Seats live across phases in the same pane, and A and B share the leaf. Claude Code keeps live task output under `os.tmpdir()` (binary 2.1.286). A phase-end wipe deletes files a running session still uses.
    - Under O5a, a failed leaf keeps its worktree and so keeps its temp dir for diagnosis.
    - Park already refuses a leaf that has a worktree (`src/park.ts:22-26,54-56`), so the seed's "delete on park" has nothing to delete.

## 3. The /tmp mechanism (simplest)

The class to remove is temp files with no owner. A disk-backed location fixes the inode cap. Owning the dir fixes the leftovers.

1. In `allocate` (`src/next.ts:299-310`), create `/var/tmp/akrogon/<repo>/<slug>` and add `--env TMPDIR=<dir>` to `placement`. `placement` is already used for both the tab and the pane splits.
2. In `cleanupMerged`, remove that dir next to `git worktree remove`.
3. Add one sentence where seats already read shared rules: temp files, logs and base copies go under `$TMPDIR`, never `/tmp/<name>`. A file that must survive the merge goes in the leaf folder.

What the seed asked for that this drops:
- `TMP` and `TEMP`. Those are Windows conventions. `TMPDIR` covers Node and Bun `os.tmpdir`, `mktemp`, Python `tempfile`, Chrome and Playwright.
- Phase-end cleanup (Q5).
- Park and close hooks (no worktree exists then).
- Per-leaf size in `status` (`du` over trees of 66k inodes on every status call, for a number `df -i` already shows).

Workers need no change. They are child processes of the seat, so they inherit its env. Their worktrees already have an owner.

## 4. Practitioner questions and pitfalls

- P1. Unix socket paths are limited to 108 bytes. Chrome makes `$TMPDIR/.org.chromium.Chromium.XXXXXX/SingletonSocket`.
  - Next to the worktree (O4c), that is 127 bytes. Chrome launch fails.
  - Under `~/.cache/akrogon/framework/emdash-content-fixes/tmp` (O4b), it is 106 bytes, and a longer slug breaks it.
  - Under `/var/tmp/akrogon/framework/emdash-content-fixes`, it is 93. Claude Code's own error text warns about the same limit.
- P2. herdr `--env` applies only when a tab or pane is created. Leaves already running keep their old env until their panes are recreated, so rollout is gradual.
- P3. akrogon's tests isolate only `AKROGON_HOME` and `tmpdir()` (`tests/helpers.ts:12,44`). A fixed `/var/tmp/akrogon` root needs one test seam. Otherwise tests write into the real root.
- P4. Evidence paths in `report.md` that point into `$TMPDIR` stop resolving after merge. Anything a reviewer needs after merge belongs in the leaf folder.
- P5. A base run (Q2) in a fixture repo costs a full dependency install, about 66k inodes. It only stays cheap if it runs once per red command, not once per test.
- P6. Whole-folder versus single-file mode must match between head and base, or interference failures look new (#50 makes the same point).
- P7. TMPDIR alone does not fix RC3. browser-core ignores TMPDIR and uses `~/.tamdoma`. That is a framework change.
- Q-a. Should A and B share one temp dir? Yes. Phases alternate, and one owner means one cleanup.
- Q-b. Is an orphan possible? Yes, if a worktree is abandoned outside akrogon. The 30-day `/var/tmp` age covers it.

## 5. Research lines

| Tier | Source (date) | Finding | Effect |
|---|---|---|---|
| better-than-training | `leaf:brief.md:27`, `leaf:plan.md:89,111`, `leaf:implementation/report.md:45-69` (read 2026-10-01) | The whole runs were required by the chart. Base-red was caused by a shared browser profile. The seat complied once given the rule. | Q1 stays 1a. Added RC1, RC2, RC3. |
| better-than-training | `fw:.claude/browser-core/scripts/cdp-core.mjs:67-70,246-247` (2026-10-01) | The profile defaults to `~/.tamdoma`, shared across sessions. | Added RC3 and P7. Framework item is Off route. |
| better-than-training | `fw:.../emdash-launch/brief.md:84`, `state.yaml` (2026-10-01) | The next leaf (plan.synthesis) requires a red `framework:verify`. | Q3 is urgent. |
| better-than-training | Claude Code binary 2.1.286, `strings` (2026-10-01) | Temp root is `CLAUDE_CODE_TMPDIR`, falling back to `os.tmpdir()`. Live task output sits there. The binary warns about socket path length. | Phase-end wipe rejected (Q5). Added P1. |
| better-than-training | `/usr/lib/tmpfiles.d/tmp.conf`, `findmnt /var/tmp`, `systemctl --user cat tmp-sweep` (2026-10-01) | `/var/tmp` is btrfs with 30-day aging. `/tmp` gets a 2 h user sweep. | O4a chosen, O4d rejected. |
| practitioner | Graydon Hoare, "The Not Rocket Science Rule" (2014, graydon2.dreamwidth.org) | Main must stay green. Test the merged result before the push. | merge-issue:33 already does this. O1c adds nothing. |
| practitioner | Martin Fowler, "Eradicating Non-Determinism in Tests" (2011, martinfowler.com) | Isolate shared resources and quarantine nondeterministic tests. | RC3 is test isolation, owned by framework. |
| practitioner | John Micco, "Flaky Tests at Google and How We Mitigate Them" (2016, testing.googleblog.com) | Separate flaky and pre-existing failures from new ones before blocking. | Supports O2a (compare against base, only new failures block). |
| practitioner | Kent Beck, "Test Desiderata" (2019) | Tests should be isolated, fast and deterministic. | Matches the operator's "stupid and meaningless and take too long". Points at framework test design, not akrogon. |
| model-knowledge | `man 7 unix` (`sun_path` is 108 bytes). Chromium `process_singleton_posix` puts its socket under TMPDIR. | Long TMPDIR paths break Chrome. | Added P1 (verify Chrome on first leaf). |

## 6. Off route

- The check-record runner, SHA reuse, automatic base-diff code and merge refusal without a record (#50 items 1 and 2). These stay Off route unless the operator takes O1b or O1c.
- A phase-start flag in code (#50 item 3). O3a replaces it.
- Per-leaf temp size in `status`, `TMP` and `TEMP`, phase-end cleanup, and park and close hooks (§3).
- Framework work, which belongs to the framework repo (fw seeds 113, 115):
  - browser-core's shared runtime dir under tests
  - fixture copies holding `node_modules`
  - whole-folder interference
  - duplicate `checks` entries (RC6)
  - the `selftest` hang
  - red `framework:verify`
- Reporting base-red main runs automatically after merge (#50). There is no owner and no evidence of value yet. Operator call.
- OS-level sweeps for sessions akrogon does not run. The operator already has `tmp-sweep` and `tmp-clean`.
