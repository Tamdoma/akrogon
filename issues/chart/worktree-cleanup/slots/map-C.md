# Territory map, slot C (blind opening map)

Scope: Tamdoma/akrogon #91, #92, #93. Read only. Every claim cites a file:line in /home/ivan/Work/infra/akrogon unless another root is named, a command I ran on 2026-10-15, or an outside source with URL and date. Items marked (low confidence) were not proven end to end.

Roots used:
- akrogon: /home/ivan/Work/infra/akrogon (main)
- framework: /home/ivan/Work/infra/tamdoma/framework (consumer repo with the evidence)
- herdr source: /home/ivan/Work/infra/herdrdev/herdr (herdr 0.9.1 installed)
- antigravity storage: ~/.gemini/antigravity-cli, hook config at ~/.gemini/config/hooks.json
- door transcript: ~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/773ba851-3d2f-4491-861b-1432f9e5c45a.jsonl
- implementer transcript (pi, leaf browser-socket-runtime): ~/.pi/agent/sessions/--home-ivan-.akrogon-worktrees-framework-browser-socket-runtime--/2026-10-15T08-09-51-358Z_01a13e9c-45fd-77e5-9073-8559f354450d.jsonl

## 1. Verified facts per report

### #91 peer-wait reports failure while an antigravity peer still works

What the code does:
- F1.1 `skills/chart-issues/scripts/peer-wait.ts:67` sets `IDLE_GRACE_MS = 10000`. The main loop (`:159-200`) runs `herdr agent wait --timeout <budget>` without `--until`, which matches idle, done or blocked (`herdr agent wait --help`, run 2026-10-15). On idle or done with no complete file it waits a 10 s grace for `working` (`:185`), then `:192-194` returns `failure` unless `turnOpen(agent)` is true.
- F1.2 `turnOpen` (`:130-134`) returns `false` for every `agent.kind !== 'claude'`. Only Claude gets the transcript scan in `claudeTurnOpen` (`:113-128`), which reads `~/.claude/projects/*/<session>.jsonl` backwards and treats a `system/turn_duration` row as closed and a `user` string row as open. That check landed in commit f3199df (2026-10-10, `git log -S claudeTurnOpen`).
- F1.3 `peer-ask.ts:31-37` spawns peer-wait and `:67` exits non-zero when any wait failed. `skills/chart-issues/assets/questions.md:46` says A ends the turn on `failure`, `blocked` or a non-zero exit. So a false `failure` ends the door turn while the peer is still writing.
- F1.4 Tests (`tests/peer-wait.test.ts:1-150`) drive a fake herdr whose `agent_status` is set by the test; `tests/fake-herdr.ts:218-235` supports `--kind` and `agent_session` kinds `id` and `path`. No test covers a non-claude peer that is idle while a subagent runs, because the fake has no notion of subagents.

Where the status comes from:
- F1.5 For `agy` (antigravity), herdr's status is screen scraping. `src/detect/manifests/antigravity.toml` in the herdr source has three rules: `permission_prompt` -> blocked (`:9`), `spinner_working` (`:20-24`, braille spinner followed by an "-ing" word) and `background_tasks_working` (`:28-32`, regex `(?i)·\s*[1-9][0-9]*\s+task` in the bottom 5 lines). Nothing else maps to working.
- F1.6 The only hook herdr installs for antigravity is `PreInvocation -> session` (`src/integration/mod.rs:223`), installed at `~/.gemini/config/hooks.json:5` as `herdr-agent-state.sh session`. The hook asset says lifecycle state comes from screen detection; it only reports the conversation id. `herdr agent list` (run 2026-10-15) shows pane wA:pTE, agent `agy`, agent_session `{source: herdr:antigravity_cli, kind: id, value: c8fd8be1-1f55-4e3d-876d-7ce1a40ff9b2}`.
- F1.7 Door transcript pane captures of wA:pTE (tool results of `herdr pane read wA:pTE`): at 09:40:26Z the screen showed `⣾  Loading...` plus `● Agent(research: Checkers and Upda` and `↓ 2 more`; at 09:41:39Z it showed only `● Agent(research: …` with the footer `? for shortcuts` and no spinner. The second screen matches neither working rule in F1.5, so herdr reports `idle` while three subagents run. The pane line `● Agent(research…` carries the information, but no rule reads it.
- F1.8 Antigravity's parent transcript confirms the gap. `~/.gemini/antigravity-cli/brain/c8fd8be1-…/.system_generated/logs/transcript.jsonl` row 64 (09:33:49Z) is a `PLANNER_RESPONSE` with tool call `invoke_subagent`; row 72 (09:34:51Z) is a text only `PLANNER_RESPONSE` ("I have launched three research subagents…"); the next row is a `SYSTEM_MESSAGE` at 09:40:14Z carrying the first subagent result. Nothing is appended to the parent transcript during the 5 minute wait. The peer-wait `failure` outcomes in the door transcript land at 09:37:29Z, 09:40:22Z, 09:41:28Z and 09:41:39Z, inside and right after that window.
- F1.9 The report says peer-wait failed "twice". The door transcript shows more: four failures in the first exchange (above), then `budget` at 09:44:44Z and 09:53:44Z and `done` at 09:53:47Z; in the second map exchange failures at 12:15:31Z, 12:15:47Z and a burst at 12:15:52Z (a 60 s retry loop), later `done`; one more failure at 12:23:04Z before `done`. The second subagent launch (`invoke_subagent`, transcript row 210, 12:09:31Z) precedes the second failure cluster the same way.

Reporter's cause: holds. `turnOpen` cannot say "open" for a non-claude kind, and herdr's antigravity status says idle while subagents run. Two corrections:
- C1.1 The failure count is understated (F1.9). The pattern repeats every time the peer delegates.
- C1.2 A Claude style transcript check is not available for antigravity. Its transcript has `status` values only `DONE` and `ERROR` (339 rows, counted 2026-10-15) and no turn-closed row. A text only planner response (row 72) looks like a final answer but was not one. Subagent records `brain/<id>/.system_generated/subagents/<id>.json` carry `state: SUBAGENT_STATE_ALIVE` for all five subagents hours after they finished (their own transcripts end with "…sent to the parent agent." at 09:43:19Z and 12:17:27Z), so that field is not a liveness signal (low confidence that it is never updated; I saw no other value). Subagent results arrive as `messages/<id>.json` with `read.json` marking delivery. None of this is documented; it is a protobuf backed CLI (conversation DB tables are protobuf blobs) and may change without notice.
- C1.3 The agy binary names hook events `PreInvocation`, `PostInvocation`, `PreToolUse`, `PostToolUse`, `SessionStart` (`strings` on the installed binary, 2026-10-15). If `PostInvocation` fires once per user turn, a hook could give an affirmative end-of-turn signal. Semantics unverified (low confidence); it is an external proof call (section 5).

Lock check: the peer-wait chart (`issues/chart/peer-wait/CHART.md`, forks/wait-mechanism.md) picked a bounded `herdr agent wait` and foreclosed file polling as the readiness signal; the door-turn lock (`issues/chart/door-turn-and-stale-tab/forks/peer-turn.md`) keeps A in its turn with 10 s checks and sets exit precedence. The learning `learnings/history/2026-10-15-peer-wait-antigravity-idle.md:10` already states the rule: pane status is a turn signal only for harnesses whose status covers subagent work. Nothing below contradicts those locks; it narrows what `failure` may mean.

### #92 check logs kept under issues/ grow the repo

What the code does:
- F2.1 `src/run-check.ts:165` writes every check to `<runRoot>/out.log`; `:208-209` copies it to `<leaf>/implementation/check-<name>-<ms>-<pid>.log` unconditionally (green or red), `:210-216` appends a `check_end` timing with `log: kept`, and `:221` removes the run root. `leafTarget` (`:99-128`) maps a worker worktree `-u<N>` to the owner's implementation folder and falls back to slug `checkout` with `--holder`.
- F2.2 `src/verify.ts:154-171` runs setup and every verify command through the same `checkedRun`, so verify logs land in the leaf folder too (`check-verify`, `check-setup`, `check-cheap`).
- F2.3 Readers of log content in src: `src/flaky.ts:13` parses `(fail)` names out of a log path it is handed; `src/log.ts:28` reads `log.jsonl` only. Nothing in src reads the kept copies back by name.
- F2.4 Leaf worktrees are sparse and exclude `/issues/` (`src/next.ts:279-307`, `git sparse-checkout set --no-cone /* !/issues/`). Verify and batch worktrees use the same helper. So worktrees do not carry the logs; the main checkout, every clone and the pack do.

Measurements in framework (commands run 2026-10-15, `git ls-files 'issues/**/*.log'` plus `du`):
- 944.9 MB raw in 4462 tracked `issues/**/*.log` files.
- run-check copies (`check-<name>-<ms>-<pid>.log`): 424 MB in 902 files (check-cheap 204, check-verify 176, check-test_changed 175, check-selftest 153, check-setup 84). First one dated 2026-10-03.
- Other logs: 521 MB in 3560 files (selftest.log 129, contracts.log 129, parity.log 128, test.log 120, test_changed.log 120, verify.log 71, merge-evidence/*.log, …).
- 233 logs are exact duplicates by content. Largest single log 3.2 MB (check-verify).
- `.git` 459 MB, pack 173.57 MiB in 4 packs; `issues/` 1.1 GB on disk; `node_modules` 972 MB; rest 152 MB. `.gitattributes` is `* text=auto eol=lf`, no LFS.
- 317 commits titled "add issues", all by the operator (`git log --format='%an|%s'`), none produced by akrogon source (`src/sync.ts:165` commits "sync issues"; no source writes "add issues"). (low confidence on which tool makes them.)

Reporter's cause: holds for the writer (F2.1). Corrections:
- C2.1 run-check is under half of the bytes. The un-prefixed logs (521 MB) are named only in closed-leaf review and report prose in framework, not in any current akrogon skill or src (`grep -n '\.log' skills/*/SKILL.md skills/implement-issue/worker-protocol.md` finds only an unrelated `bun -e` line at `skills/merge-issue/SKILL.md:62`). Seats write them by hand following older instructions or framework-side scripts. A fix that only changes run-check leaves most of the growth in place. Who tells seats to write them is fog (section 6).
- C2.2 Git already compresses: 990 MB of raw logs pack to 174 MiB. The report's zstd figure (19 MB) measures something else, probably one leaf or deduplicated content (low confidence). The real costs are the working tree of every clone, fetch size, and `git status` time, not disk in `.git` alone.
- C2.3 Lock conflict to name: `issues/chart/test-runs/CHART.md` locks "keep logs" and seats copying logs into the leaf folder; `issues/chart/temp-release` keeps the release fork paused. Any option that moves logs out of the tree reopens the test-runs lock on purpose.

### #93 worktrees of merged leaves and finished verify runs stay

What the code does:
- F3.1 `src/reconcile.ts:43-62` `worktreeRemovable`: porcelain dirty -> 'uncommitted changes'; rebase or merge markers; then `git -C <path> rev-list --count HEAD --not --branches --remotes` and count > 0 -> `${count} unreachable commits`. The guard landed in 8f10db1 (2026-10-11). `tests/reconcile.test.ts:136-152` pins it.
- F3.2 Candidate sweep `:330-394`: a known closed slug or an unregistered name is reported as 'unknown directory' and never removed (`:346-353`); `verify-*` is kept only while its record has no `end` and the owner pid/boot is alive (`:372-380`); `batch-*` (`:381-384`); `<slug>-u<N>` kept as 'active leaf worker' while the owner is not merged or failed (`:385-390`); everything else goes through `removeWorktree` (`:198-211`) which honours the F3.1 guard. Kept reasons are written to `~/.akrogon/reconcile/<repo>.json` (`:22-24`, `:447`); that file does not exist on this host today.
- F3.3 Reconcile runs in every `akrogon next` pass per repo (`src/next.ts:1327`) and on a tab-close event (`:1441`).
- F3.4 `src/verify.ts:126` names the worktree `verify-<uuid>`, `:145-147` appends the record (`verifyRunSchema` `:16-30`, `end` optional) under the lock, `:152` creates a detached sparse worktree at `sha`, and only a `finally` (`:173-190`) writes `end` and runs `git worktree remove --force`. A SIGKILL skips the `finally`.
- F3.5 Framework `issues/verify-runs.jsonl` has 85 records, 8 without `end`, all for leaf browser-socket-runtime at sha 8700f6df7 between 09:12Z and 09:53Z on 2026-10-15, with `setup` empty and `commands: []`. Six of them match the leftover `verify-*` directories named in the report (0214a286, 14648778, 4636dd20, 66154a56, cec535a2, f741e1b4).
- F3.6 The implementer's transcript shows why: `akrogon verify` exited 137 (SIGKILL) about 11 s into `framework:verify:cheap`, repeatedly, including detached runs (pi lines 340-380); then `akrogon run-check` callers died the same way (lines 386-395); then the suite died when run bare (line 413, 431); the main checkout ran the same file fine (line 407); the kill followed the leaf's own `browser-owner.test.ts` (lines 418-437), with the bisect pointing at the test "SIGKILL of the direct browser owner" (line 440, bisect still running). No OOM: `MemoryMax=infinity`, oomd logged no kills (lines 384, 423). So the parent process of each verify run was killed from inside the suite under test, not by akrogon.
- F3.7 Why the guard then keeps them: a verify worktree is detached at the leaf tip `sha`. The leaf merged at 10:41:49Z (`issues/log.jsonl`), the batch path rebased its commits (`src/batch.ts:120,135`, `git rebase --onto` in a `batch-<attempt>` worktree) and `removeMergedWorktree` deleted the leaf branch with `git branch -d` (`reconcile.ts:213-222`). The pre-rebase commits are now reachable only from those detached HEADs, so `rev-list --count HEAD --not --branches --remotes` is positive and `worktreeRemovable` returns 'N unreachable commits'. The same arithmetic keeps `<slug>-u1`, `-u2` worker worktrees that sit at or after the old leaf tip.
- F3.8 Worker worktrees: `skills/implement-issue/worker-protocol.md:11` creates `<store>/<slug>-u<N>` with `git worktree add --detach` and says A removes them after cherry-pick; `:31` keeps a worktree whose pick conflicted so the commit stays reachable. No rule covers them once the owner merges, so `:385-390` releases them to `removeWorktree` and the guard keeps them.
- F3.9 `prose-asserts-u1-cmdlogs` is an unregistered name, so it is report-only (`:346-353`). It looks like a pi `.pi-command-logs` style folder created beside a worker (low confidence).
- F3.10 `git worktree remove` refuses only a dirty worktree without `--force` and never checks commit reachability (https://git-scm.com/docs/git-worktree, read 2026-10-15). Removing the worktree does not delete commits; they stay until gc after reflog expiry. The store `~/.akrogon/worktrees/framework` is empty now because the operator removed the directories by hand; `git worktree list` in framework shows only main plus scratchpad worktrees that are not akrogon's.

Reporter's cause: holds for why reconcile keeps them (F3.7), and the unreachable guard protects nothing in a `verify-*` worktree because verify never commits (F3.4, no commit command in verify.ts). The primary cause of the verify leftovers is the SIGKILL that skipped the `finally` (F3.6); without it the worktrees would have been removed before the merge. The worker leftovers are a gap in the protocol, not a bug in the guard.

## 2. Proposed split

Three charts, no shared observable outcome:
- S1 `peer-wait-harness-turn` for #91. Outcome: a working non-Claude peer is never reported as `failure` by idle alone. Surface: peer-wait.ts, peer-ask.ts, fake-herdr, questions.md:46, SKILL.md:41,53.
- S2 `check-evidence-size` for #92. Outcome: a leaf's check evidence stops growing the tracked tree. Surface: run-check.ts, verify.ts (caller only), the test-runs lock, seat skill prose.
- S3 `worktree-leftovers` for #93. Outcome: reconcile removes verify and worker worktrees of merged or failed leaves. Surface: reconcile.ts, verify.ts record, worker-protocol.md, reconcile tests.

Dependencies:
- S2 and S3 both touch verify.ts, but on different lines (checkedRun call sites vs record and `finally`). They can run as independent leaves if S2 keeps the `verifyRunSchema` record shape. If S2 changes where `log` paths point, S3's test fixtures for verify records (`tests/reconcile.test.ts:384-420`) need the same path shape; order S3 first or keep the schema.
- S1 is independent of both.
- #93's SIGKILL origin is a framework suite problem (F3.6); it is out of S3's scope and should be reported to framework, not fixed in akrogon.

## 3. Material forks per chart

### S1 peer-wait-harness-turn

Q1.1 "When herdr says idle for a peer whose harness cannot tell us whether its turn is open, what do we report?"
- O1 Report `budget` (not `failure`) with the observed status, so A reruns the wait under the door-turn lock. `failure` only when an affirmative end-of-turn signal exists (Claude transcript today). Pick. Reason: it removes the false negative with no new parser. Cost: a peer that truly died with no file burns the whole budget before A learns it. Later: a dead pane stays undetected for the budget length; needs `done` or a pane exit to shortcut (see Q1.2).
- O2 Add an antigravity transcript or subagent-record check like `claudeTurnOpen`. Rejected: the parent transcript is silent during subagent waits and has no closed marker (C1.2); subagent `state` never leaves ALIVE. A parser here would be guessing and would break on the next antigravity release.
- O3 Raise `IDLE_GRACE_MS` for non-claude kinds. Rejected: the first gap was over 5 minutes (F1.8); no fixed grace covers delegation.
- O4 Extend herdr's antigravity manifest so `● Agent(` or `↓ N more` lines count as working. Worth filing upstream, but the peer-wait lock keeps herdr changes off route, and it stays screen scraping that breaks on a TUI redraw. Could invite the same bug with the next harness.

Q1.2 "What does `failure` mean after this?"
- O1 Only: a harness-specific affirmative end signal says the turn closed and the file is missing or empty. For kinds with no such signal, `failure` is never produced; A ends on budget or `blocked`. Pick. Cost: questions.md:46 and SKILL.md:41,53 need the narrower wording.
- O2 Keep `failure` for `done` status too (process exit). Reasonable if herdr's `done` for agy means the pane process ended; today every observed false failure carried `status: idle`, none `done`. Keep `done` as failure only after a proof call shows what agy `done` means (section 5).

Q1.3 "Should the peer write a done signal instead?"
- O1 The map file itself is the signal (today): non-empty file at the path. Keep. Cost: a partially written file counts as done; the brief already says write to a temp name and rename, which closes that gap.
- O2 A separate sentinel file. Rejected: a second file to forget, and the rename rule already does the job.

Q1.4 "Where does the per-kind rule live?"
- O1 A small table in peer-wait.ts keyed by `agent.kind`: `turnSignal: 'transcript' | 'none'`. Pick. Keeps the policy in one place and tests can pass `--kind`. Cost: a new kind defaults to `none`, which is the safe side.
- O2 Infer from `agent_session.kind` (id vs path). Rejected: codex also uses `id` and behaves differently (learning file:7, low confidence on why).

### S2 check-evidence-size

Q2.1 "Where do check logs live?"
- O1 Untracked evidence store under `~/.akrogon/evidence/<repo>/<leaf>/check-<name>-<ms>-<pid>.log`, with the path already recorded in `timings.jsonl` (`run-check.ts:210-216`). Reviewers open it from the timing record. Pick. Reason: removes the class (nothing in the tree grows per run) instead of shrinking it. Cost: evidence does not travel with the clone; a second machine cannot read it; the test-runs "keep logs in leaf folder" lock must be reopened; closed-leaf folders lose the proof trail reviewers read today. Later: the store needs retention (age or per-leaf cap), and `akrogon` must handle a missing store path on another host.
- O2 Keep tracked, add dedup by content hash and drop green logs. Halves the bytes at best (233 duplicates, green logs are most of the 902) and keeps the per-run growth. Rejected as the main fix, fine as a stopgap.
- O3 Keep on disk under the leaf folder but ignore `implementation/check-*.log` in git. Cheap, keeps reviewers' paths, but the working tree still grows and the 521 MB of seat-written logs stay. Also a `.gitignore` in the consumer repo is a consumer-side change akrogon cannot ship.
- O4 Compress in place (`.log.zst`). Rejected: git already packs 5.7:1; the win is only in the working tree, and every reader needs a decompress step.

Q2.2 "What about the seat-written logs (selftest.log, merge-evidence/*)?"
- O1 Make run-check the single writer: skills say every check runs through `akrogon run-check` and seats stop copying output by hand. Pick. Cost: the instructions that produce them are not in akrogon's current skills (C2.1); the chart must find them (fog) or accept that old closed leaves keep theirs.
- O2 Size cap per leaf folder enforced by `akrogon phase`. A guard on top of a leak; rejected.

Q2.3 "Do we touch history?"
- O1 No. The 174 MiB pack is sunk cost; a `git filter-repo` rewrite is an operator decision for framework with its own blast radius (every clone, every worktree). Pick. Cost: clones stay large until the operator decides.
- O2 Rewrite. Out of akrogon's scope.

Q2.4 "Which logs stay in the tree at all?"
- O1 Only what a reader needs by name: `report.md`, `review.md`, timings, and a short tail or failure excerpt of a red log (`flaky.ts:13` already parses `(fail)` lines from a log). Pick, bounded by O1 of Q2.1. Cost: flaky.ts must be pointed at the store path or at the excerpt.
- O2 Red logs full, green logs dropped. Simpler but a red verify log is the largest file class (3.2 MB).

### S3 worktree-leftovers

Q3.1 "Does the unreachable-commit guard apply to `verify-*` worktrees?"
- O1 No. Remove a `verify-*` worktree when its HEAD equals the record `sha` and the tree is clean, regardless of reachability, because verify never commits. Pick. Reason: the guard protects work that does not exist there. Cost: a new branch in `worktreeRemovable` or a dedicated `removeVerifyWorktree` that skips the rev-list. If HEAD differs from `sha` (someone committed inside), fall back to the guard.
- O2 Keep the guard, make verify remove its own worktree at next start. Does not help when every run is killed (F3.6).
- O3 Preserve HEAD under `refs/akrogon/kept/verify-<id>` then remove. Pointless for verify; see Q3.2 for workers.

Q3.2 "What happens to `<slug>-u<N>` worker worktrees after the owner merges or fails?"
- O1 Remove them once the owner is merged or failed, even with unreachable commits. Pick. Reason: the protocol already makes A pick what it wants before merge (`worker-protocol.md:11,31`); after merge nobody reads the worker tree, and the guard only keeps a copy forever. Cost: an unpicked worker commit is gone after merge (reflog keeps it for the expiry window; low confidence on the exact window for detached worktree HEADs). Later: a seat that relies on finding old worker experiments loses them.
- O2 Save each kept HEAD as `refs/akrogon/kept/<dir>` then remove. Keeps the commits reachable, but refs accumulate and need their own cleanup; it invites a second leftover class.
- O3 Keep them and only report. Today's behaviour; the report is in a file nobody reads (`~/.akrogon/reconcile/<repo>.json` is absent here).

Q3.3 "Should verify survive a SIGKILL of its own process?"
- O1 No. Leave the `finally` as is and let reconcile own cleanup of records without `end` once the owner is dead (F3.2 already does this part). Pick. Reason: a parent can always be killed; a second supervisor is another process to lose. Cost: records without `end` stay in `verify-runs.jsonl`; reconcile or verify should stamp them with an `end` and a reason when it removes the worktree, or `greenRun` (`verify.ts:63-76`) must ignore them (fog on whether it does).
- O2 Run the suite in a child scope and the verify parent outside the kill reach. The kill came from inside the suite (F3.6) and reached detached runs too; no akrogon-side scope arrangement is proven to escape it.

Q3.4 "What about unregistered directories like `prose-asserts-u1-cmdlogs`?"
- O1 Report-only stays, but the report must be visible: print kept reasons in `akrogon next` output or `akrogon status`, not only in the json file. Pick. Cost: noise in status until the operator removes the folder.
- O2 Remove anything not registered. Rejected: the store is also where seats put hand-made folders; deleting unknown directories deletes someone's work.

Q3.5 "Does a leaf's merge wait for its worktrees?"
- O1 No change: merge proceeds, reconcile cleans after. Pick.
- O2 Merge refuses while `verify-*` or workers for the leaf exist. Blocks merges on a cleanup problem; rejected.

## 4. Practitioner questions and pitfalls over the work's lifetime

- P1 "Peer-wait says failure but I can see slot C typing." Removed by Q1.1 O1 (budget with status) and the outcome carrying `kind` and `status` so A can see why.
- P2 "The peer crashed and A waited the whole budget." Removed by a proof of what agy `done` means (section 5) and treating a pane process exit as failure.
- P3 "A new harness kind appears; what does peer-wait do?" Removed by Q1.4 O1: unknown kinds default to no turn signal, never `failure` by idle.
- P4 "Where is the check log for leaf X?" Removed by `timings.jsonl` `check_end.log` pointing at the store path and `akrogon status` printing it.
- P5 "I cloned framework and the evidence is missing." Invited by Q2.1 O1; removed only by documenting that evidence is host-local, and by keeping a failure excerpt in the tree (Q2.4).
- P6 "Why is my clone still 1 GB after the fix?" History is sunk cost (Q2.3); say so in the chart so nobody expects the fix to shrink `.git`.
- P7 "The evidence store fills the disk." Removed by retention keyed to leaf state: drop after the owner is merged plus N days, or cap per leaf.
- P8 "Reconcile kept a worktree; why?" Removed by Q3.4 O1 printing the reason. Today the reason file does not exist on this host even though leftovers did, so either reconcile did not run after the merge or the report is not written on that path (fog).
- P9 "I removed `~/.akrogon/worktrees/<repo>/verify-*` by hand." Git then needs `git worktree prune` to drop the registration; reconcile should run prune after a removal so hand cleanup does not leave stale entries.
- P10 "verify-runs.jsonl has records without `end` forever." Removed by stamping `end` plus a reason when reconcile removes the worktree (Q3.3).
- P11 "A worker's unpicked commit was lost at merge." Invited by Q3.2 O1; removed only by the protocol step that A picks or discards worker commits before `merge`, which already exists in prose.
- P12 "The suite under test kills the verify process." Not an akrogon defect; the fix belongs in framework (`browser-owner.test.ts`, F3.6). Say so in S3's chart so the leaf does not chase it.
- P13 "Tests for the non-claude path." Fake herdr needs a status sequence (working, idle, working) per pane so the test can show `budget` instead of `failure`; today `agent_status` is a single value in `db.json`.

## 5. External operations needing a real proof call before handoff

- E1 `herdr agent wait --timeout <ms>` and `--until working` against a live agy pane: exact JSON on idle, done and timeout, and exit codes. Needed by S1 for the `budget` path.
- E2 `herdr agent list` for an agy pane whose process has exited: does status become `done`, `unknown` or stay `idle`. Decides Q1.2 O2.
- E3 Antigravity hook events: does `PostInvocation` fire once per user turn (end of turn) or per model call. Proof: install a hook in `~/.gemini/config/hooks.json` that appends a timestamp, run one prompt with a subagent, read the file. Only if S1 chooses an affirmative signal later. Documentation URL not located; the binary names the events (C1.3).
- E4 `git -C <verify-worktree> rev-list --count HEAD --not --branches --remotes` after `git branch -d <leaf>` and a batch rebase: reproduce count > 0 in a temp repo to pin F3.7 in a test.
- E5 `git worktree remove --force <path>` on a detached worktree with unreachable commits, then `git worktree prune`: confirm success and that `git worktree list` is clean.
- E6 `git update-ref refs/akrogon/kept/<name> <sha>` only if Q3.2 O2 is chosen.
- E7 Atomic store writes for the evidence path (`copyFileSync` to `~/.akrogon/evidence/...` across filesystems; rename is not atomic across devices).
- E8 `bun run framework:verify:cheap` under `akrogon run-check` on a clean host, to show the framework suite kill is reproducible outside the leaf (for the framework report, not for S3).

## 6. Fog

- G1 Who instructs seats to write the 521 MB of un-prefixed logs (selftest.log, contracts.log, parity.log, merge-evidence/*). Not in akrogon's current skills or src; may be framework-side skills or old prose in closed leaves. S2 cannot promise the outcome without this answer.
- G2 What makes the 317 "add issues" commits in framework (operator shell, a framework script, or an older akrogon). It decides whether logs are committed at all after S2.
- G3 Whether reconcile ran for framework after the 10:41Z merge. The kept-reason file is absent, and the operator removed the worktrees by hand, so I cannot show what reconcile reported for them.
- G4 The exact kill inside the framework suite (the implementer's bisect was at the test "SIGKILL of the direct browser owner" when I stopped reading). Out of S3's scope but it decides whether verify leftovers recur.
- G5 Whether `greenRun` (`verify.ts:63-76`) reuses or ignores records without `end`.
- G6 Why codex in slot B did not hit the same false failure in the same exchange: herdr's codex status may cover subagents or codex may not delegate. Decides whether Q1.4's table needs a codex row.
- G7 What herdr reports as `done` for an agy pane and when.
- G8 Origin of `prose-asserts-u1-cmdlogs`.
- G9 What the report's 19 MB zstd figure measured.
- G10 The reflog expiry window that protects commits of a removed detached worktree (default gc settings vs framework's config); decides how much Q3.2 O1 really loses.
