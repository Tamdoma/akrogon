# Ceiling values

## Question
Q1. What CPU, memory and task ceiling does the akrogon slice carry, set after a bounded measurement of one full framework run?

### Carries
- limit-boundary Taken: no TasksMax, low CPU priority, ceiling kind and value decided here. Measurement 2: one run 239 s, 15.9 GB, 409 Chrome, load 40 on 32 threads, CPUWeight=20 and MemoryHigh=48G, 0 throttled.
- Fog moved in: akrogon.slice as installed unit file or transient (seat-scope C).
- Permit-release Taken: leftovers of a killed run can overlap the next run.
- Depends on limit-boundary.
- B rebuttal R3: measure under a conservative boundary, never an unrestricted run.

## Findings
Round 2026-10-13, notes slots/ceiling-values-{A,B,C}.md, merge slots/ceiling-values-merged.md, rebuttals slots/ceiling-values-rebuttal-{B,C}.md.
- Host: 32 threads, 123 GB RAM, 246 GB swap. akrogon.slice sits beside session.slice and app.slice (weight 100) and background.slice (30) under user@1000 (C, systemd-cgls --user).
- Limits only on the shared akrogon.slice (A,B,C). CPUWeight=20 (A,B,C). No TasksMax (A,B,C). No IO, affinity or ManagedOOM.
- CPUQuota=1600% (B,C, C switched): weight is a priority, not a bound, and direct worker scripts and killed-run leftovers have no absolute ceiling otherwise. Gated on a rerun of measurement 2 with the quota: if wall time or browser timeouts worsen materially, it comes out. A had none.
- Memory: MemorySwapMax=0 plus a hard MemoryMax as in-slice last line of defense (B,C, A accepts). Values: B High 48G / Max 64G; C High 64G / Max 96G since the slice holds every seat plus charged page cache. A sides with C.
- Location: installed unit file symlinked by `akrogon install` plus daemon-reload (A,C). B: transient, created in the allocate ensure step.

## Taken
1a, operator 2026-10-13. Reason: half the PC stays free no matter what akrogon runs.
- akrogon.slice: CPUWeight=20, CPUQuota=1600%, MemoryHigh=64G, MemoryMax=96G, MemorySwapMax=0. No TasksMax, IO, affinity or ManagedOOM.
- Delivered as a unit file in the akrogon repo, symlinked to ~/.config/systemd/user/akrogon.slice by `akrogon install`, which runs `systemctl --user daemon-reload` (A,C). B's transient-slice dissent carried to leaf design.
- Proof done 2026-10-13 (proofs.md T4): framework:verify:core under exactly these properties ran 265 s and 256 s. Run 1 hit only the known playback-probe flake. Operator kept the quota (1a). If a later run takes over 300 s or fails on a non-flake, the quota comes out and this fork reopens.
- Foreclosed: priority only (1b), per-leaf limits, TasksMax.
