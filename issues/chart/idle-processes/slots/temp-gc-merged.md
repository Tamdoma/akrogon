# Temp GC, merged (A from B, C, D)

## Agreed
- G1 (B,C,D) The 10-02 move to RAM rested on an unproven claim. Same-day intake (17176d7, akrogon#53) shows the hangs under four overlapping heavy runs and a green 320-pass cf-workers-deploy run on /var/tmp when idle (D F1). The hangs were also seen 09-30 before disk temp existed, and the traced cause was a capture race fixed in 2cb00d537 (C).
- G2 (C,D) No disk-full event is recorded. The real exhaustion was tmpfs inodes on 09-30 (framework learnings/history/2026-09-30-git-fixture-temp-parent.md:5, B,C) and the 657k-file compile cache.
- G3 (B,C,D) Temp goes on disk at /var/tmp/akr-<uid>, socket budget intact. Land A's change with the wipe removal. B: replay the old hanging capture path on disk and tmpfs before release; C: 3x A/B of the gate-wiring lane; D: one quiet framework:verify after landing.
- G4 (B,C,D) Ownership deletes first: run-check finally, run-units guard, reconcile's dead-owner run roots. The collector is only for what ownership misses: seat-level top-level scratch and fixed-path producers.
- G5 (B,C,D) Framework producers fixed at source in a new test-cost issue: wrangler installed locally so bunx stops installing into TMPDIR (D F6); the scratch-repo harness deletes its own roots (C: createScratchRepo cleanup() missing at most call sites); /tmp/swi and the page-measure /tmp fallback follow TMPDIR or go (D F5); build trees reused per file (C reflinks); fixed log paths stay a skill rule (C,D).
- G6 (C,D) tmp-sweep's /var/tmp loop names the old /var/tmp/akrogon-<uid> root and must learn /var/tmp/akr-<uid>; old /tmp/akr-1000 gets one owner-checked cleanup after its seats end.

## Split: the collector
- K1 (D) No akrogon collector. Extend the operator's hourly tmp-sweep to leaf-dir entries except run-*, at 2 h since the newest file. Fewest parts. Leftovers live up to ~3 h. Age-based.
- K2 (C) Reconcile gains the rule: a top-level leaf-temp entry is deleted when no process in that leaf's slice references it (cwd, open fd, cmdline/env path) on two consecutive passes. No age. Runs on every next pass. Never kills.
- K3 (B) A one-minute user timer running an ownership-aware sweep built on run-unit identity, with a directory flock held through each run's protected lifetime, also on completion and startup. No age. Most complete, most machinery.

A's lean: K2's rule (reference-based, two-pass, bounded to the leaf slice's own processes) on a one-minute cadence for the operator's "very active", ownership from run-units for run roots, tmp-sweep only as the multi-day backstop.

## Taken (operator 2026-10-14 ~08:41, reply "1a", read as O1)
O1: tmp-sweep (existing timer) every 15 min deletes leaf-temp entries other than run-* untouched for 2 h, socket skip dropped for those folders; akrogon moves its akrogon-io-* captures into run-*; tmp-sweep learns /var/tmp/akr-<uid>; framework producers fixed at source. Rebuttals: temp-gc-rebuttal-{B,C,D}.md (K2 dropped by all three).
Built 2026-10-14: akrogon 795e769 (leaf temp /var/tmp/akr-<uid>, wipe removed, run captures in run root; 898 pass). Reviews o1-review-{B,C,D}.md: B F1 and D's page-measure and dead-run findings fixed in the sweep script; tmp-sweep install is the operator's step (classifier denied A). D: page-measure's socket path is 113 bytes under a run root, so the framework fix is a shorter socket path, not following TMPDIR.
