# Slot B blind notes: stuck-repair

Inspected 2026-10-19. Akrogon HEAD: `e522c1865538294dc1f65a90c7bcb5309a667513`. Framework was on `main` at `78dfe8cc10d90ca0390e9c95b615b48724d798af`. This return proposes a repair only. No source was closed and no folder was moved.

## 1. Pick, reason and cost

D3: Move the six merged issue subtrees into the existing closed satellite-plan-fit once. Preserve their owner name and relative paths. Reconcile EPIC.md into one index of all eight issues, remove the empty open twin, then use the existing pack command to add the incoming logs to the closed archive.

This is the explicitly allowed historical repair, not reusable append behavior. It avoids rewriting evidence ledgers and requires no permanent repair command. The operator's no-reuse dispatch rule still governs future work.

Cost: a supervised main-checkout operation with a brief interval of partially moved children, an explicit index reconciliation, and verification of source closure and evidence preservation. Proposed order:

- A1: Recheck the six merged states, source ownership, destination occupancy and file hashes. Record the child list, original index contents and evidence hashes in the chart's repair record. Keep unrelated working-tree changes untouched.
- A2: Close the two remaining sources through the existing commands, `akrogon close Tamdoma/tamdoma-framework#282 --by pool-parity` and the same command for `#285`, then read back CLOSED. Both name the actual delivering leaf. If closure fails, stop before moving children.
- A3: Move each complete child issue directory into the closed owner, refusing any occupied child destination. Retain the open index until all six children are accounted for. A partial run resumes from the recorded child list and byte comparisons, never by overwriting an existing directory.
- A4: Write the closed EPIC.md with all eight issue links and their descriptions. Remove the open index only after verifying that it is the sole remaining open-owner entry, then remove that directory. Do not rewrite timings, verify records or lifecycle logs.
- A5: Run `akrogon pack issues/closed/satellite-plan-fit` only after the open twin is absent. Verify the resulting archive against the original 89 members and 708 incoming log files before treating packing as complete.
- A6: Verify eight merged leaf states under closed, no open twin, all six second-wave source identities CLOSED, all affected recorded log paths readable with matching bytes, and no leftover `.closing` or plain logs. Run status and let ordinary reconciliation handle pool-parity's surviving worktree under its existing safety checks. Record the final scoped diff and repair result on main.

## 2. Rejected options

O7: Rename the open owner and rewrite its recorded log paths. This enforces distinct historical owner names, but changes identity after delivery and modifies shared append-only evidence files that currently have unrelated edits. It requires finding every consumer of owner paths, not merely replacing the name in EPIC.md. That migration is avoidable for this one permitted exception.

O8: Temporarily reopen the closed owner and merge the old children into open, then invoke completion. This moves already closed material twice and requires reconciling its existing archive before normal completion. Directly repairing the closed destination moves each new child once.

O9: Add generic owner-append support or weaken the new dispatch refusal. Both contradict the locked no-reuse contract. The one-time data repair does not need to become product behavior.

## 3. Evidence with tier, source and date

F10: Primary live filesystem, 2026-10-19. Open satellite-plan-fit has six merged leaves: dilutor-fit, hub-child-links, neutral-identities, persona-text-bounds, pool-parity and replay-cases. Closed has brand-override and page-draw-preview. The only shared relative file path is EPIC.md. The two indexes differ and contain complementary issue lists. No symlinks were found in the incoming tree.

F11: Primary archive and record inspection, same date. Reading `closed/satellite-plan-fit/evidence.tar.zst` in memory found 89 members, all under the two first-wave issue names. The incoming tree has 708 plain logs with zero archive-member collisions. Its six leaf slugs have 49 records in `issues/verify-runs.jsonl` with 49 owner-path references, and 1,617 timing records with 708 such references. The 61 matching lifecycle-log records contain no `issues/open/satellite-plan-fit/` references. These counts are a snapshot, not permission to overwrite changed files.

F12: Primary GitHub reads, same date, `gh` 2.102.0. `gh issue view --json number,state,url` confirmed [#282](https://github.com/Tamdoma/tamdoma-framework/issues/282) and [#285](https://github.com/Tamdoma/tamdoma-framework/issues/285) OPEN. [#281](https://github.com/Tamdoma/tamdoma-framework/issues/281), [#284](https://github.com/Tamdoma/tamdoma-framework/issues/284), [#292](https://github.com/Tamdoma/tamdoma-framework/issues/292) and [#294](https://github.com/Tamdoma/tamdoma-framework/issues/294) are CLOSED. A read-only scan of every open state found pool-parity as the only open-tree leaf claiming either remaining source, with phase merged. The carries report the earlier #103 cases already repaired, so they need no new repair here.

F13: Primary akrogon code at the HEAD above. `src/evidence.ts:46` resolves the same owner/member across open, closed and parked, and `readLog` at `:67` selects the first existing owner for archive reads. Keeping the owner name preserves recorded paths after the move, but leaving the empty open twin would still hide the closed archive. `src/pack.ts:12` unions a folder's archive and plain logs, checks bytes and refuses conflicts. `src/pack-command.ts:98` wraps packing with `.closing` and tracked-log checks. `src/pull.ts:208` provides the existing `delivered by` close command without a worktree requirement.

## 4. Pitfalls and what removes them

R8: A partial move can look like a child-name collision on retry. A1's manifest and A3's byte comparisons distinguish already moved children from an unrelated occupied destination. Stop on any mismatch.

R9: Packing while the open twin exists can select the wrong owner during archive verification. A4 must finish before A5. If packing fails, retain its `.closing` marker and retry the existing pack command after resolving the reported cause.

R10: Directory placement alone would falsely suggest completion while sources remain open. A2 closes and verifies sources first. No write behavior was exercised in this read-only notes task.

R11: Framework already has unrelated changes, including all three evidence ledgers. Use the scoped repair diff from A6. Do not reset, replace or stage those unrelated changes.

R12: Removing pool-parity's worktree by hand could interfere with a surviving pane or process. A6 delegates cleanup to the existing reconciler rather than adding a manual force-removal step.

## 5. Question missing from the fork

Q3: Must the historical repair emit a normal owner-completion announcement, or is the chart's verified repair record sufficient? This route completes the data and sources directly, so it does not naturally emit `epic complete` through `completeOwner`. Do not invent a phase transition or a broadcast requirement without settling that expectation.
