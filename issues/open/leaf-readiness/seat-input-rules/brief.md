# Brief: seat-input-rules

## What
The phase skills (`skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`) and `skills/AREA.md` replace the current env-file rule with the taken one and read the leaf's `readiness.yaml`. This leaf consumes readiness-contract's schema and `akrogon status <slug>` `Missing:` output, hence blocked-by readiness-contract.
- Seats never open, print or write `.env` or `.env.*` with a file tool. They may run declared checks and live operations that consume values through the process (`bun --env-file=<holder file> <script>`), printing results only.
- Presence is checked with `akrogon status <slug>` `Missing:` lines, where absent or empty counts as missing. This replaces the per-skill `bun -e` one-liner (plan-issue:63).
- A producer saves its key only through the operation recorded in `produces[].save`, with the value passed privately, writing the holder's real file and never the worktree link. The new key is revoked if saving fails.
- A seat reuses `grants` for probes, implementation, repairs, reruns, merge checks and cleanup without asking. Before mutating it compares operation, target and identity with the grant, records the grant reference, results and created IDs in its pass artifact, never widens the grant, and treats anything outside it as an operator blocker. check-issue:69 routing is unchanged.
- Proof fixtures are cleaned up on success and failure with the declared identities, and absence is proven by authenticated read-back. Leftovers are recorded with IDs, error, owner and next step. Agreed `retained` resources are labelled separately.
- Blockers keep `akrogon phase <slug> failed --reason "<blocker and artifact>" --slot <seat>`, with name or ID, attempted operation, identity reference, error, owner and next action in the artifact, never a value.

## Why
Skills forbid every env write (plan-issue:31, implement-issue:45, check-issue:31, merge-issue:29) though the operator allowed producer saves, and they put the env file name into commands and reasons seats run, which a user deny rule matched (I10, I13: a seat sat idle after four denied fail attempts) (Tamdoma/akrogon#52).

## Done-criteria
1. Each of the four phase skills states the new env rule once, next to its existing operator-blocker stop, and `skills/AREA.md` names it once as the phase-skill invariant. plan-issue's credential check uses `akrogon status <slug>` instead of the `bun -e` one-liner.
2. The producer-save, grant-reuse, fixture-cleanup and blocker-record rules above each appear once in the skill whose phase does that work (plan and implement for producer saves and live runs, check and merge for reruns, merge checks and cleanup), each naming the `readiness.yaml` field it reads.
3. `skills/check-issue/SKILL.md:69` routing (B hands required live runs to A) is unchanged.
4. Live demonstration: in a scratch akrogon home (`AKROGON_HOME=<scratch>`) with a scratch registered repo and a leaf whose `readiness.yaml` declares a throwaway env name absent from that repo's `.env`, each harness kind used by the registered repos' effective slots (claude, codex and pi on 2026-10-02) runs non-interactively the skill's presence command and the blocker command with a reason naming the input and the `.env` file. `implementation/report.md` records per harness the command, harness version, exit status, the resulting `failure.reason`, and the path of the transcript copied into the leaf's `implementation/` folder beside `report.md`. (A,B) No real key or real repo `.env` is touched.
