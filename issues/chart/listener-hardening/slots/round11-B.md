# Round 11 B

Verdict: changes needed.

Reviewed `a8ba0aa9d639e312be6231d40730bf11224e48b8` in scratchpad/k4. Line references below refer to that commit. Concurrent, uncommitted repairs appeared during this review. They are outside this verdict.

## Findings

- **F1: An authoritative new session can still resolve to the old transcript.** `src/transcript.ts:94,160`. Reproduced with a valid PID record naming `new`, matching `procStart`, no `new.jsonl` yet, and an existing label pointing to `old.jsonl`: `transcriptFor()` returned `old.jsonl`. “Current identity known, transcript not written” is collapsed into “process names none.” Existence does not make the label current. Door-reset can then take its input boundary and check operator input in the abandoned conversation (`skills/chart-issues/scripts/door-reset.ts:77,92`). Preserve the distinction and never use a label that contradicts the current native identity.

- **F2: Reading Claude's record during its ordinary rewrite throws.** `src/transcript.ts:87`. Reproduced with an empty record: `SyntaxError: JSON Parse error: Unexpected EOF`. This is a real writer race: the installed Claude 2.1.317 binary's `xn()` reads the PID record and uses `fs/promises.writeFile` directly to replace its contents. Its alternative backend explicitly uses `publishDiscipline:"inPlace"`. Session changes and other registry updates call `xn()`. A transient partial record therefore crashes the one-shot handover and escapes `logMove()`'s HcError-only handler (`src/log.ts:43–46`), potentially failing logging after a move committed. Handle this source boundary specifically, without broad catches or treating an old label as current.

- **F3: A missing projects root throws instead of reporting an unavailable transcript.** `src/transcript.ts:90`. Reproduced with a valid, matching PID record and an absent `<config>/projects`: ENOENT escapes. The native PID registry and the transcript are separate writes, so a fresh config/startup cannot require both to exist together. This contradicts the resolver's stated “file is not written yet” case and also reaches the consumers in F2. Treat an absent transcript directory as unavailable while retaining real access/I/O errors.

## Checks

The two targeted door-reset tests passed: stale-label replacement and failure logging before the first stage, 2 pass / 0 fail. Neither exercises F1–F3. Memory-only filesystem/hc mocks reproduced all three against the reviewed resolver, with label writes intercepted.

Read-only live probes, also intercepting labels: Claude t15 resolved its native `4a3df037-…` transcript, Codex t6c resolved its open rollout, and pi t79 returned null because it has no `--session-id` argument. The pi limitation is existing behavior. No live labels were changed and t3k was untouched. The temporary test terminal was removed. The shell launch line's argument handling and output redirection passed the targeted tests.

## Operator question: why old herdr worked, and the simpler fix

The old Claude hook is verified, not presumed. `/var/cache/pacman/pkg/herdr-0.9.1-2-x86_64.pkg.tar.zst` contains `usr/bin/herdr` with the embedded Claude integration v10 at byte offset 1661899. Counting from `# HERDR_INTEGRATION_ID=claude`, lines 50 and 57–78 accept `SessionStart`, copy the hook's `session_id` and `transcript_path`, and send `pane.report_agent_session` through herdr's socket. The settings backup `~/.claude/settings.json.bak.editor-wait-20260921-190324:152` installs that script with matcher `^(startup|resume|clear|compact|fork)$`. The old consumer accepts `agent_session` at `14c3c934^:src/shell.ts:163–166`. Removal is recorded in `issues/closed/herdr-app/herdr-removal/herdr-sweep/implementation/report.md:137`.

The diagnosis is right: old herdr received the identity directly from Claude at session changes. The migration replaced that contract with a tasks-directory guess and a persistent label. The failure comes from losing the authoritative identity update, not from needing another watcher.

- **O1: Choose this for the immediate repair.** Read Claude's existing per-PID record on demand. It creates no new files, polling, watchers or hook configuration. Compared with main it removes the tasks-FD guess. Make the native identity authoritative and fix F1–F3. Keeping an old label as a competing identity retains the fragile part.
- **O2: Do not restore settings-managed hooks here.** They previously supplied the missing contract, but akrogon is explicitly forbidden from editing Claude settings.
- **O3: Best upstream contract.** Carry the harness-owned session identity through the status communication already in use. That restores direct ownership and avoids filesystem discovery. It requires producer/core work, so it is not the smallest local incident repair.
- **O4: Turn counts cannot replace the input check.** They do not identify submitted operator input before another turn completes. Door-reset currently checks actual input records (`door-reset.ts:92–97`). Removing that evidence weakens the existing protection. Transcript content is also still needed for watch log-tail and usage accounting.

The terminal label is not needed as an authoritative lookup source. Log moves, prompt timing, observe and the chart transcript helper already call `transcriptFor()` (`src/log.ts:43`, `src/next.ts:430`, `observe.ts:75`, chart `transcript.ts:12`). The explicit remaining comparison is watch-issues' steer confirmation (`skills/watch-issues/SKILL.md:44`). Keep the label as an observation for that existing workflow during this repair. Dropping it entirely would require that confirmation to query the authoritative resolver instead. Historical transcript paths in seats.yaml and logs remain useful and are a separate concern.

## Re-check of 839eb187

Re-check: ready

F1–F3 are fixed. Memory-only probes confirmed null for an unwritten current transcript, empty/malformed record and missing projects folder, including the reset candidate lookup where applicable. An exited process no longer throws. Once the current file exists, it wins and updates the label. EACCES from either the record or projects directory still propagates. No live label writes were performed.

The three targeted door-reset tests passed, 3 pass / 0 fail. The exact amended shell launcher also passed with a missing log directory containing spaces and an apostrophe, capturing both stdout and stderr. Temporary test resources were removed. No remaining defect found within the requested re-check scope.
