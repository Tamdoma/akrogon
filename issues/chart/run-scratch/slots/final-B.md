# Final-shape check B: run-scratch

Code read in `/home/ivan/.akrogon/worktrees/akrogon/k1-compile-cache` (0383d600). (H) marks what I ran or measured on this host.

D1's always-remove and D3's config key are right. Four things break as drafted (S1-S4). I would cut D4, cut D2 or reorder it, move the evidence folder out of the issue folder, and make the RAM root flat.

## P-a. Whole-root switch or second root

- A whole-root switch moves seat files to RAM. The seat's `TMPDIR` is the leaf temp itself (src/seat.ts:298, src/config.ts:373). That is the 2026-10-14 fault (c6981701: test files left in leaf temp counted as slice memory and held admission closed overnight). Keep a second root for run roots only.
- The second root does not need the leaf temp layout. Make it flat: `<run_root>/run-XXXXXX`.
  - The three sweep rules read only the run root itself: `refusal.json` keeps it, a missing `.owner` is judged by age, a dead owner pid or boot id drops it (src/reconcile.ts:1156-1187). None needs the repo or the leaf.
  - The one rule that tied a run root to its leaf is `.akrogon-kept` ("goes with the leaf temp's release", src/reconcile.ts:1169-1171). D1 deletes it.
  - Flat means one loop in the host step. The hashed layout doubles four parts: the private-dir chain (src/config.ts:399), the per-repo loop, the leaf release, and the host stray sweep that land-own-reds Q4 is fixing.
  - A dead owner pid is a host-wide fact, so a flat root is also safe when two homes share it.

## P-b. `rm -rf` in the guard

- Safe on the two points asked. `rm -rf` on a missing path exits 0, and `quote()` is already used for the record path (src/scope.ts:70). In the normal path the wrapper stops the guard (src/run-check.ts:424) before its own removal (src/run-check.ts:468), so the two do not overlap.
- One defect: order. The line ends with `exec systemctl --user stop <scope>` (src/scope.ts:70). Nothing can follow an `exec`. An `rm` placed before it walks a tree the command is still writing and leaves files behind. It has to be: stop the scope without `exec`, then `rm -rf`.
- It covers less than the draft assumes.
  - The guard runs in the run's own slice (src/scope.ts:62). A leaf slice stop kills the wrapper and the guard together. That is the common wrapper death (stop, close, reconcile stopping a finished leaf).
  - A nested run starts no guard (src/run-check.ts:407-412).
  - In both cases the existing dead-owner drop in reconcile does the removal (src/reconcile.ts:1186). It already covers every case. D2 only shortens the wait when the wrapper alone is killed.

## P-c. `memory.peak`

- Where: `<cgroup root>/…/akrogon.slice/akrogon-l<hash>.slice/akrogon-run-<uuid>.scope/memory.peak`. It exists here (H). A leaf slice that holds a scope has `memory pids` enabled.
- There is no moment for the wrapper to read it. The run is a `systemd-run --scope` with `CollectMode=inactive-or-failed` (src/scope.ts:33-50). The scope ends and its cgroup is removed when the command's last process exits. `spawnLogged` returns after that (src/run-check.ts:416). Reading it needs a sampler or a shell wrapped around every check command. Both are new parts.
- The number does not answer the question. A live run scope read `memory.peak` 21.6 GB with anon 1.6 GB, file 2.1 GB, shmem 0.05 GB (H). On disk the peak is mostly page cache, which the kernel can drop. It does not say what the run needs on tmpfs.
- This corrects my own rebuttal R5, which asked for the field. Cut D4.
- The undo signal needs no code. `akrogon.slice` is static, so its files are always readable: `memory.events` shows `high 0` and `memory.peak` 59.0 GB against `MemoryHigh=64G` today (H). Add "the slice's `high` count rises" to the undo line beside ENOSPC.

## P-d. Rollback

- Machine config is a `strictObject` (src/config.ts:24) (H). With `run_root` in `~/.akrogon/config.yaml`, a release without the key refuses the machine config. Every command on every repo then fails, including seats' `next` and lands. This is wider than a repo key.
  - Ship in two releases: (a) accept and ignore the key, (b) use it. `init` proposes the key only from (b). A rollback past (a) needs the key removed by hand first. Say so in the release note.
- With D4 cut the receipt does not change, so it needs no schema-first step.
- `.akrogon-kept` is safe both ways. Roots kept by an older release have a dead `.owner`, so the new reconcile drops them.
  - One-time cost: the first pass after release removes every kept root inline with `rmSync` (src/reconcile.ts:901-903). There are 28 here now (H) and 214 at intake. INTAKE measured 163 s for one tree under load. Remove them by hand before the release, or expect the first command to block for minutes.
- A release without the export leaves `AKROGON_EVIDENCE` unset. The framework seed must say the driver falls back when it is unset.

## Scenarios that break a run, lose evidence or leave residue

- S1. Evidence in the issue folder enters git, and a large archive fails the push.
  - Only logs are ignored: framework `.gitignore:62` is `issues/open/**/*.log`, akrogon `.gitignore:19` covers `direct/**/*.log`. `git check-ignore` matches no evidence path (H). Any `git add` of the leaf folder commits raw evidence, and the land's evidence sits untracked in the main checkout.
  - `pack` reads every member into memory and compresses at level 19 (src/pack.ts:61-83). The archive is committed: framework tracks 268 archives, 138 MB in total, the largest 2.5 MB (H). They hold logs only.
  - Evidence is 5-50 MB per red run (INTAKE). D1 keeps it on green runs too. A leaf with a few runs of screenshots or traces makes an archive over 100 MB. GitHub refuses a file that size, so the land's push fails. Below that limit the repo still grows by tens of MB per leaf with no end.
  - The chart's figure cannot see it. It measures temp roots, and the bytes moved into the repo.
- S2. `run_root: /tmp/akr-<uid>` is the natural value and it is the retired root. Every reconcile pass drops that path recursively (src/reconcile.ts:1432-1433). `dropPath` holds back only while it sees a process or a pane inside. A run whose processes have no open file or working directory there at that moment loses its root mid-run. I read the code and did not run this. Refuse a `run_root` that is equal to or inside the retired root or the leaf temp root, and make `init` propose another name.
- S3. A long `run_root` breaks Chrome. Its socket lives under `TMPDIR` and it aborts past 107 bytes (src/config.ts:372). The hashed layout adds 24 bytes to whatever the operator typed. Cap the length in the schema. The flat layout leaves more room.
- S4. On a PC with no `run_root`, a red check now pays the tree removal before it returns (src/run-check.ts:468). Today only green runs pay it. For a land this is inside the land hold. The `check_end` row is written before the removal (src/run-check.ts:443-449), so the cost is not in any ledger. Add "seconds from command exit to return" to the figure.
- S5. Residue, small. A changed or removed `run_root` leaves the old root unread, and on tmpfs it holds RAM until reboot. An evidence folder created empty stays when the wrapper dies. `/tmp` here has 4,194,304 inodes and one framework verify peaks at 580,149 files, so seven peaks fill it whatever the byte size (H). `init`'s 25% rule reads bytes only.

## What I would cut or merge

- X1. Evidence folder: put it in the leaf temp, `<leaf temp>/evidence/<check>-<run>/`, not in the issue folder.
  - It is on disk on every PC. It is outside git. It lives and dies by the same rule as today's kept roots. The seat finds it under its own `TMPDIR`.
  - This removes the `pack` change, the ignore line in every repo, a new member kind for `locate`, and S1.
  - Do not create it. Export the path and let the command `mkdir -p`. That removes "created empty" and "removed if empty".
  - Limit to know: reconcile drops an idle leaf's temp (src/reconcile.ts:1213-1221), exactly as it does for kept roots now. A driver that needs a file after the leaf closes copies it into the issue folder itself, as LESSONS 11-15 and 11-20 already say.
- X2. Cut D4 (P-c).
- X3. Cut D2. Reconcile already owns this removal. If A keeps D2, reorder the line (P-b).
- X4. Flat `run_root`, read once in the host step (P-a), with the two schema refusals from S2 and S3.
- X5. What is left: delete `.akrogon-kept` and its branch, one exported path, one config key in two releases, one loop.
