# Merged notes: remaining automatic `failed` exits

Sources: fork-failed-exits-B.md, fork-failed-exits-C.md, A's own notes. Ledger (failed-exits.tsv, 43 transitions since 2026-10-08): base-red stops 21-23 (B 21, C 23; C counts rows 11-12 merge-check base-red here), round cap 5, seat/delivery 5, human boundaries 10-12 (B counts row 31 as technical). (A,B,C)

## Q1 Pre-merge red because main is red
- Pick (a): pre-merge base red never ends in `failed`; merge is the one place a red stops anything, and S1 makes that a wait (A,B,C).
- Shape C: honor the operator's waiting-leaf lock now in skill text only. One without-change run as today; record failing unit names from both logs in the leaf folder; continue when every name failing with the change also fails on base; a name failing only with the change is a Fix; crash/setup/build failure on either side still blocks. Delete the `failed --reason "<command> red on base"` sentence in `skills/check-issue/SKILL.md:65` and `skills/implement-issue/SKILL.md:38`. known-red-leaf shrinks (its stop-removal clause) and leaves the critical path; it keeps schema, `--compare`, red record, notice. known-red-merge unchanged. (C)
- Shape B: no pre-merge base rerun; record the unrelated red honestly as unverified and proceed; one fresh comparison at merge; fold known-red-leaf's schema, validation, red record and notices into known-red-merge, retire known-red-leaf. Needs an operator answer and contract amendments. (B; A leaned here before reading the lock)
- Lock check: `issues/chart/red-base-wait/forks/waiting-leaf.md:43-47` (operator, 2026-10-10) says a red with no cause "gets one without-change run", attribution "per failing test", unresolved attribution "unverified", and incomplete verification "still blocks". Shape C fits the lock as written; shape B changes it. (A)
- Rejected: (b) wait for main, foreclosed by the lock ("typed wait state" foreclosed) and rebuilds per-leaf holds (B,C). (c) keep failing until the chain lands, 4 merges deep (A,B,C). Command-level continue without a per-name match (C rejects, violates lock F2).
- Evidence: Chromium CQ reruns without the patch and fails only on tests that passed without it, https://chromium.googlesource.com/chromium/src/+/master/docs/infra/cq.md (B,C); matklad "Catch Flakes On Main" 2026-05-14 (C); Google post-submit culprit finding, https://research.google/pubs/what-breaks-google/ (A).
- Pitfalls: a hidden own failure in a red suite (removed by per-name match in C, by the merge comparison in B; S1 never merges red either way) (B,C). Nobody fixes main (status S1 wait line and leaf record until red record lands) (C). Removing a producer strands its consumer (B: transfer before retiring).
- Open: should pre-merge reruns go entirely (B yes; C keeps them under the lock).

## Q2 Seat unreachable / prompt undelivered
- Pick: delete the automatic failed moves (`src/next.ts:560-566`, `:572-580`); keep the error, attempt count and delivery evidence in status; retry next pass (B,C).
- Make `agent_name_taken` impossible: name is `akrogon-<sha256(pane_id)>` (`src/next.ts:605-607`), fixed per pane; use a fresh name per launch (B,C).
- On `agent_not_running`, reread the owned pane and session; relaunch only when the agent truly exited; reconcile late delivery instead of resending (`src/next.ts:597-603,662-664`) (B).
- Evidence: all five rows recovered by a bare retry within minutes and merged (C); herdr refuses duplicate live names, docs `agent-automation.mdx:32,38,42,74-78`, `herdr/src/app/agents.rs:161-184` (B).
- Pitfalls: duplicate prompts (keep delivery reconciliation) (B); herdr down all night (status shows it, no failure) (C).
- Open (B): what triggers the next pass when a launch produced no agent and no event? `docs/guide/next.md:53,147` is event-driven; seed 84 records no live watch. C and earlier B,C: keep the watch alive (`skills/watch-issues/SKILL.md` stop rule deletes the cron when nothing open).

## Q3 Rows outside Q1, Q2 and the locks
- Ten rows are true human boundaries and stay `failed` (credentials, trust dialog, brief/grant changes, model decision, locked decision) (B,C).
- Row 31 (site-media-publisher) was a technical runner defect read as operator action; narrow `skills/implement-issue/SKILL.md:36` so authorized repairs of an existing proof runner proceed (B). C counts it human.
- Row 41 class (locked third-party setting never proven in its form, #81) recurs until the chart door requires one proof for such a lock; one sentence (A,B,C via merged map L7; C P9).
- With S1, S2, Q1, Q2, `failed` means "a human is needed"; its one notice is then correct in meaning (C).

## Where slots differ
- D1 Q1 shape: C (lock as written, skill text, pre-merge rerun) vs B (no pre-merge rerun, one merge comparison, retire known-red-leaf).
- D2 Q2 trigger: B asks for a proven next-pass trigger; C relies on keeping the watch alive.
- D3 row 31: B technical, C human.
