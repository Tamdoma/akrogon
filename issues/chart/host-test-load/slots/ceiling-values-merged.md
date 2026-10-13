# Merged notes: ceiling-values (A, B, C)

## Agreed
- Limits sit only on the shared akrogon.slice, never copied per leaf (A,B,C).
- CPUWeight=20. Measurement 2 passed at normal speed with it (A,B,C). On this host akrogon.slice sits beside session.slice and app.slice at 100 and background.slice at 30 (C, systemd-cgls --user).
- No TasksMax. Slices read pids.max=max natively (C). B also wants TasksMax=infinity stated explicitly on akrogon scopes, ancestors verified.
- MemoryHigh as the main memory control, generous above one run's 15.9 GB (A,B,C).
- No IO, CPU affinity, ManagedOOM (systemd-oomd inactive) or adaptive controller (B,C).
- MemorySwapMax=0, because the host has 246 GB swap and a runaway would grind it before any memory limit acts (B,C). A accepts.
- A hard MemoryMax as last line of defense, in-slice OOM instead of a global one (B,C). A accepts, withdrawing "no MemoryMax".

## Disagreements
1. CPUQuota. B: 1600% as an absolute aggregate ceiling, since weight does not cap direct worker scripts or leftovers. A,C: none. A quota slows runs on an idle host (measurement 1 throttled 30 s at 1600%), and weight already protects the desktop under contention.
2. Memory values. A: High 48G. B: High 48G, Max 64G. C: High 64G, Max 96G, because the slice holds every seat plus page cache charged to it, not one run.
3. Location. A,C: installed unit file symlinked by `akrogon install` (src/install.ts:9-62) plus daemon-reload. Static, visible with systemctl cat, no create code. B: transient, created with full properties in the allocate ensure step. No installer change, no stale file, fails closed on mismatch.

## New questions
- QR1 Real memory of many idle seats plus one suite (C).
- QR2 Should status surface memory.events or throttling (C)?
