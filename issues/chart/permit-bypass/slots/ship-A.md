# Ship plan, slot A (before reading B, C)
## Risk of removing the permit alone
Sweep: slice ~23 GB base, 2 runs peak 45 GB, 4 runs 58.6 GB by 741 s (sweep-results.md): ~9-11 GB per sequential test_changed. Today ~9 runs queue at once (watch report 2). Release them together: 23 + 9x10 = ~113 GB > MemoryMax 96G -> kills inside the slice. So "permit out" must ship with the memory start check in the same leaf, or max_active must drop first.
## Forks
- worker-duty: workers run only their unit's targeted tests named in the sub-brief; A runs the changed-tests command after each pick and at the end. Cuts runs per leaf 3-4x.
- dispatch-wip: set max_active 8 in operator config now (reversible); dispatch reading slice pressure is off route until measured.
- long-run-path: `akrogon run-check --detach` (or a background form) that returns at once with a run id and log path, writes an exit record, and `akrogon run-check --wait <id>` polls within the harness limit. Skills print that form.
- evidence: output outside the printed checks command is not proof. Close.
- ceiling-trigger: close; the start check and the slice counters replace it.
## Leaves (akrogon)
1. start-gate: replace withPermit (src/permit.ts; callers run-check.ts:173-181, base-run.ts:165) with a memory start check: under a short flock, start if slice memory.current + reserve for runs started in the last N s < threshold (e.g. 48 GB), else poll every 5 s; no FIFO needed because waits are rare; status shows waiting runs. cheap-sized checks never wait in practice. Proof: two runs start at once under low memory; a forced low threshold delays a start; memory.current path read for akrogon.slice.
2. run-unit: each run-check/base-run run in its own transient scope under the leaf slice; stop on every exit path; `akrogon stop-run`; stale sweep. Detached mode (long-run-path) lands here too since it needs the run id. Proof: two leaves' runs, stop one, other survives; killed wrapper leaves no Chrome.
3. skill text: worker duty, detached run form, stop-run in place of the stopgap rule. Depends on 2.
Order: 1 first (ends the waiting), 2 and 3 after. max_active 8 now.
