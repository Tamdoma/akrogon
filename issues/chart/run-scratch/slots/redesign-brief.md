# Brief: run roots in RAM, redesign (consultants B and C, independent, no edits)

Issue Tamdoma/akrogon#148. Chart /home/ivan/Work/infra/akrogon/issues/chart/run-scratch: CHART.md, forks/design.md (D1-D4, the "Split" section), slots/review-D-1.md (D's five findings).
Landed: c4cf74a7 (every run root removed at run end, AKROGON_EVIDENCE, `run_root` config key accepted and not read).
Parked: branch run-scratch-ram 6396e3a6 (flat `<run_root>/run-XXXXXX`), refused by D:
- F1 the leaf temp is protected only by an `.owner` under it; a flat root moves `.owner` away, so reconcile removes a live check's evidence.
- F2/F4 resolve run_root with realpath at parse time; refuse a symlink or a path resolving inside the retired or leaf temp root.
- F3 the flat sweep must treat an entry that vanished between listing and stat as gone.
- F5 a moved or removed run_root strands its roots.
Why it matters: under load the nested suite took 109 s on disk-backed /var/tmp vs 42 s; this is the remaining cause of load timeouts the rerun cannot save. Host: /tmp is tmpfs 61.7G, RAM 123G.
Code today: src/run-check.ts (runRoot = mkdtemp under leafTempDir, :324; removal :471), src/config.ts (run_root schema, ensureLeafTemp), src/reconcile.ts (leaf temp sweep ~:1150-1200).

Question: what is the simplest design that gets run scratch into RAM and removes F1-F5 as a class rather than patching each? Consider at least:
- O1 fix the parked flat design (liveness record left under leaf temp, realpath, vanish-tolerant sweep, recorded last root).
- O2 mirror the leaf-temp layout under run_root (`<run_root>/<repo hash>/<leaf hash>/run-*`) with its own `.owner`, reconcile sweeping both roots with one function.
- O3 move the whole leaf temp root to tmpfs via one setting (seat TMPDIR and worktree copies too?) — what moves to RAM, memory risk.
- O4 keep run roots where they are and only set TMPDIR for the test process to a tmpfs subdir owned by the run (cleaned at run end), leaving .owner, evidence and layout untouched.
- anything simpler.
For your pick: what F1-F5 become, what could break (memory pressure / ENOSPC on tmpfs, reboot, crash leftovers, tests asserting paths), rollback, and the measurement that proves it (D4 memory.peak exists?).
Short. Write slots/redesign-<your slot>.md in /home/ivan/Work/infra/akrogon/issues/chart/run-scratch/slots/, then hc send t126 "done <slot>: <path>".
