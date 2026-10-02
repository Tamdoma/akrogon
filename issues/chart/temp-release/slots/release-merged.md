# Release: merged A + B

## Shared facts (A,B)
- Failed keeps the tab, renamed "<slug> failed" (src/phase.ts:48-84); a retry reuses it. Park refuses any leaf with a tab or worktree (src/park.ts:22-26). Closed is merged leaves moved to `issues/closed`; `akrogon close` touches no leaf (B, src/pull.ts:204-207).
- Deletion today: merged only, on `tab_closed` (src/next.ts:777-790) or catch-up when no live tab (:614-616); a new tab empties scratch (:339-341). The `tab_closed` branch redispatches non-terminal leaves right after (:793).
- No process ownership is stored (src/state.ts:35-58) (B).

## Why tab-close alone is not enough (B)
- herdr shutdown snapshots the pane's session PIDs, sends HUP/TERM/KILL with 250 ms waits, logs leftovers and returns success anyway (herdr src/pane.rs:1185-1259, linux.rs:386-436, v0.9.3).
- framework browser-core starts its daemon detached in a new session and unrefs it (cdp-core.mjs:2416-2420). It escapes herdr's snapshot and keeps running, and an unlinked tmpfs file keeps its RAM while any process holds it (unlink(2)).

## Recommendation Q1 (A,B): 1a confirmed release for every outcome
- Each leaf seat runs in its own Linux cgroup scope; forks, double-forks and setsid stay inside (cgroup v2 docs; Poettering, "Rethinking PID 1") (B).
- How, without changing herdr (A, probe needed): all panes today share the herdr terminal's scope (`/proc/<shell_pid>/cgroup`). Right after akrogon creates a pane, and before `herdr agent start`, it reads the idle shell PID (`herdr pane process-info --pane <id>`, `shell_pid`) and asks the user systemd manager to start a transient scope named from the leaf hash and slot, adopting that PID (systemd `StartTransientUnit` with `PIDs`). An idle shell has no children yet, so nothing escapes. Name derived like the path, never stored. B's alternative: launch support inside herdr.
- Release: stop the leaf's scopes (`systemctl --user stop`, TERM then KILL to every member), confirm they are gone, then delete scratch. If a scope will not empty, report it and keep scratch (B).
- Order: release finishes before a replacement tab for the same leaf is allocated; systemd refuses a second active scope with the same name, which blocks a double start (A,B).
- Evidence the leaf needs later is saved in the leaf folder before release; logs referenced by path under scratch are disposable (B).

## Options Q1
- 1a scoped, confirmed release (above).
- 1b trust herdr tab close, delete on tab gone for every phase. Small change; detached browser daemons leak RAM.
- 1c merged only (today).

## Disagreement Q2: what does a failed leaf release?
- 2a (B) after the failure record and evidence are saved, akrogon closes the failed tab and releases it like any other; the worktree stays; a retry starts fresh seats in a new tab. Frees RAM right away; seats lose their chat context.
- 2b (A) the failed tab stays until the operator closes it or retries; release happens then. Keeps live seats to inspect and retry in place; RAM held while you look.

## Pitfalls
- Merge seat B still broadcasts after `merged` (merge-issue:49-53); release waits for its final idle, never kills mid-broadcast (B).
- Scope adoption is unproven on this host; one probe on a throwaway pane before handoff.
- Release frees only the leaf's own processes and files; `/tmp/claude-1000` and shared browsers are untouched (B).
- Running panes from before the change have no scope; they get the weaker tab-close cleanup until restarted.

## Research
- practitioner · Lennart Poettering, "Rethinking PID 1" (0pointer.de, 2010-04-30): double-fork defeats parent tracking; cgroups keep related processes together.
- practitioner · systemd team, "Control Group APIs and Delegation" (systemd.io/CGROUP_DELEGATION): use the manager's scope API, not hand-made cgroups.
- better-than-training · kernel cgroup v2 docs (populated, cgroup.kill); systemd.kill; unlink(2), setsid(2); herdr pane.rs, linux.rs, tabs.rs v0.9.3; framework cdp-core.mjs:2416-2420, page-measure.mjs:323-326; akrogon src lines above.

## B rebuttal (slots/release-rebuttal-B.md) and A response
- R1 accepted: moving the shell does not move children it already has; only work started after adoption is contained. Leaf work starts after adoption, so the guarantee covers the seat and everything it launches; shell startup children are not leaf work.
- R2 accepted: wait for the scope's start job to succeed and verify the shell's new cgroup before `herdr agent start`; refuse launch on failure.
- R3 held for design: B wants a stored run generation and exit receipt; A holds that stop, confirm, delete and reallocate under akrogon's existing global lock with a state re-read is enough. Implementer decides with evidence.
- R4 accepted: panes from before the change get no weaker path; their release reports unresolved ownership and keeps scratch until the operator restarts them.
- R5 accepted: seats copy the logs a failure needs into the leaf folder before release.
- R6 accepted by A: the operator asked for release at every outcome, and failed evidence is saved first; A moves to 2a.
