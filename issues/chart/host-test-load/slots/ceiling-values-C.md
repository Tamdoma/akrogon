# Blind notes, slot C: ceiling-values

Question: which properties `akrogon.slice` carries, with values, and where they live. Host read 2026-10-13: 32 threads, 123 GB RAM, 246 GB swap (`free -g`).

## 1. Pick: installed slice unit file, four properties

```ini
[Unit]
Description=Akrogon leaves, seats and test runs
Before=slices.target

[Slice]
CPUWeight=20
MemoryHigh=64G
MemorySwapMax=0
MemoryMax=96G
```

Nothing else. No TasksMax line (foreclosed as a working limit by limit-boundary; slice cgroups here read `pids.max=max` natively, verified below), no CPUQuota, no IO, no accounting lines (user manager accounts CPU and memory by default in systemd 262; `DefaultMemoryAccounting=yes` on this host).

### CPUWeight=20

The placement is what makes the number meaningful. On this host the user manager's slices sit under `user@1000.service` as siblings: `session.slice` at weight 100 (compositor, dbus, pipewire), `app.slice` at 100 (GUI apps, browsers, the terminals and the herdr server itself, verified with `systemd-cgls --user`), and `background.slice` at 30. `akrogon.slice` joins that level, so weight 20 puts all leaf work deliberately below even background services: under full contention from every sibling it gets roughly 20/250 of the user manager's CPU, about 2.5 cores, and the desktop slices keep the rest. On an idle host it costs nothing, which measurement 2 already proved at exactly this value: the full suite passed in 239 s, normal time, host load 40. Under a genuinely busy desktop a run takes longer and browser timeouts may bite; that trade is the point of the setting, and the timing record will show it if it ever matters.

### Memory values are a disaster brake, not a working limit

Size them against the real population, not one run. The slice holds every seat of every allocated leaf plus the one running suite (peak 15.9 GB, measurement 2) plus any leftovers a killed run released over (permit-release taken). A credible full-tilt working set is tens of GB, never near 64 GB. So:

- `MemoryHigh=64G` (about half the host): throttling and aggressive reclaim begin here, allocations may still exceed it, nothing is killed (`systemd.resource-control` man page, read today: "use MemoryHigh= as the main control mechanism"). Normal operation should never engage it.
- `MemoryMax=96G`: past this the OOM killer acts inside the slice, on akrogon processes, instead of the kernel choosing globally while 246 GB of swap makes the host die slowly first. This is the man page's "last line of defense" usage, and it exists for one scenario: a runaway allocator in a test. It should never fire.
- `MemorySwapMax=0`: without it, a runaway can stay under MemoryMax by parking hundreds of GB in this host's swap; with it, the Max ripcord actually rips. Cost accepted: idle seats cannot be swapped out to free RAM. At this RAM size that is irrelevant.

### Where they live: an installed unit file, symlinked like everything else

`systemd/akrogon.slice` in the akrogon repo, symlinked to `~/.config/systemd/user/akrogon.slice` by `akrogon install`, which already is a symlink farm for the binary and skills (`src/install.ts:9-62`); install additionally runs `systemctl --user daemon-reload`. The properties then exist before the first leaf of a session, are inspectable and tunable with stock tools (`systemctl --user show/set-property`, drop-ins under `akrogon.slice.d/`), and need zero runtime code: no config schema keys, no ensure logic, no creation race between the first two leaves of a day. Transient leaf slices and pane scopes referencing the hierarchy pull the file-defined slice in automatically.

## 2. Rejected options

- Transient top slice created by akrogon: rejected. It moves four static numbers into code paths (create if absent, set properties, handle an already-active slice with last version's values, survive concurrent first leaves), disappears whenever empty so an operator inspecting the host between leaves finds nothing, and makes the values invisible to `systemctl cat`. Slices are the one systemd unit kind designed to just be a file; the leaf slices and scopes below it stay transient because their lifetimes are dynamic, and the top slice's is not.
- CPUQuota instead of, or in addition to, weight: rejected. Measurement 1 throttled 30 s in 150 s at `CPUQuota=1600%` on a solo run; a quota slows test runs on an otherwise idle host for no benefit, and its only job, protecting the desktop under contention, is already done by weight without the timeout-flake side effects.
- `CPUWeight=idle`: rejected. It makes akrogon work runnable only when the host has nothing else, so an operator compiling or on a video call can starve a suite into its browser timeouts indefinitely. Desktop-first does not need to mean tests-last-absolutely; 20 guarantees a floor.
- No memory properties at all: rejected, narrowly. The honest argument for it is that this chart's incident was CPU and process count, never memory, and 123 GB is a lot. But the runaway-allocator scenario costs four lines of static file to bound, and without a slice MemoryMax the failure mode is global OOM selection after a long swap grind on a host with a quarter terabyte of swap. Insurance that never engages in normal operation is cheap; the rejected version of this is memory values low enough to engage routinely.
- Memory limits on leaf slices or pane scopes instead: rejected. One leaf's run peaks near 16 GB, so per-leaf values would need to sit just above legitimate peaks and would fire on the fattest legitimate suite eventually, while twenty leaves at 20 GB each still sum past the host. The aggregate is the host's problem, so the aggregate unit carries the aggregate values.
- IOWeight, ManagedOOM settings: rejected for now. No measurement in this chart implicates disk, page cache dominates test IO and is weakly shaped by IO weight, and systemd-oomd is inactive on this host (`systemctl --user is-active systemd-oomd` today), so ManagedOOM properties would configure a daemon that is not running.

## 3. Evidence

- better-than-training · live host inspection, 2026-10-13: `free -g` (123 GB RAM, 246 GB swap), `systemd-cgls --user` (session and app slices as siblings under `user@1000.service`, herdr server inside `app-graphical.slice`), `systemctl --user show` and cgroupfs reads giving CPUWeight 100/100/30 for app/session/background, `pids.max=max` on all three slices, `DefaultTasksMax=151378` against a measured 6138-task run. Fixed the weight's meaning, the memory scale, and that no TasksMax line is needed.
- better-than-training · measurement 2 (fork limit-boundary): full suite at `CPUWeight=20`, `MemoryHigh=48G` on a single run scope, 239 s, 15.9 GB peak, load 40, 0 throttled. The weight is reused as-is; the memory number is not, because that scope held one run and the slice holds every seat.
- better-than-training · local `systemd.resource-control` man page (systemd 262), read 2026-10-13: CPUWeight splits contended CPU relatively, MemoryHigh throttles and may be exceeded, MemoryMax invokes the in-unit OOM killer and is recommended as last line of defense, MemorySwapMax caps swap use separately from RAM. Selected the soft/hard pairing and the swap cap.
- better-than-training · `src/install.ts:9-62`, read 2026-10-13: install is already a checked symlink farm from the tool root into the home directory, with conflict reporting. One more link plus a daemon-reload is the entire delivery mechanism.
- model-knowledge · nothing stronger for: seat-population memory at `max_active` 20 (no measurement exists; the tens-of-GB working-set estimate behind 64G is mine), and cgroup memory accounting charging page cache to the first toucher, so `memory.current` for the slice will read well above anonymous RSS after installs and checkouts. Both argue for the generous High value and for the leaf proof below.

## 4. Pitfalls, and what removes each

- `MemoryHigh` engaging on cache, not working set: repeated worktree and `node_modules` traffic can charge tens of GB of clean page cache to the slice, and reclaim at the threshold then evicts hot cache before every run, converting a ceiling into a permanent slowdown. Removed by headroom (64G) and by a leaf proof that samples `memory.current` and the anon/file split of the slice during ordinary multi-leaf operation before the value is treated as settled; if cache alone rides near the line, the value rises, it does not get explained away.
- `MemoryMax` killing the wrong process: in-cgroup OOM picks by kernel score, so the victim can be an idle B seat instead of the allocator. Accepted: the alternative is the same choice made globally, possibly against the compositor. A leaf that loses a seat this way presents as a dead seat, recoverable by redispatch, and it should never happen outside a genuine runaway.
- Symlinked unit file edited upstream but never reloaded: a `git pull` changes the slice contents live, and systemd keeps the loaded copy until daemon-reload. Removed by install running the reload and one line in the install docs that slice changes take effect on install, not on pull. Divergence between file and loaded state is checkable with `systemctl --user show akrogon.slice`.
- Operator tunes live with `set-property`, forgets, and later debugs against the repo file: runtime properties reset on user manager restart back to the file, so the file stays the truth in the long run. Noted only; persistent operator tuning belongs in a drop-in, which systemd reports in `systemctl cat`.
- Weight only protects against the slices akrogon actually sits beside: work in `system.slice` (system services, kernel) is not in this comparison at all, and a future desktop rearrangement that moves GUI apps out of `app.slice` changes what 20 means. Not removed; the value is calibrated to the tree inspected today, and re-verifying sibling weights is a one-command check if desktop lag ever reappears while tests run.
- All four properties are inert while no leaf slice exists; an operator reading `systemctl status akrogon.slice` on a leaf-free host sees an inactive unit and may conclude the ceiling is off. It arms with the first scope that references the hierarchy. Named here and worth one line in the guide.

## 5. Missing questions

- What is the seat population's actual memory at realistic concurrency (say 8 to 20 allocated leaves idling plus one suite)? One `systemd-cgtop` or cgroupfs sample during a busy day would replace my estimate and might move MemoryHigh in either direction.
- Does anything in the operator's desktop deliberately run sites or builds inside leaf panes by hand, which this slices' weight and swap cap would also govern? The slice cannot tell dispatched work from hand-typed work in the same pane.
- If ceiling pressure ever does engage, who learns of it: is a `memory.events` or CPU throttling counter something `akrogon status` should surface, or is unexplained slowness plus `systemctl status` an acceptable diagnostic path forever?
