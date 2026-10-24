# stopped-and-ambiguous merged notes (A, B, C)

## Settled facts
- `herdr --session <stopped> <api cmd>` fails with code server_not_running and starts nothing; spawning exists only on the attach path (B,C, herdr v0.9.1 source). Installed read-only proof: B ran `herdr --session netreachconsulting workspace list` on 2026-10-24, exit 1, server_not_running, still stopped after.
- One session may hold two workspaces with the same label; unnamed workspaces derive labels from cwd (B,C, source).
- Today a missing-workspace throw stops only that leaf; reconcile and merge loops catch per repo; host step, paneOwners panes(), owner-count throws and selectLeaves are uncontained; any skip sets exit code 1 (B,C).

## Q1
- Skip sessions the session list reports stopped; never start or restore one (A,B,C).
- server_not_running after the list: that session counts as stopped (C) / the affected work refuses, no re-discovery (B). Same outcome in practice.
- Count matching workspaces, not sessions; two or more anywhere, same session included, refuse naming session and workspace_id (A,B,C).
- Unreadable running session (any other error): refuse, because uniqueness is unknown (A,B,C). Cost: blocks every repo until fixed (B,C).
- Refusal names sessions searched and sessions not searched because stopped (C).
- A failed `session list` is reported once per invocation (B,C).
- New: herdr() has no deadline, so a hung session socket can stall discovery (C).

## Q2
- Refuse per repo, other repos continue, invocation exits nonzero (A,B,C).
- One report per repo per invocation, not per leaf (C).
- The cached refusal is honored by every later step of that repo in the invocation (merge pass, reconcile acting steps); keep-only steps still run as on a null pane list (B,C).
- Uncontained paths must not let a refusal escape and abort other repos: paneOwners, owner-count throws, host reconcile step, selectLeaves (B,C).
- Open: should a refusal in an automatic pass raise an operator notification, and in which session (C)?

## Proofs
- Stopped read: done by B (above). Duplicate label and stop race: source evidence plus a session-aware fake; live mutation would fire plugin startup hooks (`pull --all`, `next --resume`) and is not needed (B,C).
