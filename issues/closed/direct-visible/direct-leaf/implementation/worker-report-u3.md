# Wave-2 worker U3 report (archive note)

Commit b8c15421 (picked as 5a5fa8af): observeBusy probes recorded seat refs per session with
busy_since only on required slots; dispatchLeaf skips allocation for direct; activeCount fallback
excludes direct leaves. Two honest mismatch returns (fake-systemctl re-stop vs real systemd;
stopped-lifecycle control blocks bare next) — corrected by A in 5abe6870. merge-epic regression red
fixed by threading the direct arg (isolated unit bug, no wave dependency).
